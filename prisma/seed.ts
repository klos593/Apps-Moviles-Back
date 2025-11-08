import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const PROFESIONES = [
  "Gasista",
  "Electricista",
  "Plomero",
  "Paseador",
  "Limpieza",
  "Entrenador",
  "Pintor",
];

async function main() {
  // 1️⃣ Crear profesiones
  const profesiones = await Promise.all(
    PROFESIONES.map((p) =>
      prisma.profession.upsert({
        where: { name: p },
        update: {},
        create: {
          name: p,
          picture: `https://example.com/${p.toLowerCase()}.png`,
        },
      })
    )
  );

  // 2️⃣ Crear usuarios (clientes/proveedores)
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `Nombre${i}`,
        lastName: `Apellido${i}`,
        password: "hashed_password",
        phone: `+54 9 11 ${Math.floor(10000000 + Math.random() * 89999999)}`,
        picture: `https://randomuser.me/api/portraits/men/${i}.jpg`,
        rating: (Math.random() * 5).toFixed(1),
        description: "Profesional responsable y con experiencia.",
        workRadius: (Math.random() * 10 + 5).toFixed(1),
        Address: {
          create: {
            street: "Calle Falsa",
            number: 100 + i,
            postalCode: 1000 + i,
            country: "Argentina",
            province: "Buenos Aires",
            floor: `${i}`,
          },
        },
      },
    });
    users.push(user);
  }

  // 3️⃣ Asignar entre 1 y 3 profesiones a cada usuario
  for (const user of users) {
    const cantidad = Math.floor(Math.random() * 3) + 1; // entre 1 y 3
    const shuffled = [...profesiones].sort(() => 0.5 - Math.random());
    const elegidas = shuffled.slice(0, cantidad);

    for (const profesion of elegidas) {
      await prisma.userProfession.create({
        data: {
          userId: user.id,
          professionId: profesion.id,
        },
      });
    }
  }

  // 4️⃣ Crear algunos servicios entre usuarios (provider ↔ user)
  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    let provider = users[Math.floor(Math.random() * users.length)];
    if (!user || !provider) continue;
    while (provider && provider.id === user.id) {
      provider = users[Math.floor(Math.random() * users.length)];
      if (!provider) break;
    }
    if (!provider) continue;

    const profesion = profesiones[Math.floor(Math.random() * profesiones.length)];
    if (!profesion) continue;

    await prisma.service.create({
      data: {
        userId: user.id,
        providerId: provider.id,
        professionId: profesion.id,
        rating: (Math.random() * 5).toFixed(1),
        price: (Math.random() * 2000 + 1000).toFixed(2),
        comment: "Excelente servicio.",
        date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30), // en el último mes
      },
    });
  }

  console.log("✅ Seed completada correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
