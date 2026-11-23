import { api } from "./api";
import type { Veiculo, StatusFrota } from "../models/Veiculo";
import { hojeLocal, type Locacao } from "../models/Locacao";
import type { Manutencao } from "../models/Manutencao";

// Regra única da situação do veículo (RF16), usada na listagem e na locação:
// - LOCADO: tem locação ABERTA
// - EM_MANUTENCAO: tem manutenção com data de hoje ou futura
// - DISPONIVEL: nenhum dos dois
function calcularStatusFrota(
  veiculoId: string,
  locacoes: Locacao[],
  manutencoes: Manutencao[]
): StatusFrota {
  const emLocacaoAberta = locacoes.some(
    (l) => l.veiculoId === veiculoId && l.status === "ABERTA"
  );
  if (emLocacaoAberta) return "LOCADO";

  const hoje = hojeLocal();
  const emManutencao = manutencoes.some((m) => m.veiculoId === veiculoId && m.data >= hoje);
  if (emManutencao) return "EM_MANUTENCAO";

  return "DISPONIVEL";
}

async function validarUnicidadeVeiculo(veiculo: Veiculo, idIgnorado?: string): Promise<void> {
  const existentes = (await api.get<Veiculo[]>("/veiculos")).data;
  const placaNormalizada = veiculo.placa.trim().toUpperCase();
  const chassiNormalizado = veiculo.chassi.trim().toUpperCase();

  const placaDuplicada = existentes.some(
    (v) => v.id !== idIgnorado && v.placa.trim().toUpperCase() === placaNormalizada
  );
  if (placaDuplicada) {
    throw new Error(`Já existe um veículo cadastrado com a placa "${placaNormalizada}".`);
  }

  const chassiDuplicado = existentes.some(
    (v) => v.id !== idIgnorado && v.chassi.trim().toUpperCase() === chassiNormalizado
  );
  if (chassiDuplicado) {
    throw new Error(`Já existe um veículo cadastrado com o chassi "${chassiNormalizado}".`);
  }
}

export const veiculoService = {
  listar: async (): Promise<Veiculo[]> =>
    (await api.get<Veiculo[]>("/veiculos")).data,

  buscarPorId: async (id: string): Promise<Veiculo> =>
    (await api.get<Veiculo>(`/veiculos/${id}`)).data,

  criar: async (veiculo: Veiculo): Promise<Veiculo> => {
    await validarUnicidadeVeiculo(veiculo);
    const payload: Veiculo = {
      ...veiculo,
      placa: veiculo.placa.trim().toUpperCase(),
      chassi: veiculo.chassi.trim().toUpperCase(),
      cor: veiculo.cor.trim(),
      anoFabricacao: Number(veiculo.anoFabricacao),
      kmRodado: Number(veiculo.kmRodado),
    };
    return (await api.post<Veiculo>("/veiculos", payload)).data;
  },

  atualizar: async (id: string, veiculo: Veiculo): Promise<Veiculo> => {
    await validarUnicidadeVeiculo(veiculo, id);
    const payload: Veiculo = {
      ...veiculo,
      id,
      placa: veiculo.placa.trim().toUpperCase(),
      chassi: veiculo.chassi.trim().toUpperCase(),
      cor: veiculo.cor.trim(),
      anoFabricacao: Number(veiculo.anoFabricacao),
      kmRodado: Number(veiculo.kmRodado),
    };
    return (await api.put<Veiculo>(`/veiculos/${id}`, payload)).data;
  },

  excluir: async (id: string): Promise<void> => {
    // RN06: impedir exclusão se houver locações ou manutenções vinculadas
    const [locacoes, manutencoes] = await Promise.all([
      api.get<Locacao[]>("/locacoes"),
      api.get<Manutencao[]>("/manutencoes"),
    ]);

    const temLocacao = locacoes.data.some((l) => l.veiculoId === id);
    const temManutencao = manutencoes.data.some((m) => m.veiculoId === id);

    if (temLocacao || temManutencao) {
      throw new Error(
        "Não é possível excluir este veículo pois ele possui locações ou manutenções vinculadas (RN06)."
      );
    }
    await api.delete(`/veiculos/${id}`);
  },

  obterStatusFrota: async (
    veiculoId: string,
    locacoesCache?: Locacao[],
    manutencoesCache?: Manutencao[]
  ): Promise<StatusFrota> => {
    const [locacoes, manutencoes] = await Promise.all([
      locacoesCache ? Promise.resolve(locacoesCache) : api.get<Locacao[]>("/locacoes").then((r) => r.data),
      manutencoesCache
        ? Promise.resolve(manutencoesCache)
        : api.get<Manutencao[]>("/manutencoes").then((r) => r.data),
    ]);

    return calcularStatusFrota(veiculoId, locacoes, manutencoes);
  },

  // RF07: veículos que podem ser locados agora (nem locados, nem em manutenção).
  listarDisponiveis: async (): Promise<Veiculo[]> => {
    const [veiculos, locacoes, manutencoes] = await Promise.all([
      api.get<Veiculo[]>("/veiculos").then((r) => r.data),
      api.get<Locacao[]>("/locacoes").then((r) => r.data),
      api.get<Manutencao[]>("/manutencoes").then((r) => r.data),
    ]);
    return veiculos.filter(
      (v) => v.id && calcularStatusFrota(v.id, locacoes, manutencoes) === "DISPONIVEL"
    );
  },
};
// CRUD de veículos e cálculo do status da frota.