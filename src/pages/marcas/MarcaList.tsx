import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { marcaService } from "../../service/marcaService";
import type { Marca } from "../../models/Marca";
import { Table, type TableColumn } from "../../components/Table";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Modal } from "../../components/Modal";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { Plus, Tag } from "lucide-react";

export function MarcaList() {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [marcaParaExcluir, setMarcaParaExcluir] = useState<Marca | null>(null);

  async function carregarMarcas() {
    try {
      const dados = await marcaService.listar();
      setMarcas(dados);
    } catch {
      setErro("Não foi possível carregar as marcas.");
    }
  }

  useEffect(() => {
    carregarMarcas();
  }, []);

  async function confirmarExclusao() {
    if (!marcaParaExcluir?.id) return;
    try {
      await marcaService.excluir(marcaParaExcluir.id);
      setSucesso(`Marca "${marcaParaExcluir.nome}" excluída com sucesso.`);
      setErro("");
      setMarcaParaExcluir(null);
      await carregarMarcas();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir marca.");
      setMarcaParaExcluir(null);
    }
  }

  const colunas: TableColumn<Marca>[] = [
    { header: "ID", accessor: (m) => <span className="text-muted tabular">#{m.id}</span> },
    { header: "Nome", accessor: (m) => <span className="fw-semibold">{m.nome}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Marcas"
        subtitle="Gerenciamento de fabricantes de veículos (RF01)"
        actions={<Button label="Nova Marca" icon={<Plus size={16} />} onClick={() => navigate("/marcas/novo")} />}
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <Card title="Fabricantes" subtitle={`${marcas.length} marca(s) cadastrada(s)`} icon={<Tag size={16} />} flush>
        <Table
          columns={colunas}
          data={marcas}
          onEdit={(m) => navigate(`/marcas/editar/${m.id}`)}
          onDelete={(m) => setMarcaParaExcluir(m)}
          emptyMessage="Nenhuma marca cadastrada."
        />
      </Card>

      <Modal
        show={Boolean(marcaParaExcluir)}
        title="Confirmar Exclusão"
        onClose={() => setMarcaParaExcluir(null)}
        onConfirm={confirmarExclusao}
      >
        Deseja realmente excluir a marca <strong>{marcaParaExcluir?.nome}</strong>?
      </Modal>
    </div>
  );
}