export type StatNodeProps = {
  label: string
  value: string | number
}

export function StatNodeComponent({ label, value }: StatNodeProps) {
  return (
    <div className="am-stat">
      <span className="am-stat-label">{label}</span>
      <span className="am-stat-value">{String(value)}</span>
    </div>
  )
}
