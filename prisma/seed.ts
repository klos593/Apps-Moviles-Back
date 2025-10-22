// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';

// Instancia de Prisma Client
const prisma = new PrismaClient();

// Número de registros a crear
const NUM_USERS = 20;

async function main() {
  console.log('🧹 Limpiando la base de datos...');
  // Borramos en orden inverso para evitar errores de restricción de clave foránea
  await prisma.service.deleteMany();
  await prisma.userProfession.deleteMany();
  await prisma.address.deleteMany();
  await prisma.profession.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Comenzando el seeding...');

  // --- 1. Crear Profesiones ---
  console.log('🎨 Creando profesiones...');
  const professionsData = [
    { name: 'Electricista', picture: 'https://drive.google.com/file/d/1P9US55HozuApoKMvsL4rKbu4np-B0KA3/view?usp=share_link' },
    { name: 'Plomero', picture: 'https://drive.google.com/file/d/1FnN_VAm47Iins75whcG8iuWk30kR2EIh/view?usp=share_link' },
    { name: 'Entrenador', picture: 'https://drive.google.com/file/d/1wLfEhjVHP06IvmFxUtliNkOJmkr21Sff/view?usp=share_link' },
    { name: 'Limpieza', picture: 'https://drive.google.com/file/d/1aCH4nxarZ5BTFF63XarL6thFPZ88uYG-/view?usp=share_link' },
    { name: 'Gasista', picture: 'https://drive.google.com/file/d/1bG7i8sNVu4OkPeHHCds3o5fDCIA3gWPg/view?usp=share_link' },
    { name: 'Paseador', picture: 'https://drive.google.com/file/d/1S8cqCyxuHpkxORD9YShtCz1Qrp_QUOjl/view?usp=share_link' },
    {name: 'Pintor', picture: 'https://drive.google.com/file/d/14tg2b7b8uWm_cFU0nQjKQT-pw0ID8FNe/view?usp=share_link' },
  ];

  const createdProfessions = await Promise.all(
    professionsData.map(prof => prisma.profession.create({ data: prof }))
  );
  console.log(`✅ ${createdProfessions.length} profesiones creadas.`);

  // --- 2. Crear Usuarios ---
  console.log(`👤 Creando ${NUM_USERS} usuarios...`);
  const saltRounds = 10;
  const password = await bcrypt.hash('password123', saltRounds); // Contraseña por defecto para todos
  
  const createdUsers: User[] = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: password,
        birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        phone: faker.phone.number(),
        picture: faker.image.avatar(),
        rating: faker.number.float({ min: 1, max: 5 }),
        description: faker.lorem.paragraph(),
        workRadius: faker.number.int({ min: 5, max: 50 }),
      },
    });
    createdUsers.push(user);
  }
  console.log(`✅ ${createdUsers.length} usuarios creados.`);

  // --- 3. Crear Direcciones para cada usuario ---
  console.log('🏠 Asignando direcciones...');
  for (const user of createdUsers) {
    await prisma.address.create({
      data: {
        userId: user.id,
        street: faker.location.streetAddress(),
        number: faker.number.int({ min: 1, max: 5000 }),
        postalCode: parseInt(faker.location.zipCode('####')),
        country: 'Argentina',
        state: faker.location.state(),
      },
    });
  }
  console.log('✅ Direcciones asignadas.');

  // --- 4. Asignar Profesiones a los Usuarios (UserProfession) ---
  console.log('💼 Asignando profesiones a usuarios...');
  for (const user of createdUsers) {
    // Asignar entre 1 y 3 profesiones al azar
    const numProfessions = faker.number.int({ min: 1, max: 3 });
    const professionsToAssign = faker.helpers.shuffle(createdProfessions).slice(0, numProfessions);
    
    for (const profession of professionsToAssign) {
      await prisma.userProfession.create({
        data: {
          userId: user.id,
          professionId: profession.id,
        },
      });
    }
  }
  console.log('✅ Profesiones asignadas.');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Cierra la conexión a la base de datos
    await prisma.$disconnect();
})