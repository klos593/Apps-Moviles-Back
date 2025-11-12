import { PrismaClient, Prisma, ServiceState } from "@prisma/client";

const prisma = new PrismaClient();

// -------- DATOS BASE --------
const FIRST_NAMES = [
  "Mateo","Sofía","Thiago","Valentina","Benjamín","Martina","Joaquín","Catalina",
  "Santiago","Emilia","Luca","Lucía","Tomás","Mora","Bautista","Emma","Francisco","Isabella",
  "Nicolás","Camila","Ignacio","Sol","Juan","Abril"
];

const LAST_NAMES = [
  "González","Rodríguez","Gómez","Fernández","López","Díaz","Martínez","Pérez","Sánchez",
  "Romero","Sosa","Torres","Álvarez","Ruiz","Ramírez","Flores","Acosta","Medina","Ortiz","Herrera"
];

const COUNTRIES = ["Argentina"];
const PROVINCES = ["Buenos Aires","Córdoba","Santa Fe","Mendoza","Salta","Neuquén","Tucumán","Chubut"];
const STREETS = ["Belgrano","Mitre","Rivadavia","San Martín","Sarmiento","Alsina","Italia","España","Chile","Perú"];

// Fotos random de usuarios
const avatarUrl = (i: number) =>
  `https://randomuser.me/api/portraits/${i % 2 === 0 ? "men" : "women"}/${(i % 80) + 1}.jpg`;

// Profesiones con tus imágenes Cloudinary
const PROFESSION_CATALOG = [
  { name: "Pintor", picture: "https://res.cloudinary.com/dvdw8zjel/image/upload/v1762810838/Pintor_zgedv4.png" },
  { name: "Entrenador", picture: "https://res.cloudinary.com/dvdw8zjel/image/upload/v1762810837/Entrenador_kz7iul.png" },
  { name: "Limpieza", picture: "https://res.cloudinary.com/dvdw8zjel/image/upload/v1762810836/Limpieza_buj6hy.png" },
  { name: "Plomero", picture: "https://res.cloudinary.com/dvdw8zjel/image/upload/v1762810835/Plomero_j6ocag.png" },
  { name: "Paseador", picture: "https://res.cloudinary.com/dvdw8zjel/image/upload/v1762810835/Paseador_ffvxku.png" },
  { name: "Gasista", picture: "https://res.cloudinary.com/dvdw8zjel/image/upload/v1762810835/Gasista_g9ctcu.png" },
  { name: "Electricista", picture: "https://res.cloudinary.com/dvdw8zjel/image/upload/v1762810835/Electricista_fidyc1.png" },
];

const STATES: ServiceState[] = [
  ServiceState.REJECTED,
  ServiceState.ACCEPTED,
  ServiceState.CANCELED,
  ServiceState.COMPLETED,
  ServiceState.PENDING,
];

// -------- HELPERS --------
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]) => arr[rnd(0, arr.length - 1)];
const sampleN = <T>(arr: T[], nMin: number, nMax: number) => {
  const howMany = rnd(nMin, Math.min(nMax, arr.length));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, howMany);
};
const decimal = (min: number, max: number, digits = 2) =>
  new Prisma.Decimal((Math.random() * (max - min) + min).toFixed(digits));
const phoneAr = () => `+54 9 11 ${rnd(4000, 9999)}-${rnd(1000, 9999)}`;

// Dirección aleatoria
function randomAddressInput() {
  const street = pick(STREETS);
  return {
    street,
    number: rnd(1, 4500),
    postalCode: rnd(1000, 1999),
    country: pick(COUNTRIES),
    province: pick(PROVINCES),
    floor: ["PB", "1°A", "2°B", "3°", "4°", "5°A"][rnd(0, 5)],
  };
}

// -------- MAIN SEED --------
async function main() {
  console.log("⏳ Limpiando tablas previas...");
  await prisma.$transaction([
    prisma.userAddress.deleteMany(),
    prisma.service.deleteMany(),
    prisma.userProfession.deleteMany(),
    prisma.address.deleteMany(),
    prisma.user.deleteMany(),
    prisma.profession.deleteMany(),
  ]);

  console.log("📋 Creando profesiones...");
  const professions = await Promise.all(
    PROFESSION_CATALOG.map((p) =>
      prisma.profession.create({ data: { name: p.name, picture: p.picture } })
    )
  );

  console.log("👤 Creando usuarios, direcciones y profesiones...");
  type UserCtx = { id: number; professionIds: number[]; addressIds: number[] };
  const users: UserCtx[] = [];

  for (let i = 0; i < 20; i++) {
    const name = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const email = `${name.toLowerCase()}.${lastName.toLowerCase()}${rnd(1, 999)}@mail.com`;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        lastName,
        password: "Password123!",
        phone: phoneAr(),
        workRadius: decimal(1, 20, 0),
        picture: avatarUrl(i),
        rating: decimal(3, 5, 2),
        description: `Soy ${name} ${lastName}, profesional con experiencia.`,
      },
    });

    // Direcciones (1–2)
    const addrCount = rnd(1, 2);
    const addressIds: number[] = [];
    for (let j = 0; j < addrCount; j++) {
      const addr = await prisma.address.create({ data: randomAddressInput() });
      addressIds.push(addr.id);
      await prisma.userAddress.create({ data: { userId: user.id, addressId: addr.id } });
    }

    // Profesiones (1–3)
    const chosen = sampleN(professions, 1, 3);
    for (const p of chosen) {
      await prisma.userProfession.create({ data: { userId: user.id, professionId: p.id } });
    }

    users.push({ id: user.id, professionIds: chosen.map((p) => p.id), addressIds });
  }

  console.log("🛠️ Generando servicios...");
  for (const client of users) {
    const serviceCount = rnd(2, 5);
    for (let k = 0; k < serviceCount; k++) {
      let provider = pick(users);
      while (provider.id === client.id) provider = pick(users);

      const profId =
        provider.professionIds.length > 0
          ? pick(provider.professionIds)
          : pick(professions).id;

      const addressId = pick(client.addressIds);
      const state = pick(STATES);
      const daysOffset = rnd(-40, 10);
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);

      await prisma.service.create({
        data: {
          professionId: profId,
          userId: client.id,
          providerId: provider.id,
          rating: decimal(3, 5, 2),
          price: decimal(8000, 120000, 0),
          comment: Math.random() < 0.5 ? "Buen trabajo, cumplió con lo acordado." : "Servicio a coordinar.",
          date,
          addressId,
          state,
        },
      });
    }
  }

  console.log("✅ Seed completo: 7 profesiones, 20 usuarios, direcciones y servicios generados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
