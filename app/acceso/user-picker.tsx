"use client";

import { useMemo, useState } from "react";
import { formatUserName } from "@/lib/ui";

type UserOption = {
  id: number;
  fullName: string;
  role: string;
};


export function UserPicker({ users }: { users: UserOption[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UserOption | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 12);
    return users.filter((u) => u.fullName.toLowerCase().includes(q)).slice(0, 12);
  }, [users, query]);

  const onChangeQuery = (value: string) => {
    setQuery(value);
    const exact = users.find((u) => u.fullName.toLowerCase() === value.trim().toLowerCase()) ?? null;
    setSelected(exact);
  };

  return (
    <div className="space-y-2">
      <input
        className="pc-select acceso-input"
        placeholder="Escribe tu nombre..."
        list="usuarios-lista"
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
      />
      <datalist id="usuarios-lista">
        {users.map((user) => (
          <option key={user.id} value={user.fullName} />
        ))}
      </datalist>

      <input
        type="text"
        name="userId"
        value={selected?.id ?? ""}
        readOnly
        required
        tabIndex={-1}
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 pointer-events-none"
      />

      {!selected && query.trim().length > 0 && filtered.length > 0 && (
        <div className="acceso-suggestions">
          {filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              className="acceso-suggestion"
              onClick={() => {
                setQuery(user.fullName);
                setSelected(user);
              }}
            >
              {formatUserName(user.fullName)} <span>({user.role})</span>
            </button>
          ))}
        </div>
      )}

      {query.trim().length > 0 && !selected && (
        <p className="text-xs text-amber-700">Selecciona un nombre válido de la lista.</p>
      )}
    </div>
  );
}
