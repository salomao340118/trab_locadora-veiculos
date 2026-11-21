import type { ReactNode } from "react";

// Props tipadas garantem que o componente receba apenas variantes e tamanhos permitidos.
export interface ButtonProps {
  label?: string;
  children?: ReactNode;
  icon?: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "outline-primary"
    | "outline-secondary"
    | "outline-danger";
  size?: "sm" | "md";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({
  label,
  children,
  icon,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {
  // Converte o tamanho lógico em uma classe CSS do Bootstrap.
  const sizeClass = size === "sm" ? "btn-sm" : "";
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span aria-hidden="true" className="d-inline-flex">{icon}</span>}
      {children ?? label}
    </button>
  );
}

// Botão compacto apenas com ícone, usado nas ações das tabelas.
export interface IconButtonProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function IconButton({ label, icon, onClick, danger = false, disabled = false }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-icon btn-sm ${danger ? "is-danger" : ""}`.trim()}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      <span aria-hidden="true" className="d-inline-flex">{icon}</span>
    </button>
  );
}
