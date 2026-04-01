"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseIsoDateOnly, parsePositiveInt } from "@/lib/validation";
import { logError } from "@/lib/logger";
import { logAudit } from "@/lib/audit";

const monThuCategories = ["first", "second", "dessert"];
const fridayCategories = ["single", "dessert", "fruit"];
const allowedDishTypes = ["first", "second", "single", "dessert"] as const;

function mapDishTypeToExcelTable(dishType: string) {
  if (dishType === "first") return "Primeros";
  if (dishType === "second" || dishType === "single") return "Segundos";
  return "Postres";
}

function dishTypeMatchesCategory(dishType: string, category: string) {
  if (category === "fruit") return dishType === "dessert";
  return dishType === category;
}

function validarReglaDia(weekday: number, category: string) {
  if (weekday >= 1 && weekday <= 4) return monThuCategories.includes(category);
  if (weekday === 5) return fridayCategories.includes(category);
  return false;
}

export async function createDishAction(formData: FormData) {
  const sessionUser = await requireRole([Role.COOK, Role.ADMIN]);

  const name = String(formData.get("name") ?? "").trim();
  const rawDishType = String(formData.get("dishType") ?? "").trim();
  const dishType = allowedDishTypes.includes(rawDishType as (typeof allowedDishTypes)[number])
    ? rawDishType
    : null;

  if (!name || !dishType) return;

  const dish = await prisma.dish.create({
    data: {
      name,
      description: null,
      dishType
    }
  });

  // Sincronización opcional con Power Automate (no bloqueante).
  // Si falla, no debe romper el alta de plato en la app.
  const webhookUrl = process.env.POWER_AUTOMATE_DISH_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishId: dish.id,
          nombre: dish.name,
          descripcion: dish.description ?? "",
          tipo: dish.dishType,
          tabla: mapDishTypeToExcelTable(dish.dishType),
          origen: "kitchenflow"
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logError("cocina.createDishAction.webhook", new Error("Webhook response not ok"), {
          status: response.status,
          errorBody,
          dishId: dish.id
        });
      }
    } catch (error) {
      logError("cocina.createDishAction.webhook", error, { dishId: dish.id });
    }
  }

  await logAudit("cocina.createDish", sessionUser, {
    dishId: dish.id,
    name: dish.name,
    dishType: dish.dishType
  });

  revalidatePath("/cocina");
  revalidatePath("/calendario");
  redirect("/cocina");
}

export async function createWeekAction(formData: FormData) {
  const sessionUser = await requireRole([Role.COOK, Role.ADMIN]);

  const weekStart = parseIsoDateOnly(formData.get("weekStart"));
  if (!weekStart) {
    redirect("/cocina?week=error-validacion");
  }

  if (weekStart.getUTCDay() !== 1) {
    redirect("/cocina?week=error-lunes");
  }

  const week = await prisma.menuWeek.upsert({
    where: { weekStart },
    update: {},
    create: { weekStart }
  });

  // Preferencia por defecto: de lunes a jueves, primer plato = amanida.
  const dishes = await prisma.dish.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" }
  });

  const normalized = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  let saladDish =
    dishes.find((d) => normalized(d.name) === "amanida") ??
    dishes.find((d) => normalized(d.name) === "ensalada") ??
    dishes.find((d) => {
      const name = normalized(d.name);
      return name.includes("amanida") || name.includes("ensalada");
    });

  if (!saladDish) {
    saladDish = await prisma.dish.create({
      data: {
        name: "Amanida",
        description: null,
        dishType: "first"
      },
      select: { id: true, name: true }
    });
  }

  for (const weekday of [1, 2, 3, 4]) {
    await prisma.menuItem.upsert({
      where: {
        menuWeekId_weekday_category_optionIndex: {
          menuWeekId: week.id,
          weekday,
          category: "first",
          optionIndex: 1
        }
      },
      update: {},
      create: {
        menuWeekId: week.id,
        dishId: saladDish.id,
        weekday,
        category: "first",
        optionIndex: 1
      }
    });
  }

  await logAudit("cocina.createWeek", sessionUser, {
    menuWeekId: week.id,
    weekStart: weekStart.toISOString(),
    defaultFirstDishId: saladDish.id
  });

  revalidatePath("/cocina");
  revalidatePath("/calendario");
}

export async function assignMenuItemAction(formData: FormData) {
  const sessionUser = await requireRole([Role.COOK, Role.ADMIN]);

  const menuWeekId = parsePositiveInt(formData.get("menuWeekId"));
  const dishId = parsePositiveInt(formData.get("dishId"));
  const weekday = Number(formData.get("weekday"));
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim().slice(0, 240);

  if (!menuWeekId || !dishId || !Number.isInteger(weekday) || !category) {
    redirect("/cocina?menu=error-validacion");
  }
  if (!validarReglaDia(weekday, category)) {
    redirect("/cocina?menu=error-regla-dia");
  }

  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    select: { dishType: true }
  });

  if (!dish || !dishTypeMatchesCategory(dish.dishType, category)) return;

  if (description) {
    await prisma.dish.update({ where: { id: dishId }, data: { description } }).catch(() => null);
  }

  if (weekday === 5) {
    await prisma.menuItem.upsert({
      where: {
        menuWeekId_weekday_category_optionIndex: {
          menuWeekId,
          weekday,
          category,
          optionIndex: 1
        }
      },
      update: { dishId },
      create: {
        menuWeekId,
        dishId,
        weekday,
        category,
        optionIndex: 1
      }
    });
  } else {
    const last = await prisma.menuItem.findFirst({
      where: { menuWeekId, weekday, category },
      orderBy: { optionIndex: "desc" }
    });

    await prisma.menuItem.create({
      data: {
        menuWeekId,
        dishId,
        weekday,
        category,
        optionIndex: (last?.optionIndex ?? 0) + 1
      }
    });
  }

  await logAudit("cocina.assignMenuItem", sessionUser, {
    menuWeekId,
    dishId,
    weekday,
    category,
    description: description || null
  });

  revalidatePath("/cocina");
  revalidatePath("/cocina/historico");
  revalidatePath("/calendario");
}

export async function deleteMenuItemAction(formData: FormData) {
  const sessionUser = await requireRole([Role.COOK, Role.ADMIN]);

  const menuItemId = parsePositiveInt(formData.get("menuItemId"));
  if (!menuItemId) {
    redirect("/cocina?menu=error-validacion");
  }

  const existing = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!existing) return;

  await prisma.$transaction(async (tx) => {
    await tx.menuItem.delete({ where: { id: menuItemId } });

    if (existing.weekday <= 4) {
      const rest = await tx.menuItem.findMany({
        where: {
          menuWeekId: existing.menuWeekId,
          weekday: existing.weekday,
          category: existing.category
        },
        orderBy: { optionIndex: "asc" }
      });

      for (let i = 0; i < rest.length; i++) {
        const next = i + 1;
        if (rest[i].optionIndex !== next) {
          await tx.menuItem.update({ where: { id: rest[i].id }, data: { optionIndex: next } });
        }
      }
    }
  });

  await logAudit("cocina.deleteMenuItem", sessionUser, {
    menuItemId,
    menuWeekId: existing.menuWeekId,
    weekday: existing.weekday,
    category: existing.category,
    optionIndex: existing.optionIndex
  });

  revalidatePath("/cocina");
  revalidatePath("/cocina/historico");
  revalidatePath("/calendario");
}

export async function syncExistingDishesToExcelAction() {
  await requireRole([Role.COOK, Role.ADMIN]);

  const webhookUrl = process.env.POWER_AUTOMATE_DISH_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    redirect("/cocina?sync=missing-webhook");
  }

  const dishes = await prisma.dish.findMany({
    orderBy: { createdAt: "asc" }
  });

  // 1) Intento de reseteo previo en Excel (borrado de platos antiguos).
  // El flujo puede ignorar este comando si no está implementado.
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operacion: "reset_dishes",
        origen: "kitchenflow"
      })
    });
  } catch (error) {
    logError("cocina.syncExistingDishesToExcelAction.reset", error);
  }

  let sent = 0;
  let failed = 0;

  for (const dish of dishes) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishId: dish.id,
          nombre: dish.name,
          descripcion: dish.description ?? "",
          tipo: dish.dishType,
          tabla: mapDishTypeToExcelTable(dish.dishType),
          origen: "kitchenflow"
        })
      });

      if (response.ok) {
        sent += 1;
      } else {
        failed += 1;
        const errorBody = await response.text();
        logError("cocina.syncExistingDishesToExcelAction.send", new Error("Webhook response not ok"), {
          status: response.status,
          errorBody,
          dishId: dish.id
        });
      }
    } catch (error) {
      failed += 1;
      logError("cocina.syncExistingDishesToExcelAction.send", error, { dishId: dish.id });
    }
  }

  redirect(`/cocina?sync=done&sent=${sent}&failed=${failed}`);
}
