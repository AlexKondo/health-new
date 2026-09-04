import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://escolasaude.com.br"),
  title: {
    default: "Escola Saúde — Educação Infantil e Fundamental I | Vila Clementino",
    template: "%s | Escola Saúde",
  },
  description:
    "Desde 1993, a Escola Saúde oferece educação infantil e ensino fundamental I com afeto, valores e ensino de qualidade na Vila Clementino, São Paulo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
