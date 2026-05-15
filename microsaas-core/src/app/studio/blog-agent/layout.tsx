import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Agent | Studio Sualuma",
  description:
    "Agente de copy + publicacao — crie artigos de 1000 palavras, revise, agende e publique com aprovacao.",
};

export default function BlogAgentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
