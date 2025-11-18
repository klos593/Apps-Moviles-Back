import { PrismaClient, ServiceState } from '@prisma/client';
import type { Request, Response } from 'express';

const prisma = new PrismaClient();

export async function getUserActiveServices(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return [];

  const services = await prisma.service.findMany({
    where: {
      userId: user.id,
      state: {
        in: ["ACCEPTED", "PENDING"],
      },
    },
    orderBy: { date: "desc" },
    include: {
      profession: { select: { name: true } },
      provider: { select: { name: true, lastName: true } },
      address: {
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

  return services.map((s) => ({
    id: String(s.id),
    name: s.provider.name,
    lastName: s.provider.lastName,
    profession: s.profession.name,
    date: s.date.toISOString(),
    state: s.state,
    address: {
      street: s.address.street,
      number: s.address.number,
      postalCode: s.address.postalCode,
      country: s.address.country,
      province: s.address.province,
      floor: s.address.floor,
    },
  }));
}

export async function getFinishedUsedServices(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return [];

  const services = await prisma.service.findMany({
    where: {
      userId: user.id,
      state: {
        in: ["COMPLETED", "REJECTED", "CANCELED"],
      },
    },
    orderBy: { date: "desc" },
    include: {
      profession: { select: { name: true } },
      provider: { select: { name: true, lastName: true } },
      address: {
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

  return services.map((s) => ({
    id: String(s.id),
    name: s.provider.name,
    lastName: s.provider.lastName,
    profession: s.profession.name,
    date: s.date.toISOString(),
    state: s.state,
    address: {
      street: s.address.street,
      number: s.address.number,
      postalCode: s.address.postalCode,
      country: s.address.country,
      province: s.address.province,
      floor: s.address.floor,
    },
  }));
}

export async function getProviderActiveServices(email: string) {
  const provider = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!provider) return [];

  const services = await prisma.service.findMany({
    where: {
      providerId: provider.id,
      state: {
        in: ["ACCEPTED", "PENDING"],
      },
    },
    orderBy: { date: "desc" },
    include: {
      profession: { select: { name: true } },
      user: { select: { name: true, lastName: true } },
      address: {
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

  return services.map((s) => ({
    id: String(s.id),
    name: s.user.name,
    lastName: s.user.lastName,
    profession: s.profession.name,
    date: s.date.toISOString(),
    state: s.state,
    address: {
      street: s.address.street,
      number: s.address.number,
      postalCode: s.address.postalCode,
      country: s.address.country,
      province: s.address.province,
      floor: s.address.floor,
    },
  }));
}

export async function getFinishedProvidedServices(email: string) {
  const provider = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!provider) return [];

  const services = await prisma.service.findMany({
    where: {
      providerId: provider.id,
      state: {
        in: ["COMPLETED", "REJECTED", "CANCELED"],
      },
    },
    orderBy: { date: "desc" },
    include: {
      profession: { select: { name: true } },
      user: { select: { name: true, lastName: true } },
      address: {
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

  return services.map((s) => ({
    id: String(s.id),
    name: s.user.name,
    lastName: s.user.lastName,
    profession: s.profession.name,
    date: s.date.toISOString(),
    state: s.state,
    address: {
      street: s.address.street,
      number: s.address.number,
      postalCode: s.address.postalCode,
      country: s.address.country,
      province: s.address.province,
      floor: s.address.floor,
    },
  }));
}

export async function getServiceInfoById(id: number) {
  const service = await prisma.service.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      date: true,
      state: true,
      price: true,
      rating: true,
      comment: true,
      provider: {
        select: {
          id: true,
          name: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      user: {
        select: {
          name: true,
          lastName: true,
        },
      },
      profession: {
        select: {
          name: true,
        },
      },
      address: {
        select: {
          street: true,
          number: true,
          floor: true,
          province: true,
          country: true,
        },
      },
    },
  });

  return service;
}

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    if (!Object.values(ServiceState).includes(state)) {
      return res.status(400).json({
        error: 'Estado de servicio inválido',
      });
    }

    const existingService = await prisma.service.findUnique({
      where: { id: Number(id) },
      include: {
        provider: true,
        profession: true,
        address: true,
      },
    });

    if (!existingService) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
      });
    }

    const updatedService = await prisma.service.update({
      where: { id: Number(id) },
      data: { state },
      include: {
        provider: {
          select: { name: true, lastName: true },
        },
        profession: {
          select: { name: true },
        },
        address: {
          select: {
            street: true,
            number: true,
            floor: true,
            province: true,
            country: true,
          },
        },
      },
    });

    const response = {
      id: updatedService.id,
      state: updatedService.state,
      date: updatedService.date,
      price: updatedService.price,
      rating: updatedService.rating ? Number(updatedService.rating) : null,
      comment: updatedService.comment,
      provider: updatedService.provider,
      profession: updatedService.profession,
      address: updatedService.address,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error al actualizar el estado del servicio:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al actualizar el estado del servicio',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const {
      professionId,
      userId,
      providerId,
      rating,
      price,
      comment,
      date,
      addressId,
      state,
    } = req.body;

    // Validaciones de campos requeridos
    if (!professionId) {
      return res.status(400).json({
        error: 'El campo professionId es requerido',
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: 'El campo userId es requerido',
      });
    }

    if (!providerId) {
      return res.status(400).json({
        error: 'El campo providerId es requerido',
      });
    }

    if (!date) {
      return res.status(400).json({
        error: 'El campo date es requerido',
      });
    }

    // Validar que la profesión existe
    const profession = await prisma.profession.findUnique({
      where: { id: professionId },
    });

    if (!profession) {
      return res.status(404).json({
        error: 'La profesión especificada no existe',
      });
    }

    // Validar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: 'El usuario especificado no existe',
      });
    }

    // Validar que el proveedor existe
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({
        error: 'El proveedor especificado no existe',
      });
    }

    // Validar que la dirección existe (si se proporciona)
    if (addressId) {
      const address = await prisma.address.findUnique({
        where: { id: addressId },
      });

      if (!address) {
        return res.status(404).json({
          error: 'La dirección especificada no existe',
        });
      }
    }

    // Crear el servicio
    const service = await prisma.service.create({
      data: {
        professionId,
        userId,
        providerId,
        rating: rating,
        price: price,
        comment: comment,
        date: date,
        addressId: addressId,
        state: 'PENDING',
      },
      include: {
        profession: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
            picture: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
            picture: true,
            rating: true,
          },
        },
        address: true,
      },
    });

    return res.status(201).json({
      message: 'Servicio creado exitosamente',
      service,
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al crear el servicio',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export async function getProfessionalReviews(professionalId: number) {
  const reviews = await prisma.service.findMany({
    where: {
      professionId: professionalId,
    },
    orderBy: {
      id: 'desc',
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      user: {
        select: {
          name: true,
          lastName: true,
        },
      },
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    userName: `${r.user.name} ${r.user.lastName}`,
  }));
}