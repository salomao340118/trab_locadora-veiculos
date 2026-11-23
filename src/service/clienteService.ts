import { api } from "./api";
import type { Cliente } from "../models/Cliente";
import type { Locacao } from "../models/Locacao";

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

async function validarUnicidadeCliente(cliente: Cliente, idIgnorado?: string): Promise<void> {
  const clientes = (await api.get<Cliente[]>("/clientes")).data;
  const cpfLimpo = somenteDigitos(cliente.cpf);
  const cnhLimpa = somenteDigitos(cliente.cnh);

  const cpfExiste = clientes.some(
    (c) => c.id !== idIgnorado && somenteDigitos(c.cpf) === cpfLimpo
  );
  if (cpfExiste) {
    throw new Error("Já existe um cliente cadastrado com este CPF.");
  }

  const cnhExiste = clientes.some(
    (c) => c.id !== idIgnorado && somenteDigitos(c.cnh) === cnhLimpa
  );
  if (cnhExiste) {
    throw new Error("Já existe um cliente cadastrado com esta CNH.");
  }
}

export const clienteService = {
  listar: async (): Promise<Cliente[]> =>
    (await api.get<Cliente[]>("/clientes")).data,

  buscarPorId: async (id: string): Promise<Cliente> =>
    (await api.get<Cliente>(`/clientes/${id}`)).data,

  criar: async (cliente: Cliente): Promise<Cliente> => {
    await validarUnicidadeCliente(cliente);
    return (
      await api.post<Cliente>("/clientes", {
        ...cliente,
        nome: cliente.nome.trim(),
        email: cliente.email.trim(),
        endereco: cliente.endereco.trim(),
      })
    ).data;
  },

  atualizar: async (id: string, cliente: Cliente): Promise<Cliente> => {
    await validarUnicidadeCliente(cliente, id);
    return (
      await api.put<Cliente>(`/clientes/${id}`, {
        ...cliente,
        id,
        nome: cliente.nome.trim(),
        email: cliente.email.trim(),
        endereco: cliente.endereco.trim(),
      })
    ).data;
  },

  excluir: async (id: string): Promise<void> => {
    // RN06: impedir exclusão se cliente possuir locações
    const locacoes = (await api.get<Locacao[]>("/locacoes")).data;
    const possuiLocacao = locacoes.some((l) => l.clienteId === id);
    if (possuiLocacao) {
      throw new Error("Não é possível excluir este cliente pois ele possui locações registradas (RN06).");
    }
    await api.delete(`/clientes/${id}`);
  },
};
// CRUD de clientes, incluindo validação de duplicidade de CPF e CNH.