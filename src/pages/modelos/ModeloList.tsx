import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { modeloService } from "../../service/modeloService";
import { marcaService } from "../../service/marcaService";
import { categoriaService } from "../../service/categoriaService";
import type { Modelo } from "../../models/Modelo";
import type { Marca } from "../../models/Marca";
import type { Categoria } from "../../models/Categoria";
import { Table, type TableColumn } from "../../components/Table";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Modal } from "../../components/Modal";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Layers, Plus } from "lucide-react";
import { formatarMoeda } from "../../utils/format";

export function ModeloList() {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [modeloExcluir, setModeloExcluir] = useState<Modelo | null>(null);

  async function carregar() {
    try {
      const [mList, bList, cList] = await Promise.all([
        modeloService.listar(),
        marcaService.listar(),
        categoriaService.listar(),
      ]);
      setModelos(mList);
      setMarcas(bList);
      setCategorias(cList);
    } catch {
      setErro("Não foi possível carregar os modelos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!modeloExcluir?.id) return;
    try {
      await modeloService.excluir(modeloExcluir.id);
      setSucesso(`Modelo "${modeloExcluir.nome}" excluído.`);
      setErro("");
      setModeloExcluir(null);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir modelo.");
      setModeloExcluir(null);
    }
  }

  const colunas: TableColumn<Modelo>[] = [
    { header: "ID", accessor: (m) => <span className="text-muted tabular">#{m.id}</span> },
    { header: "Modelo", accessor: (m) => <span className="fw-semibold">{m.nome}</span> },
    { header: "Ano", accessor: (m) => <span className="tabular">{m.ano}</span> },
    {
      header: "Marca",
      accessor: (m) => marcas.find((b) => b.id === m.marcaId)?.nome ?? m.marcaId,
    },
    {
      header: "Categoria",
      accessor: (m) => {
        const cat = categorias.find((c) => c.id === m.categoriaId);
        return cat ? (
          <span className="d-inline-flex align-items-center gap-2 flex-wrap">
            <StatusBadge tone="primary">{cat.nome}</StatusBadge>
            <span className="text-muted small tabular">{formatarMoeda(cat.valorLocacao)}/dia</span>
          </span>
        ) : (
          m.categoriaId
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Modelos"
        subtitle="Modelos vinculados a marcas e categorias (RF03)"
        actions={<Button label="Novo Modelo" icon={<Plus size={16} />} onClick={() => navigate("/modelos/novo")} />}
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <Card title="Modelos cadastrados" subtitle={`${modelos.length} modelo(s)`} icon={<Layers size={16} />} flush>
        <Table
          columns={colunas}
          data={modelos}
          onEdit={(m) => navigate(`/modelos/editar/${m.id}`)}
          onDelete={(m) => setModeloExcluir(m)}
          emptyMessage="Nenhum modelo cadastrado."
        />
      </Card>

      <Modal
        show={Boolean(modeloExcluir)}
        title="Confirmar Exclusão"
        onClose={() => setModeloExcluir(null)}
        onConfirm={confirmarExclusao}
      >
        Deseja excluir o modelo <strong>{modeloExcluir?.nome}</strong>?
      </Modal>
    </div>
  );
}