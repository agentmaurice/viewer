export type AppFieldOption = { value: string; label: string }
export type AppFieldDefinition = {
  name: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'combobox' | 'file' | 'file_upload' | 'date' | 'checkbox' | 'number' | 'boolean' | 'url' | string
  required?: boolean
  description?: string
  default?: unknown
  options?: AppFieldOption[]
  accept?: string
  max_size_mb?: number
  auto_fill?: string
  hidden_if_auto_filled?: boolean
}
export type AppFormDefinition = { id: string; title: string; fields: AppFieldDefinition[]; next?: string; actions_on_submit?: string[] }
