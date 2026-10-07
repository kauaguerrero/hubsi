import { AdminNav } from "@/components/admin/admin-nav";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { Badge } from "@/components/ui/display";
import { Button } from "@/components/ui/button";
import { NAV_ADMIN, podeAcessar } from "@/lib/auth/permissoes";
import { requireRole } from "@/lib/auth/roles";
import { sair } from "@/server/actions/auth";

export const metadata = { title: { default: "Painel", template: "%s | Painel Hub S.I." }, robots: { index: false, follow: false } };

export default async function PainelLayout({ children }: LayoutProps<"/admin">) {
  const perfil = await requireRole(["editor", "admin", "superadmin"]);
  const itens = NAV_ADMIN.filter((i) => podeAcessar(perfil.papel, i.area));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-6 border-b border-border p-4 md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <LogoHubSI />
        <div className="flex flex-col gap-2">
          <p className="font-medium">{perfil.nome}</p>
          <Badge tom="acento" className="w-fit">{perfil.papel}</Badge>
          <form action={sair}>
            <Button type="submit" variante="ghost" className="-ml-4">Sair</Button>
          </form>
        </div>
        <AdminNav itens={itens} />
      </aside>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-28 md:pb-10">{children}</main>
    </div>
  );
}
