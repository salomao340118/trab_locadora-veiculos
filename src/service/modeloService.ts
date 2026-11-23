import { api } from "./api";
import type { Modelo } from "../models/Modelo";
import type { Veiculo } from "../models/Veiculo";

export const modeloService = {
  listar: async (): Promise<Modelo[]> => (await api.get<Modelo[]>("/modelos")).data,

  buscarPorId: async (id: string): Promise<Modelo> =>
    (await api.get<Modelo>(`/modelos/${id}`)).data,

  criar: async (modelo: Modelo): Promise<Modelo> =>
    (
      await api.post<Modelo>("/modelos", {
        ...modelo,
        nome: modelo.nome.trim(),
        ano: Number(modelo.ano),
      })
    ).data,

  atualizar: async (id: string, modelo: Modelo): Promise<Modelo> =>
    (
      await api.put<Modelo>(`/modelos/${id}`, {
        ...modelo,
        id,
        nome: modelo.nome.trim(),
        ano: Number(modelo.ano),
      })
    ).data,

  excluir: async (id: string): Promise<void> => {
    // RN06: não excluir modelo com veículos vinculados
    const veiculos = (await api.get<Veiculo[]>("/veiculos")).data;
    const possuiVinculo = veiculos.some((v) => v.modeloId === id);
    if (possuiVinculo) {
      throw new Error("Não é possível excluir este modelo pois existem veículos vinculados a ele (RN06).");
    }
    await api.delete(`/modelos/${id}`);
  },
};
// CRUD da entidade Modelo, incluindo as relações com marca e categoria.