import { api, listarPorCampo } from "./api";
import type { Vistoria } from "../models/Vistoria";
import type { Locacao } from "../models/Locacao";

export const vistoriaService = {
  listar: async (): Promise<Vistoria[]> =>
    (await api.get<Vistoria[]>("/vistorias")).data,

  listarPorLocacaoId: async (locacaoId: string): Promise<Vistoria[]> =>
    await listarPorCampo<Vistoria>("vistorias", "locacaoId", locacaoId),

  buscarPorId: async (id: string): Promise<Vistoria> =>
    (await api.get<Vistoria>(`/vistorias/${id}`)).data,

  criar: async (vistoria: Vistoria): Promise<Vistoria> => {
    const locacao = (await api.get<Locacao>(`/locacoes/${vistoria.locacaoId}`)).data;
    const kmValor = Number(vistoria.km);

    if (vistoria.tipo === "DEVOLUCAO" && kmValor < Number(locacao.kmRetirada)) {
      throw new Error(
        `O km da vistoria de devolução (${kmValor}) não pode ser menor que o km de retirada (${locacao.kmRetirada}) (RN04).`
      );
    }

    return (
      await api.post<Vistoria>("/vistorias", {
        ...vistoria,
        km: kmValor,
        observacoes: vistoria.observacoes.trim(),
      })
    ).data;
  },

  atualizar: async (id: string, vistoria: Vistoria): Promise<Vistoria> =>
    (
      await api.put<Vistoria>(`/vistorias/${id}`, {
        ...vistoria,
        id,
        km: Number(vistoria.km),
        observacoes: vistoria.observacoes.trim(),
      })
    ).data,

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/vistorias/${id}`);
  },
};
// Operações das vistorias de retirada e de devolução.