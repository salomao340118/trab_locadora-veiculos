import type { ChangeEvent } from "react";

// Componente reutilizável controla rótulo, valor e mensagem de erro dos inputs.
export interface InputProps {
  label: string;
  name: string;
  type?: "text" | "number" | "email" | "tel" | "date" | "datetime-local";
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  disabled?: boolean;
  required?: boolean;
}

export function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  min,
  max,
  step,
  disabled = false,
  required = false,
}: InputProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-erro` : undefined}
        className={`form-control ${error ? "is-invalid" : ""}`}
      />
      {error && <div id={`${name}-erro`} className="invalid-feedback">{error}</div>}
    </div>
  );
}