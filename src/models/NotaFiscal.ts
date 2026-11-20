import { hojeLocal } from "./Locacao";

export interface NotaFiscal {
  id?: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  valor: number;
  locacaoId: string;
}

export const notaFiscalInicial: NotaFiscal = {
  numero: "",
  serie: "1",
  dataEmissao: hojeLocal(),
  valor: 0,
  locacaoId: "",
};
// Nota fiscal emitida somente para uma locação finalizada.