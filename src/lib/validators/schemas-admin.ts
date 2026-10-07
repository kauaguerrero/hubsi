import { z } from "zod";

const texto = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Só http(s): bloqueia `javascript:` e similares em links exibidos publicamente. */
const urlWeb = z
  .url("URL inválida")
  .refine((u) => /^https?:\/\//i.test(u), "Use um endereço http(s)");

export const linkHubSchema = z.object({
  titulo: texto(80),
  url: urlWeb,
  categoria: texto(40).transform((c) => c.toLowerCase()),
  descricao: textoOpcional(160),
  ordem: z.number().int().min(0).max(9999),
  ativo: z.boolean(),
});

export const palestranteSchema = z.object({
  nome: texto(120),
  bio: textoOpcional(1000),
  ordem: z.number().int().min(0).max(9999),
});

export const membroSchema = z.object({
  nome: texto(120),
  cargo: texto(80),
  ordem: z.number().int().min(0).max(9999),
});

export const conviteUsuarioSchema = z.object({
  nome: texto(120),
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido")),
  papel: z.enum(["superadmin", "admin", "editor"]),
});

export const papelSchema = z.enum(["superadmin", "admin", "editor"]);
