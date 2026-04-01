"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function clearErrorLogsAction() {
  await requireRole([Role.ADMIN]);
  await prisma.errorLog.deleteMany({});
  revalidatePath("/admin/debug");
  redirect("/admin/debug?cleared=1");
}
