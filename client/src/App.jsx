import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_API_URL } from "@portfolio/shared";

const skills = [
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "Tailwind CSS",
  "Framer Motion",
  "REST API Design",
  "JWT Security",
];

const projects = [
  {
    title: "Nova Commerce",
    category: "Full Stack",
    summary:
      "Conversion-focused storefront with role-based admin tools, curated analytics, and fast product editing workflows.",
    stack: ["React", "Node", "MongoDB"],
  },
  {
    title: "Studio Atlas",
    category: "Portfolio System",
    summary:
      "Modular portfolio platform with dynamic case studies, blogging, and content-managed sections for creators.",
    stack: ["Vite", "Express", "JWT"],
  },
  {
    title: "Signal Desk",
    category: "Dashboard",
    summary:
      "Operational dashboard for tracking user activity, inbound messages, and campaign performance in one place.",
    stack: ["Charts", "APIs", "Role Guards"],
  },
];

const blogPosts = [
  {
    title: "Designing APIs That Age Well",
    meta: "Backend Architecture",
    excerpt:
      "A practical approach to clean route surfaces, predictable error handling, and version-friendly model design.",
  },
  {
    title: "Motion Without Noise",
    meta: "Frontend Craft",
    excerpt:
      "How to use animation as guidance instead of decoration, especially for portfolio and product storytelling.",
  },
  {
    title: "Shipping Admin Panels Fast",
    meta: "Product Systems",
    excerpt:
      "Patterns for combining auth, role gating, and CRUD structure without turning the codebase brittle.",
  },
];

const contactInitialState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const chatbotSuggestions = [
  "What stack do you use?",
  "What kind of projects do you build?",
  "How can I contact you?",
];

const sectionVariant = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.08, ease: "easeOut" },
  }),
};

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [contactForm, setContactForm] = useState(contactInitialState);
  const [contactState, setContactState] = useState({ busy: false, message: "", error: "" });
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatState, setChatState] = useState({
    busy: false,
    answer: "Ask about my skills, projects, or how we can work together.",
    suggestions: chatbotSuggestions,
    error: "",
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setContactState({ busy: true, message: "", error: "" });

    try {
      const response = await fetch(`${DEFAULT_API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to send message right now.");
      }

      setContactForm(contactInitialState);
      setContactState({
        busy: false,
        message: "Message sent successfully. I will get back to you soon.",
        error: "",
      });
    } catch (error) {
      setContactState({
        busy: false,
        message: "",
        error: error.message,
      });
    }
  };

  const askChatbot = async (question) => {
    const nextQuestion = (question || chatQuestion).trim();

    if (!nextQuestion) {
      return;
    }

    setChatState((current) => ({ ...current, busy: true, error: "" }));

    try {
      const response = await fetch(`${DEFAULT_API_URL}/smart/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: nextQuestion }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to answer right now.");
      }

      setChatState({
        busy: false,
        answer: data.answer,
        suggestions: data.suggestions || chatbotSuggestions,
        error: "",
      });
      setChatQuestion("");
    } catch (error) {
      setChatState((current) => ({
        ...current,
        busy: false,
        error: error.message,
      }));
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a href="#hero" className="brand">
          PK Portfolio
        </a>
        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <main className="page">
        <motion.section
          id="hero"
          className="hero"
          initial="hidden"
          animate="visible"
          variants={sectionVariant}
        >
          <div className="hero-copy">
            <p className="eyebrow">Portfolio Frontend</p>
            <h1>
              Building modern digital experiences with strong backend thinking and
              polished frontend craft.
            </h1>
            <p className="hero-text">
              I design portfolio systems, dashboards, and scalable web products that
              feel sharp on the surface and stay maintainable underneath.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="primary-button">
                View Projects
              </a>
              <a href="#contact" className="secondary-button">
                Hire Me
              </a>
            </div>
            <ul className="hero-stats">
              <li>
                <strong>12+</strong>
                <span>Launch-ready interfaces</span>
              </li>
              <li>
                <strong>8</strong>
                <span>Core stack strengths</span>
              </li>
              <li>
                <strong>100%</strong>
                <span>Responsive layouts</span>
              </li>
            </ul>
          </div>

          <motion.div
            className="hero-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="hero-badge">Available for freelance and product builds</div>
            <div className="hero-card-grid">
              <article>
                <span>Current focus</span>
                <strong>React + Node platforms</strong>
              </article>
              <article>
                <span>Speciality</span>
                <strong>Admin, portfolio, API systems</strong>
              </article>
              <article>
                <span>Workflow</span>
                <strong>Design, build, refine, ship</strong>
              </article>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          id="about"
          className="content-section two-column"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariant}
        >
          <div>
            <SectionHeading
              eyebrow="About"
              title="A developer who thinks in systems, not just screens."
              text="I work across frontend polish and backend structure, which means layouts stay expressive while APIs, models, and access control stay intentional."
            />
            <p className="body-copy">
              My approach is simple: make the experience feel premium, keep the codebase
              understandable, and leave room for future product growth without a rewrite.
            </p>
          </div>
          <div className="info-card">
            <div>
              <span className="card-label">Based in</span>
              <strong>India</strong>
            </div>
            <div>
              <span className="card-label">Preferred work</span>
              <strong>Portfolio, SaaS, internal tools</strong>
            </div>
            <div>
              <span className="card-label">Core style</span>
              <strong>Bold UI, clean architecture</strong>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="skills"
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariant}
        >
          <SectionHeading
            eyebrow="Skills"
            title="Tools I use to turn concepts into maintainable products."
            text="A balanced stack for building interfaces, APIs, content systems, and role-aware admin experiences."
          />
          <div className="pill-grid">
            {skills.map((skill, index) => (
              <motion.div
                key={skill}
                className="pill-card"
                custom={index}
                variants={cardVariant}
              >
                {skill}
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="ask"
          className="content-section ask-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariant}
        >
          <div>
            <SectionHeading
              eyebrow="Ask About Me"
              title="A smart assistant trained on this portfolio's profile."
              text="Use the quick prompts or ask your own question to learn about skills, project fit, and collaboration style."
            />
            <div className="suggestion-row">
              {chatState.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="suggestion-pill"
                  onClick={() => askChatbot(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="chatbot-card">
            <div className="chatbot-bubble">
              <span className="meta-chip">AI reply</span>
              <p>{chatState.answer}</p>
            </div>
            <form
              className="chatbot-form"
              onSubmit={(event) => {
                event.preventDefault();
                askChatbot();
              }}
            >
              <label>
                <span>Your question</span>
                <textarea
                  rows="4"
                  value={chatQuestion}
                  onChange={(event) => setChatQuestion(event.target.value)}
                  placeholder="Ask about my skills, projects, process, or availability"
                />
              </label>
              {chatState.error ? <p className="form-error">{chatState.error}</p> : null}
              <button type="submit" className="primary-button form-button" disabled={chatState.busy}>
                {chatState.busy ? "Thinking..." : "Ask now"}
              </button>
            </form>
          </div>
        </motion.section>

        <motion.section
          id="projects"
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariant}
        >
          <SectionHeading
            eyebrow="Projects"
            title="Selected work built for clarity, speed, and scale."
            text="A few examples of product direction, technical depth, and interface quality working together."
          />
          <div className="feature-grid">
            {projects.map((project, index) => (
              <motion.article
                key={project.title}
                className="feature-card"
                custom={index}
                variants={cardVariant}
              >
                <span className="meta-chip">{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="tag-row">
                  {project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="blog"
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariant}
        >
          <SectionHeading
            eyebrow="Blog"
            title="Writing about product architecture and frontend execution."
            text="Short-form insights around systems design, UI implementation, and shipping habits that hold up in real projects."
          />
          <div className="feature-grid">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.title}
                className="feature-card blog-card"
                custom={index}
                variants={cardVariant}
              >
                <span className="meta-chip">{post.meta}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <a href="#contact">Discuss this approach</a>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="resume"
          className="content-section resume-band"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariant}
        >
          <SectionHeading
            eyebrow="Resume"
            title="Open to product-focused frontend and full stack opportunities."
            text="If you need someone who can move from schema design to polished landing pages without losing structure, we should talk."
          />
          <div className="resume-actions">
            <a href="#contact" className="primary-button">
              Request Resume
            </a>
            <a href="#projects" className="secondary-button">
              See Work Samples
            </a>
          </div>
        </motion.section>

        <motion.section
          id="contact"
          className="content-section contact-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariant}
        >
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Let us build something that looks intentional and scales cleanly."
              text="Share the project brief, current stack, or the gap you want fixed. I will reply with a practical direction."
            />
            <div className="contact-points">
              <div>
                <span>Email</span>
                <strong>hello@pkportfolio.dev</strong>
              </div>
              <div>
                <span>Focus</span>
                <strong>Portfolio, dashboard, backend API work</strong>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="field-grid">
              <label>
                <span>Name</span>
                <input
                  value={contactForm.name}
                  onChange={(event) =>
                    setContactForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <label>
              <span>Subject</span>
              <input
                value={contactForm.subject}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, subject: event.target.value }))
                }
              />
            </label>
            <label>
              <span>Message</span>
              <textarea
                rows="6"
                value={contactForm.message}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, message: event.target.value }))
                }
                required
              />
            </label>
            {contactState.error ? <p className="form-error">{contactState.error}</p> : null}
            {contactState.message ? <p className="form-success">{contactState.message}</p> : null}
            <button type="submit" className="primary-button form-button" disabled={contactState.busy}>
              {contactState.busy ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.section>
      </main>
    </div>
  );
}
