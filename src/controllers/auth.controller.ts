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
    const {
      email,
      password,
      name,
      lastName = "",
      phone = "",
      address, 
    } = req.body as {
      email: string;
      password: string;
      name: string;
      lastName?: string;
      phone?: string;
      address?: {
        country?: string;
        province?: string;
        street?: string;
        number?: number | string;
        floor?: string;
        postalCode?: number | string;
      };
    };

    // 1) email único
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already exists" });

    // 2) hash pass
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);


    // 4) create atómico con include para devolver Address
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
        lastName,
        phone,
        picture: "",
        description: "",
        Address: {
          create: {
            country: String(address!.country),
            province: String(address!.province),
            street: String(address!.street),
            number: Number(address!.number),        
            floor: String(address!.floor),
            postalCode: Number(address!.postalCode), 
          },
        },
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_S }
    );

    const { password: _omit, ...safeUser } = user;
    return res.status(201).json({ token, user: safeUser });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
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