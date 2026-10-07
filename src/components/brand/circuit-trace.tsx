import { useId } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  /** Anima o "acender" da trilha (estática com prefers-reduced-motion). */
  animada?: boolean;
};

const COMPRIMENTO = 640;

/** Trilha de circuito decorativa, horizontal, com nós circulares e degradê ciano → violeta. */
export function CircuitTrace({ className, animada = true }: Props) {
  const id = useId();
  const traco = `url(#${id})`;

  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="xMinYMid meet"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-full max-w-md", className)}
    >
      <defs>
        <linearGradient
          id={id}
          x1="0"
          y1="0"
          x2="400"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d="M0 20h70l14-14h90l14 14h60l14 14h70l14-14h54"
        stroke={traco}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animada ? "trace-path" : undefined}
        style={{ ["--trace-len" as string]: COMPRIMENTO }}
      />
      {[70, 174, 248, 332].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={[20, 6, 20, 34][i]}
          r="4.5"
          fill="var(--color-surface)"
          stroke={traco}
          strokeWidth="2.5"
          className={animada ? "trace-node" : undefined}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      <circle cx="396" cy="20" r="4.5" fill="#7c3aed" />
    </svg>
  );
}
