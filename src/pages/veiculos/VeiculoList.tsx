import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { veiculoService } from "../../service/veiculoService";
import { modeloService } from "../../service/modeloService";
import { manutencaoService } from "../../service/manutencaoService";
import { locacaoService } from "../../service/locacaoService";
import type { Veiculo, StatusFrota } from "../../models/Veiculo";
import type { Modelo } from "../../models/Modelo";
import type { Manutencao } from "../../models/Manutencao";
import { Table, type TableColumn } from "../../components/Table";
import { Button, IconButton } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Modal } from "../../components/Modal";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { DomainStatusBadge } from "../../components/StatusBadge";
import { CarFront, History, Plus, Wrench } from "lucide-react";
import { formatarData, formatarKm, formatarMoeda } from "../../utils/format";

export function VeiculoList() {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, StatusFrota>>({});
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [veiculoExcluir, setVeiculoExcluir] = useState<Veiculo | null>(null);
  const [veiculoHistorico, setVeiculoHistorico] = useState<Veiculo | null>(null);

  async function carregar() {
    try {
      // As quatro listas são carregadas juntas porque todas participam do status da frota.
      const [vList, mList, manList, locList] = await Promise.all([
        veiculoService.listar(),
        modeloService.listar(),
        manutencaoService.listar(),
        locacaoService.listar(),
      ]);
      setVeiculos(vList);
      setModelos(mList);
      setManutencoes(manList);

      const mapa: Record<string, StatusFrota> = {};
      for (const v of vList) {
        if (v.id) {
          mapa[v.id] = await veiculoService.obterStatusFrota(v.id, locList, manList);
        }
      }
      setStatusMap(mapa);
    } catch {
      setErro("Não foi possível carregar os veículos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!veiculoExcluir?.id) return;
    try {
      await veiculoService.excluir(veiculoExcluir.id);
      setSucesso(`Veículo placa ${veiculoExcluir.placa} excluído.`);
      setErro("");
      setVeiculoExcluir(null);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir veículo.");
      setVeiculoExcluir(null);
    }
  }

  function renderBadgeStatus(status?: StatusFrota) {
    return <DomainStatusBadge status={status ?? "DISPONIVEL"} />;
  }

  const colunas: TableColumn<Veiculo>[] = [
    {
      header: "Placa",
      accessor: (v) => <span className="fw-semibold tabular text-nowrap">{v.placa}</span>,
    },
    {
      header: "Modelo",
      accessor: (v) => modelos.find((m) => m.id === v.modeloId)?.nome ?? v.modeloId,
    },
    { header: "Chassi", accessor: (v) => <span className="text-muted small tabular">{v.chassi}</span> },
    { header: "Ano", accessor: (v) => <span className="tabular">{v.anoFabricacao}</span> },
    { header: "Cor", accessor: "cor" },
    {
      header: "KM Rodado",
      accessor: (v) => <span className="tabular text-nowrap">{formatarKm(v.kmRodado)}</span>,
    },
    {
      header: "Status",
      accessor: (v) => renderBadgeStatus(v.id ? statusMap[v.id] : undefined),
    },
  ];

  const historicoDoVeiculo = manutencoes.filter((m) => m.veiculoId === veiculoHistorico?.id);

  return (
    <div>
      <PageHeader
        title="Frota de Veículos"
        subtitle="Status em tempo real (Disponível, Locado ou Em manutenção) e histórico de manutenções (RF04, RF05, RF16)"
        actions={
          <>
            <Button
              label="Registrar Manutenção"
              variant="secondary"
              icon={<Wrench size={16} />}
              onClick={() => navigate("/manutencoes/nova")}
            />
            <Button label="Novo Veículo" icon={<Plus size={16} />} onClick={() => navigate("/veiculos/novo")} />
          </>
        }
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <Card title="Veículos" subtitle={`${veiculos.length} veículo(s) na frota`} icon={<CarFront size={16} />} flush>
        <Table
          columns={colunas}
          data={veiculos}
          extraActions={(v) => (
            <IconButton
              label="Histórico de manutenções"
              icon={<History size={16} />}
              onClick={() => setVeiculoHistorico(v)}
            />
          )}
          onEdit={(v) => navigate(`/veiculos/editar/${v.id}`)}
          onDelete={(v) => setVeiculoExcluir(v)}
          emptyMessage="Nenhum veículo cadastrado."
        />
      </Card>

      <Modal
        show={Boolean(veiculoExcluir)}
        title="Confirmar Exclusão"
        onClose={() => setVeiculoExcluir(null)}
        onConfirm={confirmarExclusao}
      >
        Deseja excluir o veículo de placa <strong>{veiculoExcluir?.placa}</strong>?
      </Modal>

      <Modal
        show={Boolean(veiculoHistorico)}
        title={`Histórico de Manutenções — ${veiculoHistorico?.placa ?? ""}`}
        onClose={() => setVeiculoHistorico(null)}
        cancelLabel="Fechar"
      >
        {historicoDoVeiculo.length === 0 ? (
          <p className="text-muted mb-0">Nenhuma manutenção registrada para este veículo.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {historicoDoVeiculo.map((item) => (
              <li key={item.id} className="list-row align-items-start">
                <div>
                  <div className="fw-semibold">{item.descricao}</div>
                  <div className="small text-muted tabular">{formatarData(item.data)}</div>
                </div>
                <span className="fw-semibold tabular text-nowrap">{formatarMoeda(item.valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}