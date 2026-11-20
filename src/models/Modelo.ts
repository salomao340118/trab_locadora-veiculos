export interface Modelo {
  id?: string;
  nome: string;
  ano: number;
  marcaId: string;
  categoriaId: string;
}

export const modeloInicial: Modelo = {
  nome: "",
  ano: new Date().getFullYear(),
  marcaId: "",
  categoriaId: "",
};
// Modelo representa uma versão de veículo e possui marca e categoria.