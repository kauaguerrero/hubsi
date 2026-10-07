import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  /** Anima o "acender" da trilha (estática com prefers-reduced-motion). */
  animada?: boolean;
};

const COMPRIMENTO = 640;

/** Trilha de circuito decorativa, horizontal, com nós circulares. */
export function CircuitTrace({ className, animada = true }: Props) {
  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="xMinYMid meet"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-full max-w-md text-accent", className)}
    >
      <path
        d="M0 20h70l14-14h90l14 14h60l14 14h70l14-14h54"
        stroke="currentColor"
        strokeWidth="2"
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
          r="4"
          fill="var(--color-bg)"
          stroke="currentColor"
          strokeWidth="2"
          className={animada ? "trace-node" : undefined}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      <circle cx="400" cy="20" r="4" fill="currentColor" />
    </svg>
  );
}
