export type ButtonNodeProps = {
  label: string
  on_click: string
  onEvent: (eventId: string) => void
}

export function ButtonNodeComponent({ label, on_click, onEvent }: ButtonNodeProps) {
  return (
    <button className="am-button" onClick={() => onEvent(on_click)}>
      {label}
    </button>
  )
}
