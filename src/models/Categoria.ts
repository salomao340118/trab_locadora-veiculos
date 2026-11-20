export interface Categoria {
  id?: string;
  nome: string;
  valorLocacao: number;
}

export const categoriaInicial: Categoria = {
  nome: "",
  valorLocacao: 0,
};
// Entidade de categoria e valor usado no cálculo da diária.