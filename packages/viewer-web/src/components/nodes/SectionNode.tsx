export type SectionNodeProps = {
  title?: string
  layout?: 'column' | 'row'
  children: React.ReactNode
}

export function SectionNodeComponent({ title, layout = 'column', children }: SectionNodeProps) {
  return (
    <div className={`am-section am-layout-${layout}`}>
      {title && <h3 className="am-section-title">{title}</h3>}
      <div className="am-section-content">{children}</div>
    </div>
  )
}
