import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clienteService } from "../../service/clienteService";
import { clienteInicial, type Cliente } from "../../models/Cliente";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { UserRound, Save } from "lucide-react";

export function ClienteForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Cliente>(clienteInicial);
  const [erros, setErros] = useState<Partial<Record<keyof Cliente, string>>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    clienteService
      .buscarPorId(id)
      .then(setForm)
      .catch(() => setErroGeral("Não foi possível carregar o cliente."));
  }, [id]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErros({ ...erros, [name]: undefined });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const novosErros: Partial<Record<keyof Cliente, string>> = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome completo.";
    if (!form.cpf.trim()) novosErros.cpf = "Informe o CPF.";
    if (!form.cnh.trim()) novosErros.cnh = "Informe o número da CNH.";
    if (!form.validadeCnh) novosErros.validadeCnh = "Informe a validade da CNH.";
    if (!form.telefone.trim()) novosErros.telefone = "Informe o telefone.";
    if (!form.email.trim()) novosErros.email = "Informe o e-mail.";
    if (!form.endereco.trim()) novosErros.endereco = "Informe o endereço.";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setSalvando(true);
    try {
      if (id) {
        await clienteService.atualizar(id, form);
      } else {
        await clienteService.criar(form);
      }
      navigate("/clientes");
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Erro ao salvar cliente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={id ? "Editar Cliente" : "Novo Cliente"}
        subtitle="Dados pessoais, contato e habilitação do cliente."
        backTo="/clientes"
      />
      <Card title="Dados do cliente" subtitle="Campos marcados com * são obrigatórios" className="form-card" icon={<UserRound size={16} />}>
      {erroGeral && <Alert type="danger" message={erroGeral} onClose={() => setErroGeral("")} />}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <h3 className="form-section-title">Identificação e habilitação</h3>
          <p className="form-section-desc">A CNH precisa estar válida para que o cliente possa realizar locações.</p>
        <Input
          label="Nome Completo"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          error={erros.nome}
          required
        />
        <div className="row">
          <div className="col-md-4">
            <Input
              label="CPF"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              error={erros.cpf}
              required
            />
          </div>
          <div className="col-md-4">
            <Input
              label="CNH"
              name="cnh"
              value={form.cnh}
              onChange={handleChange}
              placeholder="00000000000"
              error={erros.cnh}
              required
            />
          </div>
          <div className="col-md-4">
            <Input
              label="Validade da CNH"
              name="validadeCnh"
              type="date"
              value={form.validadeCnh}
              onChange={handleChange}
              error={erros.validadeCnh}
              required
            />
          </div>
        </div>
        </div>
        <div className="form-section">
          <h3 className="form-section-title">Contato e endereço</h3>
          <p className="form-section-desc">Usados para comunicação e emissão de documentos.</p>
        <div className="row">
          <div className="col-md-6">
            <Input
              label="Telefone"
              name="telefone"
              type="tel"
              value={form.telefone}
              onChange={handleChange}
              error={erros.telefone}
              required
            />
          </div>
          <div className="col-md-6">
            <Input
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={erros.email}
              required
            />
          </div>
        </div>
        <Input
          label="Endereço"
          name="endereco"
          value={form.endereco}
          onChange={handleChange}
          error={erros.endereco}
          required
        />
        </div>
        <div className="form-actions">
          <Button label="Cancelar" variant="secondary" onClick={() => navigate("/clientes")} />
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
