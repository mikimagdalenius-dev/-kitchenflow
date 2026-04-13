"use client";

export function DeleteFichajeButton() {
  return (
    <button
      type="submit"
      className="pc-btn pc-btn-secondary text-xs py-1 px-2"
      onClick={(e) => {
        if (!window.confirm("¿Borrar este fichaje? Esta acción no se puede deshacer.")) {
          e.preventDefault();
        }
      }}
    >
      Borrar
    </button>
  );
}
