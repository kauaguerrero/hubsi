import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Fundo decorativo do hero: aurora (faixas em degradê) + bolhas de cor flutuando + pontos sutis.
 * Puro CSS; estático com prefers-reduced-motion.
 */
export function AuroraBackground({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div aria-hidden="true" className="aurora -z-10" />
      <div
        aria-hidden="true"
        className="animate-float pointer-events-none absolute -top-24 -right-24 -z-10 size-80 rounded-full bg-[#22d3ee]/30 blur-3xl sm:size-[28rem]"
      />
      <div
        aria-hidden="true"
        className="animate-float pointer-events-none absolute top-1/2 -left-32 -z-10 size-72 rounded-full bg-[#a78bfa]/30 blur-3xl [animation-delay:-4s] sm:size-96"
      />
      <div
        aria-hidden="true"
        className="bg-dots pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] opacity-60"
      />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t to-transparent"
      />
      {children}
    </div>
  );
}
