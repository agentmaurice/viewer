export type TextNodeProps = {
  value: string
}

export function TextNodeComponent({ value }: TextNodeProps) {
  return <p className="am-text">{value}</p>
}
