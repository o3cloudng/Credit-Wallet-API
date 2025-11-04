import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "demo_credit_secret";
const JWT_EXPIRES_IN = "3h"; // 3 Hours

export function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
