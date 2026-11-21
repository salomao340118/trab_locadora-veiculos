import type { ReactNode } from "react";

export type BadgeTone = "primary" | "success" | "warning" | "danger" | "neutral";

// Badge com ponto de cor para identificar situações (disponível, locado, aberta, etc.).
export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>;
}

const statusMap: Record<string, { tone: BadgeTone; label: string }> = {
  DISPONIVEL: { tone: "success", label: "Disponível" },
  LOCADO: { tone: "warning", label: "Locado" },
  EM_MANUTENCAO: { tone: "danger", label: "Em manutenção" },
  ABERTA: { tone: "warning", label: "Aberta" },
  FINALIZADA: { tone: "success", label: "Finalizada" },
  CANCELADA: { tone: "neutral", label: "Cancelada" },
  PAGO: { tone: "success", label: "Pago" },
  PENDENTE: { tone: "warning", label: "Pendente" },
  ESTORNADO: { tone: "neutral", label: "Estornado" },
  RETIRADA: { tone: "primary", label: "Retirada" },
  DEVOLUCAO: { tone: "neutral", label: "Devolução" },
};

// Traduz um status do domínio para a badge correspondente.
export function DomainStatusBadge({ status }: { status?: string }) {
  const info = (status && statusMap[status]) || statusMap.DISPONIVEL;
  return <StatusBadge tone={info.tone}>{info.label}</StatusBadge>;
}
