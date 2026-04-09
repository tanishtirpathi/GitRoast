import mongoose, { Schema } from "mongoose"
import { AIResponse } from "../types/ai.types.js";




const ConvoSchema = new Schema<AIResponse>({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    UserAnswer: {
        type: String,
    }, 
    AI: {
        type: String,
    }
}, { timestamps: true })

const Convo = mongoose.model("Convo", ConvoSchema)

export default Convo;
