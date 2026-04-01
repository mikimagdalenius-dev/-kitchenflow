# KitchenFlow

Aplicación interna para gestión de cocina, fichajes e informes de RRHH.

## Módulos principales
- `/cocina` → creación de platos, semanas y asignación de menú.
- `/usuarios` → empleados y fichaje.
- `/calendario` → menú semanal visible para toda la empresa.
- `/reportes` → resumen y exportación CSV mensual para RRHH.
- `/acceso` → inicio/cierre de sesión por usuario.

## Stack
- Next.js (App Router, TypeScript)
- PostgreSQL
- Prisma ORM
- TailwindCSS

## Arranque local
1. Copia variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Genera cliente de Prisma:
   ```bash
   npm run prisma:generate
   ```
4. Aplica esquema (base de datos vacía o nueva):
   ```bash
   npm run prisma:push
   ```
5. (Opcional) carga datos demo:
   ```bash
   npm run prisma:seed:demo
   ```
6. (Recomendado) carga tus datos reales:
   ```bash
   cp prisma/company-data.example.json prisma/company-data.json
   # Edita nombres reales de empleados, cocina, rrhh, alérgenos y platos
   npm run prisma:seed:company
   ```
7. Ejecuta en desarrollo:
   ```bash
   npm run dev
   ```
