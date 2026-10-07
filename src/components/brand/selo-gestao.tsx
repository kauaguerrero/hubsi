import { getGestaoAtiva } from "@/server/queries/gestoes";

/** Selo da chapa em exercício. Sem gestão ativa, não renderiza nada. */
export async function SeloGestao() {
  const gestao = await getGestaoAtiva();
  if (!gestao) return null;

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted"
      title={`Gestão ${gestao.nome} ${gestao.ano}`}
    >
      {gestao.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={gestao.logo_url} alt="" width={16} height={16} className="size-4 rounded-full object-cover" />
      ) : (
        <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
      )}
      <span>
        Gestão {gestao.nome} {gestao.ano}
      </span>
    </span>
  );
}
