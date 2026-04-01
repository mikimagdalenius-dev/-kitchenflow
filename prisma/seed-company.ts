import fs from "node:fs";
import path from "node:path";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

type InputData = {
  users?: { fullName: string; email?: string; role?: keyof typeof Role; active?: boolean }[];
  allergens?: { code: string; name: string }[];
  dishes?: { name: string; description?: string; allergenCodes?: string[] }[];
};

async function main() {
  const fileArg = process.argv[2] || "prisma/company-data.json";
  const filePath = path.resolve(process.cwd(), fileArg);

  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe ${filePath}. Crea el archivo desde prisma/company-data.example.json`);
  }

  const input = JSON.parse(fs.readFileSync(filePath, "utf8")) as InputData;

  for (const allergen of input.allergens ?? []) {
    await prisma.allergen.upsert({
      where: { code: allergen.code.toUpperCase() },
      update: { name: allergen.name },
      create: { code: allergen.code.toUpperCase(), name: allergen.name }
    });
  }

  for (const user of input.users ?? []) {
    const role = user.role && Role[user.role] ? Role[user.role] : Role.EMPLOYEE;
    const email = user.email?.trim() || null;

    if (email) {
      await prisma.user.upsert({
        where: { email },
        update: { fullName: user.fullName, role, active: user.active ?? true },
        create: { fullName: user.fullName, email, role, active: user.active ?? true }
      });
    } else {
      const existing = await prisma.user.findFirst({ where: { fullName: user.fullName } });
      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role, active: user.active ?? true }
        });
      } else {
        await prisma.user.create({
          data: { fullName: user.fullName, role, active: user.active ?? true }
        });
      }
    }
  }

  for (const dish of input.dishes ?? []) {
    const existing = await prisma.dish.findFirst({ where: { name: dish.name } });
    const created = existing
      ? await prisma.dish.update({ where: { id: existing.id }, data: { description: dish.description || null } })
      : await prisma.dish.create({ data: { name: dish.name, description: dish.description || null } });

    await prisma.dishAllergen.deleteMany({ where: { dishId: created.id } });

    for (const code of dish.allergenCodes ?? []) {
      const allergen = await prisma.allergen.findUnique({ where: { code: code.toUpperCase() } });
      if (!allergen) continue;
      await prisma.dishAllergen.create({
        data: { dishId: created.id, allergenId: allergen.id }
      });
    }
  }

  console.log("Seed empresa aplicado correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
