import { Hono } from "hono";
import { cors } from "hono/cors";
import { users } from "./routes/users";
import { bills } from "./routes/bills";
import { groups } from "./routes/groups";
import { ocr } from "./routes/ocr";
import { aiModels } from "./routes/ai-models";
import { HonoWithConvex } from "convex-helpers/server/hono";
import { ActionCtx } from "../convex/_generated/server";
import { auth } from "./routes/auth";
import { test } from "./routes/test";

const app: HonoWithConvex<ActionCtx> = new Hono();
// 3. CORS Configuration
app.use(
    "/api/*",
    cors({
        // In production, you might want to change this to your actual domain
        // or just keep it * if you are comfortable with that.
        origin: "https://app-splitwise.ryujin-me-cloudflare.workers.dev",
    }),
);

// app.get("/listMessages/:userId{[0-9]+}", async (c) => {
//     const userId = c.req.param("userId");
//     const messages = await c.env.runQuery(api.messages.getByAuthor, {
//         authorNumber: userId,
//     });
//     return c.json(messages);
// });

app.route("/api/users", users);
app.route("/api/groups", groups);
app.route("/api/bills", bills);
app.route("/api/ocr", ocr);
app.route("/api/models", aiModels);
app.route("/api/auth", auth);
app.route("/api/test", test);

export default app;
