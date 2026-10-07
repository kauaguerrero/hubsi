import { cn } from "@/lib/utils/cn";

type Props = { className?: string; mostrarTexto?: boolean };

/** Wordmark "HUB S.I." em condensada + ícone de circuito com nós. */
export function LogoHubSI({ className, mostrarTexto = true }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        role="img"
        aria-label={mostrarTexto ? undefined : "Hub S.I."}
        aria-hidden={mostrarTexto ? true : undefined}
      >
        <path
          d="M4 16h8m0 0 4-8h12M12 16l4 8h12M16 8v16"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4" cy="16" r="2.5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2" />
        <circle cx="28" cy="8" r="2.5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2" />
        <circle cx="28" cy="24" r="2.5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2" />
        <circle cx="16" cy="16" r="3" fill="var(--color-accent)" />
      </svg>
      {mostrarTexto && (
        <span className="font-display text-2xl leading-none font-bold tracking-wide text-fg uppercase">
          Hub <span className="text-accent">S.I.</span>
        </span>
      )}
    </span>
  );
}
