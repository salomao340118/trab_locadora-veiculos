// Funções de apresentação: não alteram os dados, apenas formatam para exibição.

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarMoeda(valor: number | string | undefined): string {
  return moeda.format(Number(valor ?? 0));
}

// Converte "AAAA-MM-DD" ou "AAAA-MM-DDTHH:mm" para o padrão brasileiro.
export function formatarData(valor?: string): string {
  if (!valor) return "—";
  const [data, hora] = valor.split("T");
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return valor;
  const dataBr = `${dia}/${mes}/${ano}`;
  return hora ? `${dataBr} ${hora.slice(0, 5)}` : dataBr;
}

export function formatarKm(valor: number | string | undefined): string {
  return `${Number(valor ?? 0).toLocaleString("pt-BR")} km`;
}

const formasPagamento: Record<string, string> = {
  PIX: "PIX",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO: "Cartão de Débito",
  DINHEIRO: "Dinheiro",
  BOLETO: "Boleto",
};

export function formatarFormaPagamento(forma: string): string {
  return formasPagamento[forma] ?? forma;
}
