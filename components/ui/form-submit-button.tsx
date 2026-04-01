"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  idleText: string;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
  secondary?: boolean;
};

export function FormSubmitButton({
  idleText,
  pendingText = "Guardando...",
  className = "",
  disabled = false,
  secondary = false
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const classes = `${secondary ? "pc-btn pc-btn-secondary" : "pc-btn"} ${className}`.trim();

  return (
    <button className={classes} type="submit" disabled={disabled || pending} aria-busy={pending}>
      {pending && <span className="pc-spinner" aria-hidden="true" />}
      {pending ? pendingText : idleText}
    </button>
  );
}
