// backend/src/routes/test.ts
import { Hono } from "hono";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Bindings } from "../types/bindings.type";

export const test = new Hono<{ Bindings: Bindings }>();

test.get("/ping", async (c) => {
    const checks = {
        timestamp: new Date().toISOString(),
        env: {
            hasConvexUrl: !!c.env.CONVEX_URL,
            hasJwtSecret: !!c.env.JWT_SECRET,
            hasBetterAuthUrl: !!c.env.BETTER_AUTH_URL,
            hasGoogleApiKey: !!c.env.GOOGLE_API_KEY,
        },
        convex: { ok: false, error: null as string | null },
    };

    if (c.env.CONVEX_URL) {
        try {
            const convex = new ConvexHttpClient(c.env.CONVEX_URL);
            await convex.query(api.features.users.query.getByEmail, {
                email: "ping@test.local",
            });
            checks.convex.ok = true;
        } catch (err) {
            checks.convex.error =
                err instanceof Error ? err.message : String(err);
        }
    } else {
        checks.convex.error = "CONVEX_URL not set";
    }

    const allOk =
        checks.env.hasConvexUrl && checks.env.hasJwtSecret && checks.convex.ok;

    return c.json({ ok: allOk, ...checks }, allOk ? 200 : 500);
});
