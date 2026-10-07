import Image from "next/image";
import { notFound } from "next/navigation";
import { BotaoAcao } from "@/components/admin/botao-acao";
import { FormAcao } from "@/components/admin/form-acao";
import { UploadImagem } from "@/components/admin/upload-imagem";
import { Card } from "@/components/ui/display";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/field";
import { contextoAdmin } from "@/server/admin/contexto";
import {
  adicionarFoto,
  adicionarVariacao,
  excluirProduto,
  removerFoto,
  removerVariacao,
  salvarProduto,
} from "@/server/actions/produtos";

export const metadata = { title: "Produto" };

export default async function ProdutoAdminPage({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const { supabase } = await contextoAdmin("produtos");
  const novo = id === "novo";

  const [{ data: lotes }, { data: produto }] = await Promise.all([
    supabase.from("lotes").select("id, nome").order("abre_em", { ascending: false }),
    novo
      ? Promise.resolve({ data: null })
      : supabase.from("produtos").select("*, variacoes(id, tamanho, cor, ativo, ordem)").eq("id", id).maybeSingle(),
  ]);
  if (!novo && !produto) notFound();

  const variacoes = [...(produto?.variacoes ?? [])].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <h1 className="text-5xl">{novo ? "Novo produto" : produto?.nome}</h1>

      <FormAcao action={salvarProduto.bind(null, novo ? null : id)}>
        <Select id="lote_id" name="lote_id" label="Lote" defaultValue={produto?.lote_id} required>
          {(lotes ?? []).map((l) => (
            <option key={l.id} value={l.id}>{l.nome}</option>
          ))}
        </Select>
        <Input id="nome" name="nome" label="Nome" defaultValue={produto?.nome} required />
        <Input id="slug" name="slug" label="Slug (URL)" dica="Minúsculas, números e hífens. Ex.: camisa-hub-si" defaultValue={produto?.slug} required />
        <Textarea id="descricao" name="descricao" label="Descrição" defaultValue={produto?.descricao ?? ""} />
        <Input id="categoria" name="categoria" label="Categoria" dica='Use "vestuario" para exibir a tabela de medidas.' defaultValue={produto?.categoria ?? "geral"} required />
        <Input id="preco" name="preco" label="Preço (R$)" inputMode="decimal" defaultValue={produto ? (produto.preco_centavos / 100).toFixed(2).replace(".", ",") : ""} required />
        <Checkbox id="aceita_cartao" name="aceita_cartao" label="Aceita cartão de crédito" defaultChecked={produto?.aceita_cartao ?? true} />
        <Checkbox id="ativo" name="ativo" label="Ativo (visível na loja)" defaultChecked={produto?.ativo ?? true} />
      </FormAcao>

      {!novo && produto && (
        <>
          <section aria-labelledby="fotos" className="flex flex-col gap-4">
            <h2 id="fotos" className="text-3xl">Fotos</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {produto.fotos.map((f) => (
                <li key={f} className="flex flex-col gap-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                    <Image src={f} alt={`Foto de ${produto.nome}`} fill sizes="200px" className="object-cover" />
                  </div>
                  <BotaoAcao action={removerFoto.bind(null, id, f)} confirmar="Remover esta foto?" className="w-full">Remover</BotaoAcao>
                </li>
              ))}
            </ul>
            <UploadImagem bucket="produtos" pasta={id} rotulo="Adicionar foto (JPG, PNG ou WebP, até 5 MB)" aoEnviar={adicionarFoto.bind(null, id)} />
          </section>

          <section aria-labelledby="variacoes" className="flex flex-col gap-4">
            <h2 id="variacoes" className="text-3xl">Variações</h2>
            <p className="text-sm text-muted">Sem variações, o produto é vendido direto. Com variações, o cliente precisa escolher uma.</p>
            <ul className="flex flex-col gap-2">
              {variacoes.map((v) => (
                <li key={v.id}>
                  <Card className="flex items-center justify-between gap-3 py-3">
                    <span>
                      {[v.tamanho, v.cor].filter(Boolean).join(" / ")}
                      {!v.ativo && <span className="ml-2 text-sm text-muted">(inativa)</span>}
                    </span>
                    <BotaoAcao action={removerVariacao.bind(null, id, v.id)} confirmar="Remover esta variação?">Remover</BotaoAcao>
                  </Card>
                </li>
              ))}
            </ul>
            <FormAcao action={adicionarVariacao.bind(null, id)} rotulo="Adicionar variação" limparAoSalvar className="grid gap-4 sm:grid-cols-2">
              <Input id="tamanho" name="tamanho" label="Tamanho" placeholder="P, M, G…" />
              <Input id="cor" name="cor" label="Cor" placeholder="Preta, Azul…" />
            </FormAcao>
          </section>

          <BotaoAcao action={excluirProduto.bind(null, id)} confirmar="Excluir este produto? Só é possível se nunca foi vendido." className="w-fit text-danger">
            Excluir produto
          </BotaoAcao>
        </>
      )}
    </div>
  );
}
