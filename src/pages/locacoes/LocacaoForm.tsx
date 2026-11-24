import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { locacaoService } from "../../service/locacaoService";
import { clienteService } from "../../service/clienteService";
import { veiculoService } from "../../service/veiculoService";
import { modeloService } from "../../service/modeloService";
import { categoriaService } from "../../service/categoriaService";
import { isCnhVencida, type Cliente } from "../../models/Cliente";
import type { Veiculo } from "../../models/Veiculo";
import type { Modelo } from "../../models/Modelo";
import type { Categoria } from "../../models/Categoria";
import { agoraLocal, calcularDiarias, calcularValorLocacao } from "../../models/Locacao";
import type { NivelCombustivel } from "../../models/Vistoria";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { CheckCircle2, ClipboardCheck, KeyRound, Receipt } from "lucide-react";
import { formatarMoeda } from "../../utils/format";

const niveisCombustivel: NivelCombustivel[] = ["VAZIO", "1/4", "1/2", "3/4", "CHEIO"];

export function LocacaoForm() {
  const navigate = useNavigate();
  // useState mantém os dados digitados e as opções exibidas na tela.
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState<Veiculo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  // Datas sugeridas: retirada agora e devolução amanhã no mesmo horário (o usuário pode alterar).
  const [dataRetirada, setDataRetirada] = useState(() => agoraLocal());
  const [dataDevolucaoPrevista, setDataDevolucaoPrevista] = useState(() => agoraLocal(1));
  const [nivelCombustivelRetirada, setNivelCombustivelRetirada] =
    useState<NivelCombustivel>("CHEIO");
  const [observacoesRetirada, setObservacoesRetirada] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        // Promise.all executa os carregamentos em paralelo para reduzir o tempo de espera.
        const [cList, vList, mList, catList] = await Promise.all([
          clienteService.listar(),
          // RF07 e RN01: só veículos disponíveis (sem locação aberta e fora de manutenção)
          veiculoService.listarDisponiveis(),
          modeloService.listar(),
          categoriaService.listar(),
        ]);
        setClientes(cList);
        setModelos(mList);
        setCategorias(catList);
        setVeiculosDisponiveis(vList);
      } catch {
        setErro("Não foi possível carregar dados para nova locação.");
      }
    }
    carregarDados();
  }, []);

  const veiculoSelecionado = veiculosDisponiveis.find((v) => v.id === veiculoId);
  const modeloSelecionado = modelos.find((m) => m.id === veiculoSelecionado?.modeloId);
  const categoriaSelecionada = categorias.find((c) => c.id === modeloSelecionado?.categoriaId);
  const valorDiaria = categoriaSelecionada ? Number(categoriaSelecionada.valorLocacao) : 0;
  // O valor previsto é recalculado sempre que as datas ou o veículo mudam.
  const valorPrevisto = calcularValorLocacao(dataRetirada, dataDevolucaoPrevista, valorDiaria);
  const diarias = calcularDiarias(dataRetirada, dataDevolucaoPrevista);
  const clienteSelecionado = clientes.find((c) => c.id === clienteId);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!clienteId) {
      setErro("Selecione um cliente.");
      return;
    }
    if (!veiculoId) {
      setErro("Selecione um veículo disponível.");
      return;
    }

    setSalvando(true);
    try {
      const criada = await locacaoService.registrarLocacaoCompleta({
        clienteId,
        veiculoId,
        dataRetirada,
        dataDevolucaoPrevista,
        nivelCombustivelRetirada,
        observacoesRetirada,
      });
      navigate(`/locacoes/${criada.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao registrar locação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Nova Locação"
        subtitle="Gera automaticamente contrato (RF09) e vistoria de retirada (RF10), validando CNH e disponibilidade"
        backTo="/locacoes"
      />

      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          <div className="col-lg-8">
            <Card title="Cliente e veículo" subtitle="Somente veículos disponíveis são listados (RF07, RN01)" icon={<KeyRound size={16} />}>
              <Select
                label="Cliente"
                name="clienteId"
                value={clienteId}
                options={clientes.map((c) => {
                  const vencida = isCnhVencida(c.validadeCnh);
                  return {
                    value: c.id ?? "",
                    label: `${c.nome} — CPF: ${c.cpf}${vencida ? " [CNH VENCIDA]" : ""}`,
                  };
                })}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setClienteId(e.target.value)}
                required
              />
              {clienteSelecionado && isCnhVencida(clienteSelecionado.validadeCnh) && (
                <Alert
                  type="warning"
                  message="A CNH deste cliente está vencida. A locação será recusada ao confirmar (RN03)."
                />
              )}

              <Select
                label="Veículo Disponível"
                name="veiculoId"
                value={veiculoId}
                options={veiculosDisponiveis.map((v) => {
                  const mod = modelos.find((m) => m.id === v.modeloId);
                  const cat = categorias.find((c) => c.id === mod?.categoriaId);
                  return {
                    value: v.id ?? "",
                    label: `${v.placa} — ${mod?.nome ?? ""} (${cat?.nome ?? "Sem categoria"}: R$ ${(
                      cat?.valorLocacao ?? 0
                    ).toFixed(2)}/dia, ${v.kmRodado} km)`,
                  };
                })}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setVeiculoId(e.target.value)}
                required
              />

              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="Data e Hora de Retirada"
                    name="dataRetirada"
                    type="datetime-local"
                    value={dataRetirada}
                    onChange={(e) => setDataRetirada(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Data e Hora de Devolução Prevista"
                    name="dataDevolucaoPrevista"
                    type="datetime-local"
                    value={dataDevolucaoPrevista}
                    onChange={(e) => setDataDevolucaoPrevista(e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            <Card
              title="Vistoria de Retirada (RF10)"
              subtitle="Registre o estado do veículo no momento da entrega"
              icon={<ClipboardCheck size={16} />}
            >
              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="KM de Retirada"
                    name="kmRetirada"
                    type="number"
                    value={veiculoSelecionado ? veiculoSelecionado.kmRodado : 0}
                    onChange={() => {}}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <Select
                    label="Nível de Combustível"
                    name="nivelCombustivelRetirada"
                    value={nivelCombustivelRetirada}
                    options={niveisCombustivel.map((n) => ({ value: n, label: n }))}
                    onChange={(e) =>
                      setNivelCombustivelRetirada(e.target.value as NivelCombustivel)
                    }
                  />
                </div>
              </div>

              <TextArea
                label="Observações / Estado Inicial do Veículo"
                name="observacoesRetirada"
                value={observacoesRetirada}
                onChange={(e) => setObservacoesRetirada(e.target.value)}
                placeholder="Registre estado da lataria, pneus, acessórios, etc."
              />
            </Card>
          </div>

          <div className="col-lg-4">
            <div className="sticky-lg-top" style={{ top: "5rem" }}>
              <Card title="Resumo da locação" icon={<Receipt size={16} />}>
                <dl className="d-flex flex-column gap-3 mb-4">
                  <div>
                    <dt className="detail-label">Cliente</dt>
                    <dd className="detail-value mb-0">{clienteSelecionado?.nome ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="detail-label">Veículo</dt>
                    <dd className="detail-value mb-0">
                      {veiculoSelecionado
                        ? `${modeloSelecionado?.nome ?? ""} • ${veiculoSelecionado.placa}`
                        : "—"}
                    </dd>
                  </div>
                  <div className="d-flex gap-4">
                    <div>
                      <dt className="detail-label">Categoria</dt>
                      <dd className="detail-value mb-0">{categoriaSelecionada?.nome ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="detail-label">Diária</dt>
                      <dd className="detail-value mb-0 tabular">{formatarMoeda(valorDiaria)}</dd>
                    </div>
                    <div>
                      <dt className="detail-label">Diárias</dt>
                      <dd className="detail-value mb-0 tabular">{diarias}</dd>
                    </div>
                  </div>
                </dl>

                <div className="price-highlight mb-4">
                  <span className="small fw-semibold">Valor Previsto (RF08)</span>
                  <span className="price-highlight-value">{formatarMoeda(valorPrevisto)}</span>
                </div>

                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    icon={<CheckCircle2 size={16} />}
                    label={salvando ? "Registrando..." : "Confirmar Locação"}
                    disabled={salvando}
                  />
                  <Button label="Cancelar" variant="secondary" onClick={() => navigate("/locacoes")} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
