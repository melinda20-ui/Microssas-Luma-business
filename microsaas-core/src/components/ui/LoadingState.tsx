export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#04040f] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="shimmer h-10 w-64 rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer h-32 rounded-3xl" />
          ))}
        </div>
        <div className="shimmer h-64 rounded-[40px]" />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shimmer h-20 rounded-2xl" />
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="shimmer h-28 rounded-3xl" />
      ))}
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#04040f] text-white flex items-center justify-center p-8">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 max-w-md w-full backdrop-blur-xl text-center">
        <div className="text-5xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold font-outfit mb-3">Acesso Restrito</h2>
        <p className="text-white/50 text-sm mb-6">Faça login para acessar esta página.</p>
        <a href="/login" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
          Fazer Login
        </a>
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-12 text-center backdrop-blur-xl">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {description && <p className="text-white/40 text-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
