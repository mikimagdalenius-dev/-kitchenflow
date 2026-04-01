import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LogMeta = Record<string, unknown>;

export function logError(scope: string, error: unknown, meta?: LogMeta) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const payload = {
    level: "error",
    scope,
    message,
    meta,
    stack,
    at: new Date().toISOString()
  };

  console.error(JSON.stringify(payload));

  void prisma.errorLog
    .create({
      data: {
        scope,
        message,
        meta: (meta as Prisma.InputJsonValue | undefined) ?? undefined,
        stack
      }
    })
    .catch((dbError) => {
      console.error(
        JSON.stringify({
          level: "error",
          scope: "logger.persist",
          message: dbError instanceof Error ? dbError.message : String(dbError),
          at: new Date().toISOString()
        })
      );
    });
}
