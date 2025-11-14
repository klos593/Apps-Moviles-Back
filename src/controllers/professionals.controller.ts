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
  const professional = await prisma.user.findUniqueOrThrow({
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
      id: professional.id,
      mail: professional.email, 
      name: professional.name,
      lastName: professional.lastName,
      phoneNumber: professional.phone, 
      professions: professional.UserProfession.map(up => up.profession.name),
      rating: Number(professional.rating), 
      picture: professional.picture,
      description: professional.description,
    };

    return formattedProfessional;
}

export async function getProfessionsById(userId: number) {
  const professions = await prisma.profession.findMany({
    where: {
      UserProfession: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      picture: true,
    },
  });

  return professions;
}


export async function getProfessionalsByProfession(profession: string) {
  const professionalsFromDb = await prisma.user.findMany({
      where: {
        UserProfession: {
          some: {
            profession: {
              name: {
                equals: profession,
                mode: 'insensitive', 
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        picture: true,
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

    const formattedProfessionals = professionalsFromDb.map(p => ({
      id: p.id.toString(), 
      name: p.name,
      lastName: p.lastName,
      picture: p.picture,
      rating: Number(p.rating ?? 0), 
      professions: p.UserProfession.map(up => up.profession.name), 
    }));
    
    return formattedProfessionals;
}