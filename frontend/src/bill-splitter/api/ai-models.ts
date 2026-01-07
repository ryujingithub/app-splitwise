import { z } from "zod";
import { STATIC_MODELS } from "@/data/static-models";
import { AIModel } from "../types/ai-model.types";

export const aiModelSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    limit: z.number().optional(),
    price: z.string().optional(),
    isCheapest: z.boolean().optional(),
});

const responseSchema = z.object({
    data: z.array(aiModelSchema),
});

export const modelApi = {
    getLocal: async (): Promise<AIModel[]> => {
        return new Promise((resolve) => resolve(STATIC_MODELS));
    },

    fetchRemote: async (): Promise<AIModel[]> => {
        const response = await fetch(`/api/models`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to sync models");

        const json = await response.json();
        // Validate response
        const parsed = responseSchema.parse(json);
        return parsed.data;
    },
};
