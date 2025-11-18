import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "super-secret-key";
const JWT_EXPIRES_S = Number(process.env.JWT_EXPIRES_S ?? 60 * 60 * 24 * 7);
const signOpts: SignOptions = { expiresIn: JWT_EXPIRES_S };
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

// Helper para mapear user + userAddresses -> addresses[]
function packUserResponse(user: any) {
  const { password: _omit, userAddresses, ...rest } = user;
  const addresses =
    userAddresses?.map((ua: any) => ({
      street: ua.address.street,
      number: ua.address.number,
      postalCode: ua.address.postalCode,
      country: ua.address.country,
      province: ua.address.province,
      floor: ua.address.floor,
      id: ua.address.id,
    })) ?? [];
  return { ...rest, addresses };
}

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
      picture?: string;
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

    // 3) creación atómica: user -> (opcional) address -> userAddress
    const created = await prisma.$transaction(async (tx) => {
      // User requiere picture/description (en tu schema son String no-null)
      const user = await tx.user.create({
        data: {
          email,
          password: hash,
          name,
          lastName,
          phone,
          picture: "",         // placeholder
          description: "",     // placeholder
          // rating/workRadius son opcionales
        },
      });

      if (address?.street && address?.country && address?.province && address?.postalCode != null) {
        const addr = await tx.address.create({
          data: {
            country: String(address.country),
            province: String(address.province),
            street: String(address.street),
            number: Number(address.number ?? 0),
            floor: String(address.floor ?? ""),
            postalCode: Number(address.postalCode),
          },
        });

        await tx.userAddress.create({
          data: {
            userId: user.id,
            addressId: addr.id,
          },
        });
      }

      // devolver con sus direcciones
      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          userAddresses: {
            include: { address: true },
          },
        },
      });
    });

    if (!created) return res.status(500).json({ error: "Could not create user" });

    const token = jwt.sign({ id: created.id, email: created.email }, JWT_SECRET, signOpts);
    const safeUser = packUserResponse(created);

    return res.status(201).json({ token, user: safeUser });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // Traer con direcciones para responder igual que register
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userAddresses: { include: { address: true } },
      },
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, signOpts);
    const safeUser = packUserResponse(user);

    return res.json({ token, user: safeUser });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
