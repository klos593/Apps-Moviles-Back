import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProfessions() {
  const professions = await prisma.profession.findMany({
    select: {
      id: true,
      name: true,
      picture: true,
    }
  });

  return professions;
}

getProfessions()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });