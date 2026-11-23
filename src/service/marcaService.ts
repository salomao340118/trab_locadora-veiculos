import { api } from "./api";
import type { Marca } from "../models/Marca";
import type { Modelo } from "../models/Modelo";

// Service responsável pelo CRUD de marcas.
// Antes da exclusão, também verifica a dependência definida pela regra RN06.
export const marcaService = {
  listar: async (): Promise<Marca[]> => (await api.get<Marca[]>("/marcas")).data,

  buscarPorId: async (id: string): Promise<Marca> =>
    (await api.get<Marca>(`/marcas/${id}`)).data,

  criar: async (marca: Marca): Promise<Marca> =>
    (await api.post<Marca>("/marcas", { ...marca, nome: marca.nome.trim() })).data,

  atualizar: async (id: string, marca: Marca): Promise<Marca> =>
    (await api.put<Marca>(`/marcas/${id}`, { ...marca, id, nome: marca.nome.trim() })).data,

  excluir: async (id: string): Promise<void> => {
    // RN06: não excluir marca com modelos vinculados
    const modelos = (await api.get<Modelo[]>("/modelos")).data;
    const possuiVinculo = modelos.some((m) => m.marcaId === id);
    if (possuiVinculo) {
      throw new Error("Não é possível excluir esta marca pois existem modelos vinculados a ela (RN06).");
    }
    await api.delete(`/marcas/${id}`);
  },
};