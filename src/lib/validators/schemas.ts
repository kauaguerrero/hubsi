import { z } from "zod";
import { normalizarCpf, validarCpf } from "./cpf";

const texto = (max: number) => z.string().trim().min(1, "Campo obrigatório").max(max);
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** WhatsApp BR: aceita +55, máscara e espaços; devolve só dígitos (DDD + número). */
export const whatsappSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .transform((v) => (v.length > 11 && v.startsWith("55") ? v.slice(2) : v))
  .refine((v) => /^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(v), "WhatsApp inválido");

export const cpfSchema = z.string().refine(validarCpf, "CPF inválido").transform(normalizarCpf);

export const itemPedidoSchema = z.object({
  produtoId: z.uuid(),
  variacaoId: z.uuid().nullish(),
  quantidade: z.number().int().min(1).max(10),
});

export const pedidoSchema = z.object({
  nome: texto(120).refine((v) => v.split(/\s+/).length >= 2, "Informe nome e sobrenome"),
  cpf: cpfSchema,
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("E-mail inválido")),
  whatsapp: whatsappSchema,
  turma: textoOpcional(60),
  itens: z.array(itemPedidoSchema).min(1, "Carrinho vazio").max(20),
  aceitePrivacidade: z.literal(true, "É necessário aceitar o aviso de privacidade"),
});
export type PedidoInput = z.infer<typeof pedidoSchema>;

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens");

const dataHora = z.coerce.date();
const urlOpcional = z
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const eventoSchema = z
  .object({
    slug,
    titulo: texto(160),
    descricao: textoOpcional(5000),
    tipo: z.enum(["palestra", "workshop", "hackathon", "social", "semana_academica", "outro"]),
    status: z.enum(["rascunho", "publicado", "cancelado"]),
    inicio: dataHora,
    fim: dataHora.optional(),
    local: textoOpcional(160),
    linkInscricao: urlOpcional,
  })
  .refine((e) => !e.fim || e.fim >= e.inicio, { message: "Fim antes do início", path: ["fim"] });

export const produtoSchema = z.object({
  loteId: z.uuid(),
  slug,
  nome: texto(120),
  descricao: textoOpcional(3000),
  categoria: texto(40),
  precoCentavos: z.number().int().min(0).max(10_000_000),
  aceitaCartao: z.boolean(),
  ativo: z.boolean(),
});

export const loteSchema = z
  .object({
    nome: texto(120),
    status: z.enum(["aberto", "fechado", "em_producao", "entregue"]),
    abreEm: dataHora,
    fechaEm: dataHora,
    limiteUnidades: z.number().int().positive().optional(),
    localRetirada: textoOpcional(160),
    dataRetirada: dataHora.optional(),
  })
  .refine((l) => l.fechaEm > l.abreEm, { message: "Fechamento antes da abertura", path: ["fechaEm"] });

export const gestaoSchema = z.object({
  nome: texto(80),
  slug,
  ano: z.number().int().min(2000).max(2100),
  descricao: textoOpcional(2000),
});
