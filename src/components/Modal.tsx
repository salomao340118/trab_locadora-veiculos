import { useEffect, useEffectEvent, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

// Janela modal usada principalmente na confirmação antes de excluir registros.
export interface ModalProps {
  show: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary" | "success" | "warning";
  children?: ReactNode;
}

export function Modal({
  show,
  title,
  onClose,
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "danger",
  children,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const fecharComEsc = useEffectEvent(() => onClose());

  useEffect(() => {
    if (!show) return;
    const anterior = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") fecharComEsc();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      anterior?.focus();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="app-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="app-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="app-modal-header">
          <h2 id={titleId} className="app-modal-title">{title}</h2>
          <button type="button" className="btn btn-icon btn-sm" aria-label="Fechar" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
        <div className="app-modal-footer">
          <Button label={cancelLabel} variant="secondary" onClick={onClose} />
          {onConfirm && <Button label={confirmLabel} variant={confirmVariant} onClick={onConfirm} />}
        </div>
      </div>
    </div>
  );
}
