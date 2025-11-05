import { Request, Response } from "express";
import knex from "../db.js";
import { isBlacklistedByLendsqr } from "../services/lendsqrService.js";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { createUserSchema } from "../validators/userSchema.js";
import { ZodError } from "zod";
import _ from "lodash";

export async function createUser(req: Request, res: Response) {
  const { email, firstName, lastName, password } = req.body;

  // Basic validation
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check blacklist
  const blacklisted = await isBlacklistedByLendsqr(email);
  if (blacklisted) {
    return res.status(403).json({ error: "User is blacklisted" });
  }

  try {
    //  Field validation
    createUserSchema.parse(req.body);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await knex.transaction(async (trx) => {
      // Generate UUID for this user
      const userId = randomUUID();

      // Insert user
      await trx("users").insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        password: hashedPassword,
      });

      // Create wallet with same UUID
      await trx("wallets").insert({
        id: randomUUID(),
        user_id: userId,
        balance_kobo: 0,
      });

      // Fetch created user
      const user = await trx("users").where({ id: userId }).first();
      return user;
    });

    res.status(201).json({
      id: createdUser.id,
      email: createdUser.email,
      message: "User created successfully",
    });
  }  catch (err: any) {
    // Handle validation errors
    if (err instanceof ZodError) {
      const formatted = err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ errors: formatted });
    }
  }
}


export async function getAllUsers(req: Request, res: Response) {
  try {
    const rows = await knex("users")
      .leftJoin("wallets", "users.id", "wallets.user_id")
      .leftJoin("transactions", "wallets.id", "transactions.wallet_id")
      .select(
        "users.id as user_id",
        "users.email",
        "users.first_name",
        "users.last_name",
        "users.created_at as user_created_at",
        "wallets.id as wallet_id",
        "wallets.balance_kobo",
        "wallets.created_at as wallet_created_at",
        "transactions.id as transaction_id",
        "transactions.amount_kobo",
        "transactions.type",
        "transactions.metadata",
        "transactions.created_at as transaction_created_at"
      )
      .orderBy("users.created_at", "desc");

    const users = _(rows)
      .groupBy("user_id")
      .map((userRows) => {
        const base = userRows[0];
        const wallet = base.wallet_id
          ? {
              id: base.wallet_id,
              balance_kobo: base.balance_kobo,
              created_at: base.wallet_created_at,
              transactions: userRows
                .filter((r) => r.transaction_id)
                .map((t) => ({
                  id: t.transaction_id,
                  amount_kobo: t.amount_kobo,
                  type: t.type,
                  metadata: t.metadata,
                  created_at: t.transaction_created_at,
                })),
            }
          : null;

        return {
          id: base.user_id,
          email: base.email,
          first_name: base.first_name,
          last_name: base.last_name,
          created_at: base.user_created_at,
          wallet,
        };
      })
      .value();

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function profileUser(req: Request, res: Response) {
  const userId = req.user!.id;
  // console.log("PROFILE ID: " + userId)
  try {
    // Query all users
    // const user = await knex("users")
    const rows = await knex("users")
      .where({ "users.id": userId })
      .leftJoin("wallets", "users.id", "wallets.user_id")
      .leftJoin("transactions", "wallets.id", "transactions.wallet_id")
      .select(
        "users.id as user_id",
        "users.email",
        "users.first_name",
        "users.last_name",
        "users.created_at as user_created_at",
        "wallets.id as wallet_id",
        "wallets.balance_kobo",
        "wallets.created_at as wallet_created_at",
        "transactions.id as transaction_id",
        "transactions.amount_kobo",
        "transactions.type",
        "transactions.metadata",
        "transactions.created_at as transaction_created_at"
      )      

      const user = _(rows)
        .groupBy("user_id")
        .map((userRows) => {
          const base = userRows[0];
          const wallet = base.wallet_id
            ? {
                id: base.wallet_id,
                balance_kobo: base.balance_kobo,
                created_at: base.wallet_created_at,
                transactions: userRows
                  .filter((r) => r.transaction_id)
                  .map((t) => ({
                    id: t.transaction_id,
                    amount_kobo: t.amount_kobo,
                    type: t.type,
                    metadata: t.metadata,
                    created_at: t.transaction_created_at,
                  })),
              }
            : null;

          return {
            id: base.user_id,
            email: base.email,
            first_name: base.first_name,
            last_name: base.last_name,
            created_at: base.user_created_at,
            wallet,
          };
        })
        .value();



    res.status(200).json({
      user,
      // tranx
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
