import { headers } from "next/headers";

/** IP do cliente (primeiro valor de x-forwarded-for, preenchido pela Vercel). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
}
