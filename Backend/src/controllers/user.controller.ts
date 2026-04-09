import { Request, Response } from "express"
import User from "../models/user.model.js"
import { cookieOptions as CookieOptions } from "../types/user.types.js"
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js"




const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "lax" as const,
};



export const Signup = async (req: Request, res: Response) => {
    //algorithm 
    // user sends name, email and password
    // validate the input
    // check if the user already exists
    // hash the password
    // save the user to the database
    // return a success message or token
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email and password" })
    }

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const newUser = await User.create({ name, email, password })

        if (!newUser) {
            return res.status(400).json({ message: "Failed to create user" })
        }
        const accessToken = newUser.generateAccessToken();

        const refreshToken = newUser.generateRefreshToken();

        newUser.RefreshToken = refreshToken;

        await newUser.save();

        const createdUser = await User.findById(newUser._id).select(
            "-password -RefreshToken",
        );


        res.status(201).cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 minutes
        }).cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            }).json({ message: "User created successfully", user: createdUser })

        console.log(`User created successfully: ${newUser}`)

    } catch (error) {
        res.status(500).json({ message: "Server error", error })
        console.log(error)
    }
}

export const Login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" })
    }

    try {
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" })
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" })
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.RefreshToken = refreshToken;
        await user.save();
        const loggedInUser = await User.findById(user._id).select(
            "-password -RefreshToken",);



        res.status(200).cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 30 * 60 * 1000, // 30 minutes
        })
            .cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            }).json({ message: "Logged in successfully", user: loggedInUser })
        console.log(`User logged in successfully: ${user}`)
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
        console.log(error)
    }
}

export const Logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await User.findOneAndUpdate(
                { RefreshToken: refreshToken },
                { $set: { RefreshToken: "" } },
                { new: false },
            );
        }

        res.clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({ message: "Logged out successfully" })

        console.log("User logged out successfully")
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
        console.log(error)
    }
}

export const GetCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const user = await User.findById(req.userId).select("-password -RefreshToken")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
        console.log(error)
    }
}
