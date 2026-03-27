export type CardNodeProps = {
  title?: string
  layout?: 'column' | 'row'
  children: React.ReactNode
}

export function CardNodeComponent({ title, layout = 'column', children }: CardNodeProps) {
  return (
    <div className={`am-card am-layout-${layout}`}>
      {title && <h3 className="am-card-title">{title}</h3>}
      <div className="am-card-content">{children}</div>
    </div>
  )
}
