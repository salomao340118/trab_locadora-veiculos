import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Cabeçalho padrão das páginas: título, descrição, ações e link de retorno opcional.
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({ title, subtitle, actions, backTo, backLabel = "Voltar" }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <div>
        {backTo && (
          <button type="button" className="page-back" onClick={() => navigate(backTo)}>
            <ArrowLeft size={14} aria-hidden="true" />
            {backLabel}
          </button>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
