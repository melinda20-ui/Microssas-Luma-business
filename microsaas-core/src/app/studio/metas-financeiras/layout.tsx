import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metas Financeiras | Studio Sualuma",
  description:
    "Agente financeiro inteligente — receita, metas, oportunidades, relatórios e integração com conteúdo.",
};

export default function MetasFinanceirasLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
