import { Hono } from "hono";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { hashSync } from "bcrypt-ts";
import { FunctionArgs } from "convex/server";
import { Bindings } from "../types/bindings.type";

export const users = new Hono<{ Bindings: Bindings }>();
const convexUsers = api.features.users;
const salt = 10;
const getConvex = (env: Bindings) => new ConvexHttpClient(env.CONVEX_URL);

users.get("/", async (c) => {
    const convex = getConvex(c.env);
    const result = await convex.query(convexUsers.query.list);
    return c.json(result);
});

users.get("/:id", async (c) => {
    const id = c.req.param("id") as Id<"users">;
    const convex = getConvex(c.env);
    const result = await convex.query(convexUsers.query.getById, { id });
    if (!result) return c.json({ error: "User not found" }, 404);
    return c.json(result);
});

users.post("/", async (c) => {
    const body = await c.req.json<{
        username: string;
        email: string;
        password: string;
        role?: "member" | "admin" | "system_admin";
    }>();

    const passwordHash = hashSync(body.password, salt);
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexUsers.mutation.create, {
        username: body.username,
        email: body.email,
        passwordHash,
        role: body.role,
    });

    return c.json(result, 201);
});
type UpdateUserArgs = FunctionArgs<typeof api.features.users.mutation.update>;
users.patch("/:id", async (c) => {
    const id = c.req.param("id") as Id<"users">;
    const body = await c.req.json<{
        username?: string;
        email?: string;
        password?: string;
        defaultGroupId?: Id<"groups">;
        role?: "member" | "admin" | "system_admin";
        isActive?: boolean;
    }>();

    const { password, ...rest } = body;
    const updateData: UpdateUserArgs = { id, ...rest };
    const convex = getConvex(c.env);
    if (password) {
        updateData.passwordHash = hashSync(password, salt);
    }

    const result = await convex.mutation(
        convexUsers.mutation.update,
        updateData
    );
    return c.json(result);
});

users.delete("/:id", async (c) => {
    const id = c.req.param("id") as Id<"users">;
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexUsers.mutation.remove, { id });
    return c.json(result);
});

users.post("/:id/restore", async (c) => {
    const id = c.req.param("id") as Id<"users">;
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexUsers.mutation.restore, { id });

    return c.json(result);
});

users.delete("/:id/permanent", async (c) => {
    const id = c.req.param("id") as Id<"users">;
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexUsers.mutation.hardDelete, {
        id,
    });
    return c.json(result);
});
