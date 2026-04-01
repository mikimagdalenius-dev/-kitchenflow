import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const allergens = [
    { code: "GLU", name: "Gluten" },
    { code: "LAC", name: "Lactosa" },
    { code: "HUE", name: "Huevo" },
    { code: "FRC", name: "Frutos secos" }
  ];

  for (const allergen of allergens) {
    await prisma.allergen.upsert({
      where: { code: allergen.code },
      update: { name: allergen.name },
      create: allergen
    });
  }

  const users = [
    { fullName: "Admin KitchenFlow", email: "admin@kitchenflow.local", role: Role.ADMIN },
    { fullName: "Cocinero Demo", email: "cocina@kitchenflow.local", role: Role.COOK },
    { fullName: "RRHH Demo", email: "rrhh@kitchenflow.local", role: Role.HR },
    { fullName: "Empleado Demo", email: "empleado@kitchenflow.local", role: Role.EMPLOYEE }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { fullName: user.fullName, role: user.role, active: true },
      create: user
    });
  }

  console.log("Seed demo completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
