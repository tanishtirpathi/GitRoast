import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import {  Response } from "express";
import Convo from "../models/convo.model.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js"

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "default-api-key");

export const handleChat = async (req:AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).userId;
        
        if (!userId) {
             res.status(401).json({ error: "Unauthorized" });
             console.log("Unauthorized access attempt to /chat endpoint.");
             return;
        }
        const { message } = req.body as { message: string };

        if (!message || typeof message !== "string") {
            res.status(400).json({ error: "Message must be a non-empty string." });
            return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite"});
        const result = await model.generateContent(`talk like the human Who is talking the interview of another human and this is his reply and make sure u should talk pure like human answer : ${message} , btw ask one follow up question based on this `);

        // ✅ Corrected extraction
        const reply = result?.response?.text()?.trim() || "Sorry, I couldn’t generate a reply.";
       
        const convo = await Convo.create({ user: userId, UserAnswer: message });
        if(!convo) {
            console.error(`Failed to save conversation for user ${userId}`);
            res.status(500).json({ error: "Failed to save conversation." });
            return;
        }
        await convo.save();
        
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