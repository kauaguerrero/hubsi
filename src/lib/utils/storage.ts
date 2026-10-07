export type BucketPublico = "produtos" | "eventos" | "gestoes";

/** Caminho do objeto dentro do bucket se a URL for do Storage público do projeto; senão null. */
export function caminhoNoStorage(url: string, supabaseUrl: string, bucket: BucketPublico): string | null {
  const prefixo = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefixo)) return null;
  const caminho = decodeURIComponent(url.slice(prefixo.length));
  return caminho && !caminho.includes("..") ? caminho : null;
}
