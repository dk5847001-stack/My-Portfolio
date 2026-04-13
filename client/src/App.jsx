import { APP_NAME, CLIENT_APP_NAME, DEFAULT_API_URL } from "@portfolio/shared";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl shadow-slate-950/30">
        <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm tracking-[0.3em] text-emerald-300 uppercase">
          Phase 1 Ready
        </span>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">{CLIENT_APP_NAME}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            {APP_NAME} ke liye React workspace scaffold ho gaya hai. Existing portfolio UI
            ko touch nahi kiya gaya hai, taaki aage ki phases me same styling ke saath
            migration ho sake.
          </p>
        </div>
        <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <h2 className="text-lg font-medium text-white">Frontend</h2>
            <p className="mt-2">React + Vite + Tailwind setup complete.</p>
          </section>
          <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <h2 className="text-lg font-medium text-white">API</h2>
            <p className="mt-2">Backend base URL: {DEFAULT_API_URL}</p>
          </section>
        </div>
      </div>
    </main>
  );
}

