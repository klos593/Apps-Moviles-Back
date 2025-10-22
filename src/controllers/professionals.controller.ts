import { prisma } from "../config/prisma.js";

export async function getProfessionals() {
  const professionals = await prisma.user.findMany({
    where: {
      UserProfession: {
        some: {}, 
      },
    },
    select: {
      id: true,
      picture: true,
      name: true,
      lastName: true,
      rating: true,
      UserProfession: {
        select: {
          profession: { 
            select: {
              name: true, 
            },
          },
        },
      },
    },
  });

  const formattedProfessionals = professionals.map(p => ({
    id: p.id,
    picture: p.picture,
    name: p.name,
    lastName: p.lastName,
    rating: p.rating,
    professions: p.UserProfession.map(up => up.profession.name),
  }));

  return formattedProfessionals;
}

export async function getProfessionalById(professionalId: number) {
  const professionalFromDb = await prisma.user.findUniqueOrThrow({
      where: {
        id: professionalId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
        rating: true,
        picture: true,
        description: true,
        UserProfession: {
          select: {
            profession: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedProfessional = {
      id: professionalFromDb.id,
      mail: professionalFromDb.email, 
      name: professionalFromDb.name,
      lastName: professionalFromDb.lastName,
      phoneNumber: professionalFromDb.phone, 
      professions: professionalFromDb.UserProfession.map(up => up.profession.name),
      rating: Number(professionalFromDb.rating), 
      picture: professionalFromDb.picture,
      description: professionalFromDb.description,
    };
    
    return formattedProfessional;
}