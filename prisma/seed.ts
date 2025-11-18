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

  console.log("✅ Seed completo: 7 profesiones");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
