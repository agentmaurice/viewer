export type CalloutNodeProps = {
  title?: string
  value: string
  tone?: 'info' | 'success' | 'warning' | 'error'
}

export function CalloutNodeComponent({ title, value, tone = 'info' }: CalloutNodeProps) {
  return (
    <div className={`am-callout am-callout-${tone}`} role="alert">
      {title && <strong className="am-callout-title">{title}</strong>}
      <p className="am-callout-value">{value}</p>
    </div>
  )
}
