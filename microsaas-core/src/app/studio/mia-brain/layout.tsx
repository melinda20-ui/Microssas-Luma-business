import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mia Brain | Studio Sualuma",
  description:
    "Central operacional multagentes — tarefas, aprovações e chat com Mia e agentes especialistas.",
};

export default function MiaBrainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
