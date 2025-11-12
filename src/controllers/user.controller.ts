import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

/** GET user by email (legacy shape) */
export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      lastName: true,
      phone: true,
      picture: true,
      userAddresses: {
        include: { address: { select: { street: true, number: true } } },
      },
    },
  });

  return {
    id: user.id,
    mail: user.email,
    name: user.name,
    lastName: user.lastName,
    phone: user.phone,
    street: user.userAddresses.map((ua) => ua.address.street),
    number: user.userAddresses.map((ua) => ua.address.number),
  };
}

/**
 * PATCH-like: actualiza datos básicos y, si viene dirección,
 * CREA una nueva Address y la asocia (no modifica ni borra las anteriores).
 */
export async function updateUserByEmail(req: Request, res: Response) {
  const { email } = req.params;
  if (!email) return res.status(400).json({ message: "Email param is required" });

  const { name, lastName, phone, street, number, postalCode, country, province, floor } = req.body as {
    name?: string;
    lastName?: string;
    phone?: string;
    street?: string;
    number?: number | string;
    postalCode?: number | string;
    country?: string;
    province?: string;
    floor?: string;
  };

  if (
    name === undefined &&
    lastName === undefined &&
    phone === undefined &&
    street === undefined &&
    number === undefined &&
    postalCode === undefined &&
    country === undefined &&
    province === undefined &&
    floor === undefined
  ) {
    return res.status(400).json({ message: "No fields to update" });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
        // Traemos 1 dirección (la más “antigua/primaria” si querés). Podés ordenar por createdAt si lo agregás.
        userAddresses: {
          take: 1,
          include: {
            address: {
              select: {
                id: true,
                street: true,
                number: true,
                postalCode: true,
                country: true,
                province: true,
                floor: true,
              },
            },
          },
        },
      },
    });
    if (!existing) return res.status(404).json({ message: "User not found" });

    const userPatch: Record<string, unknown> = {};
    if (name !== undefined) userPatch.name = name;
    if (lastName !== undefined) userPatch.lastName = lastName;
    if (phone !== undefined) userPatch.phone = phone;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1) actualizar datos básicos
      const updatedUser =
        Object.keys(userPatch).length > 0
          ? await tx.user.update({
              where: { email },
              data: userPatch,
              select: { id: true, email: true, name: true, lastName: true, phone: true },
            })
          : {
              id: existing.id,
              email: existing.email,
              name: existing.name,
              lastName: existing.lastName,
              phone: existing.phone,
            };

      // 2) si viene dirección, crear una NUEVA (sin tocar las previas)
      let returnedAddress:
        | {
            street: string;
            number: number;
            postalCode: number;
            country: string;
            province: string;
            floor: string | null;
          }
        | null = null;

      const wantsAddressChange =
        street !== undefined || number !== undefined || postalCode !== undefined || country !== undefined || province !== undefined || floor !== undefined;

      if (wantsAddressChange) {
        // Campos requeridos por el modelo Address:
        // street, number, postalCode, country, province, floor
        const prev = existing.userAddresses[0]?.address ?? null;

        const nextStreet = street ?? prev?.street;
        const nextNumber = number !== undefined ? Number(number) : prev?.number;
        const nextPostal = postalCode !== undefined ? Number(postalCode) : prev?.postalCode ?? 0;
        const nextCountry = country ?? prev?.country ?? "";
        const nextProvince = province ?? prev?.province ?? "";
        const nextFloor = floor ?? prev?.floor ?? "";

        if (!nextStreet || nextNumber === undefined || Number.isNaN(nextNumber)) {
          throw new Error("Si se modifica la dirección, se debe ingresar street y number válidos.");
        }

        const createdAddr = await tx.address.create({
          data: {
            street: String(nextStreet).trim(),
            number: nextNumber,
            postalCode: nextPostal,
            country: nextCountry,
            province: nextProvince,
            floor: nextFloor,
          },
          select: {
            id: true,
            street: true,
            number: true,
            postalCode: true,
            country: true,
            province: true,
            floor: true,
          },
        });

        await tx.userAddress.create({
          data: { userId: existing.id, addressId: createdAddr.id },
        });

        const { id: _omit, ...addrOut } = createdAddr;
        returnedAddress = addrOut;
      } else if (existing.userAddresses[0]?.address) {
        const { id: _omit, ...addrOut } = existing.userAddresses[0].address;
        returnedAddress = addrOut;
      }

      return { updatedUser, returnedAddress };
    });

    return res.json({
      ...result.updatedUser,
      mail: result.updatedUser.email,
      address: result.returnedAddress ?? null, // si creaste una nueva, vuelve esa; si no, la primera existente
    });
  } catch (err: any) {
    console.error(err);
    if (typeof err.message === "string" && err.message.includes("dirección")) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal error" });
  }
}
