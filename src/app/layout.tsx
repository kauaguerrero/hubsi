import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { ConsoleBoasVindas } from "@/components/brand/console-boas-vindas";
import { publicEnv } from "@/lib/env";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  themeColor: "#0a1628",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <ConsoleBoasVindas />
      </body>
    </html>
  );
}
