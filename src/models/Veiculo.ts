// Restringe o estado visual do veículo a três situações possíveis.
export type StatusFrota = "DISPONIVEL" | "LOCADO" | "EM_MANUTENCAO";

export interface Veiculo {
  id?: string;
  chassi: string;
  placa: string;
  anoFabricacao: number;
  cor: string;
  kmRodado: number;
  modeloId: string;
}

export const veiculoInicial: Veiculo = {
  chassi: "",
  placa: "",
  anoFabricacao: new Date().getFullYear(),
  cor: "",
  kmRodado: 0,
  modeloId: "",
};