import Link from "next/link";
import { CircuitTrace } from "@/components/brand/circuit-trace";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { SeloGestao } from "@/components/brand/selo-gestao";
import { NAV_LINKS } from "./nav-links";

export function Footer() {
  return (
    <footer className="border-border bg-surface relative mt-20 border-t">
      <div
        aria-hidden="true"
        className="bg-brand absolute inset-x-0 top-0 h-0.5"
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <CircuitTrace animada={false} className="mb-10 opacity-70" />
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <LogoHubSI />
            <p className="text-muted text-sm">
              D.A. de Sistemas de Informação da FAFRAM.
            </p>
            <SeloGestao />
          </div>

          <nav aria-label="Rodapé">
            <p className="text-muted mb-2 font-mono text-xs tracking-wider uppercase">
              Navegação
            </p>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-fg hover:text-accent inline-block py-1.5 transition-colors"
                  >
                    {link.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-muted mb-2 font-mono text-xs tracking-wider uppercase">
              Contato e redes
            </p>
            <p className="text-muted text-sm">
              Redes sociais e canais de contato do D.A. estão em{" "}
              <Link
                href="/hub"
                className="text-accent underline underline-offset-2"
              >
                /hub
              </Link>
              .
            </p>
            <Link
              href="/privacidade"
              className="text-fg hover:text-accent mt-3 inline-block py-1.5 text-sm"
            >
              Aviso de privacidade
            </Link>
          </div>
        </div>
        <p className="text-muted mt-10 font-mono text-xs">
          © {new Date().getFullYear()} Hub S.I. — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
