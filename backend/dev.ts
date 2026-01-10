// src/server/dev.ts
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import app from "./index";
import { Bindings } from "./types/bindings.type";

const env: Bindings = {
    CONVEX_URL: process.env.CONVEX_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY!,
};

const devApp = new Hono<{ Bindings: Bindings }>();

devApp.use("*", async (c, next) => {
    c.env = env;
    await next();
});

devApp.route("/", app);

serve({
    fetch: devApp.fetch,
    port: 3001,
});

console.log("🚀 Dev server running on http://localhost:3001");
