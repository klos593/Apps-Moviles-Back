
import 'dotenv/config';              
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const plain = '123456';              // password users will type
  const hash = await bcrypt.hash(plain, 10);

  const result = await prisma.user.updateMany({
    where: { password: 'hashed_password' }, 
    data: { password: hash },
  });

  console.log(`Updated ${result.count} users to bcrypt hash.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });