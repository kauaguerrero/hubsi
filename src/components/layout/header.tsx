import Link from "next/link";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { SeloGestao } from "@/components/brand/selo-gestao";
import { MenuMobile } from "./menu-mobile";
import { NAV_LINKS } from "./nav-links";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Hub S.I. — página inicial">
          <LogoHubSI />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="py-2 font-display text-lg font-semibold tracking-wide text-muted uppercase hover:text-fg"
                >
                  {link.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <SeloGestao />
        </div>

        <MenuMobile selo={<SeloGestao />} />
      </div>
    </header>
  );
}
