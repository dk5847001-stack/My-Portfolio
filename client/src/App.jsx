import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  APP_NAME,
  CLIENT_APP_NAME,
  DEFAULT_API_URL,
  ROLE_LABELS,
  ROLE_ORDER,
  ROLES,
} from "@portfolio/shared";

const tokenStorageKey = "portfolio-client-token";

const routeGroups = [
  {
    title: "Everyone",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.USER],
    to: "/dashboard",
  },
  {
    title: "Editor+",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR],
    to: "/editor",
  },
  {
    title: "Admin+",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    to: "/admin",
  },
  {
    title: "Super Admin",
    roles: [ROLES.SUPER_ADMIN],
    to: "/super-admin",
  },
];

const readToken = () => window.localStorage.getItem(tokenStorageKey);

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

function ScreenMessage({ title, message }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl shadow-slate-950/40">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-slate-300">{message}</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-200"
      >
        Back home
      </Link>
    </div>
  );
}

function ProtectedRoute({ session, allowedRoles, children }) {
  const location = useLocation();

  if (session.status === "loading") {
    return <ScreenMessage title="Checking session" message="Please wait a moment." />;
  }

  if (!session.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return (
      <ScreenMessage
        title="Access denied"
        message={`This area requires ${allowedRoles
          .map((role) => ROLE_LABELS[role])
          .join(", ")} access.`}
      />
    );
  }

  return children;
}

function AuthPage({ mode, onSubmit, busy, error, session }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const isRegister = mode === "register";

  useEffect(() => {
    if (session.user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session.user]);

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
          {isRegister ? "Register" : "Login"}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-4 max-w-xl text-slate-300">
          JWT auth, bcrypt-hashed passwords, and role-aware route access are now part of
          the client workspace.
        </p>

        <form className="mt-8 space-y-4" onSubmit={submit}>
          {isRegister ? (
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Full name</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Aarav Sharma"
                required
              />
            </label>
          ) : null}
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="At least 8 characters"
              required
            />
          </label>
          {error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
            disabled={busy}
          >
            {busy ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 via-slate-900/70 to-emerald-400/10 p-8">
        <h2 className="text-2xl font-semibold text-white">Route access matrix</h2>
        <div className="mt-6 space-y-3">
          {routeGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-white">{group.title}</span>
                <span className="text-sm text-cyan-200">{group.to}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {group.roles.map((role) => ROLE_LABELS[role]).join(", ")}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-300">
          First registered user automatically becomes Super Admin. All later signups get
          the User role by default.
        </p>
        <div className="mt-6 flex gap-3 text-sm">
          <Link to="/register" className="rounded-full border border-white/15 px-4 py-2 text-white">
            Register
          </Link>
          <Link to="/login" className="rounded-full border border-cyan-300/40 px-4 py-2 text-cyan-200">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

function Dashboard({ session, title, endpoint, caption }) {
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
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">{caption}</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-slate-300">
          Signed in as {session.user.name} ({ROLE_LABELS[session.user.role]}).
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        {state.loading ? <p className="text-slate-300">Loading protected data...</p> : null}
        {state.error ? (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {state.error}
          </p>
        ) : null}
        {state.data ? (
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
            {JSON.stringify(state.data, null, 2)}
          </pre>
        ) : null}
      </div>
    </section>
  );
}

function Home({ session }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Phase 2</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          {CLIENT_APP_NAME}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          {APP_NAME} frontend now includes register/login flows, JWT session persistence,
          bcrypt-backed credentials on the API, and protected routes for every role tier.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={session.user ? "/dashboard" : "/register"}
            className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950"
          >
            {session.user ? "Open dashboard" : "Start with register"}
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-white/15 px-5 py-3 font-semibold text-white"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-500/10 p-8">
        <h2 className="text-2xl font-semibold text-white">Active role ladder</h2>
        <div className="mt-6 space-y-3">
          {ROLE_ORDER.map((role) => (
            <div key={role} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">{ROLE_LABELS[role]}</p>
              <p className="mt-1 text-sm text-slate-300">Internal id: {role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState({
    status: "loading",
    token: readToken(),
    user: null,
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setSession({ status: "ready", token: null, user: null });
      return;
    }

    apiRequest("/auth/me", {}, token)
      .then((data) => {
        setSession({ status: "ready", token, user: data.user });
      })
      .catch(() => {
        window.localStorage.removeItem(tokenStorageKey);
        setSession({ status: "ready", token: null, user: null });
      });
  }, []);

  const completeAuth = (payload) => {
    window.localStorage.setItem(tokenStorageKey, payload.token);
    setSession({ status: "ready", token: payload.token, user: payload.user });
    setAuthError("");
    navigate("/dashboard", { replace: true });
  };

  const handleRegister = async (form) => {
    try {
      setAuthBusy(true);
      setAuthError("");
      const payload = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      completeAuth(payload);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogin = async (form) => {
    try {
      setAuthBusy(true);
      setAuthError("");
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      completeAuth(payload);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(tokenStorageKey);
    setSession({ status: "ready", token: null, user: null });
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-slate-950/60 px-6 py-4 backdrop-blur">
          <Link to="/" className="font-semibold tracking-[0.2em] text-cyan-200 uppercase">
            {CLIENT_APP_NAME}
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <Link to="/" className="rounded-full px-3 py-2 hover:bg-white/5">
              Home
            </Link>
            <Link to="/dashboard" className="rounded-full px-3 py-2 hover:bg-white/5">
              Dashboard
            </Link>
            <Link to="/editor" className="rounded-full px-3 py-2 hover:bg-white/5">
              Editor
            </Link>
            <Link to="/admin" className="rounded-full px-3 py-2 hover:bg-white/5">
              Admin
            </Link>
            <Link to="/super-admin" className="rounded-full px-3 py-2 hover:bg-white/5">
              Super Admin
            </Link>
            {session.user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-rose-300/25 px-4 py-2 text-rose-200"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded-full border border-cyan-300/30 px-4 py-2 text-cyan-200">
                Login
              </Link>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home session={session} />} />
          <Route
            path="/register"
            element={
              <AuthPage
                mode="register"
                onSubmit={handleRegister}
                busy={authBusy}
                error={authError}
                session={session}
              />
            }
          />
          <Route
            path="/login"
            element={
              <AuthPage
                mode="login"
                onSubmit={handleLogin}
                busy={authBusy}
                error={authError}
                session={session}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                session={session}
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.USER]}
              >
                <Dashboard
                  session={session}
                  title="User dashboard"
                  caption="Protected profile route"
                  endpoint="/protected/profile"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute
                session={session}
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR]}
              >
                <Dashboard
                  session={session}
                  title="Editor workspace"
                  caption="Editor-level access"
                  endpoint="/protected/editor"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                session={session}
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}
              >
                <Dashboard
                  session={session}
                  title="Admin control center"
                  caption="Admin-only route"
                  endpoint="/protected/admin"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute session={session} allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Dashboard
                  session={session}
                  title="Super admin control room"
                  caption="Highest privilege route"
                  endpoint="/protected/super-admin"
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}
