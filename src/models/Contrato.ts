import { hojeLocal } from "./Locacao";

export interface Contrato {
  id?: string;
  numero: string;
  dataEmissao: string;
  termos: string;
  locacaoId: string;
}

export const contratoInicial: Contrato = {
  numero: "",
  dataEmissao: hojeLocal(),
  termos: "",
  locacaoId: "",
};
// Contrato gerado automaticamente para cada locação.