import type { Metadata } from "next";
import { LogoHubSI } from "@/components/brand/logo-hub-si";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { erro } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-4 py-12">
      <LogoHubSI />
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl">Painel do D.A.</h1>
        <p className="text-muted">Entre com seu e-mail e senha.</p>
      </div>
      {erro === "link" && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">
          Link inválido ou expirado. Solicite um novo.
        </p>
      )}
      <LoginForm />
    </main>
  );
}
