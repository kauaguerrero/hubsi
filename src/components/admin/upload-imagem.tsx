"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EstadoForm } from "@/server/actions/pedidos";

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

type Props = {
  bucket: "produtos" | "eventos" | "gestoes";
  /** Pasta dentro do bucket (ex.: id do produto). */
  pasta: string;
  rotulo: string;
  /** Server action que grava a URL pública no registro. */
  aoEnviar: (url: string) => Promise<EstadoForm | void>;
};

/** Envia a imagem direto do navegador ao Storage (sessão do admin; evita o limite de corpo das actions). */
export function UploadImagem({ bucket, pasta, rotulo, aoEnviar }: Props) {
  const id = useId();
  const router = useRouter();
  const [msg, setMsg] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEscolher(arquivo: File | undefined) {
    if (!arquivo) return;
    if (!TIPOS.includes(arquivo.type)) return setMsg({ tipo: "erro", texto: "Use JPG, PNG ou WebP." });
    if (arquivo.size > MAX_BYTES) return setMsg({ tipo: "erro", texto: "A imagem deve ter até 5 MB." });

    setEnviando(true);
    setMsg(null);
    const supabase = createClient();
    const caminho = `${pasta}/${crypto.randomUUID()}.${EXT[arquivo.type]}`;
    const { error } = await supabase.storage.from(bucket).upload(caminho, arquivo, { contentType: arquivo.type });
    if (error) {
      setEnviando(false);
      return setMsg({ tipo: "erro", texto: "Falha no envio da imagem." });
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(caminho);
    const r = await aoEnviar(data.publicUrl);
    setEnviando(false);
    if (r?.erro) return setMsg({ tipo: "erro", texto: r.erro });
    setMsg({ tipo: "ok", texto: "Imagem enviada." });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo}
      </label>
      <input
        id={id}
        type="file"
        accept={TIPOS.join(",")}
        disabled={enviando}
        onChange={(e) => {
          void aoEscolher(e.target.files?.[0]);
          e.target.value = "";
        }}
        className="min-h-11 text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-border file:bg-surface file:px-4 file:text-fg"
      />
      <p aria-live="polite" className={msg?.tipo === "erro" ? "text-sm text-danger" : "text-sm text-success"}>
        {enviando ? "Enviando…" : (msg?.texto ?? "")}
      </p>
    </div>
  );
}
