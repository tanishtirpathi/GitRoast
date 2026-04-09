import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { Response } from "express";
import Convo from "../models/convo.model.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js"

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "default-api-key");

export const handleChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // check user is authenticated or not
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            console.log("Unauthorized access attempt to /chat endpoint.");
            return;
        }

        //message aaya ya nai 
        const { message } = req.body as { message: string };


        if (!message || typeof message !== "string") {
            res.status(400).json({ error: "Message must be a non-empty string." });
            return;
        }
        // model of ai 
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        // ai ki histroy 
        const history = await Convo.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(4);
        // histroy nikalni 
        const formattedHistory = history
            .reverse()
            .map(c => `User: ${c.UserAnswer}\nAI: ${c.AI || ""}`)
            .join("\n");

        const prompt = `
                            You are a Interview AI assistant who talk like a human.

                            Here is the recent conversation:
                            ${formattedHistory}

                            Now the user answer this :
                            "${message}"

                            reply naturally, keeping context in mind.
                             and also make sure to ask the follow up questions based 
                             on the user answer.and keep the conversation in flow 

                             also make sure u don't get destracted from the topic which is HTML and CSS and also make sure to ask short and simple question.
                             
                            `;


        const result = await model.generateContent(prompt);

        const reply = result?.response?.text()?.trim() || "Sorry, I couldn’t generate a reply.";
        console.log("FULL AI RESPONSE:", result);

        console.log("TEXT:", result?.response?.text());

        console.log("RESPONSE OBJECT:", reply.length);

        const convo = await Convo.create({ user: userId, UserAnswer: message, AI: reply });
        if (!convo) {
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
        console.log("Error message:", message);
        res.status(500).json({
            error: "Gemini API request failed.",
            details: message,
        });
    }
};
export const startChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            console.log("Unauthorized access attempt to /chat endpoint.");
            return;
        }
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const StartingQuerstion = await model.generateContent(" ac as the Interviewer and ask a question based on this topic html and css make sure to ask short and simple question ");
        const startingreply = StartingQuerstion?.response?.text()?.trim() || "Sorry, I couldn’t generate a reply.";

        const convo = await Convo.create({ user: userId, AI: startingreply });
        if (!convo) {
            console.error(`Failed to save conversation for user ${userId}`);
            res.status(500).json({ error: "Failed to save conversation." });
            return;
        }
        await convo.save();

        res.json({ startingreply });
    } catch (error) {
        console.error("Gemini API Error:", error);

        let message = "Unknown error";

        if (error instanceof Error) {
            message = error.message;
        }
        console.log("Error message:", message);
        res.status(500).json({
            error: "Gemini API request failed.",
            details: message,
        });
    }
}