// backend/src/routes/test.ts
import { Hono } from "hono";

export const test = new Hono();

test.get("/ping", (c) => {
    return c.json({
        ok: true,
        message: "pong",
        timestamp: new Date().toISOString(),
    });
});
