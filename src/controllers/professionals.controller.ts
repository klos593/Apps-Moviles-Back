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