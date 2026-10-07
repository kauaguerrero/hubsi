import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
let falhas = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) falhas++;
  console.log(`${ok ? "OK   " : "FALHA"} ${msg}`);
};

const sufixo = Date.now();
const senha = `Tmp-${sufixo}-aA1!`;
const papeis = ["editor", "admin", "superadmin"] as const;
const usuarios: Record<string, { id: string; email: string }> = {};
const limpeza: (() => Promise<unknown>)[] = [];

try {
  for (const papel of papeis) {
    const email = `rls-${papel}-${sufixo}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true });
    if (error || !data.user) throw error;
    usuarios[papel] = { id: data.user.id, email };
    limpeza.push(() => admin.auth.admin.deleteUser(data.user!.id));
    await admin.from("perfis_admin").insert({ user_id: data.user.id, nome: `RLS ${papel}`, email, papel });
  }

  // dado sensível de teste
  const { data: cli } = await admin.from("clientes").insert({ nome: "RLS Cliente", cpf: "11144477735", email: "c@example.com", whatsapp: "11912345678" }).select("id").single();
  limpeza.push(() => admin.from("clientes").delete().eq("id", cli!.id));
  const { data: lote } = await admin.from("lotes").select("id").limit(1).single();
  const { data: ped } = await admin.from("pedidos").insert({ lote_id: lote!.id, cliente_id: cli!.id, total_centavos: 100 }).select("id").single();
  limpeza.unshift(() => admin.from("pedidos").delete().eq("id", ped!.id));

  const entrar = async (papel: string) => {
    const c = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error } = await c.auth.signInWithPassword({ email: usuarios[papel]!.email, password: senha });
    if (error) throw error;
    return c;
  };
  const editor = await entrar("editor");
  const adm = await entrar("admin");
  const sup = await entrar("superadmin");

  // pedidos / clientes
  check(((await editor.from("pedidos").select("id")).data ?? []).length === 0, "editor NÃO lê pedidos");
  check(((await editor.from("clientes").select("id")).data ?? []).length === 0, "editor NÃO lê clientes (CPF/e-mail/WhatsApp)");
  check(((await adm.from("pedidos").select("id")).data ?? []).length === 1, "admin lê pedidos");
  check(((await adm.from("clientes").select("cpf")).data ?? []).length === 1, "admin lê clientes");

  // escrita por papel
  const ev = await editor.from("eventos").insert({ slug: `rls-${sufixo}`, titulo: "RLS", inicio: new Date().toISOString() }).select("id").single();
  check(!ev.error, "editor cria evento");
  if (ev.data) limpeza.unshift(() => admin.from("eventos").delete().eq("id", ev.data!.id));
  const hub = await editor.from("links_hub").insert({ titulo: "t", url: "https://x.com" }).select("id").single();
  check(!hub.error, "editor cria link do hub");
  if (hub.data) limpeza.unshift(() => admin.from("links_hub").delete().eq("id", hub.data!.id));
  check(!!(await editor.from("lotes").insert({ nome: "x", fecha_em: new Date(Date.now() + 1e9).toISOString() })).error, "editor NÃO cria lote");
  check(!!(await editor.from("produtos").update({ nome: "x" }).eq("slug", "camisa-hub-si").select()).error ||
        ((await editor.from("produtos").update({ nome: "x" }).eq("slug", "camisa-hub-si").select("id")).data ?? []).length === 0, "editor NÃO altera produtos");

  // perfis_admin
  check(((await editor.from("perfis_admin").select("user_id")).data ?? []).length === 1, "editor só enxerga o próprio perfil");
  check(((await adm.from("perfis_admin").select("user_id")).data ?? []).length === 1, "admin só enxerga o próprio perfil");
  check(((await sup.from("perfis_admin").select("user_id")).data ?? []).length >= 3, "superadmin enxerga todos os perfis");
  const tentaPromover = await adm.from("perfis_admin").update({ papel: "superadmin" }).eq("user_id", usuarios.admin!.id).select("user_id");
  check((tentaPromover.data ?? []).length === 0, "admin NÃO consegue se promover a superadmin");

  // ativar_gestao
  const { data: gestao } = await admin.from("gestoes").select("id").eq("ativa", true).single();
  check(!!(await adm.rpc("ativar_gestao", { p_id: gestao!.id })).error, "admin NÃO executa ativar_gestao");
  check(!!(await editor.rpc("ativar_gestao", { p_id: gestao!.id })).error, "editor NÃO executa ativar_gestao");
  check(!(await sup.rpc("ativar_gestao", { p_id: gestao!.id })).error, "superadmin executa ativar_gestao");

  // log_acoes
  check(!(await adm.from("log_acoes").insert({ user_id: usuarios.admin!.id, acao: "teste", entidade: "rls" })).error, "admin grava log_acoes");
  check(!!(await adm.from("log_acoes").insert({ user_id: usuarios.superadmin!.id, acao: "forjado", entidade: "rls" })).error, "admin NÃO grava log em nome de outro");
  check(((await editor.from("log_acoes").select("id")).data ?? []).length === 0, "editor NÃO lê log_acoes");
  limpeza.unshift(() => admin.from("log_acoes").delete().eq("entidade", "rls"));

  // rate_limits e webhook_eventos
  check(!!(await sup.from("rate_limits").select("*")).error, "superadmin NÃO acessa rate_limits");
  check(!!(await sup.from("webhook_eventos").select("*")).error, "superadmin NÃO acessa webhook_eventos");
  check(!!(await sup.rpc("checar_rate_limit", { p_chave: "x", p_limite: 1, p_janela_segundos: 1 })).error, "authenticated NÃO executa checar_rate_limit");

  // storage
  const arq = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
  const caminho = `rls/${sufixo}.png`;
  check(!!(await editor.storage.from("produtos").upload(caminho, arq, { contentType: "image/png" })).error, "editor NÃO envia ao bucket produtos");
  check(!(await editor.storage.from("eventos").upload(caminho, arq, { contentType: "image/png" })).error, "editor envia ao bucket eventos");
  check(!(await adm.storage.from("produtos").upload(caminho, arq, { contentType: "image/png" })).error, "admin envia ao bucket produtos");
  limpeza.unshift(() => admin.storage.from("eventos").remove([caminho]));
  limpeza.unshift(() => admin.storage.from("produtos").remove([caminho]));
} finally {
  for (const f of limpeza) {
    try {
      await f();
    } catch {
      /* melhor esforço */
    }
  }
}

console.log(falhas === 0 ? "\nTodos os checks passaram." : `\n${falhas} check(s) falharam.`);
process.exit(falhas === 0 ? 0 : 1);
