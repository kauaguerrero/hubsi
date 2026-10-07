# Checklist de testes no sandbox do Asaas

Pré-requisitos: `ASAAS_API_KEY` do **sandbox**, `ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3`, `ASAAS_WEBHOOK_TOKEN`, `CRON_SECRET` e `RESEND_API_KEY`/`EMAIL_FROM` configurados; webhook cadastrado no painel do sandbox apontando para a URL pública (em dev, use um túnel como ngrok/cloudflared); migrations e seed aplicados; lote aberto com produto.

Marque cada item ao testar. Registre falhas em `PROGRESS.md` > Bloqueios.

## 1. Pix pago

- [ ] Adicione um produto ao carrinho e finalize o checkout (dados válidos, aceite de privacidade).
- [ ] Você é redirecionado para `/pedido/HSI-XXXXXX?novo=1`; o carrinho esvazia; o pedido está **Aguardando pagamento**.
- [ ] A página mostra QR Code Pix e o "copia e cola" com botão de copiar.
- [ ] No sandbox do Asaas, simule o pagamento Pix da cobrança.
- [ ] Em até ~5 s a página do pedido muda sozinha para **Pago** (polling) e `pago_em`/`forma_pagamento = pix` ficam gravados.
- [ ] Chegou o e-mail "Pagamento confirmado — pedido HSI-XXXXXX" (código, itens, total, retirada).
- [ ] Em `webhook_eventos` há o evento com `resultado = processado: aguardando_pagamento → pago`.

## 2. Cartão pago

- [ ] Finalize um pedido de produtos que aceitam cartão; a página mostra o botão para o link da fatura (`invoiceUrl`).
- [ ] Pague com um cartão de teste do sandbox (ver documentação do Asaas).
- [ ] O pedido vira **Pago** com `forma_pagamento = cartao`; o e-mail é enviado **uma única vez** (mesmo recebendo `PAYMENT_CONFIRMED` e depois `PAYMENT_RECEIVED`).

## 3. Cobrança vencida

- [ ] Crie um pedido e deixe vencer (ou altere o vencimento da cobrança no sandbox / dispare `PAYMENT_OVERDUE`).
- [ ] O pedido vira **Expirado**.
- [ ] Feche o lote no painel e execute o cron manualmente:
      `curl -H "Authorization: Bearer $CRON_SECRET" https://SEU-DOMINIO/api/cron/expirar-pedidos`
      — pedidos aguardando do lote fechado ficam **Expirados** e as cobranças são canceladas no Asaas. Sem o header (ou com token errado) a resposta é **401**.

## 4. Estorno

- [ ] Estorne no sandbox um pedido já pago.
- [ ] O pedido vira **Estornado**.
- [ ] Estornar um pedido já **Retirado** não altera o status (transição ignorada e registrada em `webhook_eventos.resultado`).

## 5. Webhook repetido

- [ ] Reenvie o mesmo evento pelo painel do Asaas (ou reenvie o mesmo payload com `curl` usando o token correto).
- [ ] Resposta **200**, nenhum efeito novo, sem segundo e-mail; `webhook_eventos` continua com **uma** linha para o `id` do evento.

## 6. Webhook sem token

- [ ] `curl -X POST https://SEU-DOMINIO/api/webhooks/asaas -H "content-type: application/json" -d '{"id":"x","event":"PAYMENT_RECEIVED"}'` → **401**.
- [ ] Com token errado no header `asaas-access-token` → **401**.
- [ ] Nenhuma linha nova em `webhook_eventos`.

## 7. Extras

- [ ] Preço adulterado: no navegador, altere o preço no `sessionStorage` (`hubsi:carrinho`) e finalize; o valor da cobrança no Asaas é o do banco.
- [ ] Lote fechado: após fechar o lote, `/loja` mostra o aviso e `/checkout` recusa o pedido.
- [ ] Rate limit: 6 pedidos em 10 min do mesmo IP → mensagem de "muitas tentativas".
- [ ] `/meus-pedidos`: e-mail + código corretos levam ao pedido; qualquer combinação errada mostra a mesma mensagem genérica.
- [ ] Cancelar pedido no painel (não pago): a cobrança some no Asaas e o pedido fica **Cancelado**; pedidos pagos não oferecem "cancelar".
- [ ] CSV da gráfica (`/admin/grafica`) abre sem colunas de CPF/e-mail/WhatsApp.
