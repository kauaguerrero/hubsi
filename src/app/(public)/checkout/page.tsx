import type { Metadata } from "next";
import { CheckoutForm } from "@/components/loja/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-5xl uppercase sm:text-6xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
