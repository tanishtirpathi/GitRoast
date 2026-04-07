import dotenv from "dotenv";

dotenv.config();

export const ENV = {
	NODE_ENV: process.env.NODE_ENV ?? "development",
	PORT: Number(process.env.PORT ?? 3000),
	MONGODB_URI: process.env.MONGODB_URI ?? "",
};
