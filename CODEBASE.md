# KitchenFlow codebase guide

Quick map for future maintainers.

## Main routes

- `/acceso` → session picker (name-based login)
- `/fichar` → kiosk check-in page (ADMIN + KIOSK)
- `/usuarios` → user management + daily attendance table
- `/cocina` + `/cocina/historico` → weekly menu management/history
- `/calendario` → published weekly menu view
- `/reportes` → attendance dashboard + filters + CSV export
- `/admin/debug` → admin-only error log viewer

## Legacy compatibility routes

- `/submit` → redirects to `/fichar`
- `/fichar/kiosk` → redirects to `/fichar`
- `/players` → redirects to `/`

These are kept intentionally so old bookmarks/devices still work.

## Key folders

- `app/*` → Next.js route pages and server actions
- `components/ui/*` → reusable UI building blocks
- `lib/auth.ts` → role/session helpers
- `lib/validation.ts` → input parsing/validation helpers
- `lib/dates.ts` → shared date/time helpers (Madrid timezone aware)
- `lib/logger.ts` → structured error logging + persistence

## Rules that matter

- Check-in (`/fichar`) is role-protected in both page and server action.
- Attendance uniqueness is enforced by DB unique key `(userId, attendedDate, service)`.
- Report export uses current filters (month/user/date range).
- Error logs are persisted in `ErrorLog` table and visible in `/admin/debug`.
