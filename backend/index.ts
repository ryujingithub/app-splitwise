import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { users } from "./routes/users";
import { bills } from "./routes/bills";
import { groups } from "./routes/groups";
import { ocr } from "./routes/ocr";
import { aiModels } from "./routes/ai-models";

const app = new Hono();

app.use(
    "/*",
    cors({
        origin: "http://localhost:5173",
    })
);

app.route("/api/users", users);
app.route("/api/groups", groups);
app.route("/api/bills", bills);
app.route("/api/ocr", ocr);
app.route("/api/models", aiModels);

serve({ fetch: app.fetch, port: 3001 });
