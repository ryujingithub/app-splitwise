// routes/bills.ts
import { Hono } from "hono";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

export const bills = new Hono();

const convexBills = api.features.bills;

bills.get("/", async (c) => {
    const groupId = c.req.query("groupId");
    if (!groupId) return c.json({ error: "groupId required" }, 400);

    try {
        const result = await convex.query(convexBills.query.listByGroup, {
            groupId: groupId as Id<"groups">,
        });
        return c.json(result);
    } catch (err) {
        console.error("Fetch Bills Error:", err);
        return c.json({ error: "Failed to fetch bills" }, 500);
    }
});

bills.get("/balances", async (c) => {
    try {
        const result = await convex.query(convexBills.query.getBalances, {});
        return c.json(result);
    } catch (err) {
        console.error("Fetch Balances Error:", err);
        return c.json({ error: "Failed to calculate balances" }, 500);
    }
});

bills.get("/balances/v2", async (c) => {
    try {
        const result = await convex.query(
            convexBills.query.getBalancesByGroup,
            {}
        );
        return c.json(result);
    } catch (err) {
        console.error("Fetch Balances V2 Error:", err);
        return c.json({ error: "Failed to calculate grouped balances" }, 500);
    }
});

bills.get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await convex.query(convexBills.query.getById, {
            id: id as Id<"bills">,
        });
        if (!result) return c.json({ error: "Bill not found" }, 404);
        return c.json(result);
    } catch (err) {
        console.error("Fetch Bill Error:", err);
        return c.json({ error: "Internal Error" }, 500);
    }
});

bills.post("/", async (c) => {
    const body = await c.req.json();

    if (
        !body.title ||
        !body.groupId ||
        !body.createdBy ||
        !body.payerId ||
        !Array.isArray(body.items) ||
        body.items.length === 0
    ) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    try {
        const billId = await convex.mutation(convexBills.mutation.create, {
            title: body.title,
            groupId: body.groupId as Id<"groups">,
            rawMarkdown: body.rawMarkdown,
            payerId: body.payerId as Id<"users">,
            createdBy: body.createdBy as Id<"users">,
            currency: body.currency,
            splitType: body.splitType,
            items: body.items.map((item: any) => ({
                name: item.name,
                unitPrice: item.amount ?? item.unitPrice,
                quantity: item.quantity ?? 1,
                assignedUserIds: item.assignedUserIds ?? item.assigned_user_ids,
            })),
        });

        return c.json(
            { id: billId, message: "Bill created successfully" },
            201
        );
    } catch (err: any) {
        console.error("Create Bill Error:", err);
        return c.json({ error: err.message || "Internal Server Error" }, 400);
    }
});

bills.put("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (
        !body.title ||
        !body.groupId ||
        !body.payerId ||
        !Array.isArray(body.items) ||
        body.items.length === 0
    ) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    try {
        await convex.mutation(convexBills.mutation.update, {
            id: id as Id<"bills">,
            title: body.title,
            groupId: body.groupId as Id<"groups">,
            rawMarkdown: body.rawMarkdown,
            payerId: body.payerId as Id<"users">,
            currency: body.currency,
            splitType: body.splitType,
            items: body.items.map((item: any) => ({
                name: item.name,
                unitPrice: item.amount ?? item.unitPrice,
                quantity: item.quantity ?? 1,
                assignedUserIds: item.assignedUserIds ?? item.assigned_user_ids,
            })),
        });

        return c.json({ id, message: "Bill updated successfully" });
    } catch (err: any) {
        console.error("Update Bill Error:", err);
        if (err.message === "Bill not found") {
            return c.json({ error: "Bill not found" }, 404);
        }
        return c.json({ error: err.message || "Internal Server Error" }, 400);
    }
});

bills.post("/settle", async (c) => {
    const body = await c.req.json();

    if (!Array.isArray(body.assignmentIds) || body.assignmentIds.length === 0) {
        return c.json({ error: "assignmentIds array is required" }, 400);
    }

    try {
        const result = await convex.mutation(convexBills.mutation.settle, {
            assignmentIds: body.assignmentIds as Id<"billItemAssignments">[],
        });

        return c.json({
            message: "Debts settled successfully",
            count: result.count,
        });
    } catch (err) {
        console.error("Settle Debt Error:", err);
        return c.json({ error: "Failed to update records" }, 500);
    }
});

export default bills;
