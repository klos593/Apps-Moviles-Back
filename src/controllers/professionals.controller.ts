import { prisma } from "../config/prisma.js";
import type { Request, Response } from 'express';

export async function getProfessionals(currentUserId: number) {
  const professionals = await prisma.user.findMany({
    where: {
      AND: [
        {
          UserProfession: {
            some: {}, 
          }
        },
        {
          NOT: {
            id: currentUserId 
          }
        }
      ]
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
    orderBy: {
      rating: {
        sort: 'desc',
        nulls: 'last' 
      }
    }
  });

  const formattedProfessionals = professionals.map(p => ({
    id: p.id,
    picture: p.picture,
    name: p.name,
    lastName: p.lastName,
    rating: p.rating || 0, 
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

export async function getAvailableProfessionsById(userId: number) {
  const professions = await prisma.profession.findMany({
    where: {
      UserProfession: {
        none: {
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

export async function getProfessionalsByProfession(profession: string, currentUserId: number) {
  if (!currentUserId || isNaN(currentUserId)) {
    throw new Error('currentUserId debe ser un número válido');
  }

  const professionalsFromDb = await prisma.user.findMany({
    where: {
      AND: [
        {
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
        {
          NOT: {
            id: currentUserId 
          }
        }
      ]
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
    orderBy: {
      rating: {
        sort: 'desc',
        nulls: 'last' 
      }
    }
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

export const createUserProfession = async (req: Request, res: Response) => {
  try {
    const { userId, professionId } = req.body;

    if (!userId || !professionId) {
      return res.status(400).json({
        error: 'userId y professionId son requeridos'
      });
    }

    const userIdInt = parseInt(userId);
    const professionIdInt = parseInt(professionId);

    if (isNaN(userIdInt) || isNaN(professionIdInt)) {
      return res.status(400).json({
        error: 'userId y professionId deben ser números válidos'
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userIdInt }
    });

    if (!userExists) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const professionExists = await prisma.profession.findUnique({
      where: { id: professionIdInt }
    });

    if (!professionExists) {
      return res.status(404).json({
        error: 'Profesión no encontrada'
      });
    }

    const userProfession = await prisma.userProfession.create({
      data: {
        userId: userIdInt,
        professionId: professionIdInt
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true
          }
        },
        profession: {
          select: {
            id: true,
            name: true,
            picture: true
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Profesión asignada al usuario exitosamente',
      data: userProfession
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'El usuario ya tiene asignada esta profesión'
      });
    }

    console.error('Error al crear UserProfession:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

export const deleteUserProfession = async (req: Request, res: Response) => {
  try {
    const { userId, professionId } = req.body;

    if (!userId || !professionId) {
      return res.status(400).json({
        error: 'userId y professionId son requeridos'
      });
    }

    const userIdInt = parseInt(userId);
    const professionIdInt = parseInt(professionId);

    if (isNaN(userIdInt) || isNaN(professionIdInt)) {
      return res.status(400).json({
        error: 'userId y professionId deben ser números válidos'
      });
    }

    const userProfessionExists = await prisma.userProfession.findUnique({
      where: {
        userId_professionId: {
          userId: userIdInt,
          professionId: professionIdInt
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true
          }
        },
        profession: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!userProfessionExists) {
      return res.status(404).json({
        error: 'La relación usuario-profesión no existe'
      });
    }

    await prisma.userProfession.delete({
      where: {
        userId_professionId: {
          userId: userIdInt,
          professionId: professionIdInt
        }
      }
    });

    return res.status(200).json({
      message: 'Profesión eliminada del usuario exitosamente',
      data: {
        userId: userIdInt,
        professionId: professionIdInt,
        user: userProfessionExists.user,
        profession: userProfessionExists.profession
      }
    });

  } catch (error: any) {
    console.error('Error al eliminar UserProfession:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

export async function updateRating(req: Request, res: Response){
  const { id } = req.body;

  try {
    const result = await prisma.service.aggregate({
      where: {
        providerId: id,
        rating: { not: null }, 
      },
      _avg: {
        rating: true,
      },
    });

    const avgRating = result._avg.rating; 

    
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        rating: avgRating, 
      },
      select: {
        id: true,
        rating: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error actualizando rating del usuario" });
  }
}