import type { Metadata } from "next";
import { ConsultaPedidoForm } from "@/components/loja/consulta-pedido-form";

export const metadata: Metadata = { title: "Meus pedidos", robots: { index: false } };

export default function MeusPedidosPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-5xl uppercase sm:text-6xl">Meus pedidos</h1>
        <p className="max-w-xl text-muted">
          Informe o e-mail usado na compra e o código do pedido (começa com HSI-) para acompanhar o status.
        </p>
      </header>
      <ConsultaPedidoForm />
    </div>
  );
}
