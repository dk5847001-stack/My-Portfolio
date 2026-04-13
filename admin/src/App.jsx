import { ADMIN_APP_NAME, APP_NAME } from "@portfolio/shared";

export default function App() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-10 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          Admin Workspace
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{ADMIN_APP_NAME}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {APP_NAME} ke liye admin panel ka separate React workspace ready hai. Yahan aage
          dashboard, content management aur API integration add ki ja sakti hai.
        </p>
      </div>
    </main>
  );
}

