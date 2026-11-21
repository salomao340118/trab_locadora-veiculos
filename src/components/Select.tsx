import type { ChangeEvent } from "react";

// Componente reutilizável recebe uma lista de opções e tipa o evento do select.
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Select({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Selecione...",
  error,
  disabled = false,
  required = false,
}: SelectProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-erro` : undefined}
        className={`form-select ${error ? "is-invalid" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div id={`${name}-erro`} className="invalid-feedback">{error}</div>}
    </div>
  );
}