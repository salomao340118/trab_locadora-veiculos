export interface Cliente {
  id?: string;
  nome: string;
  cpf: string;
  cnh: string;
  validadeCnh: string;
  telefone: string;
  email: string;
  endereco: string;
}

export const clienteInicial: Cliente = {
  nome: "",
  cpf: "",
  cnh: "",
  validadeCnh: "",
  telefone: "",
  email: "",
  endereco: "",
};

export function isCnhVencida(validadeCnh: string, dataReferencia = new Date()): boolean {
  if (!validadeCnh) return true;
  const hoje = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), dataReferencia.getDate());
  const partes = validadeCnh.split("-").map(Number);
  if (partes.length !== 3) return true;
  const validade = new Date(partes[0], partes[1] - 1, partes[2]);
  return validade < hoje;
}