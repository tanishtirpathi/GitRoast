import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import type { SignOptions } from "jsonwebtoken";
import { IUser } from "../types/user.types.js";
import { IUserMethods } from "../types/user.types.js";


const UserSchema = new Schema<IUser, mongoose.Model<IUser, {}, IUserMethods>, IUserMethods>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    RefreshToken: { type: String},
    password: { type: String, required: true, minlength: 6, select: false },
}, { timestamps: true })

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  const expiresIn: SignOptions["expiresIn"] =
    (process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";

  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn,
  });
};

UserSchema.methods.generateRefreshToken = function () {
  const expiresIn: SignOptions["expiresIn"] =
    (process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn,
  });
};


const User = mongoose.model<IUser, mongoose.Model<IUser, {}, IUserMethods>>("User", UserSchema)


export default User