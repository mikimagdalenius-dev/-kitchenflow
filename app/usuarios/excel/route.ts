import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const rawUserId = cookieStore.get("kf_user_id")?.value;
  const userId = rawUserId ? Number(rawUserId) : NaN;

  if (!Number.isFinite(userId)) {
    return new Response("No autorizado", { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, active: true }
  });

  if (!currentUser || !currentUser.active || currentUser.role !== Role.ADMIN) {
    return new Response("No autorizado", { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { fullName: "asc" },
    select: {
      fullName: true,
      email: true,
      intolerances: {
        include: {
          allergen: {
            select: { name: true }
          }
        }
      }
    }
  });

  const rows = users.map((u) => ({
    nombre: u.fullName,
    email: u.email ?? "",
    "alergias/intolerancias": u.intolerances.map((i) => i.allergen.name).join(", ")
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");

  const wbBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(wbBuffer);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="usuarios-control.xlsx"'
    }
  });
}
