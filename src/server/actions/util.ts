import { z } from "zod";
import { datetimeLocalParaISO } from "@/lib/utils/datas";
import type { EstadoForm } from "./pedidos";

export const texto = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export const marcado = (fd: FormData, k: string) => fd.get(k) === "on";

export function numeroOuUndef(fd: FormData, k: string): number | undefined {
  const t = texto(fd, k);
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function dataLocal(fd: FormData, k: string): string | undefined {
  const t = texto(fd, k);
  return t ? (datetimeLocalParaISO(t) ?? "invalida") : undefined;
}

export function erroZod(error: z.ZodError): EstadoForm {
  const campos = z.flattenError(error).fieldErrors;
  const primeiro = (Object.values(campos).flat() as string[])[0];
  return { erro: primeiro ?? "Confira os campos do formulário.", campos };
}

/** Traduz erros comuns do Postgres para mensagens amigáveis. */
export function erroDoBanco(error: { code?: string; message?: string } | null | undefined): EstadoForm | null {
  if (!error) return null;
  if (error.code === "23505") return { erro: "Já existe um registro com esse valor (slug/identificador duplicado)." };
  if (error.code === "23503") return { erro: "Este registro está em uso por outros dados e não pode ser removido." };
  if (error.code === "42501") return { erro: "Sem permissão para esta ação." };
  return { erro: "Não foi possível salvar. Tente novamente." };
}
