import React, { useState } from "react";
import type {
  AppFormDefinition,
  AppFieldDefinition,
  AppFieldOption,
} from "@agent-maurice/viewer-core";

export interface FormRendererProps {
  form: AppFormDefinition;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function FormRenderer({ form, onSubmit, onCancel }: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="am-form" onSubmit={handleSubmit}>
      {form.title && <h2 className="am-form-title">{form.title}</h2>}

      <div className="am-form-fields">
        {form.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        ))}
      </div>

      <div className="am-form-actions">
        <button type="submit" className="am-form-submit">
          Submit
        </button>
        {onCancel && (
          <button type="button" className="am-form-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

interface FormFieldProps {
  field: AppFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FormField({ field, value, onChange }: FormFieldProps) {
  const baseProps = {
    id: field.name,
    className: "am-form-field-input",
  };

  const containerClass = `am-form-field am-form-field-${field.type}`;

  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "url":
      case "number":
      case "date":
        return (
          <input
            {...baseProps}
            type={field.type}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <textarea
            {...baseProps}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            required={field.required}
          />
        );

      case "select":
        return (
          <select
            {...baseProps}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          >
            <option value="">Select an option</option>
            {Array.isArray(field.options) &&
              field.options.map((opt: AppFieldOption) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
          </select>
        );

      case "combobox":
        return (
          <input
            {...baseProps}
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            list={`${field.name}-datalist`}
            placeholder={field.description}
            required={field.required}
          />
        );

      case "checkbox":
      case "boolean":
        return (
          <input
            {...baseProps}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        );

      case "file":
      case "file_upload":
        return (
          <input
            {...baseProps}
            type="file"
            onChange={(e) => onChange(e.target.files?.[0])}
            accept={field.accept}
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={containerClass}>
      {field.type !== "checkbox" && field.type !== "boolean" && (
        <label htmlFor={field.name} className="am-form-field-label">
          {field.name}
          {field.required && <span className="am-required">*</span>}
        </label>
      )}

      {renderInput()}

      {field.description && field.type === "checkbox" && (
        <label
          htmlFor={field.name}
          className="am-form-field-label am-checkbox-label"
        >
          {field.name}
          {field.required && <span className="am-required">*</span>}
        </label>
      )}
    </div>
  );
}
