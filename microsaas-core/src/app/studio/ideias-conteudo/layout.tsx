import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideias de Conteúdo | Studio Sualuma",
  description:
    "Transforme lacunas financeiras em pautas de conteúdo — aquisição, conversão, retenção e upgrade.",
};

export default function IdeiasConteudoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
