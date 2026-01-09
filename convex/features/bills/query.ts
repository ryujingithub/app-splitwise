import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { query } from "../../_generated/server";

export const listByGroup = query({
    args: { groupId: v.id("groups") },
    handler: async (ctx, { groupId }) => {
        const bills = await ctx.db
            .query("bills")
            .withIndex("by_group", (q) => q.eq("groupId", groupId))
            .order("desc")
            .collect();

        const result = await Promise.all(
            bills.map(async (bill) => {
                const items = await ctx.db
                    .query("billItems")
                    .withIndex("by_bill", (q) => q.eq("billId", bill._id))
                    .collect();

                const itemsWithAssignments = await Promise.all(
                    items.map(async (item) => {
                        const assignments = await ctx.db
                            .query("billItemAssignments")
                            .withIndex("by_bill_item", (q) =>
                                q.eq("billItemId", item._id)
                            )
                            .collect();

                        return {
                            ...item,
                            assignments,
                        };
                    })
                );

                return {
                    ...bill,
                    items: itemsWithAssignments,
                };
            })
        );

        return result;
    },
});

export const getById = query({
    args: { id: v.id("bills") },
    handler: async (ctx, { id }) => {
        const bill = await ctx.db.get(id);
        if (!bill) return null;

        const items = await ctx.db
            .query("billItems")
            .withIndex("by_bill", (q) => q.eq("billId", id))
            .collect();

        const itemsWithAssignments = await Promise.all(
            items.map(async (item) => {
                const assignments = await ctx.db
                    .query("billItemAssignments")
                    .withIndex("by_bill_item", (q) =>
                        q.eq("billItemId", item._id)
                    )
                    .collect();

                return { ...item, assignments };
            })
        );

        return { ...bill, items: itemsWithAssignments };
    },
});

export const getBalances = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const balanceMap = new Map<string, number>();

        users.forEach((u) => balanceMap.set(u._id, 0));

        const bills = await ctx.db.query("bills").collect();

        for (const bill of bills) {
            const items = await ctx.db
                .query("billItems")
                .withIndex("by_bill", (q) => q.eq("billId", bill._id))
                .collect();

            for (const item of items) {
                const assignments = await ctx.db
                    .query("billItemAssignments")
                    .withIndex("by_bill_item", (q) =>
                        q.eq("billItemId", item._id)
                    )
                    .collect();

                const unsettled = assignments.filter((a) => !a.settledAt);
                if (unsettled.length === 0) continue;

                const shareAmount =
                    (item.unitPrice * item.quantity) / unsettled.length;

                for (const assignment of unsettled) {
                    if (assignment.userId === bill.payerId) continue;

                    // Debtor owes money (negative)
                    balanceMap.set(
                        assignment.userId,
                        (balanceMap.get(assignment.userId) || 0) - shareAmount
                    );
                    // Creditor is owed (positive)
                    balanceMap.set(
                        bill.payerId,
                        (balanceMap.get(bill.payerId) || 0) + shareAmount
                    );
                }
            }
        }

        return users.map((u) => ({
            id: u._id,
            username: u.username,
            email: u.email,
            balance: balanceMap.get(u._id) || 0,
        }));
    },
});

export const getBalancesByGroup = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const userMap = new Map(users.map((u) => [u._id, u]));
        const groups = await ctx.db.query("groups").collect();

        const result: Array<{
            groupId: string;
            groupName: string;
            balances: Array<{
                userId: string;
                username: string;
                balance: number;
            }>;
        }> = [];

        for (const group of groups) {
            const balanceMap = new Map<string, number>();
            const bills = await ctx.db
                .query("bills")
                .withIndex("by_group", (q) => q.eq("groupId", group._id))
                .collect();

            for (const bill of bills) {
                const items = await ctx.db
                    .query("billItems")
                    .withIndex("by_bill", (q) => q.eq("billId", bill._id))
                    .collect();

                for (const item of items) {
                    const assignments = await ctx.db
                        .query("billItemAssignments")
                        .withIndex("by_bill_item", (q) =>
                            q.eq("billItemId", item._id)
                        )
                        .collect();

                    const unsettled = assignments.filter((a) => !a.settledAt);
                    if (unsettled.length === 0) continue;

                    const shareAmount =
                        (item.unitPrice * item.quantity) / unsettled.length;

                    for (const assignment of unsettled) {
                        if (assignment.userId === bill.payerId) continue;

                        balanceMap.set(
                            assignment.userId,
                            (balanceMap.get(assignment.userId) || 0) -
                                shareAmount
                        );
                        balanceMap.set(
                            bill.payerId,
                            (balanceMap.get(bill.payerId) || 0) + shareAmount
                        );
                    }
                }
            }

            const balances = Array.from(balanceMap.entries())
                .filter(([_, balance]) => Math.abs(balance) > 0.01)
                .map(([userId, balance]) => ({
                    userId,
                    username:
                        userMap.get(userId as Id<"users">)?.username ||
                        "Unknown",
                    balance,
                }));

            if (balances.length > 0) {
                result.push({
                    groupId: group._id,
                    groupName: group.name,
                    balances,
                });
            }
        }

        return result;
    },
});
