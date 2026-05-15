import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Lab | Sualuma",
  description:
    "Painel ao vivo do Studio Sualuma — status do sistema, perfil do usuário e agentes de IA em tempo real.",
};

export default function StudioLabLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
