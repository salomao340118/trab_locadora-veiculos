import { api } from "./api";
import { veiculoService } from "./veiculoService";
import {
  calcularDiarias,
  calcularValorLocacao,
  hojeLocal,
  type Locacao,
} from "../models/Locacao";
import { isCnhVencida, type Cliente } from "../models/Cliente";
import type { Veiculo } from "../models/Veiculo";
import type { Modelo } from "../models/Modelo";
import type { Categoria } from "../models/Categoria";
import type { Contrato } from "../models/Contrato";
import type { Manutencao } from "../models/Manutencao";
import type { Vistoria, NivelCombustivel } from "../models/Vistoria";

export interface DadosAberturaLocacao {
  clienteId: string;
  veiculoId: string;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  nivelCombustivelRetirada: NivelCombustivel;
  observacoesRetirada: string;
}

export interface DadosFinalizacaoLocacao {
  dataDevolucaoReal: string;
  kmDevolucao: number;
  nivelCombustivelDevolucao: NivelCombustivel;
  observacoesDevolucao: string;
}

// Service centraliza regras da locação e toda comunicação com o JSON Server.
// As páginas chamam estes métodos e não usam Axios diretamente.
export const locacaoService = {
  listar: async (): Promise<Locacao[]> =>
    (await api.get<Locacao[]>("/locacoes")).data,

  buscarPorId: async (id: string): Promise<Locacao> =>
    (await api.get<Locacao>(`/locacoes/${id}`)).data,

  criar: async (locacao: Locacao): Promise<Locacao> =>
    (await api.post<Locacao>("/locacoes", locacao)).data,

  atualizar: async (id: string, locacao: Locacao): Promise<Locacao> =>
    (await api.put<Locacao>(`/locacoes/${id}`, { ...locacao, id })).data,

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/locacoes/${id}`);
  },

  registrarLocacaoCompleta: async (dados: DadosAberturaLocacao): Promise<Locacao> => {
    const [
      clientes,
      veiculos,
      modelos,
      categorias,
      locacoesExistentes,
      contratosExistentes,
      manutencoes,
    ] = await Promise.all([
      api.get<Cliente[]>("/clientes").then((r) => r.data),
      api.get<Veiculo[]>("/veiculos").then((r) => r.data),
      api.get<Modelo[]>("/modelos").then((r) => r.data),
      api.get<Categoria[]>("/categorias").then((r) => r.data),
      api.get<Locacao[]>("/locacoes").then((r) => r.data),
      api.get<Contrato[]>("/contratos").then((r) => r.data),
      api.get<Manutencao[]>("/manutencoes").then((r) => r.data),
    ]);

    const cliente = clientes.find((c) => c.id === dados.clienteId);
    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    // RN03: CNH vencida bloqueia locação
    if (isCnhVencida(cliente.validadeCnh)) {
      throw new Error(
        `Não é permitido registrar locação: a CNH do cliente ${cliente.nome} venceu em ${cliente.validadeCnh} (RN03).`
      );
    }

    const veiculo = veiculos.find((v) => v.id === dados.veiculoId);
    if (!veiculo) {
      throw new Error("Veículo não encontrado.");
    }

    // RN01: veículo com locação ABERTA não pode ser locado novamente
    const temLocacaoAberta = locacoesExistentes.some(
      (l) => l.veiculoId === veiculo.id && l.status === "ABERTA"
    );
    if (temLocacaoAberta) {
      throw new Error(
        `O veículo de placa ${veiculo.placa} já possui uma locação em aberto e não pode ser locado (RN01).`
      );
    }

    // RF07: o veículo precisa estar disponível; em manutenção também não pode ser locado
    const statusFrota = await veiculoService.obterStatusFrota(
      veiculo.id!,
      locacoesExistentes,
      manutencoes
    );
    if (statusFrota === "EM_MANUTENCAO") {
      throw new Error(
        `O veículo de placa ${veiculo.placa} está em manutenção e não está disponível para locação (RF07).`
      );
    }

    // RN02: data de devolução prevista deve ser posterior à data de retirada
    if (new Date(dados.dataDevolucaoPrevista) <= new Date(dados.dataRetirada)) {
      throw new Error(
        "A data de devolução prevista deve ser posterior à data de retirada (RN02)."
      );
    }

    const modelo = modelos.find((m) => m.id === veiculo.modeloId);
    const categoria = categorias.find((c) => c.id === modelo?.categoriaId);
    const valorDiaria = categoria ? Number(categoria.valorLocacao) : 0;

    // RF08: cálculo automático do valor previsto
    const valorPrevisto = calcularValorLocacao(
      dados.dataRetirada,
      dados.dataDevolucaoPrevista,
      valorDiaria
    );

    const novaLocacao: Locacao = {
      dataRetirada: dados.dataRetirada,
      dataDevolucaoPrevista: dados.dataDevolucaoPrevista,
      kmRetirada: Number(veiculo.kmRodado),
      valorTotal: valorPrevisto,
      status: "ABERTA",
      clienteId: cliente.id!,
      veiculoId: veiculo.id!,
    };

    const locacaoCriada = (await api.post<Locacao>("/locacoes", novaLocacao)).data;
    const locacaoId = locacaoCriada.id!;

    let contratoId: string | undefined;
    try {
      // RF09: gerar contrato automaticamente com número único
      const seq = String(contratosExistentes.length + 1).padStart(4, "0");
      const anoAtual = new Date().getFullYear();
      const novoContrato: Contrato = {
        numero: `CTR-${anoAtual}-${seq}`,
        dataEmissao: hojeLocal(),
        termos:
          "Contrato de locação de veículo: o locatário compromete-se a devolver o veículo na data prevista, respeitando as condições registradas na vistoria de retirada e as normas de trânsito.",
        locacaoId,
      };
      contratoId = (await api.post<Contrato>("/contratos", novoContrato)).data.id;

      // RF10: registrar vistoria de retirada
      const vistoriaRetirada: Vistoria = {
        tipo: "RETIRADA",
        data: dados.dataRetirada,
        km: Number(veiculo.kmRodado),
        nivelCombustivel: dados.nivelCombustivelRetirada,
        observacoes: dados.observacoesRetirada.trim() || "Sem observações na retirada.",
        locacaoId,
      };
      await api.post<Vistoria>("/vistorias", vistoriaRetirada);
    } catch {
      // Desfaz o que já foi salvo, para não ficar locação sem contrato ou sem vistoria.
      if (contratoId) await api.delete(`/contratos/${contratoId}`).catch(() => undefined);
      await api.delete(`/locacoes/${locacaoId}`).catch(() => undefined);
      throw new Error("Não foi possível concluir o registro da locação. Nada foi salvo; tente novamente.");
    }

    return locacaoCriada;
  },

  finalizarLocacao: async (
    locacaoId: string,
    dados: DadosFinalizacaoLocacao
  ): Promise<Locacao> => {
    const locacao = (await api.get<Locacao>(`/locacoes/${locacaoId}`)).data;
    if (locacao.status !== "ABERTA") {
      throw new Error("Apenas locações com status ABERTA podem ser finalizadas.");
    }

    const kmDev = Number(dados.kmDevolucao);
    // RN04: km de devolução não pode ser menor que km de retirada
    if (kmDev < Number(locacao.kmRetirada)) {
      throw new Error(
        `O KM de devolução (${kmDev} km) não pode ser menor que o KM de retirada (${locacao.kmRetirada} km) (RN04).`
      );
    }

    if (new Date(dados.dataDevolucaoReal) < new Date(locacao.dataRetirada)) {
      throw new Error("A data de devolução real não pode ser anterior à data de retirada.");
    }

    const [veiculo, modelos, categorias] = await Promise.all([
      api.get<Veiculo>(`/veiculos/${locacao.veiculoId}`).then((r) => r.data),
      api.get<Modelo[]>("/modelos").then((r) => r.data),
      api.get<Categoria[]>("/categorias").then((r) => r.data),
    ]);

    const modelo = modelos.find((m) => m.id === veiculo.modeloId);
    const categoria = categorias.find((c) => c.id === modelo?.categoriaId);
    const valorDiaria = categoria ? Number(categoria.valorLocacao) : 0;

    // RF11: recalcular valor total com base na devolução real (mínimo 1 diária)
    // Se a devolução for no mesmo instante da retirada, calcularDiarias devolve 0;
    // por isso garantimos pelo menos 1 diária cobrada.
    const diariasCobradas = Math.max(
      1,
      calcularDiarias(locacao.dataRetirada, dados.dataDevolucaoReal)
    );
    const valorRecalculado = Number((diariasCobradas * valorDiaria).toFixed(2));

    // RF11: registrar vistoria de devolução (inclui ocorrências / inconsistências nas observações)
    const vistoriaDevolucao: Vistoria = {
      tipo: "DEVOLUCAO",
      data: dados.dataDevolucaoReal,
      km: kmDev,
      nivelCombustivel: dados.nivelCombustivelDevolucao,
      observacoes:
        dados.observacoesDevolucao.trim() ||
        "Devolução sem ocorrências ou inconsistências registradas.",
      locacaoId,
    };
    await api.post<Vistoria>("/vistorias", vistoriaDevolucao);

    // RF11: atualizar km_rodado do veículo
    const novoKmVeiculo = Math.max(Number(veiculo.kmRodado), kmDev);
    await api.put<Veiculo>(`/veiculos/${veiculo.id}`, {
      ...veiculo,
      kmRodado: novoKmVeiculo,
    });

    // RF11: atualizar locação para FINALIZADA
    const locacaoAtualizada: Locacao = {
      ...locacao,
      dataDevolucaoReal: dados.dataDevolucaoReal,
      kmDevolucao: kmDev,
      valorTotal: valorRecalculado,
      status: "FINALIZADA",
    };

    return (await api.put<Locacao>(`/locacoes/${locacaoId}`, locacaoAtualizada)).data;
  },

  cancelarLocacao: async (locacaoId: string): Promise<Locacao> => {
    const locacao = (await api.get<Locacao>(`/locacoes/${locacaoId}`)).data;
    if (locacao.status !== "ABERTA") {
      throw new Error("Apenas locações ABERTAS podem ser canceladas.");
    }
    return (
      await api.put<Locacao>(`/locacoes/${locacaoId}`, {
        ...locacao,
        status: "CANCELADA",
      })
    ).data;
  },
};