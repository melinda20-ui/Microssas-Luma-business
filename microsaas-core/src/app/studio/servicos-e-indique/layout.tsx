import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serviços & Indique | Studio Sualuma",
  description:
    "Agente especialista TDAH — organização visual, destaques de prioridade, sugestões de foco e ações rápidas.",
};

export default function ServicosIndiqueLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
