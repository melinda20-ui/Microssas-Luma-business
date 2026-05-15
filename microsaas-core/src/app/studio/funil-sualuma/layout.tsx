import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funil Sualuma | Studio Sualuma",
  description:
    "Central de coordenacao multigentes — diagnostico estrategico unificado com Financeiro, UX, Marketing e Google Intelligence.",
};

export default function FunilSualumaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
