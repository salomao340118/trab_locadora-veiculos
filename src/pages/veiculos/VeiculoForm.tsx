import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { veiculoService } from "../../service/veiculoService";
import { modeloService } from "../../service/modeloService";
import { veiculoInicial, type Veiculo } from "../../models/Veiculo";
import type { Modelo } from "../../models/Modelo";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { CarFront, Save } from "lucide-react";

export function VeiculoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Veiculo>(veiculoInicial);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [erros, setErros] = useState<Partial<Record<keyof Veiculo, string>>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    modeloService
      .listar()
      .then(setModelos)
      .catch(() => setErroGeral("Não foi possível carregar os modelos."));

    if (id) {
      veiculoService
        .buscarPorId(id)
        .then(setForm)
        .catch(() => setErroGeral("Não foi possível carregar o veículo."));
    }
  }, [id]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const numericos = ["anoFabricacao", "kmRodado"];
    setForm({
      ...form,
      [name]: numericos.includes(name) ? Number(value) : value,
    });
    setErros({ ...erros, [name]: undefined });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const novosErros: Partial<Record<keyof Veiculo, string>> = {};
    if (!form.placa.trim()) novosErros.placa = "Informe a placa.";
    if (!form.chassi.trim()) novosErros.chassi = "Informe o chassi.";
    if (!form.cor.trim()) novosErros.cor = "Informe a cor.";
    if (!form.modeloId) novosErros.modeloId = "Selecione um modelo.";
    if (Number(form.kmRodado) < 0) novosErros.kmRodado = "KM não pode ser negativo.";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      if (id) {
        await veiculoService.atualizar(id, form);
      } else {
        await veiculoService.criar(form);
      }
      navigate("/veiculos");
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Erro ao salvar veículo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={id ? "Editar Veículo" : "Novo Veículo"}
        subtitle="Registre os dados de identificação e quilometragem do veículo."
        backTo="/veiculos"
      />
      <Card title="Dados do veículo" subtitle="Campos marcados com * são obrigatórios" className="form-card" icon={<CarFront size={16} />}>
      {erroGeral && <Alert type="danger" message={erroGeral} onClose={() => setErroGeral("")} />}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <h3 className="form-section-title">Identificação</h3>
          <p className="form-section-desc">Modelo, placa e chassi do veículo. Placa e chassi devem ser únicos.</p>
        <Select
          label="Modelo"
          name="modeloId"
          value={form.modeloId}
          options={modelos.map((m) => ({ value: m.id ?? "", label: `${m.nome} (${m.ano})` }))}
          onChange={handleChange}
          error={erros.modeloId}
          required
        />
        <div className="row">
          <div className="col-md-6">
            <Input
              label="Placa"
              name="placa"
              value={form.placa}
              onChange={handleChange}
              placeholder="Ex.: ABC1D23"
              error={erros.placa}
              required
            />
          </div>
          <div className="col-md-6">
            <Input
              label="Chassi"
              name="chassi"
              value={form.chassi}
              onChange={handleChange}
              placeholder="17 caracteres"
              error={erros.chassi}
              required
            />
          </div>
        </div>
        </div>
        <div className="form-section">
          <h3 className="form-section-title">Características e uso</h3>
          <p className="form-section-desc">Ano de fabricação, cor e quilometragem atual.</p>
        <div className="row">
          <div className="col-md-4">
            <Input
              label="Ano de Fabricação"
              name="anoFabricacao"
              type="number"
              value={form.anoFabricacao}
              onChange={handleChange}
              error={erros.anoFabricacao}
              required
            />
          </div>
          <div className="col-md-4">
            <Input
              label="Cor"
              name="cor"
              value={form.cor}
              onChange={handleChange}
              error={erros.cor}
              required
            />
          </div>
          <div className="col-md-4">
            <Input
              label="KM Rodado"
              name="kmRodado"
              type="number"
              min="0"
              value={form.kmRodado}
              onChange={handleChange}
              error={erros.kmRodado}
              required
            />
          </div>
        </div>
        </div>
        <div className="form-actions">
          <Button label="Cancelar" variant="secondary" onClick={() => navigate("/veiculos")} />
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
