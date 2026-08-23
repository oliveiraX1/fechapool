import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FechaPool | Recupere orçamentos antes que esfriem",
  description:
    "Organize follow-ups, retome clientes no momento certo e acompanhe quanto faturamento sua empresa de piscinas recuperou.",
  applicationName: "FechaPool",
  keywords: [
    "follow-up de vendas",
    "orçamentos de piscinas",
    "gestão comercial",
    "vendas de piscinas",
  ],
  authors: [{ name: "FechaPool" }],
  creator: "FechaPool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}