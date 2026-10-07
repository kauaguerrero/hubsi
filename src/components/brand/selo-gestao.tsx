import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { getGestaoAtiva } from "@/server/queries/gestoes";

type Props = {
  /** "md" no cabeçalho; "lg" no rodapé e no menu mobile. */
  tamanho?: "md" | "lg";
  className?: string;
};

/**
 * Selo da chapa em exercício. O logo aparece na proporção original (pode ser horizontal)
 * e bem visível. Sem gestão ativa, não renderiza nada.
 */
export async function SeloGestao({ tamanho = "md", className }: Props) {
  const gestao = await getGestaoAtiva();
  if (!gestao) return null;

  const grande = tamanho === "lg";

  return (
    <span
      className={cn(
        "border-border bg-surface inline-flex items-center rounded-2xl border shadow-sm",
        grande ? "gap-4 px-4 py-2.5" : "gap-3 px-3 py-1",
        className,
      )}
      title={`Gestão ${gestao.nome} ${gestao.ano}`}
    >
      {gestao.logo_url ? (
        <Image
          src={gestao.logo_url}
          alt={`Logo da gestão ${gestao.nome}`}
          width={320}
          height={128}
          className={cn(
            "w-auto shrink-0 object-contain",
            grande ? "h-20 max-w-60" : "h-16 max-w-44",
          )}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "bg-brand font-display text-on-accent flex shrink-0 items-center justify-center rounded-full font-extrabold",
            grande ? "size-16 text-2xl" : "size-11 text-lg",
          )}
        >
          {gestao.nome.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="flex flex-col leading-tight">
        <span className="text-muted font-mono text-[0.7rem] tracking-wider uppercase">
          Gestão
        </span>
        <span
          className={cn(
            "font-display text-fg font-bold",
            grande ? "text-xl" : "text-base",
          )}
        >
          {gestao.ano}
        </span>
      </span>
    </span>
  );
}
