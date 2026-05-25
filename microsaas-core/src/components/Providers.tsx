"use client";

import { SessionProvider } from "@/contexts/SessionContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ErrorBoundary>
  );
}
