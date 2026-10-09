import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { erro } = await searchParams;

  return (
    <main className="relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-[#12122A]">
      <Image
        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=70"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-60"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#12122A]/70 via-[#12122A]/60 to-[#12122A]/90" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
        <span className="fade-slide-in-1 inline-flex items-center gap-2.5">
          <Image src="/logo-si.png" alt="" width={160} height={160} className="size-10 rounded-full shadow-sm" />
          <span className="font-display text-2xl leading-none font-extrabold tracking-tight text-white">
            Hub <span className="text-gradient">S.I.</span>
          </span>
        </span>
        <Link
          href="/"
          className="fade-slide-in-1 inline-flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/15 hover:text-white"
        >
          ← Voltar ao site
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 py-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="fade-slide-in-1 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur">
            <span className="bg-white/90 text-fg rounded-full px-2 py-0.5 text-xs font-medium">Restrito</span>
            <span className="text-sm font-medium text-white/90">Área do D.A.</span>
          </div>
          <h1 className="fade-slide-in-2 text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl">
            Painel do <span className="text-gradient">D.A.</span>
          </h1>
          <p className="fade-slide-in-3 text-white/80">Entre com seu e-mail e senha.</p>
        </div>

        <div className="fade-slide-in-4 bg-surface/95 shadow-pop flex flex-col gap-5 rounded-3xl p-6 ring-1 ring-white/20 backdrop-blur sm:p-8">
          {erro === "link" && (
            <p role="alert" className="border-danger text-danger rounded-lg border px-4 py-3">
              Link inválido ou expirado. Solicite um novo.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
