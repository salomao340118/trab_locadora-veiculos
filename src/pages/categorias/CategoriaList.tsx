import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoriaService } from "../../service/categoriaService";
import type { Categoria } from "../../models/Categoria";
import { Table, type TableColumn } from "../../components/Table";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Modal } from "../../components/Modal";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { FolderTree, Plus } from "lucide-react";
import { formatarMoeda } from "../../utils/format";

export function CategoriaList() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [categoriaExcluir, setCategoriaExcluir] = useState<Categoria | null>(null);

  async function carregar() {
    try {
      setCategorias(await categoriaService.listar());
    } catch {
      setErro("Não foi possível carregar as categorias.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!categoriaExcluir?.id) return;
    try {
      await categoriaService.excluir(categoriaExcluir.id);
      setSucesso(`Categoria "${categoriaExcluir.nome}" excluída.`);
      setErro("");
      setCategoriaExcluir(null);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir categoria.");
      setCategoriaExcluir(null);
    }
  }

  const colunas: TableColumn<Categoria>[] = [
    { header: "ID", accessor: (c) => <span className="text-muted tabular">#{c.id}</span> },
    { header: "Categoria", accessor: (c) => <span className="fw-semibold">{c.nome}</span> },
    {
      header: "Valor da Diária",
      accessor: (c) => <span className="tabular">{formatarMoeda(c.valorLocacao)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Defina categorias como Básico, Intermediário ou Luxo e o valor da diária (RF02)"
        actions={
          <Button label="Nova Categoria" icon={<Plus size={16} />} onClick={() => navigate("/categorias/novo")} />
        }
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <Card
        title="Categorias e diárias"
        subtitle={`${categorias.length} categoria(s) cadastrada(s)`}
        icon={<FolderTree size={16} />}
        flush
      >
        <Table
          columns={colunas}
          data={categorias}
          onEdit={(c) => navigate(`/categorias/editar/${c.id}`)}
          onDelete={(c) => setCategoriaExcluir(c)}
          emptyMessage="Nenhuma categoria cadastrada."
        />
      </Card>

      <Modal
        show={Boolean(categoriaExcluir)}
        title="Confirmar Exclusão"
        onClose={() => setCategoriaExcluir(null)}
        onConfirm={confirmarExclusao}
      >
        Deseja excluir a categoria <strong>{categoriaExcluir?.nome}</strong>?
      </Modal>
    </div>
  );
}