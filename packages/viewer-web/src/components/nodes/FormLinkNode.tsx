export type FormLinkNodeProps = {
  label: string
  form_id: string
  submit_event?: string
  onOpenForm: (formId: string, submitEvent?: string) => void
}

export function FormLinkNodeComponent({
  label,
  form_id,
  submit_event,
  onOpenForm
}: FormLinkNodeProps) {
  return (
    <button className="am-form-link" onClick={() => onOpenForm(form_id, submit_event)}>
      {label}
    </button>
  )
}
