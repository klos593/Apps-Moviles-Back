import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "super-secret-key";
const JWT_EXPIRES_S = Number(process.env.JWT_EXPIRES_S ?? 60 * 60 * 24 * 7);
const signOpts: SignOptions = { expiresIn: JWT_EXPIRES_S };
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, lastName = "", phone = "", birthDate } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
        lastName,
        phone,
        picture: "",
        description: "",
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_S });

    const { password: _omit, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_S });

    const { password: _omit, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}