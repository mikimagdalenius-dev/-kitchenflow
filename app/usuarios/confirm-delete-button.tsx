"use client";

type ConfirmDeleteButtonProps = {
  disabled?: boolean;
};

export function ConfirmDeleteButton({ disabled }: ConfirmDeleteButtonProps) {
  return (
    <button
      className="pc-btn"
      type="submit"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        const ok = window.confirm("¿Seguro que quieres borrar este usuario? Esta acción no se puede deshacer.");
        if (!ok) e.preventDefault();
      }}
    >
      Borrar
    </button>
  );
}
