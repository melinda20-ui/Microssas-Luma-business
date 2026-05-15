import StudioSidebar from "@/components/studio/StudioSidebar";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 80px)", paddingTop: 80 }}>
      <StudioSidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
