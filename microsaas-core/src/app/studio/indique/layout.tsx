import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indique & Ganhe | Studio Sualuma",
  description:
    "Supervisor inteligente de indicações — acompanhamento de indicações ativas, detecção de gargalos, sugestão de prioridades.",
};

export default function IndiqueLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
