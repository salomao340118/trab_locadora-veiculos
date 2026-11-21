import type { ChangeEvent } from "react";

// Wrapper Bootstrap para entradas de texto com várias linhas.
export interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 3,
  placeholder,
  error,
  disabled = false,
  required = false,
}: TextAreaProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-erro` : undefined}
        className={`form-control ${error ? "is-invalid" : ""}`}
      />
      {error && <div id={`${name}-erro`} className="invalid-feedback">{error}</div>}
    </div>
  );
}
