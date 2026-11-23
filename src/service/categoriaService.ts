import { api } from "./api";
import type { Categoria } from "../models/Categoria";
import type { Modelo } from "../models/Modelo";

export const categoriaService = {
  listar: async (): Promise<Categoria[]> =>
    (await api.get<Categoria[]>("/categorias")).data,

  buscarPorId: async (id: string): Promise<Categoria> =>
    (await api.get<Categoria>(`/categorias/${id}`)).data,

  criar: async (categoria: Categoria): Promise<Categoria> =>
    (
      await api.post<Categoria>("/categorias", {
        ...categoria,
        nome: categoria.nome.trim(),
        valorLocacao: Number(categoria.valorLocacao),
      })
    ).data,

  atualizar: async (id: string, categoria: Categoria): Promise<Categoria> =>
    (
      await api.put<Categoria>(`/categorias/${id}`, {
        ...categoria,
        id,
        nome: categoria.nome.trim(),
        valorLocacao: Number(categoria.valorLocacao),
      })
    ).data,

  excluir: async (id: string): Promise<void> => {
    // RN06: não excluir categoria com modelos vinculados
    const modelos = (await api.get<Modelo[]>("/modelos")).data;
    const possuiVinculo = modelos.some((m) => m.categoriaId === id);
    if (possuiVinculo) {
      throw new Error("Não é possível excluir esta categoria pois existem modelos vinculados a ela (RN06).");
    }
    await api.delete(`/categorias/${id}`);
  },
};
// CRUD da entidade Categoria via JSON Server.