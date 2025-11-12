import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
        picture: true,
        Address: {
          select: {
            street: true,
            number: true,
          },
        },
      },
    });

    const formattedUser = {
      id: user.id,
      mail: user.email, 
      name: user.name,
      lastName: user.lastName,
      phone: user.phone, 
      street: user.Address.map((up: { street: string }) => up.street), 
      number: user.Address.map((up: { number: number }) => up.number),
    };

    return formattedUser;
}

export async function updateUserByEmail(req: Request, res: Response) {
  const { email } = req.params;
  if (!email) return res.status(400).json({ message: "Email param is required" });


  const { name, lastName, phone, street, number } = req.body as {
    name?: string;
    lastName?: string;
    phone?: string;
    street?: string;
    number?: number | string;
  };

  // si no vino nada actualizable, devolvé 400 (opcional)
  if (
    name === undefined &&
    lastName === undefined &&
    phone === undefined &&
    street === undefined &&
    number === undefined
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
        Address: {
          take: 1,
          select: {
            street: true,
            number: true,
            postalCode: true,
            country: true,
            province: true,
            floor: true,
          },
        },
      },
    });
    if (!existing) return res.status(404).json({ message: "User not found" });

    const userId = existing.id;
    const currentAddr = existing.Address?.[0] ?? null;

    const userPatch: any = {};
    if (name !== undefined) userPatch.name = name;
    if (lastName !== undefined) userPatch.lastName = lastName;
    if (phone !== undefined) userPatch.phone = phone;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let updatedUser = {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        lastName: existing.lastName,
        phone: existing.phone,
      };

      if (Object.keys(userPatch).length > 0) {
        updatedUser = await tx.user.update({
          where: { email },
          data: userPatch,
          select: { id: true, email: true, name: true, lastName: true, phone: true },
        });
      }

      let returnedAddress = currentAddr;

      const wantsAddressChange = street !== undefined || number !== undefined;
      if (wantsAddressChange) {
        const nextStreet = street !== undefined ? String(street).trim() : currentAddr?.street;
        const nextNumberRaw = number !== undefined ? number : currentAddr?.number;
        const nextNumber = Number(nextNumberRaw);

        if (!nextStreet || Number.isNaN(nextNumber as number)) {
          throw new Error("Si se modifica la direccion, se debe ingresar un numero.");
        }

        if (currentAddr) {
          await tx.address.deleteMany({ where: { userId } });
          returnedAddress = await tx.address.create({
            data: {
              userId,
              street: nextStreet,
              number: nextNumber!,
              postalCode: currentAddr.postalCode, 
              country: currentAddr.country,       
              province: currentAddr.province,    
              floor: currentAddr.floor ?? "",     
            },
            select: {
              street: true, number: true, postalCode: true, country: true, province: true, floor: true,
            },
          });
        }
      }

      return { updatedUser, returnedAddress };
    });

    return res.json({
      ...result.updatedUser,
      mail: result.updatedUser.email, // si tu front espera "mail"
      address: result.returnedAddress ?? null,
    });
  } catch (err: any) {
    console.error(err);
    if (err.message?.includes("Street and number")) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal error" });
  }
}