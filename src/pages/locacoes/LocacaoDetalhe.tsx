import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { locacaoService } from "../../service/locacaoService";
import { clienteService } from "../../service/clienteService";
import { veiculoService } from "../../service/veiculoService";
import { modeloService } from "../../service/modeloService";
import { contratoService } from "../../service/contratoService";
import { vistoriaService } from "../../service/vistoriaService";
import { pagamentoService } from "../../service/pagamentoService";
import { notaFiscalService } from "../../service/notaFiscalService";
import type { Locacao } from "../../models/Locacao";
import type { Cliente } from "../../models/Cliente";
import type { Veiculo } from "../../models/Veiculo";
import type { Modelo } from "../../models/Modelo";
import type { Contrato } from "../../models/Contrato";
import type { Vistoria } from "../../models/Vistoria";
import {
  pagamentoInicial,
  type FormaPagamento,
  type Pagamento,
  type StatusPagamento,
} from "../../models/Pagamento";
import type { NotaFiscal } from "../../models/NotaFiscal";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { PageHeader } from "../../components/PageHeader";
import { StatCard } from "../../components/StatCard";
import { DomainStatusBadge } from "../../components/StatusBadge";
import {
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  KeyRound,
  Plus,
  Receipt,
  Undo2,
  Wallet,
} from "lucide-react";
import { formatarData, formatarFormaPagamento, formatarKm, formatarMoeda } from "../../utils/format";

export function LocacaoDetalhe() {
  // useParams lê o :id informado na URL, como /locacoes/1.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [locacao, setLocacao] = useState<Locacao | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [modelo, setModelo] = useState<Modelo | null>(null);
  const [contrato, setContrato] = useState<Contrato | undefined>(undefined);
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [notaFiscal, setNotaFiscal] = useState<NotaFiscal | undefined>(undefined);

  const [novoPag, setNovoPag] = useState<Pagamento>(pagamentoInicial);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarTudo() {
    if (!id) return;
    try {
      const l = await locacaoService.buscarPorId(id);
      setLocacao(l);

      // Reúne todas as entidades relacionadas em uma única carga paralela.
      const [c, v, mList, ctr, vistList, pagList, nf] = await Promise.all([
        clienteService.buscarPorId(l.clienteId),
        veiculoService.buscarPorId(l.veiculoId),
        modeloService.listar(),
        contratoService.buscarPorLocacaoId(id),
        vistoriaService.listarPorLocacaoId(id),
        pagamentoService.listarPorLocacaoId(id),
        notaFiscalService.buscarPorLocacaoId(id),
      ]);

      setCliente(c);
      setVeiculo(v);
      setModelo(mList.find((m) => m.id === v.modeloId) ?? null);
      setContrato(ctr);
      setVistorias(vistList);
      setPagamentos(pagList);
      setNotaFiscal(nf);
    } catch {
      setErro("Não foi possível carregar os detalhes da locação.");
    }
  }

  useEffect(() => {
    carregarTudo();
  }, [id]);

  async function handleAdicionarPagamento(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;
    setErro("");
    try {
      await pagamentoService.criar({
        ...novoPag,
        locacaoId: id,
      });
      setSucesso("Pagamento registrado com sucesso (RF12).");
      setNovoPag({ ...pagamentoInicial, valor: 0 });
      await carregarTudo();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao registrar pagamento.");
    }
  }

  async function handleEmitirNotaFiscal() {
    if (!id) return;
    setErro("");
    try {
      await notaFiscalService.emitirParaLocacao(id, "1");
      setSucesso("Nota fiscal emitida com sucesso (RF13).");
      await carregarTudo();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao emitir nota fiscal.");
    }
  }

  if (!locacao) {
    return (
      <div>
        <PageHeader title="Detalhes da Locação" backTo="/locacoes" backLabel="Voltar para locações" />
        {erro ? <Alert type="danger" message={erro} /> : <p className="text-muted">Carregando...</p>}
      </div>
    );
  }

  const totalPago = pagamentos
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + Number(p.valor), 0);

  const saldo = Number(locacao.valorTotal) - totalPago;

  return (
    <div>
      <PageHeader
        title={`Locação #${locacao.id}`}
        subtitle={`${cliente?.nome ?? locacao.clienteId} • ${modelo?.nome ?? ""} ${veiculo?.placa ?? ""}`}
        backTo="/locacoes"
        backLabel="Voltar para locações"
        actions={
          <>
            <DomainStatusBadge status={locacao.status} />
            {locacao.status === "ABERTA" && (
              <Button
                label="Registrar Devolução"
                variant="success"
                icon={<Undo2 size={16} />}
                onClick={() => navigate(`/locacoes/${locacao.id}/devolucao`)}
              />
            )}
          </>
        }
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <StatCard label="Valor total" value={formatarMoeda(locacao.valorTotal)} icon={<Receipt size={20} />} tone="primary" />
        </div>
        <div className="col-sm-4">
          <StatCard label="Total pago" value={formatarMoeda(totalPago)} icon={<Wallet size={20} />} tone="success" />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Saldo"
            value={formatarMoeda(saldo)}
            icon={<CircleDollarSign size={20} />}
            tone={saldo > 0 ? "warning" : "neutral"}
            hint={saldo > 0 ? "Valor ainda não quitado" : saldo < 0 ? "Pagamentos acima do total" : "Sem pendências"}
          />
        </div>
      </div>

      <Card title="Dados da Locação, Cliente e Veículo (RF15)" icon={<KeyRound size={16} />}>
        <div className="row g-4">
          <div className="col-md-4">
            <h3 className="form-section-title mb-3">Locação</h3>
            <dl className="d-flex flex-column gap-3 mb-0">
              <div>
                <dt className="detail-label">Retirada</dt>
                <dd className="detail-value mb-0 tabular">
                  {formatarData(locacao.dataRetirada)} • {formatarKm(locacao.kmRetirada)}
                </dd>
              </div>
              <div>
                <dt className="detail-label">Devolução</dt>
                <dd className="detail-value mb-0 tabular">
                  {locacao.dataDevolucaoReal
                    ? `${formatarData(locacao.dataDevolucaoReal)} • ${formatarKm(locacao.kmDevolucao)}`
                    : `Prevista: ${formatarData(locacao.dataDevolucaoPrevista)}`}
                </dd>
              </div>
            </dl>
          </div>
          <div className="col-md-4">
            <h3 className="form-section-title mb-3">Cliente</h3>
            <dl className="d-flex flex-column gap-3 mb-0">
              <div>
                <dt className="detail-label">Nome</dt>
                <dd className="detail-value mb-0">{cliente?.nome ?? locacao.clienteId}</dd>
              </div>
              <div>
                <dt className="detail-label">CPF</dt>
                <dd className="detail-value mb-0 tabular">{cliente?.cpf ?? "—"}</dd>
              </div>
              <div>
                <dt className="detail-label">CNH</dt>
                <dd className="detail-value mb-0 tabular">
                  {cliente?.cnh} <span className="text-muted fw-normal">(Val.: {formatarData(cliente?.validadeCnh)})</span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="col-md-4">
            <h3 className="form-section-title mb-3">Veículo</h3>
            <dl className="d-flex flex-column gap-3 mb-0">
              <div>
                <dt className="detail-label">Modelo</dt>
                <dd className="detail-value mb-0">{modelo?.nome ?? "—"}</dd>
              </div>
              <div>
                <dt className="detail-label">Placa</dt>
                <dd className="detail-value mb-0 tabular">{veiculo?.placa ?? locacao.veiculoId}</dd>
              </div>
              <div>
                <dt className="detail-label">Cor</dt>
                <dd className="detail-value mb-0">{veiculo?.cor ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      <div className="row g-3">
        <div className="col-lg-6">
          <Card title="Contrato (RF09)" icon={<FileText size={16} />} className="h-100">
            {contrato ? (
              <div>
                <div className="detail-grid mb-3">
                  <div>
                    <div className="detail-label">Número</div>
                    <div className="detail-value tabular">{contrato.numero}</div>
                  </div>
                  <div>
                    <div className="detail-label">Emissão</div>
                    <div className="detail-value tabular">{formatarData(contrato.dataEmissao)}</div>
                  </div>
                </div>
                <div className="info-panel small text-muted">{contrato.termos}</div>
              </div>
            ) : (
              <p className="text-muted mb-0">Contrato não encontrado.</p>
            )}
          </Card>
        </div>

        <div className="col-lg-6">
          <Card title="Nota Fiscal (RF13, RN05)" icon={<Receipt size={16} />} className="h-100">
            {notaFiscal ? (
              <div>
                <div className="detail-grid">
                  <div>
                    <div className="detail-label">Número</div>
                    <div className="detail-value tabular">{notaFiscal.numero}</div>
                  </div>
                  <div>
                    <div className="detail-label">Série</div>
                    <div className="detail-value tabular">{notaFiscal.serie}</div>
                  </div>
                  <div>
                    <div className="detail-label">Emissão</div>
                    <div className="detail-value tabular">{formatarData(notaFiscal.dataEmissao)}</div>
                  </div>
                  <div>
                    <div className="detail-label">Valor</div>
                    <div className="detail-value tabular">{formatarMoeda(notaFiscal.valor)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-muted">
                  {locacao.status === "FINALIZADA"
                    ? "Locação finalizada. A nota fiscal ainda não foi emitida."
                    : "A nota fiscal só pode ser emitida após a locação ser FINALIZADA (RN05)."}
                </p>
                <Button
                  label="Emitir Nota Fiscal"
                  variant="success"
                  icon={<Receipt size={16} />}
                  disabled={locacao.status !== "FINALIZADA"}
                  onClick={handleEmitirNotaFiscal}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card title="Vistorias de Retirada e Devolução (RF10, RF11)" icon={<ClipboardCheck size={16} />} className="mt-4">
        {vistorias.length === 0 ? (
          <p className="text-muted mb-0">Nenhuma vistoria registrada.</p>
        ) : (
          <div className="row g-3">
            {vistorias.map((v) => (
              <div className="col-md-6" key={v.id}>
                <div className="info-panel h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <DomainStatusBadge status={v.tipo} />
                    <small className="text-muted tabular">{formatarData(v.data)}</small>
                  </div>
                  <div className="d-flex gap-4 mb-3">
                    <div>
                      <div className="detail-label">KM</div>
                      <div className="detail-value tabular">{formatarKm(v.km)}</div>
                    </div>
                    <div>
                      <div className="detail-label">Combustível</div>
                      <div className="detail-value">{v.nivelCombustivel}</div>
                    </div>
                  </div>
                  <div className="detail-label">Observações / Ocorrências</div>
                  <p className="mb-0 small">{v.observacoes || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Pagamentos (RF12)" subtitle="Registre pagamentos parciais ou totais" icon={<Wallet size={16} />}>
        <form onSubmit={handleAdicionarPagamento} className="row g-3 align-items-end mb-2">
          <div className="col-md-6 col-xl-3">
            <Input
              label="Data/Hora"
              name="data"
              type="datetime-local"
              value={novoPag.data}
              onChange={(e) => setNovoPag({ ...novoPag, data: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6 col-xl-2">
            <Input
              label="Valor (R$)"
              name="valor"
              type="number"
              step="0.01"
              min="0.01"
              value={novoPag.valor}
              onChange={(e) => setNovoPag({ ...novoPag, valor: Number(e.target.value) })}
              required
            />
          </div>
          <div className="col-md-6 col-xl-3">
            <Select
              label="Forma"
              name="forma"
              value={novoPag.forma}
              options={[
                { value: "PIX", label: "PIX" },
                { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
                { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
                { value: "DINHEIRO", label: "Dinheiro" },
                { value: "BOLETO", label: "Boleto" },
              ]}
              onChange={(e) => setNovoPag({ ...novoPag, forma: e.target.value as FormaPagamento })}
            />
          </div>
          <div className="col-md-6 col-xl-2">
            <Select
              label="Status"
              name="status"
              value={novoPag.status}
              options={[
                { value: "PAGO", label: "Pago" },
                { value: "PENDENTE", label: "Pendente" },
                { value: "ESTORNADO", label: "Estornado" },
              ]}
              onChange={(e) =>
                setNovoPag({ ...novoPag, status: e.target.value as StatusPagamento })
              }
            />
          </div>
          <div className="col-xl-2 mb-3 d-grid">
            <Button type="submit" label="Adicionar" icon={<Plus size={16} />} variant="primary" />
          </div>
        </form>

        {pagamentos.length === 0 ? (
          <p className="text-muted mb-0">Nenhum pagamento lançado.</p>
        ) : (
          <ul className="list-unstyled mb-0 border-top">
            {pagamentos.map((p) => (
              <li key={p.id} className="list-row">
                <div className="d-flex align-items-center gap-3">
                  <span className="stat-card-icon tone-neutral" aria-hidden="true">
                    <Wallet size={16} />
                  </span>
                  <div>
                    <div className="fw-semibold">{formatarFormaPagamento(p.forma)}</div>
                    <div className="small text-muted tabular">{formatarData(p.data)}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <DomainStatusBadge status={p.status} />
                  <span className="fw-semibold tabular text-nowrap">{formatarMoeda(p.valor)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
