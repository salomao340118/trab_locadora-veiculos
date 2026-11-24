import { api, listarPorCampo } from "./api";
import type { Pagamento } from "../models/Pagamento";

export const pagamentoService = {
  listar: async (): Promise<Pagamento[]> =>
    (await api.get<Pagamento[]>("/pagamentos")).data,

  listarPorLocacaoId: async (locacaoId: string): Promise<Pagamento[]> =>
    await listarPorCampo<Pagamento>("pagamentos", "locacaoId", locacaoId),

  buscarPorId: async (id: string): Promise<Pagamento> =>
    (await api.get<Pagamento>(`/pagamentos/${id}`)).data,

  criar: async (pagamento: Pagamento): Promise<Pagamento> => {
    const valorNum = Number(pagamento.valor);
    if (valorNum <= 0) {
      throw new Error("O valor do pagamento deve ser maior que zero.");
    }
    return (
      await api.post<Pagamento>("/pagamentos", {
        ...pagamento,
        valor: valorNum,
      })
    ).data;
  },

  atualizar: async (id: string, pagamento: Pagamento): Promise<Pagamento> =>
    (
      await api.put<Pagamento>(`/pagamentos/${id}`, {
        ...pagamento,
        id,
        valor: Number(pagamento.valor),
      })
    ).data,

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/pagamentos/${id}`);
  },
};
// Operações dos pagamentos associados às locações.