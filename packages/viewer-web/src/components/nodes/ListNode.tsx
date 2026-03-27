export type ListNodeProps = {
  source: unknown[]
  on_item_click?: string
  onEvent?: (eventId: string, payload?: Record<string, unknown>) => void
}

export function ListNodeComponent({ source, on_item_click, onEvent }: ListNodeProps) {
  return (
    <ul className="am-list">
      {source.map((item, i) => (
        <li
          key={i}
          className={on_item_click ? 'am-list-item-clickable' : 'am-list-item'}
          onClick={
            on_item_click && onEvent ? () => onEvent(on_item_click, { index: i, item }) : undefined
          }
        >
          {String(item)}
        </li>
      ))}
    </ul>
  )
}
