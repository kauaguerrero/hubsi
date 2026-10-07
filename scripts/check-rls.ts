// Verifica que o client anon não lê dados sensíveis. Uso: pnpm tsx --env-file=.env.local scripts/check-rls.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");

const anon = createClient(url, key);
const sensiveis = ["pedidos", "clientes", "itens_pedido", "webhook_eventos", "rate_limits", "log_acoes", "perfis_admin"];
const publicas = ["gestoes", "lotes", "produtos", "eventos", "links_hub"];
let falhou = false;

for (const t of sensiveis) {
  const { data, error } = await anon.from(t).select("*").limit(1);
  const ok = !!error || (data?.length ?? 0) === 0;
  if (!ok) falhou = true;
  console.log(`${ok ? "OK  " : "FALHA"} anon não lê ${t}${error ? ` (negado: ${error.code})` : " (vazio)"}`);
}
for (const t of publicas) {
  const { data, error } = await anon.from(t).select("id").limit(1);
  const ok = !error && (data?.length ?? 0) > 0;
  if (!ok) falhou = true;
  console.log(`${ok ? "OK  " : "FALHA"} anon lê ${t}${error ? ` (${error.message})` : ""}`);
}
process.exit(falhou ? 1 : 0);
