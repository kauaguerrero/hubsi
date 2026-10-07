import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type Props = { className?: string; mostrarTexto?: boolean };

/** Emblema oficial do D.A. de Sistemas de Informação + wordmark "Hub S.I.". */
export function LogoHubSI({ className, mostrarTexto = true }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo-si.png"
        alt={
          mostrarTexto ? "" : "Diretório Acadêmico de Sistemas de Informação"
        }
        width={160}
        height={160}
        className="size-11 shrink-0 rounded-full shadow-sm"
      />
      {mostrarTexto && (
        <span className="font-display text-fg text-2xl leading-none font-extrabold tracking-tight">
          Hub <span className="text-gradient">S.I.</span>
        </span>
      )}
    </span>
  );
}
