import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

// Dados públicos (gestão ativa etc.) são revalidados a cada 5 minutos.
export const revalidate = 300;

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
