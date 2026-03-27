export type TableNodeProps = {
  columns: string[]
  rows: Array<string[] | Record<string, unknown>>
}

export function TableNodeComponent({ columns, rows }: TableNodeProps) {
  return (
    <table className="am-table">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {Array.isArray(row)
              ? row.map((cell, ci) => (
                  <td key={ci}>{String(cell)}</td>
                ))
              : columns.map((col, ci) => (
                  <td key={ci}>{String(row[col] ?? '')}</td>
                ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
