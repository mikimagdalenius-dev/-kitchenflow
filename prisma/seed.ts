import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Intentionally empty seed for private project.
  // Keep database clean unless explicit test data is requested.
  await prisma.$queryRaw`SELECT 1`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
