import { api, listarPorCampo } from "./api";
import type { Contrato } from "../models/Contrato";

export const contratoService = {
  listar: async (): Promise<Contrato[]> =>
    (await api.get<Contrato[]>("/contratos")).data,

  buscarPorId: async (id: string): Promise<Contrato> =>
    (await api.get<Contrato>(`/contratos/${id}`)).data,

  buscarPorLocacaoId: async (locacaoId: string): Promise<Contrato | undefined> => {
    const lista = await listarPorCampo<Contrato>("contratos", "locacaoId", locacaoId);
    return lista[0];
  },

  criar: async (contrato: Contrato): Promise<Contrato> =>
    (await api.post<Contrato>("/contratos", contrato)).data,

  atualizar: async (id: string, contrato: Contrato): Promise<Contrato> =>
    (await api.put<Contrato>(`/contratos/${id}`, { ...contrato, id })).data,

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/contratos/${id}`);
  },
};
// Operações dos contratos gerados para cada locação.