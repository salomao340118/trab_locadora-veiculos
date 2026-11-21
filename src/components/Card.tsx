import type { ReactNode } from "react";

// Container visual reutilizado para agrupar seções e títulos das páginas.
export interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  flush?: boolean;
  className?: string;
}

export function Card({ title, subtitle, icon, actions, children, footer, flush = false, className = "" }: CardProps) {
  return (
    <section className={`app-card ${className}`.trim()}>
      {(title || actions) && (
        <div className="app-card-header">
          <div className="d-flex align-items-center gap-2">
            {icon && <span className="app-card-icon" aria-hidden="true">{icon}</span>}
            <div>
              {title && <h2 className="app-card-title">{title}</h2>}
              {subtitle && <p className="app-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={`app-card-body ${flush ? "is-flush" : ""}`.trim()}>{children}</div>
      {footer && <div className="app-card-footer">{footer}</div>}
    </section>
  );
}
