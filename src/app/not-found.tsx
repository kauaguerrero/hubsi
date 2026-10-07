import type { Metadata } from "next";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-4 py-12">
      <LogoHubSI />
      <h1 className="text-4xl sm:text-6xl">
        <span className="text-accent">StackOverflowError</span>: 404
      </h1>
      <p className="text-muted">Essa página não existe, mudou de lugar ou nunca foi compilada.</p>
      <pre
        aria-hidden="true"
        className="overflow-x-auto rounded-xl border border-border bg-surface-2 p-4 font-mono text-xs leading-relaxed text-muted sm:text-sm"
      >
        {`Exception in thread "main" java.lang.StackOverflowError
    at hub.si.Rota.buscar(Rota.java:404)
    at hub.si.Rota.buscar(Rota.java:404)
    at hub.si.Rota.buscar(Rota.java:404)
    ... 1022 more`}
      </pre>
      <div>
        <ButtonLink href="/" tamanho="lg">
          Voltar para o início
        </ButtonLink>
      </div>
    </main>
  );
}
