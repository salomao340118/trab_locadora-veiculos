// Entidade de fabricante: relaciona-se com vários modelos.
export interface Marca {
  id?: string;
  nome: string;
}

export const marcaInicial: Marca = {
  nome: "",
};