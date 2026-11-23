import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { manutencaoService } from "../../service/manutencaoService";
import { veiculoService } from "../../service/veiculoService";
import type { Manutencao } from "../../models/Manutencao";
import type { Veiculo } from "../../models/Veiculo";
import { Table, type TableColumn } from "../../components/Table";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Modal } from "../../components/Modal";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { Plus, Wrench } from "lucide-react";
import { formatarData, formatarMoeda } from "../../utils/format";

export function ManutencaoList() {
  const navigate = useNavigate();
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [filtroVeiculoId, setFiltroVeiculoId] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [manutencaoExcluir, setManutencaoExcluir] = useState<Manutencao | null>(null);

  async function carregar() {
    try {
      const [manList, vList] = await Promise.all([
        manutencaoService.listar(),
        veiculoService.listar(),
      ]);
      setManutencoes(manList);
      setVeiculos(vList);
    } catch {
      setErro("Não foi possível carregar as manutenções.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!manutencaoExcluir?.id) return;
    try {
      await manutencaoService.excluir(manutencaoExcluir.id);
      setSucesso("Manutenção removida.");
      setManutencaoExcluir(null);
      await carregar();
    } catch {
      setErro("Erro ao excluir manutenção.");
      setManutencaoExcluir(null);
    }
  }

  const filtradas = filtroVeiculoId
    ? manutencoes.filter((m) => m.veiculoId === filtroVeiculoId)
    : manutencoes;

  const colunas: TableColumn<Manutencao>[] = [
    { header: "Data", accessor: (m) => <span className="tabular text-nowrap">{formatarData(m.data)}</span> },
    {
      header: "Veículo",
      accessor: (m) => (
        <span className="fw-semibold tabular text-nowrap">
          {veiculos.find((v) => v.id === m.veiculoId)?.placa ?? m.veiculoId}
        </span>
      ),
    },
    { header: "Descrição", accessor: "descricao" },
    {
      header: "Valor",
      accessor: (m) => <span className="tabular text-nowrap">{formatarMoeda(m.valor)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manutenções"
        subtitle="Histórico e registro de manutenções por veículo (RF05)"
        actions={
          <Button label="Nova Manutenção" icon={<Plus size={16} />} onClick={() => navigate("/manutencoes/nova")} />
        }
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <Card
        title="Histórico de manutenções"
        subtitle={`${filtradas.length} registro(s) • total ${formatarMoeda(
          filtradas.reduce((acc, m) => acc + Number(m.valor), 0)
        )}`}
        icon={<Wrench size={16} />}
        flush
      >
      <div className="table-toolbar">
        <div className="table-toolbar-field">
          <Select
            label="Filtrar por veículo"
            name="filtroVeiculoId"
            value={filtroVeiculoId}
            placeholder="Todos os veículos"
            options={veiculos.map((v) => ({ value: v.id ?? "", label: `${v.placa} (${v.cor})` }))}
            onChange={(e) => setFiltroVeiculoId(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={colunas}
        data={filtradas}
        onEdit={(m) => navigate(`/manutencoes/editar/${m.id}`)}
        onDelete={(m) => setManutencaoExcluir(m)}
        emptyMessage="Nenhuma manutenção encontrada."
      />
      </Card>

      <Modal
        show={Boolean(manutencaoExcluir)}
        title="Confirmar Exclusão"
        onClose={() => setManutencaoExcluir(null)}
        onConfirm={confirmarExclusao}
      >
        Deseja excluir este registro de manutenção?
      </Modal>
    </div>
  );
}