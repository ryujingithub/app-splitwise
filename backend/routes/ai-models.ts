import { Hono } from "hono";

// Types for Google API Response
interface GoogleModel {
    name: string;
    version: string;
    displayName: string;
    description: string;
    inputTokenLimit: number;
    outputTokenLimit: number;
    supportedGenerationMethods: string[];
}

interface GoogleModelListResponse {
    models: GoogleModel[];
}
type Env = {
    GOOGLE_API_KEY: string;
};
export const aiModels = new Hono<{ Bindings: Env }>();

aiModels.get("/", async (c) => {
    const apiKey = c.env.GOOGLE_API_KEY;
    if (!apiKey) return c.json({ error: "Server misconfigured" }, 500);

    try {
        // 1. Fetch live models from Google REST API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) throw new Error("Failed to fetch models from Google");

        const data = (await response.json()) as GoogleModelListResponse;

        // 2. Filter & Map Pricing (Pricing is not in API, must be mapped manually)
        const models = data.models
            .filter(
                (m) =>
                    // Must support generating content and NOT be a text-embedding model
                    m.supportedGenerationMethods.includes("generateContent") &&
                    !m.name.includes("embedding")
            )
            .map((m) => {
                let costDescription = "Standard";
                let isCheapest = false;

                // Manual Pricing Heuristics (As of 2024/25)
                if (m.name.includes("flash")) {
                    costDescription =
                        "$0.075 / 1M tokens (Free Tier Available)";
                    isCheapest = true;
                } else if (m.name.includes("pro")) {
                    costDescription = "$3.50 / 1M tokens";
                }

                return {
                    id: m.name.replace("models/", ""), // clean id: "gemini-1.5-flash"
                    name: m.displayName,
                    description: m.description,
                    limit: m.inputTokenLimit,
                    price: costDescription,
                    isCheapest,
                };
            })
            // Sort: Cheapest first
            .sort((a, b) =>
                a.isCheapest === b.isCheapest ? 0 : a.isCheapest ? -1 : 1
            );

        return c.json(models);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to retrieve models" }, 500);
    }
});
