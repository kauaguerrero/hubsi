import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ASAAS_API_KEY: z.string().min(1),
  ASAAS_BASE_URL: z.string().url(),
  ASAAS_WEBHOOK_TOKEN: z.string().min(16),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cache: ServerEnv | undefined;

/** Valida sob demanda (não no import) para o build passar sem segredos. */
export function getServerEnv(): ServerEnv {
  cache ??= serverSchema.parse(process.env);
  return cache;
}
