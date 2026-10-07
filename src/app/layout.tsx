import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { ConsoleBoasVindas } from "@/components/brand/console-boas-vindas";
import { publicEnv } from "@/lib/env";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: "Hub S.I.", template: "%s | Hub S.I." },
  description:
    "Hub do D.A. de Sistemas de Informação da FAFRAM: loja de produtos do curso, eventos e comunidade.",
  openGraph: { siteName: "Hub S.I.", locale: "pt_BR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f8f8fc",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <ConsoleBoasVindas />
      </body>
    </html>
  );
}
