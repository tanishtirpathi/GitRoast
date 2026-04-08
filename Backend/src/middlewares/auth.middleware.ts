import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

type AuthPayload = JwtPayload & { id?: string };

export type AuthenticatedRequest = Request & {
  userId?: string;
};

const extractToken = (req: Request): string | undefined => {
  const cookieToken = req.cookies?.accessToken as string | undefined;
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return undefined;
  }

  return authHeader.slice(7);
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT secret is not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    if (!decoded?.id) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
