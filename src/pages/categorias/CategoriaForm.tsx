import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { categoriaService } from "../../service/categoriaService";
import { categoriaInicial, type Categoria } from "../../models/Categoria";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { FolderTree, Save } from "lucide-react";

export function CategoriaForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Categoria>(categoriaInicial);
  const [erros, setErros] = useState<{ nome?: string; valorLocacao?: string }>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    categoriaService
      .buscarPorId(id)
      .then((dados) => setForm(dados))
      .catch(() => setErroGeral("Não foi possível carregar a categoria."));
  }, [id]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "valorLocacao" ? Number(value) : value,
    });
    setErros({ ...erros, [name]: undefined });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const novosErros: { nome?: string; valorLocacao?: string } = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome da categoria (ex.: Básico, Luxo).";
    if (!form.valorLocacao || Number(form.valorLocacao) <= 0) {
      novosErros.valorLocacao = "O valor da diária deve ser maior que zero.";
    }
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      if (id) {
        await categoriaService.atualizar(id, form);
      } else {
        await categoriaService.criar(form);
      }
      navigate("/categorias");
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Erro ao salvar categoria.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={id ? "Editar Categoria" : "Nova Categoria"}
        subtitle="Defina o nome da categoria e o valor cobrado por diária."
        backTo="/categorias"
      />
      <Card title="Dados da categoria" subtitle="Campos marcados com * são obrigatórios" className="form-card" icon={<FolderTree size={16} />}>
      {erroGeral && <Alert type="danger" message={erroGeral} onClose={() => setErroGeral("")} />}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-md-7">
            <Input
              label="Nome da Categoria"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex.: Básico, Intermediário, Luxo"
              error={erros.nome}
              required
            />
          </div>
          <div className="col-md-5">
            <Input
              label="Valor da Diária (R$)"
              name="valorLocacao"
              type="number"
              step="0.01"
              min="0.01"
              value={form.valorLocacao}
              onChange={handleChange}
              error={erros.valorLocacao}
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <Button label="Cancelar" variant="secondary" onClick={() => navigate("/categorias")} />
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
