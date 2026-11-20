import { hojeLocal } from "./Locacao";

export interface Manutencao {
  id?: string;
  data: string;
  descricao: string;
  valor: number;
  veiculoId: string;
}

export const manutencaoInicial: Manutencao = {
  data: hojeLocal(),
  descricao: "",
  valor: 0,
  veiculoId: "",
};
// Histórico de manutenção vinculado a um veículo pela veiculoId.