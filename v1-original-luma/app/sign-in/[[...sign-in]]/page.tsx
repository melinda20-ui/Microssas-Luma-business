import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050507] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-2 shadow-[0_0_40px_rgba(122,0,255,0.08)] backdrop-blur-xl">
          <SignIn />
        </div>
      </div>
    </main>
  );
}
