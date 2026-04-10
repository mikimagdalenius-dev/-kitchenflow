import { Role } from "@prisma/client";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();

  if (!user || !user.active || (user.role !== Role.COOK && user.role !== Role.ADMIN)) {
    return new Response("No autorizado", { status: 403 });
  }

  const dishes = await prisma.dish.findMany({
    orderBy: { name: "asc" }
  });

  const rows = dishes.map((dish) => ({
    id: dish.id,
    nombre: dish.name,
    descripcion: dish.description ?? ""
  }));

  const wb = XLSX.utils.book_new();

  const wsPlatos = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsPlatos, "Platos");

  const wsInfo = XLSX.utils.aoa_to_sheet([
    ["Guía"],
    ["- Hoja principal: Platos"],
    ["- Columnas nombre/descripcion son editables."],
    ["- Este fichero sirve como listado editable/exportación de control."]
  ]);
  XLSX.utils.book_append_sheet(wb, wsInfo, "Info");

  const wbBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(wbBuffer);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="platos-cocina.xlsx"'
    }
  });
}
