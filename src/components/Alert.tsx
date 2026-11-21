import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

// Exibe feedback visual padronizado e permite fechar a mensagem.
export interface AlertProps {
  type: "success" | "danger" | "warning" | "info";
  message?: string;
  children?: ReactNode;
  onClose?: () => void;
}

const icones = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Alert({ type, message, children, onClose }: AlertProps) {
  if (!message && !children) return null;
  const Icone = icones[type];

  return (
    <div className={`app-alert is-${type}`} role={type === "danger" ? "alert" : "status"}>
      <Icone size={18} aria-hidden="true" className="flex-shrink-0 mt-1" />
      <div className="app-alert-body">{children ?? message}</div>
      {onClose && (
        <button type="button" className="app-alert-close" aria-label="Fechar mensagem" onClick={onClose}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
