import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Navbar";
import { Home } from "./pages/Home";
import { MarcaList } from "./pages/marcas/MarcaList";
import { MarcaForm } from "./pages/marcas/MarcaForm";
import { CategoriaList } from "./pages/categorias/CategoriaList";
import { CategoriaForm } from "./pages/categorias/CategoriaForm";
import { ModeloList } from "./pages/modelos/ModeloList";
import { ModeloForm } from "./pages/modelos/ModeloForm";
import { VeiculoList } from "./pages/veiculos/VeiculoList";
import { VeiculoForm } from "./pages/veiculos/VeiculoForm";
import { ManutencaoList } from "./pages/manutencoes/ManutencaoList";
import { ManutencaoForm } from "./pages/manutencoes/ManutencaoForm";
import { ClienteList } from "./pages/clientes/ClienteList";
import { ClienteForm } from "./pages/clientes/ClienteForm";
import { LocacaoList } from "./pages/locacoes/LocacaoList";
import { LocacaoForm } from "./pages/locacoes/LocacaoForm";
import { DevolucaoForm } from "./pages/locacoes/DevolucaoForm";
import { LocacaoDetalhe } from "./pages/locacoes/LocacaoDetalhe";

// Componente raiz: define todas as rotas da aplicação e a navegação por URL.
// :id representa um parâmetro dinâmico, obtido nas páginas com useParams().
export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/marcas" element={<MarcaList />} />
          <Route path="/marcas/novo" element={<MarcaForm />} />
          <Route path="/marcas/editar/:id" element={<MarcaForm />} />

          <Route path="/categorias" element={<CategoriaList />} />
          <Route path="/categorias/novo" element={<CategoriaForm />} />
          <Route path="/categorias/editar/:id" element={<CategoriaForm />} />

          <Route path="/modelos" element={<ModeloList />} />
          <Route path="/modelos/novo" element={<ModeloForm />} />
          <Route path="/modelos/editar/:id" element={<ModeloForm />} />

          <Route path="/veiculos" element={<VeiculoList />} />
          <Route path="/veiculos/novo" element={<VeiculoForm />} />
          <Route path="/veiculos/editar/:id" element={<VeiculoForm />} />

          <Route path="/manutencoes" element={<ManutencaoList />} />
          <Route path="/manutencoes/nova" element={<ManutencaoForm />} />
          <Route path="/manutencoes/editar/:id" element={<ManutencaoForm />} />

          <Route path="/clientes" element={<ClienteList />} />
          <Route path="/clientes/novo" element={<ClienteForm />} />
          <Route path="/clientes/editar/:id" element={<ClienteForm />} />

          <Route path="/locacoes" element={<LocacaoList />} />
          <Route path="/locacoes/nova" element={<LocacaoForm />} />
          <Route path="/locacoes/:id" element={<LocacaoDetalhe />} />
          <Route path="/locacoes/:id/devolucao" element={<DevolucaoForm />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;