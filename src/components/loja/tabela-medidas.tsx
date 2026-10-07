// Medidas de referência (cm). Confirmar com a gráfica antes de divulgar (ver PROGRESS.md).
const MEDIDAS = [
  { tamanho: "P", largura: 50, comprimento: 70 },
  { tamanho: "M", largura: 53, comprimento: 72 },
  { tamanho: "G", largura: 56, comprimento: 74 },
  { tamanho: "GG", largura: 59, comprimento: 76 },
];

export function TabelaMedidas() {
  return (
    <details className="rounded-xl border border-border bg-surface px-4 py-3">
      <summary className="min-h-11 cursor-pointer py-2 font-display text-xl font-bold">Tabela de medidas</summary>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-sm">
          <caption className="pb-2 text-left text-muted">Medidas aproximadas, em centímetros.</caption>
          <thead>
            <tr className="border-b border-border text-muted">
              <th scope="col" className="py-2 pr-4">Tamanho</th>
              <th scope="col" className="py-2 pr-4">Largura</th>
              <th scope="col" className="py-2">Comprimento</th>
            </tr>
          </thead>
          <tbody>
            {MEDIDAS.map((m) => (
              <tr key={m.tamanho} className="border-b border-border/50">
                <th scope="row" className="py-2 pr-4">{m.tamanho}</th>
                <td className="py-2 pr-4">{m.largura}</td>
                <td className="py-2">{m.comprimento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
