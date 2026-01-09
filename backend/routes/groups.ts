import { Hono } from "hono";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
export const groups = new Hono();
const convexGroups = api.features.groups;

groups.get("/", async (c) => {
    const result = await convex.query(convexGroups.query.list);
    return c.json(result);
});

groups.get("/:id", async (c) => {
    const id = c.req.param("id") as Id<"groups">;
    const result = await convex.query(convexGroups.query.getById, { id });
    if (!result) return c.json({ error: "Group not found" }, 404);
    return c.json(result);
});

groups.post("/", async (c) => {
    const body = await c.req.json<{
        name: string;
        parentGroupId?: Id<"groups">;
    }>();
    const result = await convex.mutation(convexGroups.mutation.create, body);
    return c.json(result, 201);
});

groups.patch("/:id", async (c) => {
    const id = c.req.param("id") as Id<"groups">;
    const body = await c.req.json<{
        name?: string;
        parentGroupId?: Id<"groups">;
    }>();
    const result = await convex.mutation(convexGroups.mutation.update, {
        id,
        ...body,
    });
    return c.json(result);
});

groups.delete("/:id", async (c) => {
    const id = c.req.param("id") as Id<"groups">;
    const result = await convex.mutation(convexGroups.mutation.remove, { id });
    return c.json(result);
});

groups.post("/:id/members", async (c) => {
    const groupId = c.req.param("id") as Id<"groups">;
    const { userId, role } = await c.req.json<{
        userId: Id<"users">;
        role?: string;
    }>();
    const result = await convex.mutation(convexGroups.mutation.addMember, {
        groupId,
        userId,
        role,
    });
    return c.json(result, 201);
});

groups.delete("/:id/members/:userId", async (c) => {
    const groupId = c.req.param("id") as Id<"groups">;
    const userId = c.req.param("userId") as Id<"users">;
    const result = await convex.mutation(convexGroups.mutation.removeMember, {
        groupId,
        userId,
    });
    return c.json(result);
});
