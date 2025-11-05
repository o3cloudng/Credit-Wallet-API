import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import knex from "../db.js";
import { loginSchema } from "../validators/authSchema.js";
import { generateToken } from "../utils/jwt.js";

export async function loginUser(req: Request, res: Response) {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);

    // 🔍 Check if user exists
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 🪪 Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      token,
      email: user.email,
      userId: user.id,
      message: "Login successful",
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      const formatted = err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ errors: formatted });
    }

    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
