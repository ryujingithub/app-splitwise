import { Database } from "better-sqlite3";
import {
    CalculateUnpaidBalancesFn,
    UserRow,
    GroupUnpaidAssignment,
    BaseUnpaidAssignment,
    SplitCountRow,
} from "../types/bills.type";

export const calculateUnpaidBalances: CalculateUnpaidBalancesFn = (
    db: Database,
    groupByGroup: boolean
) => {
    const users = db
        .prepare(`SELECT id, username, email FROM users`)
        .all() as UserRow[];

    const userMap = new Map(users.map((u) => [u.id, u]));

    const baseQuery = `
        SELECT
            ${groupByGroup ? "b.group_id, g.name as group_name," : ""}
            bia.user_id AS debtor_id,
            b.payer_id AS creditor_id,
            bi.amount AS item_amount,
            bi.quantity AS item_quantity,
            bi.id as item_id
        FROM bill_item_assignments bia
        JOIN bill_items bi ON bia.bill_item_id = bi.id
        JOIN bills b ON bi.bill_id = b.id
        ${groupByGroup ? "JOIN groups g ON b.group_id = g.id" : ""}
        WHERE bia.paid_date IS NULL
    `;

    // Internal cast is safe because the SQL logic aligns with the boolean
    const unpaidAssignments = db.prepare(baseQuery).all() as
        | GroupUnpaidAssignment[]
        | BaseUnpaidAssignment[];

    const splitCounts = db
        .prepare(
            `
        SELECT bill_item_id, COUNT(*) as count
        FROM bill_item_assignments
        GROUP BY bill_item_id
    `
        )
        .all() as SplitCountRow[];

    const splitMap = new Map(splitCounts.map((s) => [s.bill_item_id, s.count]));

    // Cast return to any to satisfy the overload signature (TS limitation with conditional returns)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { users, userMap, unpaidAssignments, splitMap } as any;
};
