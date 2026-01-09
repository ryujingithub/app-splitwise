import { Hono } from "hono";
import { cors } from "hono/cors";
import { users } from "./routes/users";
import { bills } from "./routes/bills";
import { groups } from "./routes/groups";
import { ocr } from "./routes/ocr";
import { aiModels } from "./routes/ai-models";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "../convex/_generated/server";

const app: HonoWithConvex<ActionCtx> = new Hono();
// 3. CORS Configuration
app.use(
    "/api/*",
    cors({
        // In production, you might want to change this to your actual domain
        // or just keep it * if you are comfortable with that.
        origin: "http://localhost:5173",
    })
);

// app.get("/listMessages/:userId{[0-9]+}", async (c) => {
//     const userId = c.req.param("userId");
//     const messages = await c.env.runQuery(api.messages.getByAuthor, {
//         authorNumber: userId,
//     });
//     return c.json(messages);
// });

app.route("/users", users);
app.route("/groups", groups);
app.route("/bills", bills);
app.route("/ocr", ocr);
app.route("/models", aiModels);

export default app;
