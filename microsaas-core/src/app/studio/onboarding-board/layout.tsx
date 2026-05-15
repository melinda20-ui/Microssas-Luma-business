import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding Board | Studio Sualuma",
  description:
    "Agente UX para onboarding — progresso, etapas concluídas, detecção de abandonos e sugestões de melhoria.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
