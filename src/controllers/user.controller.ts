import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      lastName: true,
      phone: true,
      rating: true,
      description: true,
      picture: true,
      userAddresses: {
        take: 1,
        orderBy: { address: { id: "desc" } },
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
            }
          },
        },
      },
    },
  });

  const lastAddress = user.userAddresses[0]?.address;

  return {
    id: user.id,
    mail: user.email,
    name: user.name,
    lastName: user.lastName,
    phone: user.phone,
    rating: user.rating,
    picture: user.picture,
    description: user.description,
    address: lastAddress
  };
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const {
      name,
      lastName,
      phone,
      street,
      number,
      floor,
      province,
      country,
      description,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        userAddresses: {
          include: {
            address: true,
          },
          orderBy: {
            addressId: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
      });
    }

    const currentAddress = existingUser.userAddresses[0]?.address;
    let addressChanged = false;

    if (currentAddress) {
      addressChanged =
        currentAddress.street !== street ||
        currentAddress.number !== number ||
        currentAddress.floor !== floor ||
        currentAddress.province !== province ||
        currentAddress.country !== country;
    } else {
      addressChanged = true;
    }

    let newAddressId = currentAddress?.id;

    if (addressChanged) {
      const existingAddress = await prisma.address.findFirst({
        where: {
          street,
          number,
          floor,
          province,
          country,
        },
      });

      if (existingAddress) {
        newAddressId = existingAddress.id;
      } else {
        const newAddress = await prisma.address.create({
          data: {
            street,
            number,
            floor,
            province,
            country,
            postalCode: 0, 
          },
        });
        newAddressId = newAddress.id;
      }

      const existingUserAddress = await prisma.userAddress.findUnique({
        where: {
          userId_addressId: {
            userId: existingUser.id,
            addressId: newAddressId!,
          },
        },
      });

      if (!existingUserAddress) {
        await prisma.userAddress.create({
          data: {
            userId: existingUser.id,
            addressId: newAddressId!,
          },
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        lastName,
        phone,
        description,
      },
      include: {
        userAddresses: {
          include: {
            address: true,
          },
          orderBy: {
            addressId: 'desc',
          },
          take: 1,
        },
        UserProfession: {
          include: {
            profession: true,
          },
        },
      },
    });

    const response = {
      id: updatedUser.id,
      mail: updatedUser.email,
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      rating: updatedUser.rating ? Number(updatedUser.rating) : 0,
      picture: updatedUser.picture,
      description: updatedUser.description,
      address: updatedUser.userAddresses[0]?.address || {
        street: '',
        number: 0,
        postalCode: 0,
        country: '',
        province: '',
        floor: '',
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al actualizar usuario',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export async function updatePicture(req: Request, res: Response) {
  try {
    const { userId, pictureUrl } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!pictureUrl) {
      return res.status(400).json({ error: 'Picture URL is required' });
    }

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    try {
      new URL(pictureUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid picture URL format' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { picture: pictureUrl },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        picture: true,
        phone: true,
        rating: true,
        description: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
    });

  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export async function getUserIdAndAddressByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      userAddresses: {
        orderBy: {
          addressId: "desc",
        },
        take: 1,
        select: {
          addressId: true
        },
      },
    },
  });

  if (!user || user.userAddresses.length === 0) {
    return null;
  }

  const ua = user.userAddresses[0]!;

  return {
    userId: user.id,
    addressId: ua.addressId,
  };
}
