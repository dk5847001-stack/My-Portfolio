import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ADMIN_APP_NAME, DEFAULT_API_URL, ROLE_LABELS, ROLES } from "@portfolio/shared";

const tokenStorageKey = "portfolio-admin-token";
const allowedAdminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR];
const canManageUsers = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

const navItems = [
  { to: "/", label: "Overview", roles: allowedAdminRoles },
  { to: "/users", label: "Users", roles: canManageUsers },
  { to: "/projects", label: "Projects", roles: allowedAdminRoles },
  { to: "/blogs", label: "Blogs", roles: allowedAdminRoles },
  { to: "/ai", label: "AI Lab", roles: allowedAdminRoles },
  { to: "/messages", label: "Messages", roles: allowedAdminRoles },
  { to: "/profile", label: "Profile", roles: allowedAdminRoles },
  { to: "/media", label: "Media", roles: allowedAdminRoles },
  { to: "/settings", label: "Theme & SEO", roles: canManageUsers },
];

const emptyProject = {
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  description: "",
  techStack: "",
  projectUrl: "",
  repositoryUrl: "",
  featured: false,
  published: false,
};

const emptyBlog = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  status: "draft",
  readTimeMinutes: 5,
};

const emptyDraftRequest = {
  topic: "",
  keywords: "",
  tone: "professional",
};

const emptySeoRequest = {
  title: "",
  description: "",
  content: "",
  keywords: "",
};

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: ROLES.USER,
};

const emptySettings = {
  siteName: "",
  siteUrl: "",
  supportEmail: "",
  contactPhone: "",
  maintenanceMode: false,
  allowRegistrations: true,
  defaultSeo: {
    title: "",
    description: "",
    keywords: [],
  },
  branding: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "",
  },
};

const emptyPortfolio = {
  heroTitle: "",
  heroSubtitle: "",
  bio: "",
  location: "",
  email: "",
  phone: "",
  resumeUrl: "",
  skills: [],
};

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
    return <div className="panel-card">Checking admin session...</div>;
  }

  if (!session.user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(session.user.role)) {
    return (
      <section className="panel-card">
        <p className="eyebrow">Access restricted</p>
        <h2>This section is not available for your role.</h2>
        <p className="muted">
          Your current role is {ROLE_LABELS[session.user.role]}. Switch to an Admin or
          Super Admin account if you need broader control.
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
    <div className="auth-layout">
      <section className="auth-card">
        <p className="eyebrow">Admin Login</p>
        <h1>Control the portfolio system from one place.</h1>
        <p className="muted">
          Sign in with an Editor, Admin, or Super Admin account to manage content,
          messages, branding, and account data.
        </p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ email, password });
          }}
        >
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="error-banner">{error}</p> : null}
          <button type="submit" className="solid-button" disabled={busy}>
            {busy ? "Signing in..." : "Enter dashboard"}
          </button>
        </form>
      </section>

      <section className="auth-card auth-aside">
        <p className="eyebrow">Includes</p>
        <ul className="simple-list">
          <li>Manage users and roles</li>
          <li>Edit projects and blogs</li>
          <li>Review contact messages</li>
          <li>Update profile content</li>
          <li>Media previews and upload staging</li>
          <li>Theme and SEO settings</li>
        </ul>
      </section>
    </div>
  );
}

function AppShell({ session, logout }) {
  const visibleNavItems = navItems.filter((item) => item.roles.includes(session.user.role));

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h2>{ADMIN_APP_NAME}</h2>
          <p className="muted">
            Signed in as {session.user.name} ({ROLE_LABELS[session.user.role]})
          </p>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => (
            <SidebarLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <button type="button" onClick={logout} className="ghost-button">
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<OverviewPage session={session} />} />
          <Route
            path="/users"
            element={
              <Guard session={session} allowedRoles={canManageUsers}>
                <UsersPage session={session} />
              </Guard>
            }
          />
          <Route
            path="/projects"
            element={
              <Guard session={session} allowedRoles={allowedAdminRoles}>
                <ProjectsPage session={session} />
              </Guard>
            }
          />
          <Route
            path="/blogs"
            element={
              <Guard session={session} allowedRoles={allowedAdminRoles}>
                <BlogsPage session={session} />
              </Guard>
            }
          />
          <Route
            path="/ai"
            element={
              <Guard session={session} allowedRoles={allowedAdminRoles}>
                <AiLabPage session={session} />
              </Guard>
            }
          />
          <Route
            path="/messages"
            element={
              <Guard session={session} allowedRoles={allowedAdminRoles}>
                <MessagesPage session={session} />
              </Guard>
            }
          />
          <Route
            path="/profile"
            element={
              <Guard session={session} allowedRoles={allowedAdminRoles}>
                <ProfilePage session={session} />
              </Guard>
            }
          />
          <Route
            path="/media"
            element={
              <Guard session={session} allowedRoles={allowedAdminRoles}>
                <MediaPage />
              </Guard>
            }
          />
          <Route
            path="/settings"
            element={
              <Guard session={session} allowedRoles={canManageUsers}>
                <SettingsPage session={session} />
              </Guard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function SidebarLink({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className={`sidebar-link${active ? " active" : ""}`}>
      {label}
    </Link>
  );
}

function OverviewPage({ session }) {
  const [overview, setOverview] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let active = true;

    Promise.all([
      apiRequest("/users", {}, session.token).catch(() => ({ users: [] })),
      apiRequest("/projects", {}, session.token).catch(() => ({ projects: [] })),
      apiRequest("/blogs", {}, session.token).catch(() => ({ blogs: [] })),
      apiRequest("/messages", {}, session.token).catch(() => ({ messages: [] })),
    ])
      .then(([users, projects, blogs, messages]) => {
        if (!active) {
          return;
        }

        setOverview({
          loading: false,
          error: "",
          data: {
            users: users.users?.length || 0,
            projects: projects.projects?.length || 0,
            blogs: blogs.blogs?.length || 0,
            messages: messages.messages?.length || 0,
          },
        });
      })
      .catch((error) => {
        if (active) {
          setOverview({ loading: false, error: error.message, data: null });
        }
      });

    return () => {
      active = false;
    };
  }, [session.token]);

  return (
    <section className="page-stack">
      <div className="hero-strip">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Everything you need to run the portfolio in one dashboard.</h1>
          <p className="muted">
            Monitor content, update profile data, review inbound leads, and control
            theme-level settings from a single workspace.
          </p>
        </div>
      </div>

      {overview.error ? <p className="error-banner">{overview.error}</p> : null}

      <div className="stat-grid">
        {[
          ["Users", overview.data?.users],
          ["Projects", overview.data?.projects],
          ["Blogs", overview.data?.blogs],
          ["Messages", overview.data?.messages],
        ].map(([label, value]) => (
          <article key={label} className="panel-card stat-card">
            <span>{label}</span>
            <strong>{overview.loading ? "..." : value}</strong>
          </article>
        ))}
      </div>

      <div className="panel-grid">
        <article className="panel-card">
          <p className="eyebrow">Quick actions</p>
          <ul className="simple-list">
            <li>Create a featured project</li>
            <li>Publish a new blog post</li>
            <li>Generate an AI blog draft and SEO meta</li>
            <li>Review unread messages</li>
            <li>Refresh brand colors and SEO meta</li>
          </ul>
        </article>
        <article className="panel-card">
          <p className="eyebrow">Current access</p>
          <h3>{ROLE_LABELS[session.user.role]}</h3>
          <p className="muted">
            Editors can manage content and messages. Admins and Super Admins can also
            control users and settings.
          </p>
        </article>
      </div>
    </section>
  );
}

function UsersPage({ session }) {
  const [state, setState] = useState({ loading: true, error: "", users: [] });
  const [form, setForm] = useState(emptyUser);
  const [busy, setBusy] = useState(false);

  const loadUsers = async () => {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const data = await apiRequest("/users", {}, session.token);
      setState({ loading: false, error: "", users: data.users || [] });
    } catch (error) {
      setState({ loading: false, error: error.message, users: [] });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await apiRequest(
        "/users",
        { method: "POST", body: JSON.stringify(form) },
        session.token
      );
      setForm(emptyUser);
      await loadUsers();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page-stack">
      <PanelHeader title="Manage Users" text="Create accounts, review roles, and monitor access." />
      {state.error ? <p className="error-banner">{state.error}</p> : null}
      <div className="panel-grid">
        <form className="panel-card stack" onSubmit={createUser}>
          <p className="eyebrow">Create user</p>
          <TextFields form={form} setForm={setForm} fields={[
            ["name", "Name"],
            ["email", "Email"],
            ["password", "Password"],
          ]} />
          <label className="field">
            <span>Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {Object.values(ROLES).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="solid-button" disabled={busy}>
            {busy ? "Creating..." : "Create user"}
          </button>
        </form>

        <div className="panel-card">
          <p className="eyebrow">Accounts</p>
          <DataTable
            loading={state.loading}
            emptyMessage="No users available."
            columns={["Name", "Email", "Role"]}
            rows={state.users.map((user) => [user.name, user.email, ROLE_LABELS[user.role]])}
          />
        </div>
      </div>
    </section>
  );
}

function ProjectsPage({ session }) {
  const [state, setState] = useState({ loading: true, error: "", projects: [] });
  const [form, setForm] = useState(emptyProject);
  const [busy, setBusy] = useState(false);

  const loadProjects = async () => {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const data = await apiRequest("/projects", {}, session.token);
      setState({ loading: false, error: "", projects: data.projects || [] });
    } catch (error) {
      setState({ loading: false, error: error.message, projects: [] });
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await apiRequest(
        "/projects",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            techStack: form.techStack.split(",").map((item) => item.trim()).filter(Boolean),
          }),
        },
        session.token
      );
      setForm(emptyProject);
      await loadProjects();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page-stack">
      <PanelHeader title="Manage Projects" text="Publish case studies, feature highlights, and live links." />
      {state.error ? <p className="error-banner">{state.error}</p> : null}
      <div className="panel-grid">
        <form className="panel-card stack" onSubmit={submit}>
          <p className="eyebrow">New project</p>
          <TextFields form={form} setForm={setForm} fields={[
            ["title", "Title"],
            ["slug", "Slug"],
            ["category", "Category"],
            ["projectUrl", "Project URL"],
            ["repositoryUrl", "Repository URL"],
          ]} />
          <label className="field">
            <span>Excerpt</span>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows="3" />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="5" />
          </label>
          <label className="field">
            <span>Tech stack</span>
            <input
              value={form.techStack}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
              placeholder="React, Node, MongoDB"
            />
          </label>
          <div className="switch-row">
            <label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
            <label><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
          </div>
          <button type="submit" className="solid-button" disabled={busy}>
            {busy ? "Saving..." : "Create project"}
          </button>
        </form>

        <div className="panel-card">
          <p className="eyebrow">Project library</p>
          <DataTable
            loading={state.loading}
            emptyMessage="No projects yet."
            columns={["Title", "Category", "State"]}
            rows={state.projects.map((item) => [
              item.title,
              item.category || "General",
              `${item.published ? "Published" : "Draft"}${item.featured ? " / Featured" : ""}`,
            ])}
          />
        </div>
      </div>
    </section>
  );
}

function BlogsPage({ session }) {
  const [state, setState] = useState({ loading: true, error: "", blogs: [] });
  const [form, setForm] = useState(emptyBlog);
  const [busy, setBusy] = useState(false);
  const [helperState, setHelperState] = useState({ busy: false, message: "", error: "" });

  const loadBlogs = async () => {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const data = await apiRequest("/blogs", {}, session.token);
      setState({ loading: false, error: "", blogs: data.blogs || [] });
    } catch (error) {
      setState({ loading: false, error: error.message, blogs: [] });
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await apiRequest(
        "/blogs",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
          }),
        },
        session.token
      );
      setForm(emptyBlog);
      await loadBlogs();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    } finally {
      setBusy(false);
    }
  };

  const generateDraft = async () => {
    try {
      setHelperState({ busy: true, message: "", error: "" });
      const data = await apiRequest(
        "/smart/blog-draft",
        {
          method: "POST",
          body: JSON.stringify({
            topic: form.title || form.slug || "Portfolio systems",
            keywords: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
            tone: "professional",
          }),
        },
        session.token
      );
      setForm((current) => ({
        ...current,
        ...data.draft,
        tags: (data.draft.tags || []).join(", "),
      }));
      setHelperState({ busy: false, message: "AI draft inserted into the form.", error: "" });
    } catch (error) {
      setHelperState({ busy: false, message: "", error: error.message });
    }
  };

  const generateSeo = async () => {
    try {
      setHelperState({ busy: true, message: "", error: "" });
      const data = await apiRequest(
        "/smart/seo",
        {
          method: "POST",
          body: JSON.stringify({
            title: form.title,
            description: form.excerpt,
            content: form.content,
            keywords: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
          }),
        },
        session.token
      );
      setHelperState({
        busy: false,
        message: `SEO ready: ${data.seo.title}`,
        error: "",
      });
    } catch (error) {
      setHelperState({ busy: false, message: "", error: error.message });
    }
  };

  return (
    <section className="page-stack">
      <PanelHeader title="Manage Blogs" text="Draft, publish, and organize thought pieces or announcements." />
      {state.error ? <p className="error-banner">{state.error}</p> : null}
      {helperState.error ? <p className="error-banner">{helperState.error}</p> : null}
      {helperState.message ? <p className="success-banner">{helperState.message}</p> : null}
      <div className="panel-grid">
        <form className="panel-card stack" onSubmit={submit}>
          <p className="eyebrow">New blog</p>
          <TextFields form={form} setForm={setForm} fields={[
            ["title", "Title"],
            ["slug", "Slug"],
            ["tags", "Tags"],
          ]} />
          <label className="field">
            <span>Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="field">
            <span>Excerpt</span>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows="3" />
          </label>
          <label className="field">
            <span>Content</span>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows="6" />
          </label>
          <div className="button-row">
            <button type="button" className="ghost-button" onClick={generateDraft} disabled={busy || helperState.busy}>
              {helperState.busy ? "Working..." : "Generate draft"}
            </button>
            <button type="button" className="ghost-button" onClick={generateSeo} disabled={busy || helperState.busy}>
              Generate SEO
            </button>
          </div>
          <button type="submit" className="solid-button" disabled={busy}>
            {busy ? "Saving..." : "Create blog"}
          </button>
        </form>

        <div className="panel-card">
          <p className="eyebrow">Blog library</p>
          <DataTable
            loading={state.loading}
            emptyMessage="No blogs yet."
            columns={["Title", "Status", "Author"]}
            rows={state.blogs.map((blog) => [
              blog.title,
              blog.status,
              blog.author?.name || "Current user",
            ])}
          />
        </div>
      </div>
    </section>
  );
}

function MessagesPage({ session }) {
  const [state, setState] = useState({ loading: true, error: "", messages: [] });

  const loadMessages = async () => {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const data = await apiRequest("/messages", {}, session.token);
      setState({ loading: false, error: "", messages: data.messages || [] });
    } catch (error) {
      setState({ loading: false, error: error.message, messages: [] });
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markReplied = async (messageId) => {
    try {
      await apiRequest(
        `/messages/${messageId}`,
        { method: "PATCH", body: JSON.stringify({ status: "replied", statusNote: "Reviewed in admin dashboard" }) },
        session.token
      );
      await loadMessages();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  };

  return (
    <section className="page-stack">
      <PanelHeader title="Messages Viewer" text="Read incoming inquiries and update their response state." />
      {state.error ? <p className="error-banner">{state.error}</p> : null}
      <div className="message-list">
        {state.loading ? <div className="panel-card">Loading messages...</div> : null}
        {!state.loading && state.messages.length === 0 ? (
          <div className="panel-card">No messages available.</div>
        ) : null}
        {state.messages.map((message) => (
          <article key={message.id} className="panel-card">
            <div className="row-between">
              <div>
                <h3>{message.subject || "New inquiry"}</h3>
                <p className="muted">
                  {message.name} | {message.email}
                </p>
              </div>
              <div className="chip-row">
                <span className="status-chip">{message.status}</span>
                <span className={`status-chip spam-${message.spamVerdict || "clean"}`}>
                  Spam {message.spamVerdict || "clean"}
                </span>
              </div>
            </div>
            <p>{message.message}</p>
            <p className="muted">
              Spam score: {message.spamScore || 0}
              {message.spamSignals?.length ? ` | Signals: ${message.spamSignals.join(", ")}` : ""}
            </p>
            <div className="row-between">
              <span className="muted">{new Date(message.createdAt).toLocaleString()}</span>
              {message.status !== "replied" ? (
                <button type="button" className="ghost-button" onClick={() => markReplied(message.id)}>
                  Mark replied
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AiLabPage({ session }) {
  const [draftRequest, setDraftRequest] = useState(emptyDraftRequest);
  const [draftState, setDraftState] = useState({ busy: false, error: "", draft: null });
  const [seoRequest, setSeoRequest] = useState(emptySeoRequest);
  const [seoState, setSeoState] = useState({ busy: false, error: "", seo: null });

  const runDraft = async (event) => {
    event.preventDefault();
    try {
      setDraftState({ busy: true, error: "", draft: null });
      const data = await apiRequest(
        "/smart/blog-draft",
        {
          method: "POST",
          body: JSON.stringify({
            topic: draftRequest.topic,
            tone: draftRequest.tone,
            keywords: draftRequest.keywords.split(",").map((item) => item.trim()).filter(Boolean),
          }),
        },
        session.token
      );
      setDraftState({ busy: false, error: "", draft: data.draft });
    } catch (error) {
      setDraftState({ busy: false, error: error.message, draft: null });
    }
  };

  const runSeo = async (event) => {
    event.preventDefault();
    try {
      setSeoState({ busy: true, error: "", seo: null });
      const data = await apiRequest(
        "/smart/seo",
        {
          method: "POST",
          body: JSON.stringify({
            ...seoRequest,
            keywords: seoRequest.keywords.split(",").map((item) => item.trim()).filter(Boolean),
          }),
        },
        session.token
      );
      setSeoState({ busy: false, error: "", seo: data.seo });
    } catch (error) {
      setSeoState({ busy: false, error: error.message, seo: null });
    }
  };

  return (
    <section className="page-stack">
      <PanelHeader title="AI & Smart Features" text="Generate blog drafts, produce SEO meta, and use the portfolio smart layer from one place." />
      <div className="panel-grid">
        <form className="panel-card stack" onSubmit={runDraft}>
          <p className="eyebrow">Auto blog generation</p>
          <TextFields form={draftRequest} setForm={setDraftRequest} fields={[
            ["topic", "Topic"],
            ["keywords", "Keywords"],
            ["tone", "Tone"],
          ]} />
          {draftState.error ? <p className="error-banner">{draftState.error}</p> : null}
          <button type="submit" className="solid-button" disabled={draftState.busy}>
            {draftState.busy ? "Generating..." : "Generate blog draft"}
          </button>
          {draftState.draft ? (
            <div className="result-card">
              <h3>{draftState.draft.title}</h3>
              <p className="muted">{draftState.draft.excerpt}</p>
              <p className="muted">Slug: {draftState.draft.slug}</p>
              <pre>{draftState.draft.content}</pre>
            </div>
          ) : null}
        </form>

        <form className="panel-card stack" onSubmit={runSeo}>
          <p className="eyebrow">Auto SEO meta</p>
          <TextFields form={seoRequest} setForm={setSeoRequest} fields={[
            ["title", "Title"],
            ["keywords", "Keywords"],
          ]} />
          <label className="field">
            <span>Description</span>
            <textarea value={seoRequest.description} onChange={(event) => setSeoRequest((current) => ({ ...current, description: event.target.value }))} rows="3" />
          </label>
          <label className="field">
            <span>Content</span>
            <textarea value={seoRequest.content} onChange={(event) => setSeoRequest((current) => ({ ...current, content: event.target.value }))} rows="6" />
          </label>
          {seoState.error ? <p className="error-banner">{seoState.error}</p> : null}
          <button type="submit" className="solid-button" disabled={seoState.busy}>
            {seoState.busy ? "Generating..." : "Generate SEO"}
          </button>
          {seoState.seo ? (
            <div className="result-card">
              <h3>{seoState.seo.title}</h3>
              <p className="muted">{seoState.seo.description}</p>
              <p className="muted">Keywords: {(seoState.seo.keywords || []).join(", ")}</p>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function ProfilePage({ session }) {
  const [state, setState] = useState({ loading: true, error: "", portfolioId: null });
  const [form, setForm] = useState(emptyPortfolio);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    apiRequest("/portfolios", {}, session.token)
      .then((data) => {
        if (!active) {
          return;
        }

        const first = data.portfolios?.[0];

        if (first) {
          setForm({
            heroTitle: first.heroTitle || "",
            heroSubtitle: first.heroSubtitle || "",
            bio: first.bio || "",
            location: first.location || "",
            email: first.email || "",
            phone: first.phone || "",
            resumeUrl: first.resumeUrl || "",
            skills: Array.isArray(first.skills) ? first.skills.join(", ") : "",
          });
          setState({ loading: false, error: "", portfolioId: first.id });
          return;
        }

        setState({ loading: false, error: "", portfolioId: null });
      })
      .catch((error) => {
        if (active) {
          setState({ loading: false, error: error.message, portfolioId: null });
        }
      });

    return () => {
      active = false;
    };
  }, [session.token]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      const payload = {
        ...form,
        skills: String(form.skills)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      const path = state.portfolioId ? `/portfolios/${state.portfolioId}` : "/portfolios";
      const method = state.portfolioId ? "PATCH" : "POST";
      const data = await apiRequest(path, { method, body: JSON.stringify(payload) }, session.token);
      setState((current) => ({
        ...current,
        error: "",
        portfolioId: data.portfolio?.id || current.portfolioId,
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page-stack">
      <PanelHeader title="Profile Editor" text="Control the portfolio hero, bio, resume link, and public contact details." />
      {state.error ? <p className="error-banner">{state.error}</p> : null}
      <form className="panel-card stack" onSubmit={submit}>
        <TextFields form={form} setForm={setForm} fields={[
          ["heroTitle", "Hero Title"],
          ["heroSubtitle", "Hero Subtitle"],
          ["location", "Location"],
          ["email", "Public Email"],
          ["phone", "Phone"],
          ["resumeUrl", "Resume URL"],
          ["skills", "Skills"],
        ]} />
        <label className="field">
          <span>Bio</span>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="6" />
        </label>
        <button type="submit" className="solid-button" disabled={busy || state.loading}>
          {busy ? "Saving..." : state.portfolioId ? "Update profile" : "Create profile"}
        </button>
      </form>
    </section>
  );
}

function MediaPage() {
  const [files, setFiles] = useState([]);

  const addFiles = (event) => {
    const nextFiles = Array.from(event.target.files || []).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      preview: URL.createObjectURL(file),
      type: file.type || "file",
    }));
    setFiles((current) => [...nextFiles, ...current]);
  };

  return (
    <section className="page-stack">
      <PanelHeader
        title="Media Upload"
        text="Stage local images or files, preview them, and prepare asset references for future backend upload integration."
      />
      <div className="panel-card stack">
        <label className="upload-zone">
          <input type="file" multiple accept="image/*,.pdf,.svg" onChange={addFiles} />
          <strong>Drop files here or browse</strong>
          <span>Local staging mode. This preview manager is ready for a future upload API.</span>
        </label>
      </div>
      <div className="media-grid">
        {files.length === 0 ? <div className="panel-card">No staged media yet.</div> : null}
        {files.map((file) => (
          <article key={file.id} className="panel-card media-card">
            {file.type.startsWith("image/") ? <img src={file.preview} alt={file.name} /> : <div className="file-icon">FILE</div>}
            <h3>{file.name}</h3>
            <p className="muted">{file.size}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ session }) {
  const [state, setState] = useState({ loading: true, error: "", settingsId: null });
  const [form, setForm] = useState(emptySettings);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    apiRequest("/settings", {}, session.token)
      .then((data) => {
        if (!active) {
          return;
        }
        const first = data.settings?.[0];
        if (!first) {
          setState({ loading: false, error: "", settingsId: null });
          return;
        }

        setForm({
          siteName: first.siteName || "",
          siteUrl: first.siteUrl || "",
          supportEmail: first.supportEmail || "",
          contactPhone: first.contactPhone || "",
          maintenanceMode: Boolean(first.maintenanceMode),
          allowRegistrations: Boolean(first.allowRegistrations),
          defaultSeo: {
            title: first.defaultSeo?.title || "",
            description: first.defaultSeo?.description || "",
            keywords: Array.isArray(first.defaultSeo?.keywords)
              ? first.defaultSeo.keywords.join(", ")
              : "",
          },
          branding: {
            logoUrl: first.branding?.logoUrl || "",
            faviconUrl: first.branding?.faviconUrl || "",
            primaryColor: first.branding?.primaryColor || "",
          },
        });
        setState({ loading: false, error: "", settingsId: first.id });
      })
      .catch((error) => {
        if (active) {
          setState({ loading: false, error: error.message, settingsId: null });
        }
      });

    return () => {
      active = false;
    };
  }, [session.token]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      const payload = {
        ...form,
        defaultSeo: {
          ...form.defaultSeo,
          keywords: String(form.defaultSeo.keywords)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      };
      const path = state.settingsId ? `/settings/${state.settingsId}` : "/settings";
      const method = state.settingsId ? "PATCH" : "POST";
      const data = await apiRequest(path, { method, body: JSON.stringify(payload) }, session.token);
      setState((current) => ({
        ...current,
        error: "",
        settingsId: data.settings?.id || current.settingsId,
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page-stack">
      <PanelHeader title="Theme & SEO Settings" text="Manage site identity, SEO defaults, brand assets, and access switches." />
      {state.error ? <p className="error-banner">{state.error}</p> : null}
      <form className="panel-card stack" onSubmit={submit}>
        <TextFields form={form} setForm={setForm} fields={[
          ["siteName", "Site Name"],
          ["siteUrl", "Site URL"],
          ["supportEmail", "Support Email"],
          ["contactPhone", "Contact Phone"],
        ]} />
        <div className="switch-row">
          <label>
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
            />
            Maintenance mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.allowRegistrations}
              onChange={(e) => setForm({ ...form, allowRegistrations: e.target.checked })}
            />
            Allow registrations
          </label>
        </div>
        <label className="field">
          <span>SEO Title</span>
          <input
            value={form.defaultSeo.title}
            onChange={(e) =>
              setForm({ ...form, defaultSeo: { ...form.defaultSeo, title: e.target.value } })
            }
          />
        </label>
        <label className="field">
          <span>SEO Description</span>
          <textarea
            rows="3"
            value={form.defaultSeo.description}
            onChange={(e) =>
              setForm({
                ...form,
                defaultSeo: { ...form.defaultSeo, description: e.target.value },
              })
            }
          />
        </label>
        <label className="field">
          <span>SEO Keywords</span>
          <input
            value={form.defaultSeo.keywords}
            onChange={(e) =>
              setForm({ ...form, defaultSeo: { ...form.defaultSeo, keywords: e.target.value } })
            }
            placeholder="portfolio, react developer, full stack"
          />
        </label>
        <TextFields
          form={form.branding}
          setForm={(updater) =>
            setForm((current) => ({
              ...current,
              branding: typeof updater === "function" ? updater(current.branding) : updater,
            }))
          }
          fields={[
            ["logoUrl", "Logo URL"],
            ["faviconUrl", "Favicon URL"],
            ["primaryColor", "Primary Color"],
          ]}
        />
        <button type="submit" className="solid-button" disabled={busy || state.loading}>
          {busy ? "Saving..." : state.settingsId ? "Update settings" : "Create settings"}
        </button>
      </form>
    </section>
  );
}

function PanelHeader({ title, text }) {
  return (
    <div className="hero-strip compact">
      <div>
        <p className="eyebrow">Control Panel</p>
        <h1>{title}</h1>
        <p className="muted">{text}</p>
      </div>
    </div>
  );
}

function DataTable({ loading, columns, rows, emptyMessage }) {
  if (loading) {
    return <div className="table-placeholder">Loading...</div>;
  }

  if (!rows.length) {
    return <div className="table-placeholder">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={`${index}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextFields({ form, setForm, fields }) {
  return fields.map(([key, label]) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <input
        value={form[key]}
        onChange={(event) => {
          if (typeof setForm === "function") {
            setForm((current) => ({ ...current, [key]: event.target.value }));
          }
        }}
      />
    </label>
  ));
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

      if (!allowedAdminRoles.includes(payload.user.role)) {
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
    <main className="admin-app">
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onSubmit={handleLogin} busy={busy} error={error} session={session} />}
        />
        <Route
          path="/*"
          element={
            session.user ? (
              <AppShell session={session} logout={logout} />
            ) : session.status === "loading" ? (
              <div className="auth-layout">
                <div className="auth-card">Checking admin session...</div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </main>
  );
}
