import Link from "next/link";
import { CircuitTrace } from "@/components/brand/circuit-trace";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { SeloGestao } from "@/components/brand/selo-gestao";
import { NAV_LINKS } from "./nav-links";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface-2">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <CircuitTrace animada={false} className="mb-8 opacity-60" />
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <LogoHubSI />
            <p className="text-sm text-muted">D.A. de Sistemas de Informação da FAFRAM.</p>
            <SeloGestao />
          </div>

          <nav aria-label="Rodapé">
            <p className="mb-2 font-mono text-xs text-muted uppercase">Navegação</p>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block py-1.5 text-fg hover:text-accent">
                    {link.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-2 font-mono text-xs text-muted uppercase">Contato e redes</p>
            <p className="text-sm text-muted">
              Redes sociais e canais de contato do D.A. estão em{" "}
              <Link href="/hub" className="text-accent underline underline-offset-2">
                /hub
              </Link>
              .
            </p>
            <Link href="/privacidade" className="mt-3 inline-block py-1.5 text-sm text-fg hover:text-accent">
              Aviso de privacidade
            </Link>
          </div>
        </div>
        <p className="mt-8 font-mono text-xs text-muted">
          © {new Date().getFullYear()} Hub S.I. — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
