// Cria (ou promove) o primeiro superadmin.
// Uso: pnpm tsx --env-file=.env.local scripts/criar-superadmin.mts voce@exemplo.com "Seu Nome"
import { createClient } from "@supabase/supabase-js";

const [email, nome = "Superadmin"] = process.argv.slice(2);
if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Uso: pnpm tsx --env-file=.env.local scripts/criar-superadmin.mts <email> ["Nome"]');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !chave) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const admin = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
const emailNormalizado = email.trim().toLowerCase();

// Procura o usuário já existente; se não houver, cria já confirmado (entra por link mágico).
let userId: string | undefined;
for (let pagina = 1; !userId; pagina++) {
  const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 200 });
  if (error) throw error;
  userId = data.users.find((u) => u.email?.toLowerCase() === emailNormalizado)?.id;
  if (data.users.length < 200) break;
}
if (!userId) {
  const { data, error } = await admin.auth.admin.createUser({ email: emailNormalizado, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("Falha ao criar usuário");
  userId = data.user.id;
}

const { error } = await admin
  .from("perfis_admin")
  .upsert({ user_id: userId, nome, email: emailNormalizado, papel: "superadmin" }, { onConflict: "user_id" });
if (error) throw error;

console.log(`OK: ${emailNormalizado} agora é superadmin. Entre em /admin/login pelo link mágico.`);
