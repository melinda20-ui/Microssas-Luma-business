import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign Agent | Studio Sualuma",
  description:
    "Gerenciamento de campanhas com fluxo de aprovacao PENDING → REVIEW → APPROVED → EXECUTING → COMPLETED.",
};

export default function CampaignAgentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
