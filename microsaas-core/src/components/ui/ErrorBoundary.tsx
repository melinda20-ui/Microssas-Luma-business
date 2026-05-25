"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-[#04040f] text-white flex items-center justify-center p-8">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 max-w-lg w-full backdrop-blur-xl text-center">
            <div className="text-5xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold font-outfit mb-3">Algo deu errado</h2>
            <p className="text-white/50 text-sm mb-6">
              {this.state.error?.message || "Ocorreu um erro inesperado."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
