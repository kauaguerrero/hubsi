import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { IconeAdmin } from "@/components/admin/icones";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { Badge } from "@/components/ui/display";
import { NAV_ADMIN, podeAcessar } from "@/lib/auth/permissoes";
import { requireRole } from "@/lib/auth/roles";
import { sair } from "@/server/actions/auth";
import { ROTULO_PAPEL } from "@/lib/utils/rotulos";

export const metadata = { title: { default: "Painel", template: "%s | Painel Hub S.I." }, robots: { index: false, follow: false } };

export default async function PainelLayout({ children }: LayoutProps<"/admin">) {
  const perfil = await requireRole(["editor", "admin", "superadmin"]);
  const itens = NAV_ADMIN.filter((i) => podeAcessar(perfil.papel, i.area));
  const inicial = perfil.nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[264px_1fr]">
      <aside className="border-border bg-surface flex flex-col gap-6 border-b p-4 md:sticky md:top-0 md:h-screen md:border-r md:border-b-0 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" aria-label="Início do painel">
            <LogoHubSI />
          </Link>
          <form action={sair} className="md:hidden">
            <button type="submit" aria-label="Sair" className="text-muted hover:text-accent flex size-11 items-center justify-center rounded-full">
              <IconeAdmin nome="sair" />
            </button>
          </form>
        </div>

        <AdminNav itens={itens} />

        <div className="border-border hidden flex-col gap-3 border-t pt-4 md:flex">
          <div className="flex items-center gap-3">
            <span className="bg-brand text-on-accent font-display flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-bold">
              {inicial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{perfil.nome}</p>
              <Badge tom="acento" className="mt-0.5">{ROTULO_PAPEL[perfil.papel] ?? perfil.papel}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="border-border text-muted hover:border-accent hover:text-accent flex min-h-10 flex-1 items-center justify-center rounded-xl border text-sm font-medium transition-colors"
            >
              Ver site
            </Link>
            <form action={sair} className="flex-1">
              <button
                type="submit"
                className="border-border text-muted hover:border-danger hover:text-danger flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors"
              >
                <IconeAdmin nome="sair" className="size-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-28 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
