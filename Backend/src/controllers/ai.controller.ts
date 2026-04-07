import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { Request, Response } from "express";


const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "default-api-key");

export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message } = req.body as { message: string };

        if (!message || typeof message !== "string") {
            res.status(400).json({ error: "Message must be a non-empty string." });
            return
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite"});
        const result = await model.generateContent(message);

        // ✅ Corrected extraction
        const reply = result?.response?.text()?.trim() || "Sorry, I couldn’t generate a reply.";

        res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error);

        let message = "Unknown error";

        if (error instanceof Error) {
            message = error.message;
        }

        res.status(500).json({
            error: "Gemini API request failed.",
            details: message,
        });
    }
};