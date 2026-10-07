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

export function ProdutoCard({
  slug,
  nome,
  precoCentavos,
  foto,
  categoria,
}: Props) {
  return (
    <Link
      href={`/loja/${slug}`}
      className="group border-border bg-surface shadow-card hover:shadow-pop flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
    >
      <div className="bg-brand-soft relative aspect-square overflow-hidden">
        {foto ? (
          <Image
            src={foto}
            alt={nome}
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center opacity-70">
            <Image
              src="/logo-si.png"
              alt=""
              width={160}
              height={160}
              className="size-20 rounded-full shadow-sm"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        {categoria && (
          <Badge tom="acento" className="w-fit capitalize">
            {categoria}
          </Badge>
        )}
        <h3 className="group-hover:text-accent text-2xl transition-colors">
          {nome}
        </h3>
        <p className="text-fg font-mono text-lg font-medium">
          {formatarBRL(precoCentavos)}
        </p>
      </div>
    </Link>
  );
}
