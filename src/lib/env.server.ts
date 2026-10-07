import "server-only";
import { z } from "zod";

// Cada domínio valida só o que usa, sob demanda (não no import), para que a
// ausência de uma integração (ex.: Asaas) não derrube o resto do app.

const supabaseSchema = z.object({ SUPABASE_SERVICE_ROLE_KEY: z.string().min(1) });
const asaasSchema = z.object({
  ASAAS_API_KEY: z.string().min(1),
  ASAAS_BASE_URL: z.url(),
  ASAAS_WEBHOOK_TOKEN: z.string().min(32),
});
const emailSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
});
const cronSchema = z.object({ CRON_SECRET: z.string().min(16) });

export const getSupabaseServerEnv = () => supabaseSchema.parse(process.env);
export const getAsaasEnv = () => asaasSchema.parse(process.env);
export const getEmailEnv = () => emailSchema.parse({
  RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
  EMAIL_FROM: process.env.EMAIL_FROM || undefined,
});
export const getCronEnv = () => cronSchema.parse(process.env);
