import Link from "next/link";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { SeloGestao } from "@/components/brand/selo-gestao";
import { CarrinhoBadge } from "@/components/loja/carrinho-badge";
import { MenuMobile } from "./menu-mobile";
import { NAV_LINKS } from "./nav-links";

export function Header() {
  return (
    <header className="border-border/70 bg-surface/75 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:h-[5.25rem]">
        <Link href="/" aria-label="Hub S.I. — página inicial">
          <LogoHubSI />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted hover:bg-accent/10 hover:text-accent rounded-full px-4 py-2 text-base font-medium transition-colors"
                >
                  {link.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <SeloGestao />
        </div>

        <div className="flex items-center gap-2">
          <CarrinhoBadge />
          <MenuMobile selo={<SeloGestao tamanho="lg" />} />
        </div>
      </div>
    </header>
  );
}
