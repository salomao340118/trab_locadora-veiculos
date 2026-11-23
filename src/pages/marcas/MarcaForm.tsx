import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { marcaService } from "../../service/marcaService";
import { marcaInicial, type Marca } from "../../models/Marca";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { Tag, Save } from "lucide-react";

export function MarcaForm() {
  // Se existe id na URL, a página entra em modo de edição.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Marca>(marcaInicial);
  const [erroNome, setErroNome] = useState("");
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    marcaService
      .buscarPorId(id)
      .then((dados) => setForm(dados))
      .catch(() => setErroGeral("Não foi possível carregar a marca."));
  }, [id]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, nome: e.target.value });
    setErroNome("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.nome.trim()) {
      setErroNome("Informe o nome da marca.");
      return;
    }
    setSalvando(true);
    try {
      if (id) {
        await marcaService.atualizar(id, form);
      } else {
        await marcaService.criar(form);
      }
      navigate("/marcas");
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Erro ao salvar marca.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={id ? "Editar Marca" : "Nova Marca"}
        subtitle="Informe o nome do fabricante do veículo."
        backTo="/marcas"
      />
      <Card title="Dados da marca" subtitle="Campos marcados com * são obrigatórios" className="form-card" icon={<Tag size={16} />}>
      {erroGeral && <Alert type="danger" message={erroGeral} onClose={() => setErroGeral("")} />}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome da Marca"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Ex.: Volkswagen, Toyota, BMW"
          error={erroNome}
          required
        />
        <div className="form-actions">
          <Button label="Cancelar" variant="secondary" onClick={() => navigate("/marcas")} />
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
