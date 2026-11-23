import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clienteService } from "../../service/clienteService";
import { isCnhVencida, type Cliente } from "../../models/Cliente";
import { Table, type TableColumn } from "../../components/Table";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { Modal } from "../../components/Modal";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Plus, Users } from "lucide-react";
import { formatarData } from "../../utils/format";

export function ClienteList() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [clienteExcluir, setClienteExcluir] = useState<Cliente | null>(null);

  async function carregar() {
    try {
      setClientes(await clienteService.listar());
    } catch {
      setErro("Não foi possível carregar os clientes.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!clienteExcluir?.id) return;
    try {
      await clienteService.excluir(clienteExcluir.id);
      setSucesso(`Cliente "${clienteExcluir.nome}" excluído.`);
      setErro("");
      setClienteExcluir(null);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir cliente.");
      setClienteExcluir(null);
    }
  }

  const colunas: TableColumn<Cliente>[] = [
    {
      header: "Cliente",
      accessor: (c) => (
        <div>
          <div className="fw-semibold">{c.nome}</div>
          <div className="small text-muted">{c.email}</div>
        </div>
      ),
    },
    { header: "CPF", accessor: (c) => <span className="tabular text-nowrap">{c.cpf}</span> },
    { header: "CNH", accessor: (c) => <span className="tabular">{c.cnh}</span> },
    {
      header: "Validade CNH",
      accessor: (c) => {
        const vencida = isCnhVencida(c.validadeCnh);
        return (
          <span className="d-inline-flex align-items-center gap-2 text-nowrap">
            <span className="tabular">{formatarData(c.validadeCnh)}</span>
            {vencida ? (
              <StatusBadge tone="danger">Vencida</StatusBadge>
            ) : (
              <StatusBadge tone="success">Válida</StatusBadge>
            )}
          </span>
        );
      },
    },
    { header: "Telefone", accessor: (c) => <span className="tabular text-nowrap">{c.telefone}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Cadastro de clientes e validação de CNH (RF06, RN03)"
        actions={<Button label="Novo Cliente" icon={<Plus size={16} />} onClick={() => navigate("/clientes/novo")} />}
      />

      {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso("")} />}
      {erro && <Alert type="danger" message={erro} onClose={() => setErro("")} />}

      <Card title="Base de clientes" subtitle={`${clientes.length} cliente(s) cadastrado(s)`} icon={<Users size={16} />} flush>
        <Table
          columns={colunas}
          data={clientes}
          onEdit={(c) => navigate(`/clientes/editar/${c.id}`)}
          onDelete={(c) => setClienteExcluir(c)}
          emptyMessage="Nenhum cliente cadastrado."
        />
      </Card>

      <Modal
        show={Boolean(clienteExcluir)}
        title="Confirmar Exclusão"
        onClose={() => setClienteExcluir(null)}
        onConfirm={confirmarExclusao}
      >
        Deseja excluir o cliente <strong>{clienteExcluir?.nome}</strong>?
      </Modal>
    </div>
  );
}