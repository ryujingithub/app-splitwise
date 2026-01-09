import { v } from "convex/values";
import { query } from "../../_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .collect();
    },
});

export const getById = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user || user.deletedAt) return null;

        let activeGroupId = user.defaultGroupId;

        if (!activeGroupId) {
            const membership = await ctx.db
                .query("groupMembers")
                .withIndex("by_user", (q) => q.eq("userId", args.id))
                .first();
            activeGroupId = membership?.groupId;
        }

        const { passwordHash, ...safeUser } = user;
        return { ...safeUser, activeGroupId };
    },
});

export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .first();
    },
});
