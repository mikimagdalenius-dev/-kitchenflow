"use client";

import { useEffect, useMemo, useState } from "react";
import { formatUserName } from "@/lib/ui";
import { deleteUserAction, updateUserAction } from "./actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

type UserItem = {
  id: number;
  fullName: string;
  email: string | null;
  role: "EMPLOYEE" | "COOK" | "ADMIN" | "HR" | "KIOSK";
  intoleranceIds: number[];
};

type AllergenItem = {
  id: number;
  name: string;
};

export function AdminUserManager({
  users,
  currentUserId,
  allergens
}: {
  users: UserItem[];
  currentUserId: number;
  allergens: AllergenItem[];
}) {
  const [selectedId, setSelectedId] = useState<number>(0);
  const [userQuery, setUserQuery] = useState("");

  const selectedUser = useMemo(() => users.find((u) => u.id === selectedId) ?? null, [users, selectedId]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserItem["role"]>("EMPLOYEE");
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([]);

  useEffect(() => {
    if (!selectedUser) {
      setFullName("");
      setEmail("");
      setRole("EMPLOYEE");
      setSelectedAllergens([]);
      return;
    }
    setUserQuery(formatUserName(selectedUser.fullName));
    setFullName(selectedUser.fullName);
    setEmail(selectedUser.email ?? "");
    setRole(selectedUser.role);
    setSelectedAllergens(selectedUser.intoleranceIds);
  }, [selectedUser]);

  if (users.length === 0) {
    return (
      <div className="pc-card users-admin-card p-4">
        <h2 className="font-semibold text-slate-800">Gestionar usuario</h2>
        <p className="text-sm text-slate-500 mt-2">No hay usuarios todavía.</p>
      </div>
    );
  }

  return (
    <div className="pc-card users-admin-card p-4 space-y-2 text-left">
      <h2 className="font-semibold text-slate-800">Gestionar usuario</h2>

      <input
        className="pc-select"
        placeholder="Usuario..."
        list="gestionar-usuarios-lista"
        value={userQuery}
        onChange={(e) => {
          const value = e.target.value;
          setUserQuery(value);
          const exact = users.find((u) => formatUserName(u.fullName).toLowerCase() === value.trim().toLowerCase());
          setSelectedId(exact?.id ?? 0);
        }}
      />
      <datalist id="gestionar-usuarios-lista">
        {users.map((u) => (
          <option key={u.id} value={formatUserName(u.fullName)} />
        ))}
      </datalist>

      <form action={updateUserAction} className="space-y-2">
        <input type="hidden" name="userId" value={selectedId || ""} />

        <input
          name="fullName"
          className="pc-select"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre"
          required
          disabled={!selectedUser}
        />

        <select
          name="role"
          className="pc-select"
          value={role}
          onChange={(e) => setRole(e.target.value as UserItem["role"])}
          disabled={!selectedUser}
        >
          {!selectedUser && <option value="EMPLOYEE">Rol</option>}
          <option value="EMPLOYEE">Empleado</option>
          <option value="COOK">Cocinero</option>
          <option value="ADMIN">Administrador</option>
          <option value="HR">RRHH</option>
          <option value="KIOSK">fichajes_iPad</option>
        </select>

        <input
          name="email"
          className="pc-select"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          disabled={!selectedUser}
        />

        {allergens.length > 0 && (
          <fieldset className="rounded border border-slate-200 p-2 text-left">
            <legend className="px-1 text-xs text-slate-500">Alergias / Intolerancias</legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {allergens.map((a) => (
                <label key={a.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="allergenIds"
                    value={a.id}
                    checked={selectedAllergens.includes(a.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedAllergens((prev) => [...prev, a.id]);
                      else setSelectedAllergens((prev) => prev.filter((id) => id !== a.id));
                    }}
                    disabled={!selectedUser}
                  />
                  {a.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <FormSubmitButton idleText="Guardar cambios" pendingText="Guardando..." disabled={!selectedUser} />
      </form>

      <form action={deleteUserAction}>
        <input type="hidden" name="userId" value={selectedId || ""} />
        <ConfirmSubmitButton
          buttonText="Borrar usuario"
          className="pc-btn pc-btn-secondary"
          disabled={!selectedUser || selectedId === currentUserId}
          firstConfirmText="¿Seguro que quieres borrar este usuario? Esta acción no se puede deshacer."
          secondPromptText="Escribe BORRAR para confirmar el borrado de usuario"
          requiredWord="BORRAR"
        />
      </form>
    </div>
  );
}
