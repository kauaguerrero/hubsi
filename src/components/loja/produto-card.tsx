import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/display";
import { formatarBRL } from "@/lib/utils/money";

type Props = {
  slug: string;
  nome: string;
  precoCentavos: number;
  foto?: string | null;
  categoria?: string;
};

export function ProdutoCard({ slug, nome, precoCentavos, foto, categoria }: Props) {
  return (
    <Link
      href={`/loja/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent"
    >
      <div className="relative aspect-square bg-surface-2">
        {foto ? (
          <Image src={foto} alt={nome} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-sm text-muted">sem foto</div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        {categoria && <Badge className="w-fit">{categoria}</Badge>}
        <h3 className="text-2xl group-hover:text-accent">{nome}</h3>
        <p className="font-mono text-lg text-fg">{formatarBRL(precoCentavos)}</p>
      </div>
    </Link>
  );
}
