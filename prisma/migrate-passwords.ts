import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);
  await prisma.user.updateMany({
    where: { password: "hashed_password" },
    data: { password: hash },
  });
  console.log("Passwords updated to bcrypt hash for demo users.");
}

main().finally(() => prisma.$disconnect());