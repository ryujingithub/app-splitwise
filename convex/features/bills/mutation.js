import { v } from "convex/values";
import { mutation } from "../../_generated/server";
export const create = mutation({
    args: {
        title: v.string(),
        groupId: v.id("groups"),
        rawMarkdown: v.optional(v.string()),
        payerId: v.id("users"),
        createdBy: v.id("users"),
        currency: v.optional(v.string()),
        splitType: v.optional(v.string()),
        items: v.array(v.object({
            name: v.string(),
            unitPrice: v.number(),
            quantity: v.number(),
            assignedUserIds: v.array(v.id("users")),
        })),
    },
    handler: async (ctx, args) => {
        // Validate items
        if (args.items.length === 0) {
            throw new Error("Bill must contain at least one item");
        }
        let totalAmount = 0;
        const allAssignedUsers = new Set();
        for (const item of args.items) {
            if (item.unitPrice < 0) {
                throw new Error(`Item "${item.name}" cannot have negative price`);
            }
            if (item.unitPrice > 0 && item.assignedUserIds.length === 0) {
                throw new Error(`Item "${item.name}" has cost but no assignees`);
            }
            totalAmount += item.unitPrice * item.quantity;
            item.assignedUserIds.forEach((id) => allAssignedUsers.add(id));
        }
        // Verify all users are group members
        for (const userId of allAssignedUsers) {
            const membership = await ctx.db
                .query("groupMembers")
                .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", userId))
                .unique();
            if (!membership) {
                throw new Error(`User ${userId} is not a member of this group`);
            }
        }
        // Insert bill
        const billId = await ctx.db.insert("bills", {
            title: args.title,
            groupId: args.groupId,
            rawMarkdown: args.rawMarkdown,
            totalAmount,
            currency: args.currency || "USD",
            splitType: args.splitType || "equal",
            payerId: args.payerId,
            createdBy: args.createdBy,
        });
        // Insert items and assignments
        for (const item of args.items) {
            const itemId = await ctx.db.insert("billItems", {
                billId,
                name: item.name,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
            });
            const shareAmount = (item.unitPrice * item.quantity) / item.assignedUserIds.length;
            for (const userId of new Set(item.assignedUserIds)) {
                await ctx.db.insert("billItemAssignments", {
                    billItemId: itemId,
                    userId,
                    shareAmount,
                    settledAt: undefined,
                });
            }
        }
        return billId;
    },
});
export const update = mutation({
    args: {
        id: v.id("bills"),
        title: v.string(),
        groupId: v.id("groups"),
        rawMarkdown: v.optional(v.string()),
        payerId: v.id("users"),
        currency: v.optional(v.string()),
        splitType: v.optional(v.string()),
        items: v.array(v.object({
            name: v.string(),
            unitPrice: v.number(),
            quantity: v.number(),
            assignedUserIds: v.array(v.id("users")),
        })),
    },
    handler: async (ctx, args) => {
        const bill = await ctx.db.get(args.id);
        if (!bill)
            throw new Error("Bill not found");
        if (args.items.length === 0) {
            throw new Error("Bill must contain at least one item");
        }
        let totalAmount = 0;
        const allAssignedUsers = new Set([args.payerId]);
        for (const item of args.items) {
            if (item.unitPrice < 0) {
                throw new Error(`Item "${item.name}" cannot have negative price`);
            }
            if (item.unitPrice > 0 && item.assignedUserIds.length === 0) {
                throw new Error(`Item "${item.name}" has cost but no assignees`);
            }
            totalAmount += item.unitPrice * item.quantity;
            item.assignedUserIds.forEach((id) => allAssignedUsers.add(id));
        }
        // Verify memberships
        for (const userId of allAssignedUsers) {
            const membership = await ctx.db
                .query("groupMembers")
                .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", userId))
                .unique();
            if (!membership) {
                throw new Error(`User ${userId} is not a member of this group`);
            }
        }
        // Update bill
        await ctx.db.patch(args.id, {
            title: args.title,
            groupId: args.groupId,
            rawMarkdown: args.rawMarkdown,
            totalAmount,
            currency: args.currency,
            splitType: args.splitType,
            payerId: args.payerId,
        });
        // Delete old items (assignments cascade via app logic)
        const oldItems = await ctx.db
            .query("billItems")
            .withIndex("by_bill", (q) => q.eq("billId", args.id))
            .collect();
        for (const item of oldItems) {
            const assignments = await ctx.db
                .query("billItemAssignments")
                .withIndex("by_bill_item", (q) => q.eq("billItemId", item._id))
                .collect();
            for (const assignment of assignments) {
                await ctx.db.delete(assignment._id);
            }
            await ctx.db.delete(item._id);
        }
        // Insert new items
        for (const item of args.items) {
            const itemId = await ctx.db.insert("billItems", {
                billId: args.id,
                name: item.name,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
            });
            const shareAmount = (item.unitPrice * item.quantity) / item.assignedUserIds.length;
            for (const userId of new Set(item.assignedUserIds)) {
                await ctx.db.insert("billItemAssignments", {
                    billItemId: itemId,
                    userId,
                    shareAmount,
                    settledAt: undefined,
                });
            }
        }
        return args.id;
    },
});
export const settle = mutation({
    args: {
        assignmentIds: v.array(v.id("billItemAssignments")),
    },
    handler: async (ctx, { assignmentIds }) => {
        if (assignmentIds.length === 0) {
            throw new Error("assignmentIds array is required");
        }
        let count = 0;
        for (const id of assignmentIds) {
            const assignment = await ctx.db.get(id);
            if (assignment) {
                await ctx.db.patch(id, { settledAt: Date.now() });
                count++;
            }
        }
        return { count };
    },
});
