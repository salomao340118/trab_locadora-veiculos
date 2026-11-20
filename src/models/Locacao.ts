// Union type que limita o status a valores válidos do domínio da aplicação.
export type StatusLocacao = "ABERTA" | "FINALIZADA" | "CANCELADA";

// Interface que representa o formato dos dados persistidos no JSON Server.
export interface Locacao {
  id?: string;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal?: string;
  kmRetirada: number;
  kmDevolucao?: number;
  valorTotal: number;
  status: StatusLocacao;
  clienteId: string;
  veiculoId: string;
}

export const locacaoInicial: Locacao = {
  dataRetirada: "",
  dataDevolucaoPrevista: "",
  kmRetirada: 0,
  valorTotal: 0,
  status: "ABERTA",
  clienteId: "",
  veiculoId: "",
};

// Converte o período em quantidade de diárias.
// Math.ceil arredonda parcialmente iniciado para uma diária completa.
export function calcularDiarias(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio).getTime();
  const fim = new Date(dataFim).getTime();
  if (Number.isNaN(inicio) || Number.isNaN(fim) || fim <= inicio) {
    return 0;
  }
  const diffMs = fim - inicio;
  const umDiaMs = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil(diffMs / umDiaMs));
}

// Calcula o valor bruto usando a quantidade de diárias e o valor da categoria.
export function calcularValorLocacao(dataInicio: string, dataFim: string, valorDiaria: number): number {
  const diarias = calcularDiarias(dataInicio, dataFim);
  return Number((diarias * valorDiaria).toFixed(2));
}

// Formata uma data como AAAA-MM-DD usando o fuso do computador.
// (toISOString usa UTC: no Brasil, depois das 21h ele já devolve o dia seguinte.)
function formatarDataLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// Data de hoje no formato AAAA-MM-DD (usada em dataEmissao e na data da manutenção).
export function hojeLocal(): string {
  return formatarDataLocal(new Date());
}

// Data e hora de agora no formato AAAA-MM-DDTHH:mm, o mesmo do <input type="datetime-local">.
// diasAMais soma dias à data atual (ex.: 1 = amanhã no mesmo horário).
export function agoraLocal(diasAMais = 0): string {
  const data = new Date();
  data.setDate(data.getDate() + diasAMais);
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${formatarDataLocal(data)}T${hora}:${minuto}`;
}