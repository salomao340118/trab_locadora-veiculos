import type { ReactNode } from "react";
import { Inbox, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "./Button";

// Descreve uma coluna: o valor pode ser uma propriedade ou uma função de apresentação.
export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

export interface TableProps<T extends { id?: string }> {
  columns: TableColumn<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  extraActions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

export function Table<T extends { id?: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  extraActions,
  emptyMessage = "Nenhum registro encontrado.",
}: TableProps<T>) {
  // O cabeçalho de ações só aparece quando alguma ação foi informada.
  const temAcoes = Boolean(onEdit || onDelete || extraActions);

  return (
    <div className="table-responsive">
      <table className="table app-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={col.className}>
                {col.header}
              </th>
            ))}
            {temAcoes && (
              <th scope="col" className="text-end">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (temAcoes ? 1 : 0)}>
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    <Inbox size={20} />
                  </span>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={item.id ?? rowIndex}>
                {columns.map((col, colIndex) => {
                  // Permite mostrar conteúdo simples ou transformar o item antes da exibição.
                  const conteudo: ReactNode =
                    typeof col.accessor === "function"
                      ? col.accessor(item)
                      : (item[col.accessor] as ReactNode);
                  return (
                    <td key={colIndex} className={col.className}>
                      {conteudo}
                    </td>
                  );
                })}
                {temAcoes && (
                  <td className="text-end">
                    <div className="d-inline-flex gap-1 flex-nowrap justify-content-end align-items-center">
                      {extraActions && extraActions(item)}
                      {onEdit && (
                        <IconButton label="Editar" icon={<Pencil size={16} />} onClick={() => onEdit(item)} />
                      )}
                      {onDelete && (
                        <IconButton
                          label="Excluir"
                          icon={<Trash2 size={16} />}
                          danger
                          onClick={() => onDelete(item)}
                        />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
