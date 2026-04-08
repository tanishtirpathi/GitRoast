export interface IUser {
    name: string
    email: string
    password: string
    RefreshToken: string
    createdAt: Date
    updatedAt: Date
}
 

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export interface cookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
}