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
          },
        },
      },
    });

    const formattedUser = {
      id: user.id,
      mail: user.email, 
      name: user.name,
      lastName: user.lastName,
      phoneNumber: user.phone, 
      professions: user.Address.map(up => up.street), 
      picture: user.picture,
    };

    return formattedUser;
}