import { v } from "convex/values";
import { query } from "../../_generated/server";
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("groups").collect();
    },
});
export const getById = query({
    args: { id: v.id("groups") },
    handler: async (ctx, args) => {
        const group = await ctx.db.get(args.id);
        if (!group)
            return null;
        const memberships = await ctx.db
            .query("groupMembers")
            .withIndex("by_group", (q) => q.eq("groupId", args.id))
            .collect();
        const members = await Promise.all(memberships.map(async (m) => {
            const user = await ctx.db.get(m.userId);
            return user
                ? { id: user._id, username: user.username, role: m.role }
                : null;
        }));
        return { ...group, members: members.filter(Boolean) };
    },
});
