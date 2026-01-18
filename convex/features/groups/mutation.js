import { v } from "convex/values";
import { mutation } from "../../_generated/server";
export const create = mutation({
    args: {
        name: v.string(),
        parentGroupId: v.optional(v.id("groups")),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("groups", {
            name: args.name,
            parentGroupId: args.parentGroupId,
        });
        return { id, ...args };
    },
});
export const update = mutation({
    args: {
        id: v.id("groups"),
        name: v.optional(v.string()),
        parentGroupId: v.optional(v.id("groups")),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing)
            throw new Error("Group not found");
        await ctx.db.patch(id, {
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.parentGroupId !== undefined && {
                parentGroupId: updates.parentGroupId,
            }),
        });
        return { message: "Group updated" };
    },
});
export const remove = mutation({
    args: { id: v.id("groups") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return { message: "Group deleted" };
    },
});
export const addMember = mutation({
    args: {
        groupId: v.id("groups"),
        userId: v.id("users"),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("groupMembers", {
            groupId: args.groupId,
            userId: args.userId,
            role: args.role ?? "member",
            joinedAt: Date.now(),
        });
        return { message: "Member added" };
    },
});
export const removeMember = mutation({
    args: {
        groupId: v.id("groups"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const membership = await ctx.db
            .query("groupMembers")
            .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", args.userId))
            .first();
        if (membership)
            await ctx.db.delete(membership._id);
        return { message: "Member removed" };
    },
});
