import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/helpers";

export type Evento = Tables<"eventos">;
export type Palestrante = Pick<Tables<"palestrantes">, "id" | "nome" | "bio" | "foto_url" | "ordem">;
export type EventoComPalestrantes = Evento & { palestrantes: Palestrante[] };

/** Eventos publicados/cancelados (RLS), do mais antigo ao mais novo. */
export async function listarEventos(): Promise<Evento[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("eventos").select("*").order("inicio", { ascending: true });
  return data ?? [];
}

export function eventoJaAconteceu(evento: Pick<Evento, "inicio" | "fim">, agora = new Date()): boolean {
  return new Date(evento.fim ?? evento.inicio) < agora;
}

export async function getProximoEvento(): Promise<Evento | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("eventos")
    .select("*")
    .eq("status", "publicado")
    .gte("inicio", new Date().toISOString())
    .order("inicio", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getEventoPorSlug(slug: string): Promise<EventoComPalestrantes | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("eventos")
    .select("*, palestrantes(id, nome, bio, foto_url, ordem)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return { ...data, palestrantes: [...data.palestrantes].sort((a, b) => a.ordem - b.ordem) };
}

export async function listarSlugsEventos(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("eventos").select("slug");
  return (data ?? []).map((e) => e.slug);
}
