import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { Badge, Card } from "@/components/ui/display";
import { Input, Select } from "@/components/ui/field";
import { podeAlterarUsuario } from "@/lib/auth/permissoes";
import { alterarPapel, convidarUsuario, removerUsuario } from "@/server/actions/usuarios";
import { contextoAdmin } from "@/server/admin/contexto";

export const metadata = { title: "Usuários" };

export default async function UsuariosPage() {
  const { perfil, supabase } = await contextoAdmin("usuarios");
  const { data } = await supabase.from("perfis_admin").select("user_id, nome, email, papel").order("nome");
  const usuarios = data ?? [];
  const totalSuperadmins = usuarios.filter((u) => u.papel === "superadmin").length;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-5xl uppercase">Usuários</h1>

      <section aria-labelledby="convidar" className="flex flex-col gap-4">
        <h2 id="convidar" className="text-3xl">Convidar</h2>
        <FormAcao action={convidarUsuario} rotulo="Enviar convite" limparAoSalvar>
          <Input id="c_nome" name="nome" label="Nome" required />
          <Input id="c_email" name="email" type="email" label="E-mail" required />
          <Select id="c_papel" name="papel" label="Papel" defaultValue="editor">
            <option value="editor">Editor (eventos e hub)</option>
            <option value="admin">Admin (loja, pedidos, gestões)</option>
            <option value="superadmin">Superadmin (tudo, inclusive usuários)</option>
          </Select>
        </FormAcao>
      </section>

      <section aria-labelledby="lista" className="flex flex-col gap-3">
        <h2 id="lista" className="text-3xl">Equipe</h2>
        {usuarios.map((u) => {
          const podeRemover = podeAlterarUsuario({
            alvoId: u.user_id, alvoPapel: u.papel, acao: "remover", executorId: perfil.userId, totalSuperadmins,
          }).ok;
          return (
            <Card key={u.user_id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-xl font-bold">{u.nome}</p>
                  <p className="text-sm text-muted">{u.email}</p>
                </div>
                <Badge tom="acento">{u.papel}</Badge>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <FormAcao action={alterarPapel.bind(null, u.user_id)} rotulo="Mudar papel" className="flex flex-wrap items-end gap-3">
                  <Select id={`p_${u.user_id}`} name="papel" label="Papel" defaultValue={u.papel}>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </Select>
                </FormAcao>
                {podeRemover && (
                  <BotaoAcao action={removerUsuario.bind(null, u.user_id)} confirmar={`Remover ${u.nome} do painel?`} className="text-danger">
                    Remover
                  </BotaoAcao>
                )}
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
