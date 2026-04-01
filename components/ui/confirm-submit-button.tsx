"use client";

import { useState } from "react";

type Props = {
  buttonText: string;
  className?: string;
  disabled?: boolean;
  firstConfirmText?: string;
  secondPromptText?: string;
  requiredWord?: string;
};

export function ConfirmSubmitButton({
  buttonText,
  className,
  disabled,
  firstConfirmText = "¿Seguro que quieres continuar?",
  secondPromptText = "Para confirmar, escribe BORRAR",
  requiredWord = "BORRAR"
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || submitting}
      onClick={(e) => {
        const btn = e.currentTarget;
        const form = btn.closest("form");
        if (!form || disabled || submitting) return;

        const ok1 = window.confirm(firstConfirmText);
        if (!ok1) return;

        const typed = window.prompt(secondPromptText, "")?.trim().toUpperCase() ?? "";
        if (typed !== requiredWord.toUpperCase()) {
          window.alert("Confirmación cancelada.");
          return;
        }

        setSubmitting(true);
        form.requestSubmit();
      }}
    >
      {submitting ? "Procesando..." : buttonText}
    </button>
  );
}
