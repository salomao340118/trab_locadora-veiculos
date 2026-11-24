import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { locacaoService } from "../../service/locacaoService";
import { veiculoService } from "../../service/veiculoService";
import { agoraLocal, type Locacao } from "../../models/Locacao";
import type { Veiculo } from "../../models/Veiculo";
import type { NivelCombustivel } from "../../models/Vistoria";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { CarFront, CheckCircle2, ClipboardCheck } from "lucide-react";
import { formatarData, formatarKm } from "../../utils/format";

const niveisCombustivel: NivelCombustivel[] = ["VAZIO", "1/4", "1/2", "3/4", "CHEIO"];

export function DevolucaoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [locacao, setLocacao] = useState<Locacao | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  // Sugere a data e a hora de agora como devolução real (o usuário pode alterar).
  const [dataDevolucaoReal, setDataDevolucaoReal] = useState(() => agoraLocal());
  const [kmDevolucao, setKmDevolucao] = useState<number>(0);
  const [nivelCombustivelDevolucao, setNivelCombustivelDevolucao] =
    useState<NivelCombustivel>("CHEIO");
  const [observacoesDevolucao, setObservacoesDevolucao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    locacaoService
      .buscarPorId(id)
      .then(async (l) => {
        setLocacao(l);
        setKmDevolucao(l.kmRetirada);
        const v = await veiculoService.buscarPorId(l.veiculoId);
        setVeiculo(v);
      })
      .catch(() => setErro("Não foi possível carregar os dados da locação."));
  }, [id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;
    setErro("");
    setSalvando(true);
    try {
      await locacaoService.finalizarLocacao(id, {
        dataDevolucaoReal,
        kmDevolucao,
        nivelCombustivelDevolucao,
        observacoesDevolucao,
      });
      navigate(`/locacoes/${id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao finalizar locação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={`Devolução e Vistoria — Locação #${id ?? ""}`}
        subtitle="Registra vistoria de devolução, ocorrências/inconsistências, recalcula valor e atualiza KM do veículo (RF11, RN04)"
        backTo={id ? `/locacoes/${id}` : "/locacoes"}
        backLabel="Voltar para a locação"
      />

      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      {locacao && (
        <Card title="Dados da retirada" icon={<CarFront size={16} />}>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Veículo</div>
              <div className="detail-value tabular">{veiculo?.placa ?? locacao.veiculoId}</div>
            </div>
            <div>
              <div className="detail-label">Retirada</div>
              <div className="detail-value tabular">{formatarData(locacao.dataRetirada)}</div>
            </div>
            <div>
              <div className="detail-label">Devolução prevista</div>
              <div className="detail-value tabular">{formatarData(locacao.dataDevolucaoPrevista)}</div>
            </div>
            <div>
              <div className="detail-label">KM Retirada</div>
              <div className="detail-value tabular">{formatarKm(locacao.kmRetirada)}</div>
            </div>
          </div>
        </Card>
      )}

      <Card
        title="Vistoria de devolução"
        subtitle="Informe a quilometragem, o combustível e as ocorrências encontradas"
        icon={<ClipboardCheck size={16} />}
        className="form-card"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-4">
              <Input
                label="Data e Hora de Devolução Real"
                name="dataDevolucaoReal"
                type="datetime-local"
                value={dataDevolucaoReal}
                onChange={(e) => setDataDevolucaoReal(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <Input
                label="KM de Devolução"
                name="kmDevolucao"
                type="number"
                min={locacao?.kmRetirada ?? 0}
                value={kmDevolucao}
                onChange={(e) => setKmDevolucao(Number(e.target.value))}
                required
              />
            </div>
            <div className="col-md-4">
              <Select
                label="Nível de Combustível"
                name="nivelCombustivelDevolucao"
                value={nivelCombustivelDevolucao}
                options={niveisCombustivel.map((n) => ({ value: n, label: n }))}
                onChange={(e) =>
                  setNivelCombustivelDevolucao(e.target.value as NivelCombustivel)
                }
              />
            </div>
          </div>

          {locacao && kmDevolucao >= locacao.kmRetirada && (
            <p className="small text-muted mt-n2 mb-3">
              Percorridos nesta locação:{" "}
              <strong className="tabular">{formatarKm(kmDevolucao - locacao.kmRetirada)}</strong>
            </p>
          )}

          <TextArea
            label="Observações / Ocorrências / Inconsistências Encontradas"
            name="observacoesDevolucao"
            rows={4}
            value={observacoesDevolucao}
            onChange={(e) => setObservacoesDevolucao(e.target.value)}
            placeholder="Ex.: Sem avarias; ou Inconsistência: risco no para-choque, falta de combustível, etc."
          />

          <div className="form-actions">
            <Button label="Cancelar" variant="secondary" onClick={() => navigate("/locacoes")} />
            <Button
              type="submit"
              variant="success"
              icon={<CheckCircle2 size={16} />}
              label={salvando ? "Finalizando..." : "Finalizar Locação"}
              disabled={salvando}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
// Página responsável pela vistoria final e pela mudança do status para FINALIZADA.
