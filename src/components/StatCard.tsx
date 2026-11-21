import type { ReactNode } from "react";
import type { BadgeTone } from "./StatusBadge";

// Cartão de indicador do dashboard.
export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: BadgeTone;
  hint?: string;
}

export function StatCard({ label, value, icon, tone = "primary", hint }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className={`stat-card-icon tone-${tone}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <span className="stat-card-value">{value}</span>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </div>
  );
}
