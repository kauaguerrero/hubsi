import { z } from "zod";
import { whatsappSchema } from "./schemas";

const texto = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));
const dataOpcional = z.coerce.date().optional();
const urlOpcional = z
  .url("Link inválido")
  .refine((u) => /^https?:\/\//i.test(u), "Use um link http(s)")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const destaqueSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens"),
    titulo: texto(120),
    descricao: textoOpcional(3000),
    tipo: z.enum(["save_the_date", "formulario", "link"]),
    status: z.enum(["rascunho", "publicado"]),
    dataEvento: dataOpcional,
    expiraEm: dataOpcional,
    ctaTexto: textoOpcional(40),
    linkExterno: urlOpcional,
  })
  .refine((d) => d.tipo !== "link" || !!d.linkExterno, {
    message: "Informe o link do destaque",
    path: ["linkExterno"],
  });

export const itemDestaqueSchema = z.object({
  nome: texto(120),
  descricao: textoOpcional(500),
  precoCentavos: z.number().int().min(0).max(10_000_000),
  ordem: z.number().int().min(0).max(999),
});

export const interesseSchema = z.object({
  nome: texto(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("E-mail inválido")),
  whatsapp: whatsappSchema,
  turma: textoOpcional(60),
  observacao: textoOpcional(500),
  selecao: z
    .array(
      z.object({
        itemId: z.uuid(),
        quantidade: z.number().int().min(1, "Quantidade mínima 1").max(20),
      }),
    )
    .min(1, "Escolha pelo menos um item")
    .max(50)
    .refine((s) => new Set(s.map((i) => i.itemId)).size === s.length, "Item repetido"),
  aceitePrivacidade: z.literal(true, "É necessário aceitar o aviso de privacidade"),
});
export type InteresseInput = z.infer<typeof interesseSchema>;
