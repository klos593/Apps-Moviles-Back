import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  /*const user = await prisma.user.create({
    data: {
        name: "Agus",
        lastName: "Kloster",
        email: "ak@gmail.com",
        password: "12345",
        phone: "12345",
        picture: "acaVaUnaURL",
        birthDate: new Date(),
    }
  })
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)*/

  const profession = await prisma.profession.create({
    data: {
      name: "electricista",
      decription: "buen electricista",
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })