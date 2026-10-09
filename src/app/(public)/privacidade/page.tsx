import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como o Hub S.I. coleta, usa e protege os dados de quem compra na loja do curso.",
};

export default function PrivacidadePage() {
  return (
    <article className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-5xl sm:text-6xl">Privacidade</h1>
      <p className="text-muted">
        Este aviso explica quais dados pessoais o Hub S.I. coleta quando você faz um pedido na loja, para que servem e
        quem pode acessá-los.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="text-3xl">Dados coletados e finalidade</h2>
        <p className="text-muted">
          Nome, CPF, e-mail, WhatsApp e turma. Usamos esses dados apenas para: processar o pagamento do seu pedido,
          confirmar a compra por e-mail, organizar a produção e a retirada dos produtos e entrar em contato sobre o
          pedido.
        </p>
        <p className="text-muted">
          Nos formulários de interesse em pré-venda, coletamos nome, e-mail, WhatsApp, turma (opcional) e os itens
          escolhidos, apenas para avisar você sobre o lançamento e estimar a demanda. Esses formulários não pedem CPF.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-3xl">Quem acessa</h2>
        <ul className="list-disc pl-6 text-muted">
          <li>Membros autorizados do D.A. com acesso administrativo ao painel.</li>
          <li>Asaas, processador de pagamentos (recebe nome, CPF e e-mail para emitir a cobrança).</li>
          <li>Resend, serviço de envio de e-mails transacionais.</li>
          <li>Supabase, provedor de banco de dados onde as informações ficam armazenadas.</li>
        </ul>
        <p className="text-muted">Não vendemos nem compartilhamos seus dados para fins de publicidade.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-3xl">Por quanto tempo guardamos</h2>
        <p className="text-muted">
          Guardamos os dados durante a gestão da chapa atual do D.A. Ao fim da gestão, eles deixam de ser usados e são
          eliminados, salvo quando houver obrigação legal de mantê-los.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-3xl">Seus direitos</h2>
        <p className="text-muted">
          Conforme a LGPD, você pode pedir acesso, correção ou exclusão dos seus dados, quando não houver obrigação de
          guardá-los.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-3xl">Contato</h2>
        <p className="text-muted">
          Para assuntos de privacidade, escreva para{" "}
          <a href="mailto:da.sistemas@fafram.com.br" className="text-accent underline underline-offset-4">
            da.sistemas@fafram.com.br
          </a>
          .
        </p>
      </section>
    </article>
  );
}
