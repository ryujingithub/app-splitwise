import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const create = mutation({
    args: {
        username: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        role: v.optional(
            v.union(
                v.literal("member"),
                v.literal("admin"),
                v.literal("system_admin")
            )
        ),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) throw new Error("Email already exists");

        const now = Date.now();
        const id = await ctx.db.insert("users", {
            username: args.username,
            email: args.email,
            passwordHash: args.passwordHash,
            role: args.role ?? "member",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });

        return { id, username: args.username, email: args.email };
    },
});

export const update = mutation({
    args: {
        id: v.id("users"),
        username: v.optional(v.string()),
        email: v.optional(v.string()),
        passwordHash: v.optional(v.string()),
        defaultGroupId: v.optional(v.id("groups")),
        role: v.optional(
            v.union(
                v.literal("member"),
                v.literal("admin"),
                v.literal("system_admin")
            )
        ),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing || existing.deletedAt) throw new Error("User not found");

        const updateFields: Record<string, unknown> = { updatedAt: Date.now() };

        if (updates.username !== undefined)
            updateFields.username = updates.username;
        if (updates.email !== undefined) updateFields.email = updates.email;
        if (updates.passwordHash !== undefined)
            updateFields.passwordHash = updates.passwordHash;
        if (updates.defaultGroupId !== undefined)
            updateFields.defaultGroupId = updates.defaultGroupId;
        if (updates.role !== undefined) updateFields.role = updates.role;
        if (updates.isActive !== undefined)
            updateFields.isActive = updates.isActive;

        await ctx.db.patch(id, updateFields);
        return { message: "User updated" };
    },
});

export const remove = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("User not found");

        // Soft delete
        await ctx.db.patch(args.id, {
            deletedAt: Date.now(),
            isActive: false,
            updatedAt: Date.now(),
        });

        return { message: "User deleted" };
    },
});

export const hardDelete = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return { message: "User permanently deleted" };
    },
});

export const restore = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("User not found");

        await ctx.db.patch(args.id, {
            deletedAt: undefined,
            isActive: true,
            updatedAt: Date.now(),
        });

        return { message: "User restored" };
    },
});
