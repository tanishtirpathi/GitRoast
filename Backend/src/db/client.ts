import mongoose from "mongoose";

import { ENV } from "../config/env.js";

export const connectDb = async (): Promise<void> => {
	console.log(process.env.MONGODB_URI)
	try {
		if (!ENV.MONGODB_URI) {
			console.log("MONGODB_URI is not set. Skipping database connection.");
			return;
		}
		await mongoose.connect(ENV.MONGODB_URI);

		
		console.log("Connected to MongoDB successfully");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
	}
};
