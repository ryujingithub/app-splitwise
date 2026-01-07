import { Context, Hono } from "hono";
import { SqliteError } from "better-sqlite3";
import { db } from "../database";
import {
    RawBillRow,
    BillResponse,
    CreateBillPayload,
    UpdateBillPayload,
    SettleDebtPayload,
} from "../types/bills.type";
import { calculateUnpaidBalances } from "../helpers/calculate-unpaid-balances";
import {
    formatGlobalBalances,
    formatGroupBalances,
} from "../helpers/format-balances";

export const bills = new Hono();

// Type guard for SQLite errors
function isSqliteError(error: unknown): error is SqliteError {
    return error instanceof Error && error.constructor.name === "SqliteError";
}

/**
 * Transforms flat SQL rows into the nested Bill structure
 */
const transformFlatRowsToBills = (rows: RawBillRow[]): BillResponse[] => {
    const billsMap = new Map<number, BillResponse>();

    for (const row of rows) {
        if (!billsMap.has(row.bill_id)) {
            billsMap.set(row.bill_id, {
                id: row.bill_id,
                group_id: row.bill_group_id,
                title: row.bill_title,
                total_amount: row.bill_total,
                payer_id: row.bill_payer_id,
                created_by: row.bill_created_by,
                created_at: row.bill_created_at,
                // bill_date: row.bill_date,
                items: [],
            });
        }

        const bill = billsMap.get(row.bill_id)!;

        if (
            row.item_id === null ||
            row.item_name === null ||
            row.item_amount === null ||
            row.item_quantity === null
        ) {
            continue;
        }

        let item = bill.items.find((i) => i.id === row.item_id);

        if (!item) {
            item = {
                id: row.item_id,
                bill_id: row.bill_id,
                name: row.item_name,
                amount: row.item_amount,
                quantity: row.item_quantity,
                assignments: [],
            };
            bill.items.push(item);
        }

        // Skip if no assignment
        if (row.assign_id === null || row.assign_user_id === null) {
            continue;
        }

        // Add Assignment (Avoid duplicates if row logic repeats)
        const exists = item.assignments.some((a) => a.id === row.assign_id);
        if (!exists) {
            item.assignments.push({
                id: row.assign_id,
                bill_item_id: row.item_id,
                user_id: row.assign_user_id,
                paid_date: row.assign_paid_date,
            });
        }
    }

    return Array.from(billsMap.values());
};

/**
 * GET /
 * List bills for a group.
 */
bills.get("/", (c) => {
    const groupIdStr = c.req.query("groupId");
    if (!groupIdStr) return c.json({ error: "groupId required" }, 400);

    const groupId = parseInt(groupIdStr, 10);
    if (isNaN(groupId)) return c.json({ error: "Invalid groupId" }, 400);

    try {
        const statement = db.prepare(`
      SELECT
        b.id as bill_id,
        b.group_id as bill_group_id,
        b.title as bill_title,
        b.total_amount as bill_total,
        b.created_at as bill_created_at,
        b.created_by as bill_created_by,
        b.payer_id as bill_payer_id,

        bi.id as item_id,
        bi.name as item_name,
        bi.amount as item_amount,
        bi.quantity as item_quantity,

        bia.id as assign_id,
        bia.user_id as assign_user_id,
        bia.paid_date as assign_paid_date,

        u.username as user_username,
        u.email as user_email
      FROM bills b
      LEFT JOIN bill_items bi ON b.id = bi.bill_id
      LEFT JOIN bill_item_assignments bia ON bi.id = bia.bill_item_id
      LEFT JOIN users u ON bia.user_id = u.id
      WHERE b.group_id = ?
      ORDER BY b.created_at DESC, bi.id ASC
    `);

        const rows = statement.all(groupId) as RawBillRow[];
        const nestedBills = transformFlatRowsToBills(rows);

        return c.json(nestedBills);
    } catch (err: unknown) {
        console.error("Fetch Bills Error:", err);
        return c.json({ error: "Failed to fetch bills" }, 500);
    }
});

/**
 * GET /balances
 * List of balances per user.
 */
bills.get("/balances", (c: Context) => {
    try {
        const { users, unpaidAssignments, splitMap } = calculateUnpaidBalances(
            db,
            false
        );
        const balanceMap = new Map(users.map((u) => [u.id, 0]));

        for (const record of unpaidAssignments) {
            if (record.debtor_id === record.creditor_id) continue;

            const shareAmount =
                (record.item_amount * record.item_quantity) /
                (splitMap.get(record.item_id) || 1);

            balanceMap.set(
                record.debtor_id,
                (balanceMap.get(record.debtor_id) || 0) - shareAmount
            );
            balanceMap.set(
                record.creditor_id,
                (balanceMap.get(record.creditor_id) || 0) + shareAmount
            );
        }

        return c.json(formatGlobalBalances(users, balanceMap));
    } catch (err) {
        console.error("Fetch Balances Error:", err);
        return c.json({ error: "Failed to calculate balances" }, 500);
    }
});

/**
 * GET /balances
 * List of balances per user per group.
 */
bills.get("/balances/v2", (c: Context) => {
    try {
        // 1. Passing 'true' triggers the specific overload.
        // unpaidAssignments is now typed strictly as GroupUnpaidAssignment[]
        const { userMap, unpaidAssignments, splitMap } =
            calculateUnpaidBalances(db, true);

        const groupLedger = new Map<
            number,
            { name: string; balances: Map<number, number> }
        >();

        for (const record of unpaidAssignments) {
            if (record.debtor_id === record.creditor_id) continue;

            const shareAmount =
                (record.item_amount * record.item_quantity) /
                (splitMap.get(record.item_id) || 1);

            // 2. TypeScript is happy here because record.group_id is 'number' (not undefined)
            if (!groupLedger.has(record.group_id)) {
                groupLedger.set(record.group_id, {
                    name: record.group_name,
                    balances: new Map(),
                });
            }

            const groupEntry = groupLedger.get(record.group_id)!;

            groupEntry.balances.set(
                record.debtor_id,
                (groupEntry.balances.get(record.debtor_id) || 0) - shareAmount
            );
            groupEntry.balances.set(
                record.creditor_id,
                (groupEntry.balances.get(record.creditor_id) || 0) + shareAmount
            );
        }

        return c.json(formatGroupBalances(groupLedger, userMap));
    } catch (err) {
        console.error("Fetch Balances V2 Error:", err);
        return c.json({ error: "Failed to calculate grouped balances" }, 500);
    }
});

/**
 * GET /:id
 * Returns single bill details
 */
bills.get("/:id", (c) => {
    const idStr = c.req.param("id");
    const billId = parseInt(idStr, 10);

    if (isNaN(billId)) return c.json({ error: "Invalid ID" }, 400);

    try {
        const statement = db.prepare(`
      SELECT
        b.id as bill_id,
        b.group_id as bill_group_id,
        b.title as bill_title,
        b.total_amount as bill_total,
        b.created_at as bill_created_at,
        b.created_by as bill_created_by,
        b.payer_id as bill_payer_id,

        bi.id as item_id,
        bi.name as item_name,
        bi.amount as item_amount,
        bi.quantity as item_quantity,

        bia.id as assign_id,
        bia.user_id as assign_user_id,
        bia.paid_date as assign_paid_date,

        u.username as user_username
      FROM bills b
      LEFT JOIN bill_items bi ON b.id = bi.bill_id
      LEFT JOIN bill_item_assignments bia ON bi.id = bia.bill_item_id
      LEFT JOIN users u ON bia.user_id = u.id
      WHERE b.id = ?
    `);

        const rows = statement.all(billId) as RawBillRow[];

        if (rows.length === 0) {
            return c.json({ error: "Bill not found" }, 404);
        }

        const nestedBills = transformFlatRowsToBills(rows);
        return c.json(nestedBills[0]);
    } catch (err: unknown) {
        console.error("Fetch Bill By ID Error:", err);
        return c.json({ error: "Internal Error" }, 500);
    }
});

/**
 * POST /
 * Creates a bill with payer_id.
 */
bills.post("/", async (c) => {
    let body: CreateBillPayload;
    try {
        body = await c.req.json<CreateBillPayload>();
    } catch {
        return c.json({ error: "Invalid JSON body" }, 400);
    }

    // 2. Required Field Validation (Included payer_id)
    if (
        !body.title ||
        !body.group_id ||
        !body.created_by ||
        !body.payer_id ||
        !Array.isArray(body.items)
    ) {
        return c.json(
            {
                error: "Missing required fields (title, group_id, payer_id, created_by, items)",
            },
            400
        );
    }

    if (body.items.length === 0) {
        return c.json({ error: "Bill must contain at least one item." }, 400);
    }

    try {
        const newBillId = db.transaction(() => {
            // --- A. Business Logic Validations ---
            const uniqueAssignedUserIds = new Set<number>();
            let calculatedTotal = 0;

            for (const item of body.items) {
                if (item.amount > 0 && item.assigned_user_ids.length === 0) {
                    throw new Error(
                        `Item "${item.name}" has a cost but is not assigned to anyone.`
                    );
                }
                if (item.amount < 0) {
                    throw new Error(
                        `Item "${item.name}" cannot have a negative amount.`
                    );
                }
                calculatedTotal += item.amount;
                item.assigned_user_ids.forEach((id) =>
                    uniqueAssignedUserIds.add(id)
                );
            }

            // Ensure assigned users belong to group
            if (uniqueAssignedUserIds.size > 0) {
                const userIdsArray = Array.from(uniqueAssignedUserIds);
                const placeholders = userIdsArray.map(() => "?").join(",");

                const memberQuery = db.prepare(`
                    SELECT count(*) as count
                    FROM group_members
                    WHERE group_id = ? AND user_id IN (${placeholders})
                `);

                const result = memberQuery.get(
                    body.group_id,
                    ...userIdsArray
                ) as { count: number };

                if (result.count !== uniqueAssignedUserIds.size) {
                    throw new Error(
                        "One or more assigned users do not belong to this group."
                    );
                }
            }

            // --- B. Database Insertions ---

            // 1. Insert Bill Header (With Payer ID)
            const insertBillStmt = db.prepare(
                `INSERT INTO bills (title, group_id, raw_markdown, total_amount, payer_id, created_by)
                 VALUES (?, ?, ?, ?, ?, ?)`
            );

            const billResult = insertBillStmt.run(
                body.title,
                body.group_id,
                body.raw_markdown ?? null,
                calculatedTotal,
                body.payer_id, // <--- Inserted
                body.created_by
            );

            const billId = Number(billResult.lastInsertRowid);

            // 2. Prepare Statements for Items
            const insertItemStmt = db.prepare(
                `INSERT INTO bill_items (bill_id, name, amount, quantity)
                 VALUES (?, ?, ?, ?)`
            );

            const insertAssignmentStmt = db.prepare(
                `INSERT INTO bill_item_assignments (bill_item_id, user_id)
                 VALUES (?, ?)`
            );

            // 3. Insert Items and Assignments
            for (const item of body.items) {
                const itemResult = insertItemStmt.run(
                    billId,
                    item.name,
                    item.amount,
                    item.quantity
                );

                const itemId = Number(itemResult.lastInsertRowid);
                const uniqueItemUsers = new Set(item.assigned_user_ids);

                for (const userId of uniqueItemUsers) {
                    insertAssignmentStmt.run(itemId, userId);
                }
            }

            return billId;
        })();

        return c.json(
            {
                id: newBillId,
                message: "Bill created successfully",
            },
            201
        );
    } catch (error: unknown) {
        console.error("Create Bill Error:", error);

        if (error instanceof Error) {
            if (
                error.message.includes("not assigned to anyone") ||
                error.message.includes("do not belong to this group") ||
                error.message.includes("negative amount")
            ) {
                return c.json({ error: error.message }, 400);
            }
        }

        if (isSqliteError(error)) {
            if (isSqliteError(error)) {
                return c.json(
                    {
                        error: "Invalid Group ID, Payer ID or User ID provided.",
                    },
                    400
                );
            }
        }

        return c.json({ error: "Internal Server Error" }, 500);
    }
});

/**
 * PUT /:id
 * Updates an existing bill.
 */
bills.put("/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

    let body: UpdateBillPayload;
    try {
        body = await c.req.json<UpdateBillPayload>();
    } catch {
        return c.json({ error: "Invalid JSON body" }, 400);
    }

    // Validate required fields and items
    if (
        !body.title ||
        !body.group_id ||
        !body.payer_id ||
        //!body.bill_date ||
        !Array.isArray(body.items) ||
        body.items.length === 0
    ) {
        return c.json(
            { error: "Missing required fields or empty items array" },
            400
        );
    }

    try {
        db.transaction(() => {
            // Check if bill exists
            const billExists = db
                .prepare("SELECT 1 FROM bills WHERE id = ?")
                .pluck()
                .get(id);
            if (!billExists) throw new Error("BILL_NOT_FOUND");

            // Validate items and calculate total
            const assignedUserIds = new Set<number>([body.payer_id]);
            let totalAmount = 0;

            for (const item of body.items) {
                if (item.amount < 0)
                    throw new Error(
                        `Item "${item.name}" cannot have negative amount`
                    );
                if (item.amount > 0 && item.assigned_user_ids.length === 0) {
                    throw new Error(
                        `Item "${item.name}" has cost but no assignees`
                    );
                }
                totalAmount += item.amount;
                item.assigned_user_ids.forEach((uid) =>
                    assignedUserIds.add(uid)
                );
            }

            // Verify all users belong to the group
            const userIds = Array.from(assignedUserIds);
            const placeholders = userIds.map(() => "?").join(",");
            const memberCount = db
                .prepare(
                    `
                SELECT COUNT(*) as count FROM group_members
                WHERE group_id = ? AND user_id IN (${placeholders})
            `
                )
                .get(body.group_id, ...userIds) as { count: number };

            if (memberCount.count !== userIds.length) {
                throw new Error(
                    "One or more users do not belong to the specified group"
                );
            }

            // Update bill and replace items
            db.prepare(
                `
                UPDATE bills
                SET title = ?, group_id = ?, raw_markdown = ?, total_amount = ?, payer_id = ?

                WHERE id = ?
            `
            ).run(
                body.title,
                body.group_id,
                body.raw_markdown ?? null,
                totalAmount,
                body.payer_id,
                id
            );

            // Delete old items (cascade handles assignments)
            db.prepare("DELETE FROM bill_items WHERE bill_id = ?").run(id);

            // Insert new items and assignments
            const insertItem = db.prepare(`
                INSERT INTO bill_items (bill_id, name, amount, quantity) VALUES (?, ?, ?, ?)
            `);
            const insertAssignment = db.prepare(`
                INSERT INTO bill_item_assignments (bill_item_id, user_id) VALUES (?, ?)
            `);

            for (const item of body.items) {
                const { lastInsertRowid } = insertItem.run(
                    id,
                    item.name,
                    item.amount,
                    item.quantity
                );
                const itemId = Number(lastInsertRowid);
                for (const userId of new Set(item.assigned_user_ids)) {
                    insertAssignment.run(itemId, userId);
                }
            }
        })();

        return c.json({ id, message: "Bill updated successfully" });
    } catch (error: unknown) {
        console.error("Update Bill Error:", error);

        if (error instanceof Error) {
            if (error.message === "BILL_NOT_FOUND")
                return c.json({ error: "Bill not found" }, 404);
            if (
                error.message.includes("cannot have negative amount") ||
                error.message.includes("has cost but no assignees") ||
                error.message.includes("do not belong to the specified group")
            ) {
                return c.json({ error: error.message }, 400);
            }
        }

        if (isSqliteError(error)) {
            return c.json({ error: "Invalid Group ID or User ID" }, 400);
        }

        return c.json({ error: "Internal Server Error" }, 500);
    }
});
/**
 * POST /settle
 * Marks specific bill item assignments as paid.
 */
bills.post("/settle", async (c) => {
    let body: SettleDebtPayload;
    try {
        body = await c.req.json<SettleDebtPayload>();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    if (!Array.isArray(body.assignmentIds) || body.assignmentIds.length === 0) {
        return c.json({ error: "assignmentIds array is required" }, 400);
    }

    try {
        const result = db.transaction(() => {
            const updateStmt = db.prepare(`
                UPDATE bill_item_assignments
                SET paid_date = datetime('now')
                WHERE id = ?
            `);

            let updatedCount = 0;
            for (const id of body.assignmentIds) {
                const info = updateStmt.run(id);
                updatedCount += info.changes;
            }

            return updatedCount;
        })();

        return c.json({
            message: "Debts settled successfully",
            count: result,
        });
    } catch (error) {
        console.error("Settle Debt Error:", error);
        return c.json({ error: "Failed to update records" }, 500);
    }
});

export default bills;
