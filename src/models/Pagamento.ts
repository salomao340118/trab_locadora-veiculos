import { agoraLocal } from "./Locacao";

export type FormaPagamento = "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "DINHEIRO" | "BOLETO";
export type StatusPagamento = "PENDENTE" | "PAGO" | "ESTORNADO";

export interface Pagamento {
  id?: string;
  data: string;
  valor: number;
  forma: FormaPagamento;
  status: StatusPagamento;
  locacaoId: string;
}

export const pagamentoInicial: Pagamento = {
  data: agoraLocal(),
  valor: 0,
  forma: "PIX",
  status: "PAGO",
  locacaoId: "",
};
// Pagamentos associados a uma locação; uma locação pode ter vários registros.