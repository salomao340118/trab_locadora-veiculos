import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { locacaoService } from "../../service/locacaoService";
import { clienteService } from "../../service/clienteService";
import { veiculoService } from "../../service/veiculoService";
import type { Locacao, StatusLocacao } from "../../models/Locacao";
import type { Cliente } from "../../models/Cliente";
import type { Veiculo } from "../../models/Veiculo";
import { Table, type TableColumn } from "../../components/Table";
import { Select } from "../../components/Select";
import { Button, IconButton } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { DomainStatusBadge } from "../../components/StatusBadge";
import { Eye, KeyRound, Plus, Undo2, XCircle } from "lucide-react";
import { formatarData, formatarMoeda } from "../../utils/format";

export function LocacaoList() {
  const navigate = useNavigate();
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroClienteId, setFiltroClienteId] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregar() {
    try {
      const [lList, cList, vList] = await Promise.all([
        locacaoService.listar(),
        clienteService.listar(),
        veiculoService.listar(),
      ]);
      setLocacoes(lList);
      setClientes(cList);
      setVeiculos(vList);
    } catch {
      setErro("Não foi possível carregar as locações.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCancelar(locacao: Locacao) {
    if (!locacao.id) return;
    try {
      await locacaoService.cancelarLocacao(locacao.id);
      setSucesso(`Locação #${locacao.id} cancelada.`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao cancelar locação.");
    }
  }

  const filtradas = locacoes.filter((l) => {
    const matchStatus = !filtroStatus || l.status === filtroStatus;
    const matchCliente = !filtroClienteId || l.clienteId === filtroClienteId;
    return matchStatus && matchCliente;
  });

  function badgeStatus(status: StatusLocacao) {
    return <DomainStatusBadge status={status} />;
  }

  const colunas: TableColumn<Locacao>[] = [
    { header: "ID", accessor: (l) => <span className="fw-semibold tabular">#{l.id}</span> },
    {
      header: "Cliente",
      accessor: (l) => clientes.find((c) => c.id === l.clienteId)?.nome ?? l.clienteId,
    },
    {
      header: "Veículo",
      accessor: (l) => (
        <span className="tabular text-nowrap">
          {veiculos.find((v) => v.id === l.veiculoId)?.placa ?? l.veiculoId}
        </span>
      ),
    },
    {
      header: "Retirada",
      accessor: (l) => <span className="tabular text-nowrap">{formatarData(l.dataRetirada)}</span>,
    },
    {
      header: "Prev. Devolução",
      accessor: (l) => <span className="tabular text-nowrap">{formatarData(l.dataDevolucaoPrevista)}</span>,
    },
    {
      header: "Valor Total",
      accessor: (l) => <span className="fw-semibold tabular text-nowrap">{formatarMoeda(l.valorTotal)}</span>,
    },
    {
      header: "Status",
      accessor: (l) => badgeStatus(l.status),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Locações"
        subtitle="Filtre por status ou cliente, abra detalhes, registre devoluções ou emita nota fiscal (RF14, RF15)"
        actions={<Button label="Nova Locação" icon={<Plus size={16} />} onClick={() => navigate("/locacoes/nova")} />}
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <Card
        title="Todas as locações"
        subtitle={`${filtradas.length} de ${locacoes.length} locação(ões)`}
        icon={<KeyRound size={16} />}
        flush
      >
      <div className="table-toolbar">
        <div className="table-toolbar-field">
          <Select
            label="Filtrar por Status"
            name="filtroStatus"
            value={filtroStatus}
            placeholder="Todos os status"
            options={[
              { value: "ABERTA", label: "Aberta" },
              { value: "FINALIZADA", label: "Finalizada" },
              { value: "CANCELADA", label: "Cancelada" },
            ]}
            onChange={(e) => setFiltroStatus(e.target.value)}
          />
        </div>
        <div className="table-toolbar-field">
          <Select
            label="Filtrar por Cliente"
            name="filtroClienteId"
            value={filtroClienteId}
            placeholder="Todos os clientes"
            options={clientes.map((c) => ({ value: c.id ?? "", label: c.nome }))}
            onChange={(e) => setFiltroClienteId(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={colunas}
        data={filtradas}
        emptyMessage="Nenhuma locação encontrada para os filtros selecionados."
        extraActions={(l) => (
          <>
            {l.status === "ABERTA" && (
              <>
                <Button
                  label="Devolver"
                  variant="success"
                  size="sm"
                  icon={<Undo2 size={14} />}
                  onClick={() => navigate(`/locacoes/${l.id}/devolucao`)}
                />
                <IconButton
                  label="Cancelar locação"
                  icon={<XCircle size={16} />}
                  danger
                  onClick={() => handleCancelar(l)}
                />
              </>
            )}
            <IconButton
              label="Ver detalhes"
              icon={<Eye size={16} />}
              onClick={() => navigate(`/locacoes/${l.id}`)}
            />
          </>
        )}
      />
      </Card>
    </div>
  );
}
// Lista locações e permite filtrar por status e por cliente antes da exibição.