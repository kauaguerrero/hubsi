import Image from "next/image";
import { montarArvore, type NoArvore } from "@/lib/gestao/arvore";
import type { MembroOrg } from "@/lib/gestao/organograma";
import { cn } from "@/lib/utils/cn";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? "") +
    (partes.length > 1 ? (partes.at(-1)?.[0] ?? "") : "")
  ).toUpperCase();
}

function Avatar({ membro, grande }: { membro: MembroOrg; grande?: boolean }) {
  const tamanho = grande ? "size-20 text-2xl" : "size-14 text-lg";
  return membro.foto_url ? (
    <Image
      src={membro.foto_url}
      alt={`Foto de ${membro.nome}`}
      width={96}
      height={96}
      className={cn(
        "border-surface shrink-0 rounded-full border-2 object-cover shadow-sm",
        tamanho,
      )}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "bg-brand font-display text-on-accent flex shrink-0 items-center justify-center rounded-full font-bold",
        tamanho,
      )}
    >
      {iniciais(membro.nome)}
    </span>
  );
}

function CartaoMembro({
  membro,
  destaque,
}: {
  membro: MembroOrg;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-surface shadow-card hover:shadow-pop flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 sm:w-52",
        destaque
          ? "border-accent/40 ring-accent/10 px-6 py-6 ring-4 sm:w-64"
          : "border-border",
      )}
    >
      <Avatar membro={membro} grande={destaque} />
      <div>
        <p
          className={cn(
            "font-display font-bold",
            destaque ? "text-2xl" : "text-lg leading-tight",
          )}
        >
          {membro.nome}
        </p>
        <p
          className={cn(
            "mt-1.5 inline-block rounded-full px-3 py-0.5 font-mono text-xs font-medium",
            destaque ? "bg-brand text-on-accent" : "bg-accent/10 text-accent",
          )}
        >
          {membro.cargo}
        </p>
      </div>
    </div>
  );
}

function No({ no, nivel }: { no: NoArvore; nivel: number }) {
  return (
    <li>
      <CartaoMembro membro={no.membro} destaque={nivel === 0} />
      {no.filhos.length > 0 && (
        <ul>
          {no.filhos.map((f) => (
            <No key={f.membro.id} no={f} nivel={nivel + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Organograma em árvore livre: a hierarquia vem do "superior" de cada membro. */
export function Organograma({
  membros,
  className,
}: {
  membros: MembroOrg[];
  className?: string;
}) {
  const raizes = montarArvore(membros);
  if (raizes.length === 0) return null;

  return (
    <div
      className={cn("org-tree w-full sm:overflow-x-auto sm:pb-2", className)}
      role="group"
      aria-label="Organograma da gestão"
    >
      <ul>
        {raizes.map((r) => (
          <No key={r.membro.id} no={r} nivel={0} />
        ))}
      </ul>
    </div>
  );
}
