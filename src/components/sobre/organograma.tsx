import Image from "next/image";
import type { ReactNode } from "react";
import { montarOrganograma, type MembroOrg } from "@/lib/gestao/organograma";
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
      alt={membro.nome}
      width={80}
      height={80}
      className={cn("shrink-0 rounded-full object-cover", tamanho)}
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
  nivel,
}: {
  membro: MembroOrg;
  destaque?: boolean;
  nivel?: "alto";
}) {
  return (
    <div
      className={cn(
        "bg-surface shadow-card hover:shadow-pop flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 hover:-translate-y-1",
        destaque ? "border-accent/40 ring-accent/10 ring-4" : "border-border",
        nivel === "alto" && "px-8 py-6",
      )}
    >
      <Avatar membro={membro} grande={destaque} />
      <div>
        <p
          className={cn(
            "font-display font-bold",
            destaque ? "text-3xl" : "text-xl",
          )}
        >
          {membro.nome}
        </p>
        <p
          className={cn(
            "mt-1 inline-block rounded-full px-3 py-0.5 font-mono text-xs font-medium",
            destaque ? "bg-brand text-on-accent" : "bg-accent/10 text-accent",
          )}
        >
          {membro.cargo}
        </p>
      </div>
    </div>
  );
}

/** Linha vertical de circuito (degradê) ligando um nível ao próximo. */
function Conector({ altura = "h-8" }: { altura?: string }) {
  return (
    <span aria-hidden="true" className="relative flex flex-col items-center">
      <span
        className={cn("from-accent-2 to-accent w-0.5 bg-gradient-to-b", altura)}
      />
      <span className="border-accent bg-surface -mt-1 size-2.5 rounded-full border-2" />
    </span>
  );
}

function Ramo({
  titulo,
  titular,
  vice,
}: {
  titulo: string;
  titular?: MembroOrg;
  vice?: MembroOrg;
}) {
  if (!titular && !vice) return null;
  return (
    <div className="flex flex-col items-center">
      <Conector />
      <p className="text-muted mt-2 mb-3 font-mono text-xs tracking-wider uppercase">
        {titulo}
      </p>
      <div className="flex w-full flex-col items-center">
        {titular && <CartaoMembro membro={titular} />}
        {titular && vice && <Conector altura="h-6" />}
        {vice && <CartaoMembro membro={vice} />}
      </div>
    </div>
  );
}

/** Organograma da gestão: presidente → vice → secretaria e tesouraria (titular → vice). */
export function Organograma({
  membros,
  rodape,
}: {
  membros: MembroOrg[];
  rodape?: ReactNode;
}) {
  const org = montarOrganograma(membros);
  const doisRamos =
    [org.secretaria, org.tesouraria].filter((r) => r.titular || r.vice)
      .length === 2;

  return (
    <figure
      className="flex flex-col items-center"
      aria-label="Organograma da gestão"
    >
      {org.presidente && (
        <CartaoMembro membro={org.presidente} destaque nivel="alto" />
      )}
      {org.presidente && org.vicePresidente && <Conector />}
      {org.vicePresidente && <CartaoMembro membro={org.vicePresidente} />}

      {(org.secretaria.titular ||
        org.secretaria.vice ||
        org.tesouraria.titular ||
        org.tesouraria.vice) && (
        <div
          className={cn(
            "relative mt-0 grid w-full max-w-3xl gap-x-8",
            doisRamos ? "sm:grid-cols-2" : "sm:grid-cols-1",
            // barra horizontal que "abre" os dois ramos (só em telas largas)
            doisRamos &&
              "sm:before:bg-accent/40 sm:before:absolute sm:before:top-0 sm:before:right-1/4 sm:before:left-1/4 sm:before:h-0.5",
          )}
        >
          <Ramo
            titulo="Secretaria"
            titular={org.secretaria.titular}
            vice={org.secretaria.vice}
          />
          <Ramo
            titulo="Tesouraria"
            titular={org.tesouraria.titular}
            vice={org.tesouraria.vice}
          />
        </div>
      )}

      {org.outros.length > 0 && (
        <div className="mt-10 flex w-full flex-col items-center gap-4">
          <p className="text-muted font-mono text-xs tracking-wider uppercase">
            Demais membros
          </p>
          <ul className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {org.outros.map((m) => (
              <li key={m.id} className="flex justify-center">
                <CartaoMembro membro={m} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {rodape}
    </figure>
  );
}
