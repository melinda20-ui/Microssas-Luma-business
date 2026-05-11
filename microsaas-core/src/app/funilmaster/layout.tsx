import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funil Master | Studio Luma",
  description:
    "A jornada completa do lead: da prospecção à fidelização. Mapa mental interativo, canvas do negócio e simulador SWOT.",
};

export default function FunilMasterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
