import axios from "axios";

// Instância central do Axios: todas as requisições usam esta baseURL.
// Mantê-la em um único arquivo evita URLs repetidas em todos os serviços.
export const api = axios.create({
  // Em desenvolvimento o Vite repassa /api para o JSON Server (porta 3001); veja vite.config.ts.
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// O JSON Server 1.x converte "?campo=2" para o número 2 e não encontra IDs salvos como texto ("2").
// Por isso as buscas por relacionamento carregam a coleção e comparam os valores como string.
export async function listarPorCampo<T>(recurso: string, campo: keyof T, valor: string): Promise<T[]> {
  const lista = (await api.get<T[]>(`/${recurso}`)).data;
  return lista.filter((item) => String(item[campo]) === String(valor));
}
