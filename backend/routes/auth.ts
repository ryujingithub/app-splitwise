import { compareSync } from "bcrypt-ts";
import { ConvexHttpClient } from "convex/browser";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { api } from "../../convex/_generated/api";
import { Bindings } from "../types/bindings.type";

export const auth = new Hono<{ Bindings: Bindings }>();
const convexUsers = api.features.users;
const salt = 10;
const getConvex = (env: Bindings) => new ConvexHttpClient(env.CONVEX_URL);

auth.post("/login", async (c) => {
    const body = await c.req.json<{
        email: string;
        password: string;
    }>();

    if (body.email.trim() === "" || body.password.trim() === "") {
        return c.json({ error: "Invalid email or password" }, 401);
    }

    const convex = getConvex(c.env);

    // Get user by email
    const user = await convex.query(convexUsers.query.getByEmail, {
        email: body.email,
    });

    if (!user) {
        return c.json({ error: "Invalid email or password" }, 401);
    }

    // Verify password
    const isValidPassword = compareSync(body.password, user.passwordHash);
    if (!isValidPassword) {
        return c.json({ error: "Invalid email or password" }, 401);
    }

    // Check if user is active
    if (!user.isActive) {
        return c.json({ error: "Account is deactivated" }, 403);
    }

    // Generate JWT token
    const payload = {
        sub: user._id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    // Return user info (exclude passwordHash)
    const { passwordHash, ...userWithoutPassword } = user;

    return c.json({
        user: userWithoutPassword,
        token,
    });
});
