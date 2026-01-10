import { Hono } from "hono";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Bindings } from "../types/bindings.type";

export const groups = new Hono<{ Bindings: Bindings }>();
const convexGroups = api.features.groups;
const getConvex = (env: Bindings) => new ConvexHttpClient(env.CONVEX_URL);

groups.get("/", async (c) => {
    const convex = getConvex(c.env);
    const result = await convex.query(convexGroups.query.list);
    return c.json(result);
});

groups.get("/:id", async (c) => {
    const id = c.req.param("id") as Id<"groups">;
    const convex = getConvex(c.env);
    const result = await convex.query(convexGroups.query.getById, { id });
    if (!result) return c.json({ error: "Group not found" }, 404);
    return c.json(result);
});

groups.post("/", async (c) => {
    const body = await c.req.json<{
        name: string;
        parentGroupId?: Id<"groups">;
    }>();
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexGroups.mutation.create, body);
    return c.json(result, 201);
});

groups.patch("/:id", async (c) => {
    const id = c.req.param("id") as Id<"groups">;
    const body = await c.req.json<{
        name?: string;
        parentGroupId?: Id<"groups">;
    }>();
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexGroups.mutation.update, {
        id,
        ...body,
    });
    return c.json(result);
});

groups.delete("/:id", async (c) => {
    const id = c.req.param("id") as Id<"groups">;
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexGroups.mutation.remove, { id });
    return c.json(result);
});

groups.post("/:id/members", async (c) => {
    const groupId = c.req.param("id") as Id<"groups">;
    const { user_id, role } = await c.req.json<{
        user_id: Id<"users">;
        role?: string;
    }>();
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexGroups.mutation.addMember, {
        groupId,
        userId: user_id,
        role,
    });
    return c.json(result, 201);
});

groups.delete("/:id/members/:userId", async (c) => {
    const groupId = c.req.param("id") as Id<"groups">;
    const userId = c.req.param("userId") as Id<"users">;
    const convex = getConvex(c.env);
    const result = await convex.mutation(convexGroups.mutation.removeMember, {
        groupId,
        userId,
    });
    return c.json(result);
});
