import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { modeloService } from "../../service/modeloService";
import { marcaService } from "../../service/marcaService";
import { categoriaService } from "../../service/categoriaService";
import { modeloInicial, type Modelo } from "../../models/Modelo";
import type { Marca } from "../../models/Marca";
import type { Categoria } from "../../models/Categoria";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { Layers, Save } from "lucide-react";

export function ModeloForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Modelo>(modeloInicial);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erros, setErros] = useState<Partial<Record<keyof Modelo, string>>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([marcaService.listar(), categoriaService.listar()])
      .then(([mList, cList]) => {
        setMarcas(mList);
        setCategorias(cList);
      })
      .catch(() => setErroGeral("Não foi possível carregar marcas e categorias."));

    if (id) {
      modeloService
        .buscarPorId(id)
        .then((dados) => setForm(dados))
        .catch(() => setErroGeral("Não foi possível carregar o modelo."));
    }
  }, [id]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "ano" ? Number(value) : value,
    });
    setErros({ ...erros, [name]: undefined });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const novosErros: Partial<Record<keyof Modelo, string>> = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome do modelo.";
    if (!form.ano || form.ano < 1950 || form.ano > 2030) {
      novosErros.ano = "Informe um ano válido.";
    }
    if (!form.marcaId) novosErros.marcaId = "Selecione uma marca.";
    if (!form.categoriaId) novosErros.categoriaId = "Selecione uma categoria.";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      if (id) {
        await modeloService.atualizar(id, form);
      } else {
        await modeloService.criar(form);
      }
      navigate("/modelos");
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Erro ao salvar modelo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={id ? "Editar Modelo" : "Novo Modelo"}
        subtitle="Vincule o modelo a uma marca e a uma categoria de preço."
        backTo="/modelos"
      />
      <Card title="Dados do modelo" subtitle="Campos marcados com * são obrigatórios" className="form-card" icon={<Layers size={16} />}>
      {erroGeral && <Alert type="danger" message={erroGeral} onClose={() => setErroGeral("")} />}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-md-8">
            <Input
              label="Nome do Modelo"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex.: Onix, Civic, X5"
              error={erros.nome}
              required
            />
          </div>
          <div className="col-md-4">
            <Input
              label="Ano"
              name="ano"
              type="number"
              value={form.ano}
              onChange={handleChange}
              error={erros.ano}
              required
            />
          </div>
          <div className="col-md-6">
            <Select
              label="Marca"
              name="marcaId"
              value={form.marcaId}
              options={marcas.map((m) => ({ value: m.id ?? "", label: m.nome }))}
              onChange={handleChange}
              error={erros.marcaId}
              required
            />
          </div>
          <div className="col-md-6">
            <Select
              label="Categoria"
              name="categoriaId"
              value={form.categoriaId}
              options={categorias.map((c) => ({
                value: c.id ?? "",
                label: `${c.nome} (R$ ${c.valorLocacao.toFixed(2)}/dia)`,
              }))}
              onChange={handleChange}
              error={erros.categoriaId}
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <Button label="Cancelar" variant="secondary" onClick={() => navigate("/modelos")} />
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
