import { api, listarPorCampo } from "./api";
import type { NotaFiscal } from "../models/NotaFiscal";
import { hojeLocal, type Locacao } from "../models/Locacao";

export const notaFiscalService = {
  listar: async (): Promise<NotaFiscal[]> =>
    (await api.get<NotaFiscal[]>("/notasFiscais")).data,

  buscarPorId: async (id: string): Promise<NotaFiscal> =>
    (await api.get<NotaFiscal>(`/notasFiscais/${id}`)).data,

  buscarPorLocacaoId: async (locacaoId: string): Promise<NotaFiscal | undefined> => {
    const lista = await listarPorCampo<NotaFiscal>("notasFiscais", "locacaoId", locacaoId);
    return lista[0];
  },

  emitirParaLocacao: async (locacaoId: string, serie = "1"): Promise<NotaFiscal> => {
    const locacao = (await api.get<Locacao>(`/locacoes/${locacaoId}`)).data;

    // RN05: só pode emitir NF para locação FINALIZADA
    if (locacao.status !== "FINALIZADA") {
      throw new Error(
        "A nota fiscal só pode ser emitida para locações com status FINALIZADA (RN05)."
      );
    }

    // RF13: no máximo uma NF por locação
    const existentes = await listarPorCampo<NotaFiscal>("notasFiscais", "locacaoId", locacaoId);
    if (existentes.length > 0) {
      throw new Error("Esta locação já possui uma nota fiscal emitida.");
    }

    const todas = (await api.get<NotaFiscal[]>("/notasFiscais")).data;
    const proximoSeq = String(todas.length + 101).padStart(6, "0");

    const novaNf: NotaFiscal = {
      numero: `NF-${proximoSeq}`,
      serie,
      dataEmissao: hojeLocal(),
      valor: Number(locacao.valorTotal),
      locacaoId,
    };

    return (await api.post<NotaFiscal>("/notasFiscais", novaNf)).data;
  },

  criar: async (nf: NotaFiscal): Promise<NotaFiscal> =>
    notaFiscalService.emitirParaLocacao(nf.locacaoId, nf.serie),

  atualizar: async (id: string, nf: NotaFiscal): Promise<NotaFiscal> =>
    (await api.put<NotaFiscal>(`/notasFiscais/${id}`, { ...nf, id })).data,

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/notasFiscais/${id}`);
  },
};
// Emissão e consulta da nota fiscal de locações finalizadas.