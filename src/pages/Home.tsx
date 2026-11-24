import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CarFront,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Plus,
  UserPlus,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { DomainStatusBadge } from "../components/StatusBadge";
import { veiculoService } from "../service/veiculoService";
import { clienteService } from "../service/clienteService";
import { locacaoService } from "../service/locacaoService";
import { manutencaoService } from "../service/manutencaoService";
import type { Locacao } from "../models/Locacao";
import type { Cliente } from "../models/Cliente";
import type { Veiculo, StatusFrota } from "../models/Veiculo";
import { formatarData, formatarMoeda } from "../utils/format";

interface Resumo {
  veiculos: number;
  clientes: number;
  locacoesAbertas: number;
  locacoesFinalizadas: number;
  faturamentoFinalizadas: number;
  frota: Record<StatusFrota, number>;
}

const resumoInicial: Resumo = {
  veiculos: 0,
  clientes: 0,
  locacoesAbertas: 0,
  locacoesFinalizadas: 0,
  faturamentoFinalizadas: 0,
  frota: { DISPONIVEL: 0, LOCADO: 0, EM_MANUTENCAO: 0 },
};

const frotaInfo: { status: StatusFrota; label: string; cor: string }[] = [
  { status: "DISPONIVEL", label: "Disponíveis", cor: "#15803d" },
  { status: "LOCADO", label: "Locados", cor: "#d97706" },
  { status: "EM_MANUTENCAO", label: "Em manutenção", cor: "#c62828" },
];

const atalhos: { to: string; titulo: string; descricao: string; icon: LucideIcon }[] = [
  { to: "/locacoes/nova", titulo: "Nova locação", descricao: "Contrato e vistoria de retirada", icon: KeyRound },
  { to: "/clientes/novo", titulo: "Cadastrar cliente", descricao: "Dados pessoais e CNH", icon: UserPlus },
  { to: "/veiculos/novo", titulo: "Cadastrar veículo", descricao: "Adicionar à frota", icon: CarFront },
  { to: "/manutencoes/nova", titulo: "Registrar manutenção", descricao: "Serviços e custos", icon: Wrench },
];

export function Home() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState<Resumo>(resumoInicial);
  const [recentes, setRecentes] = useState<Locacao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarResumo() {
      try {
        const [vList, cList, locacoes, manutencoes] = await Promise.all([
          veiculoService.listar(),
          clienteService.listar(),
          locacaoService.listar(),
          manutencaoService.listar(),
        ]);

        // Usa a mesma regra de status da frota da tela de veículos (RF16).
        const frota: Record<StatusFrota, number> = { DISPONIVEL: 0, LOCADO: 0, EM_MANUTENCAO: 0 };
        for (const v of vList) {
          if (!v.id) continue;
          const status = await veiculoService.obterStatusFrota(v.id, locacoes, manutencoes);
          frota[status] += 1;
        }

        const finalizadas = locacoes.filter((l) => l.status === "FINALIZADA");
        setResumo({
          veiculos: vList.length,
          clientes: cList.length,
          locacoesAbertas: locacoes.filter((l) => l.status === "ABERTA").length,
          locacoesFinalizadas: finalizadas.length,
          faturamentoFinalizadas: finalizadas.reduce((acc, l) => acc + Number(l.valorTotal), 0),
          frota,
        });
        setClientes(cList);
        setVeiculos(vList);
        setRecentes(
          [...locacoes].sort((a, b) => b.dataRetirada.localeCompare(a.dataRetirada)).slice(0, 5)
        );
      } catch {
        setErro("Não foi possível carregar os indicadores. Verifique se o JSON Server está em execução.");
      } finally {
        setCarregando(false);
      }
    }
    carregarResumo();
  }, []);

  const valor = (n: number) => (carregando ? "—" : n);
  const totalFrota = resumo.veiculos || 1;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Acompanhe a frota, os clientes e o ciclo completo das locações em um só lugar."
        actions={
          <>
            <Button label="Ver locações" variant="secondary" onClick={() => navigate("/locacoes")} />
            <Button
              label="Nova locação"
              icon={<Plus size={16} />}
              onClick={() => navigate("/locacoes/nova")}
            />
          </>
        }
      />

      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Veículos na frota"
            value={valor(resumo.veiculos)}
            icon={<CarFront size={20} />}
            tone="primary"
            hint={`${resumo.frota.DISPONIVEL} disponíveis agora`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Clientes cadastrados"
            value={valor(resumo.clientes)}
            icon={<Users size={20} />}
            tone="neutral"
            hint="Base total de clientes"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Locações abertas"
            value={valor(resumo.locacoesAbertas)}
            icon={<KeyRound size={20} />}
            tone="warning"
            hint="Aguardando devolução"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Locações finalizadas"
            value={valor(resumo.locacoesFinalizadas)}
            icon={<CheckCircle2 size={20} />}
            tone="success"
            hint={`${formatarMoeda(resumo.faturamentoFinalizadas)} faturados`}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <Card
            title="Situação da frota"
            subtitle="Status atual dos veículos cadastrados"
            icon={<CarFront size={16} />}
            actions={
              <Button label="Ver frota" variant="secondary" size="sm" onClick={() => navigate("/veiculos")} />
            }
          >
            {resumo.veiculos === 0 && !carregando ? (
              <p className="text-muted mb-0">Nenhum veículo cadastrado ainda.</p>
            ) : (
              <>
                <div
                  className="fleet-bar mb-4"
                  role="img"
                  aria-label={frotaInfo
                    .map((f) => `${resumo.frota[f.status]} ${f.label.toLowerCase()}`)
                    .join(", ")}
                >
                  {frotaInfo.map((f) => (
                    <span
                      key={f.status}
                      style={{
                        width: `${(resumo.frota[f.status] / totalFrota) * 100}%`,
                        background: f.cor,
                      }}
                    />
                  ))}
                </div>
                <div className="row g-3">
                  {frotaInfo.map((f) => {
                    const qtd = resumo.frota[f.status];
                    const pct = Math.round((qtd / totalFrota) * 100);
                    return (
                      <div className="col-sm-4" key={f.status}>
                        <div className="info-panel h-100">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="legend-dot" style={{ background: f.cor }} aria-hidden="true" />
                            <span className="small fw-medium text-muted">{f.label}</span>
                          </div>
                          <div className="d-flex align-items-baseline gap-2">
                            <span className="fs-4 fw-bold tabular">{valor(qtd)}</span>
                            <span className="small text-muted tabular">{carregando ? "" : `${pct}%`}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </div>

        <div className="col-lg-5">
          <Card title="Atalhos rápidos" subtitle="Operações mais frequentes" icon={<Plus size={16} />}>
            <div className="d-flex flex-column gap-2">
              {atalhos.map((a) => (
                <Link key={a.to} to={a.to} className="quick-action">
                  <span className="stat-card-icon tone-primary" aria-hidden="true">
                    <a.icon size={18} />
                  </span>
                  <span className="flex-grow-1">
                    <span className="quick-action-title d-block">{a.titulo}</span>
                    <span className="quick-action-desc">{a.descricao}</span>
                  </span>
                  <ChevronRight size={16} className="text-muted" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card
        title="Locações recentes"
        subtitle="Últimas locações registradas"
        icon={<KeyRound size={16} />}
        flush
        actions={<Button label="Ver todas" variant="secondary" size="sm" onClick={() => navigate("/locacoes")} />}
      >
        {recentes.length === 0 ? (
          <p className="text-muted mb-0 p-4">{carregando ? "Carregando..." : "Nenhuma locação registrada."}</p>
        ) : (
          <div className="table-responsive">
            <table className="table app-table">
              <thead>
                <tr>
                  <th scope="col">Locação</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Veículo</th>
                  <th scope="col">Retirada</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link to={`/locacoes/${l.id}`} className="fw-semibold text-decoration-none">
                        #{l.id}
                      </Link>
                    </td>
                    <td>{clientes.find((c) => c.id === l.clienteId)?.nome ?? l.clienteId}</td>
                    <td className="tabular">{veiculos.find((v) => v.id === l.veiculoId)?.placa ?? l.veiculoId}</td>
                    <td className="tabular">{formatarData(l.dataRetirada)}</td>
                    <td className="tabular">{formatarMoeda(l.valorTotal)}</td>
                    <td>
                      <DomainStatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
