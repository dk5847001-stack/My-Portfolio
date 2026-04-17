import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  ADMIN_APP_NAME,
  APP_NAME,
  DEFAULT_API_URL,
  ROLE_LABELS,
  ROLES,
} from "@portfolio/shared";

const tokenStorageKey = "portfolio-admin-token";

const apiRequest = async (path, options = {}, token) => {
  const response = await fetch(`${DEFAULT_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

function Guard({ session, allowedRoles, children }) {
  if (session.status === "loading") {
    return <p className="text-slate-600">Checking admin session...</p>;
  }

  if (!session.user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(session.user.role)) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Access denied</h2>
        <p className="mt-3 text-slate-600">
          This admin surface is limited to {allowedRoles.map((role) => ROLE_LABELS[role]).join(", ")}.
        </p>
      </section>
    );
  }

  return children;
}

function LoginPage({ onSubmit, busy, error, session }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session.user) {
      navigate("/", { replace: true });
    }
  }, [navigate, session.user]);

  return (
    <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Admin Login</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          Access the control room
        </h1>
        <p className="mt-4 text-slate-600">
          Use a Super Admin, Admin, or Editor account from the shared authentication API.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ email, password });
          }}
        >
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Email</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Password</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white"
            disabled={busy}
          >
            {busy ? "Signing in..." : "Login to admin"}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-amber-200 bg-[linear-gradient(180deg,_rgba(251,191,36,0.22),_rgba(255,255,255,0.96))] p-8">
        <h2 className="text-2xl font-semibold text-slate-950">Who can enter?</h2>
        <div className="mt-6 space-y-3">
          {[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR].map((role) => (
            <div key={role} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="font-medium text-slate-900">{ROLE_LABELS[role]}</p>
              <p className="mt-1 text-sm text-slate-600">API role id: {role}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm leading-7 text-slate-700">
          {APP_NAME} admin workspace shares the same JWT auth backend, but keeps its own
          browser session storage for this origin.
        </p>
      </div>
    </section>
  );
}

function AdminPanel({ title, endpoint, session }) {
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  useEffect(() => {
    let active = true;

    apiRequest(endpoint, {}, session.token)
      .then((data) => {
        if (active) {
          setState({ loading: false, data, error: "" });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ loading: false, data: null, error: error.message });
        }
      });

    return () => {
      active = false;
    };
  }, [endpoint, session.token]);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-4 text-slate-600">
        Signed in as {session.user.name} ({ROLE_LABELS[session.user.role]}).
      </p>
      <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
        {state.loading ? <p>Loading protected admin data...</p> : null}
        {state.error ? <p>{state.error}</p> : null}
        {state.data ? <pre className="overflow-x-auto">{JSON.stringify(state.data, null, 2)}</pre> : null}
      </div>
    </section>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState({
    status: "loading",
    token: window.localStorage.getItem(tokenStorageKey),
    user: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem(tokenStorageKey);

    if (!token) {
      setSession({ status: "ready", token: null, user: null });
      return;
    }

    apiRequest("/auth/me", {}, token)
      .then((data) => setSession({ status: "ready", token, user: data.user }))
      .catch(() => {
        window.localStorage.removeItem(tokenStorageKey);
        setSession({ status: "ready", token: null, user: null });
      });
  }, []);

  const handleLogin = async (form) => {
    try {
      setBusy(true);
      setError("");
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR].includes(payload.user.role)) {
        throw new Error("This account does not have admin workspace access.");
      }

      window.localStorage.setItem(tokenStorageKey, payload.token);
      setSession({ status: "ready", token: payload.token, user: payload.user });
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(tokenStorageKey);
    setSession({ status: "ready", token: null, user: null });
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.25),_transparent_30%),linear-gradient(180deg,_#fff7ed_0%,_#f8fafc_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur">
          <Link to="/" className="font-semibold tracking-[0.2em] uppercase text-slate-900">
            {ADMIN_APP_NAME}
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link to="/" className="rounded-full px-3 py-2 text-slate-700 hover:bg-slate-100">
              Overview
            </Link>
            <Link to="/editor" className="rounded-full px-3 py-2 text-slate-700 hover:bg-slate-100">
              Editor
            </Link>
            <Link to="/admin" className="rounded-full px-3 py-2 text-slate-700 hover:bg-slate-100">
              Admin
            </Link>
            <Link to="/super-admin" className="rounded-full px-3 py-2 text-slate-700 hover:bg-slate-100">
              Super Admin
            </Link>
            {session.user ? (
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 px-4 py-2 text-slate-700"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
                Login
              </Link>
            )}
          </nav>
        </header>

        <Routes>
          <Route
            path="/login"
            element={<LoginPage onSubmit={handleLogin} busy={busy} error={error} session={session} />}
          />
          <Route
            path="/"
            element={
              <Guard
                session={session}
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR]}
              >
                <AdminPanel title="Admin overview" endpoint="/protected/editor" session={session} />
              </Guard>
            }
          />
          <Route
            path="/editor"
            element={
              <Guard
                session={session}
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR]}
              >
                <AdminPanel title="Editor tools" endpoint="/protected/editor" session={session} />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard session={session} allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AdminPanel title="Admin dashboard" endpoint="/protected/admin" session={session} />
              </Guard>
            }
          />
          <Route
            path="/super-admin"
            element={
              <Guard session={session} allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminPanel
                  title="Super admin dashboard"
                  endpoint="/protected/super-admin"
                  session={session}
                />
              </Guard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}
