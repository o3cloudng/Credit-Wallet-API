import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import knex from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "demo_credit_secret";

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // Verify and decode the JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    // Fetch the user from the database to ensure they still exist
    const user = await knex("users").where({ id: decoded.userId }).first();
    if (!user) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    // Attach user info to request object
    (req as any).user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err: any) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
