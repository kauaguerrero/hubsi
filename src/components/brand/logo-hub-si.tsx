import { useId } from "react";
import { cn } from "@/lib/utils/cn";

type Props = { className?: string; mostrarTexto?: boolean };

/** Wordmark "Hub S.I." + ícone de circuito com nós, em degradê ciano → violeta. */
export function LogoHubSI({ className, mostrarTexto = true }: Props) {
  const id = useId();

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 32 32"
        fill="none"
        role="img"
        aria-label={mostrarTexto ? undefined : "Hub S.I."}
        aria-hidden={mostrarTexto ? true : undefined}
      >
        <defs>
          <linearGradient
            id={id}
            x1="2"
            y1="4"
            x2="30"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="var(--color-surface)" />
        <path
          d="M6 16h6m0 0 3-6h8M12 16l3 6h8M15 10v12"
          stroke={`url(#${id})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="6"
          cy="16"
          r="2.2"
          fill="var(--color-surface)"
          stroke={`url(#${id})`}
          strokeWidth="2"
        />
        <circle
          cx="23"
          cy="10"
          r="2.2"
          fill="var(--color-surface)"
          stroke={`url(#${id})`}
          strokeWidth="2"
        />
        <circle
          cx="23"
          cy="22"
          r="2.2"
          fill="var(--color-surface)"
          stroke={`url(#${id})`}
          strokeWidth="2"
        />
        <circle cx="15" cy="16" r="2.6" fill={`url(#${id})`} />
      </svg>
      {mostrarTexto && (
        <span className="font-display text-fg text-2xl leading-none font-extrabold tracking-tight">
          Hub <span className="text-gradient">S.I.</span>
        </span>
      )}
    </span>
  );
}
