import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

export const ocr = new Hono();

// INIT GEMINI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

ocr.post("/process", async (c) => {
    try {
        const body = await c.req.parseBody();

        // 1. Extract File and Model from FormData
        const file = body["file"];
        const modelId = (body["model"] as string) || "gemini-1.5-flash"; // Fallback default

        if (!file || !(file instanceof File)) {
            return c.json({ error: "No image provided" }, 400);
        }

        // 2. Convert File to Base64
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");

        // 3. Initialize the specific model requested by frontend
        // Note: This relies on the frontend sending valid model strings (e.g., 'gemini-2.0-flash-exp')
        const model = genAI.getGenerativeModel({ model: modelId });

        // STRICT PROMPT FOR TABLE FORMAT
        const prompt = `
      Analyze this receipt image.
      Extract the items into a Markdown table with these exact columns:
      | Item Name | Qty | Price | Total Price |

      Rules:
      1. 'Item Name' should be the description.
      2. 'Qty' defaults to 1 if not visible.
      3. 'Price' is unit price.
      4. 'Total Price' is the line total.
      5. Return ONLY the markdown table. No conversational text.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.type,
                },
            },
        ]);

        const response = result.response;
        const text = response.text();

        return c.json({ markdown: text });
    } catch (error) {
        console.error("OCR Error:", error);
        // Handle specific model not found errors gracefully
        return c.json(
            { error: "Failed to process bill. The model may be unavailable." },
            500
        );
    }
});
