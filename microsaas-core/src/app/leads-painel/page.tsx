'use client';

export const dynamic = 'force-dynamic';

import LeadsClient from './components/LeadsClient';

export default function MyUserPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <LeadsClient />
    </main>
  );
}

