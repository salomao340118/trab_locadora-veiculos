import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { manutencaoService } from "../../service/manutencaoService";
import { veiculoService } from "../../service/veiculoService";
import { manutencaoInicial, type Manutencao } from "../../models/Manutencao";
import type { Veiculo } from "../../models/Veiculo";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { Wrench, Save } from "lucide-react";

export function ManutencaoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Manutencao>(manutencaoInicial);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [erros, setErros] = useState<Partial<Record<keyof Manutencao, string>>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    veiculoService
      .listar()
      .then(setVeiculos)
      .catch(() => setErroGeral("Não foi possível carregar os veículos."));

    if (id) {
      manutencaoService
        .buscarPorId(id)
        .then(setForm)
        .catch(() => setErroGeral("Não foi possível carregar a manutenção."));
    }
  }, [id]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "valor" ? Number(value) : value,
    });
    setErros({ ...erros, [name]: undefined });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const novosErros: Partial<Record<keyof Manutencao, string>> = {};
    if (!form.veiculoId) novosErros.veiculoId = "Selecione um veículo.";
    if (!form.data) novosErros.data = "Informe a data.";
    if (!form.descricao.trim()) novosErros.descricao = "Descreva o serviço realizado.";
    if (Number(form.valor) < 0) novosErros.valor = "O valor não pode ser negativo.";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      if (id) {
        await manutencaoService.atualizar(id, form);
      } else {
        await manutencaoService.criar(form);
      }
      navigate("/manutencoes");
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Erro ao salvar manutenção.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={id ? "Editar Manutenção" : "Nova Manutenção"}
        subtitle="Registre o serviço realizado, a data e o custo."
        backTo="/manutencoes"
      />
      <Card title="Dados da manutenção" subtitle="Campos marcados com * são obrigatórios" className="form-card" icon={<Wrench size={16} />}>
      {erroGeral && <Alert type="danger" message={erroGeral} onClose={() => setErroGeral("")} />}
      <form onSubmit={handleSubmit} noValidate>
        <Select
          label="Veículo"
          name="veiculoId"
          value={form.veiculoId}
          options={veiculos.map((v) => ({
            value: v.id ?? "",
            label: `${v.placa} — ${v.cor} (${v.kmRodado} km)`,
          }))}
          onChange={handleChange}
          error={erros.veiculoId}
          required
        />
        <div className="row">
          <div className="col-md-6">
            <Input
              label="Data"
              name="data"
              type="date"
              value={form.data}
              onChange={handleChange}
              error={erros.data}
              required
            />
          </div>
          <div className="col-md-6">
            <Input
              label="Valor (R$)"
              name="valor"
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={handleChange}
              error={erros.valor}
              required
            />
          </div>
        </div>
        <TextArea
          label="Descrição / Ocorrências da Manutenção"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          placeholder="Ex.: Troca de óleo, revisão de freios ou correção de avaria"
          error={erros.descricao}
        />
        <div className="form-actions">
          <Button label="Cancelar" variant="secondary" onClick={() => navigate("/manutencoes")} />
          <Button
            type="submit"
            icon={<Save size={16} />}
            label={salvando ? "Salvando..." : "Salvar"}
            disabled={salvando}
          />
        </div>
      </form>
      </Card>
    </div>
  );
}
