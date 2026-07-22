"use client";
import Markdown from "react-markdown";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Send,
  Sparkles,
  Bot,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter, FaEnvelope } from "react-icons/fa6";
import {
  askAssistant,
  getHealth,
  listActivities,
  listProjects,
  unwrapList,
} from "../lib/api";

const profile = {
  name: "Abdul Hanan",
  title:
    "Software Engineer || Full Stack AI Engineer || Building scalable web & AI applications.",
  location: "Lahore, Punjab, Pakistan",
  company: "JBeasyMovingLLC",
  university: "University Of Central Punjab",
  followers: "1041 connections",
  availability: "Open to work",
  focus:
    "Full Stack AI Engineer || Software Engineer || Building scalable web & AI applications.",
  linkedin: "linkedin.com/in/abdulhanan394",
  email: "abdulhanan04@icloud.com",
};

const stats = [
  ["Profile views", "900", "Discover who viewed your portfolio."],
  ["Post impressions", "11500", "Engagement from your latest AI posts."],
  ["Search appearances", "500", "How often you appear in recruiter searches."],
];

const activities = [
  {
    title: "BERT vs GPT",
    text: "A breakdown of transformer architecture and where each model family shines in modern AI workflows.",
    tag: "AI Notes",
    image: "/linkedin-page.png",
  },
  {
    title: "Activation Functions",
    text: "Why Tanh, ReLU, Sigmoid, and Softmax matter when building neural network intuition.",
    tag: "Deep Learning",
    image: "/linkedin-page.png",
  },
];

// ---------------------------------------------------------------------------
// Fallback data — used only if the live API is unreachable, so the page
// never shows an empty state to a visitor. Real data comes from
// GET /api/v1/activities and GET /api/v1/projects via lib/api.ts.
// ---------------------------------------------------------------------------
const fallbackActivities = [
  {
    id: "a1",
    source: "github",
    type: "Push",
    title: "Refactored the embedding pipeline for ChromaDB ingestion",
    summary:
      "Batched embedding requests and reworked the upsert path into ChromaDB, cutting indexing latency and making the RAG pipeline ready for multi-source activity data.",
    tags: ["Backend", "Performance"],
    technologies: ["Python", "FastAPI", "ChromaDB"],
    category: "AI Infrastructure",
    date: "2026-07-18",
    url: "https://github.com/AbdulHanan394",
  },
  {
    id: "a2",
    source: "github",
    type: "Pull Request",
    title: "Added APScheduler-based collector for GitHub activity",
    summary:
      "Implemented the first collector module in the Abdul Core backend, polling the GitHub API on a schedule and normalizing commits and PRs into a unified Activity schema.",
    tags: ["Automation", "Collectors"],
    technologies: ["FastAPI", "APScheduler", "PostgreSQL"],
    category: "Platform Engineering",
    date: "2026-07-15",
    url: "https://github.com/AbdulHanan394",
  },
];

const fallbackProjects = [
  {
    title: "Truck Dispatching Platform",
    meta: "BURAQDispatches • 2025",
    text: "Built the complete React.js frontend for a truck dispatching platform, integrated Cloudinary for document management, and consumed REST APIs to keep dispatch operations synchronized in real time.",
    stack: ["React.js", "REST APIs", "Cloudinary", "Logistics", "Frontend"],
    link: "https://buraqdispatcher.netlify.app/",
  },
  {
    title: "FocusSpark – AI Productivity & Learning Assistant",
    meta: "Final Year Project • In Progress",
    text: "Developing an AI-powered productivity platform with real-time focus detection, document chat, flashcard and quiz generation, behavioral analytics, and personalized learning assistance.",
    stack: [
      "React",
      "TypeScript",
      "FastAPI",
      "PostgreSQL",
      "MediaPipe",
      "OpenCV",
      "DeepFace",
      "LLMs",
      "AI",
    ],
    link: "https://focusspark-frontend.vercel.app/",
  },
];

const sourceMeta = {
  github: { label: "GitHub", icon: FaGithub, className: "source-github" },
  linkedin: {
    label: "LinkedIn",
    icon: FaLinkedin,
    className: "source-linkedin",
  },
  x: { label: "X", icon: FaXTwitter, className: "source-x" },
};

function timeAgo(dateStr) {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.floor((now - then) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const suggestedPrompts = [
  "What has Abdul built recently?",
  "What's Abdul's AI stack?",
  "Is Abdul open to work?",
  "Tell me about FocusSpark",
];

// Local fallback answers, only used if the live /assistant/query call fails
// (e.g. backend down). Keeps the chat useful even when offline.
function askAgentOffline(question) {
  const q = question.toLowerCase();
  if (q.includes("recent") || q.includes("built") || q.includes("working on")) {
    return "Lately Abdul has been reworking the embedding pipeline for his personal AI Core and shipping real-time focus detection for FocusSpark. (Offline preview answer — live assistant is unreachable right now.)";
  }
  if (q.includes("stack") || q.includes("technolog") || q.includes("tools")) {
    return "On the AI side: FastAPI, PostgreSQL, ChromaDB, RAG, Sentence Transformers, LangChain, and Ollama. On the product side: React, Next.js, and TypeScript. (Offline preview answer.)";
  }
  if (
    q.includes("open to work") ||
    q.includes("hire") ||
    q.includes("available")
  ) {
    return `Yes — Abdul is open to Full Stack / AI Engineer roles. Reach him at ${profile.email} or via LinkedIn (${profile.linkedin}). (Offline preview answer.)`;
  }
  if (q.includes("focusspark")) {
    return "FocusSpark is Abdul's final year project: an AI-powered productivity and learning assistant with real-time focus detection, document chat, and quiz generation. (Offline preview answer.)";
  }
  return "The live AI assistant is unreachable right now, so you're seeing a static preview. Try asking about recent work, stack, or availability once the backend is back up.";
}

function Icon({ children }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}

function Slider({ children, ariaLabel }) {
  const trackRef = useRef(null);

  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".slide-item");
    const gap = 14;
    const amount = card ? card.getBoundingClientRect().width + gap : 300;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="slider-wrap">
      <button
        type="button"
        className="slider-arrow slider-arrow-left"
        onClick={() => scrollByCard(-1)}
        aria-label="Scroll previous"
      >
        <ChevronLeft size={18} />
      </button>
      <div
        className="slider-track"
        ref={trackRef}
        role="list"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      <button
        type="button"
        className="slider-arrow slider-arrow-right"
        onClick={() => scrollByCard(1)}
        aria-label="Scroll next"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function Section({ title, children, action, id }) {
  return (
    <section className="section-card" id={id}>
      <div className="section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ThemeButton({ theme, setTheme }) {
  return (
    <button
      className="theme-button"
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Icon>{theme === "dark" ? "L" : "D"}</Icon>
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

function ProfileHero({ onAskAI }) {
  return (
    <section className="profile-hero">
      <div className="cover">
        <img src="/profile-card.png" alt="" />
      </div>
      <div className="profile-body">
        <div className="avatar-wrap">
          <img src="/profile-card_01.png" alt="Abdul Hanan profile" />
        </div>
        <div className="profile-main">
          <div className="name-row">
            <h1>{profile.name}</h1>
          </div>
          <p className="headline">{profile.title}</p>
          <p className="muted">
            {profile.location} - <a href="#contact">Contact info</a>
          </p>
          <p className="linkline">{profile.followers}</p>
          <div className="profile-actions">
            <a className="outline-pill" href="#contact">
              Open to
            </a>
            <a className="outline-pill" href="#projects">
              Projects
            </a>
            <a className="outline-pill" href="#skills">
              Skills
            </a>
            <button type="button" className="outline-pill" onClick={onAskAI}>
              Ask AI
            </button>
          </div>
        </div>
        <div className="profile-orgs">
          <p>
            <span className="org-mark blue">U</span>
            {profile.university}
          </p>
        </div>
      </div>
    </section>
  );
}

function StickySnapshot() {
  return (
    <aside className="sticky-snapshot" aria-label="Profile snapshot">
      <div className="cover">
        <img src="/profile-card.png" alt="Profile Cover" />
      </div>
      <div className="sticky-avatar">
        <img src="/profile-card_01.png" alt="Abdul Hanan" />
      </div>
      <div className="snapshot-body">
        <h2>{profile.name}</h2>
        <p className="snapshot-focus">{profile.focus}</p>
        <div className="snapshot-meta">
          <span>{profile.location}</span>
        </div>
      </div>
    </aside>
  );
}

function RightRail({ theme, setTheme }) {
  const [copied, setCopied] = useState("");
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const viewers = [
    "Customer Service Specialist at AT&T",
    "Software Developer at NeuroFive solutions",
    "Someone at University of Central Punjab",
    "AI Engineer in Lahore",
  ];

  return (
    <aside className="right-rail">
      <div className="rail-card">
        <div className="rail-row">
          <div>
            <h3>Profile language</h3>
            <p>English</p>
          </div>
        </div>
        <div
          className="rail-row"
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div>
            <h3>LinkedIn Profile & URL</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <p style={{ margin: 0 }}>linkedin.com/in/abdulhanan394</p>
              <Copy
                size={18}
                style={{
                  cursor: "pointer",
                  color: copied === "linkedin" ? "#22c55e" : "#6b7280",
                  transition: "color 0.3s ease",
                }}
                onClick={() =>
                  copyToClipboard(
                    "https://www.linkedin.com/in/abdulhanan394",
                    "linkedin",
                  )
                }
              />
            </div>
          </div>
          <div>
            <h3>GitHub Profile & URL</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <p style={{ margin: 0 }}>github.com/AbdulHanan394</p>
              <Copy
                size={18}
                style={{
                  cursor: "pointer",
                  color: copied === "github" ? "#22c55e" : "#6b7280",
                  transition: "color 0.3s ease",
                }}
                onClick={() =>
                  copyToClipboard("https://github.com/AbdulHanan394", "github")
                }
              />
            </div>
          </div>
          <div>
            <h3>X Profile & URL</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <p style={{ margin: 0 }}>x.com/AbdulHanan394</p>
              <Copy
                size={18}
                style={{
                  cursor: "pointer",
                  color: copied === "x" ? "#22c55e" : "#6b7280",
                  transition: "color 0.3s ease",
                }}
                onClick={() =>
                  copyToClipboard("https://x.com/AbdulHanan394", "x")
                }
              />
            </div>
          </div>
        </div>
        <ThemeButton theme={theme} setTheme={setTheme} />
      </div>

      <div className="rail-card">
        <h3>You May Know</h3>
        {viewers.map((item) => (
          <div className="person-row" key={item}>
            <div>
              <strong>{item}</strong>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Activity Intelligence — now backed by GET /api/v1/activities (via the
// local proxy). Falls back to static preview data if the fetch fails.
// ---------------------------------------------------------------------------
function ActivityIntelligence() {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(fallbackActivities);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listActivities({ source: filter })
      .then((data) => {
        if (cancelled) return;
        const list = unwrapList(data);
        if (list.length) {
          setItems(list);
          setLive(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load activities:", err);
        if (!cancelled) setLive(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const filtered =
    filter === "all" ? items : items.filter((item) => item.source === filter);

  return (
    <Section
      id="activity-intelligence"
      title="Activity Intelligence"
      action={
        <span className="tiny-action live-pill">
          <span className="live-dot" />
          {live ? "Live feed" : loading ? "Loading…" : "Preview data"}
        </span>
      }
    >
      <p className="about-text intel-lede">
        Auto-collected from GitHub, LinkedIn, and X, then summarized and tagged
        by Abdul&apos;s own AI pipeline — no manual copywriting.
      </p>

      <div className="tabs" aria-label="Filter activity by source">
        {[
          { id: "all", label: "All" },
          { id: "github", label: "GitHub" },
          { id: "linkedin", label: "LinkedIn" },
          { id: "x", label: "X" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={filter === tab.id ? "active" : ""}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Slider ariaLabel="Activity intelligence feed">
        {filtered.map((item) => {
          const meta = sourceMeta[item.source] || sourceMeta.github;
          const SourceIcon = meta.icon;
          return (
            <article className="intel-card slide-item" key={item.id}>
              <div className="intel-card-head">
                <span className={`source-badge ${meta.className}`}>
                  <SourceIcon size={13} />
                  {meta.label}
                </span>
                <span className="intel-type">{item.type}</span>
                <span className="intel-date">{timeAgo(item.date)}</span>
              </div>

              <h3>{item.title}</h3>

              <div className="ai-summary">
                <Sparkles size={14} className="ai-summary-icon" />
                <p>{item.summary}</p>
              </div>

              <div className="chip-row intel-chips">
                <span className="category-chip">{item.category}</span>
                {(item.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                {(item.technologies || []).map((tech) => (
                  <span key={tech} className="tech-chip">
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-btn intel-link"
              >
                View source →
              </a>
            </article>
          );
        })}
      </Slider>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Live projects — GET /api/v1/projects, falls back to static list on error.
// Backend field names may differ slightly, so we read a few possible keys.
// ---------------------------------------------------------------------------
function useLiveProjects() {
  const [projects, setProjects] = useState(fallbackProjects);

  useEffect(() => {
    let cancelled = false;
    listProjects()
      .then((data) => {
        if (cancelled) return;
        const list = unwrapList(data);
        if (list.length) setProjects(list);
      })
      .catch((err) => console.error("Failed to load projects:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  return projects;
}

// ---------------------------------------------------------------------------
// Shared chat state — hits POST /api/v1/assistant/query via the proxy.
// Falls back to a canned offline answer if the request fails.
// ---------------------------------------------------------------------------
function useAgentChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey, I'm Abdul's AI assistant. Ask me about his projects, stack, or availability.",
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = async (text) => {
    const question = (text ?? input).trim();

    if (!question || thinking) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);

    setInput("");
    setThinking(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await askAssistant(question, history);

      console.log("AI RESPONSE:", response);

      let content;

      if (typeof response === "string") {
        content = response;
      } else if (response?.content) {
        content =
          typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);
      } else if (response?.answer) {
        content = response.answer;
      } else if (response?.response) {
        content = response.response;
      } else if (response?.message) {
        content =
          typeof response.message === "string"
            ? response.message
            : response.message.content || JSON.stringify(response.message);
      } else {
        content = JSON.stringify(response);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content,
        },
      ]);
    } catch (err) {
      console.error("Assistant request failed:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: askAgentOffline(question),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    thinking,
    send,
  };
}

function AIPlayground({ chat }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat.messages, chat.thinking]);

  return (
    <Section
      id="ai-playground"
      title="AI Playground"
      action={
        <span className="tiny-action live-pill">
          <Bot size={14} />
          Ask Abdul
        </span>
      }
    >
      <p className="about-text intel-lede">
        Abdul&apos;s personal AI assistant — answers are grounded in his real
        projects and activity via RAG over the Abdul Core backend. It&apos;s
        also docked bottom-right so you can keep chatting while you browse.
      </p>

      <div className="chat-shell">
        <div className="chat-window" ref={scrollRef}>
          {chat.messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}>
              {m.role === "assistant" && (
                <span className="chat-avatar">
                  <Bot size={16} />
                </span>
              )}
             <div className="markdown-content">
  <Markdown>
    {m.content}
  </Markdown>
</div>
            </div>
          ))}
          {chat.thinking && (
            <div className="chat-message assistant">
              <span className="chat-avatar">
                <Bot size={16} />
              </span>
              <p className="chat-typing">
                <span />
                <span />
                <span />
              </p>
            </div>
          )}
        </div>

        <div className="suggested-prompts">
          {suggestedPrompts.map((prompt) => (
            <button
              type="button"
              key={prompt}
              onClick={() => chat.send(prompt)}
              disabled={chat.thinking}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="chat-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            chat.send();
          }}
        >
          <input
            type="text"
            value={chat.input}
            onChange={(e) => chat.setInput(e.target.value)}
            placeholder="Ask about Abdul's work..."
            aria-label="Ask Abdul's AI assistant"
          />
          <button
            type="submit"
            className="chat-send"
            disabled={chat.thinking || !chat.input.trim()}
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Section>
  );
}

function FloatingChatWidget({ open, setOpen, chat }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat.messages, chat.thinking, open]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <div className="floating-chat">
      {open && (
        <div
          className="floating-chat-panel"
          role="dialog"
          aria-label="Ask Abdul's AI assistant"
        >
          <div className="floating-chat-header">
            <span className="floating-chat-title">
              <Bot size={16} />
              Ask Abdul&apos;s AI
            </span>
            <button
              type="button"
              className="floating-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="chat-window floating-chat-window" ref={scrollRef}>
            {chat.messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                {m.role === "assistant" && (
                  <span className="chat-avatar">
                    <Bot size={16} />
                  </span>
                )}
               <div className="markdown-content">
  <Markdown>
    {m.content}
  </Markdown>
</div>
              </div>
            ))}
            {chat.thinking && (
              <div className="chat-message assistant">
                <span className="chat-avatar">
                  <Bot size={16} />
                </span>
                <p className="chat-typing">
                  <span />
                  <span />
                  <span />
                </p>
              </div>
            )}
          </div>

          <div className="suggested-prompts floating-chat-prompts">
            {suggestedPrompts.map((prompt) => (
              <button
                type="button"
                key={prompt}
                onClick={() => chat.send(prompt)}
                disabled={chat.thinking}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="chat-input-row floating-chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              chat.send();
            }}
          >
            <input
              type="text"
              value={chat.input}
              onChange={(e) => chat.setInput(e.target.value)}
              placeholder="Ask about Abdul's work..."
              aria-label="Message Abdul's AI assistant"
            />
            <button
              type="submit"
              className="chat-send"
              disabled={chat.thinking || !chat.input.trim()}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`floating-chat-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <Bot size={22} />}
        {!open && <span className="fab-pulse" aria-hidden="true" />}
      </button>
    </div>
  );
}

const experience = [
  [
    "Full Stack Engineer",
    "JBeasyMovingLLC",
    "2025 - Present",
    "Truck Moving Company Platform - Logistics Industry",
  ],
  [
    "Full Stack Engineer",
    "BURAQDispatches",
    "2025 - Present",
    "Truck Dispatching Platform - Logistics Industry",
  ],
];

const skillCategories = [
  {
    title: "Programming Languages",
    skills: [
      "Python",
      "JavaScript (ES6+)",
      "TypeScript",
      "SQL",
      "C++",
      "C",
      "HTML5",
      "CSS3",
    ],
  },
  {
    title: "Frontend Development",
    skills: ["React.js", "Next.js", "Redux", "Context API", "Tailwind CSS"],
  },
  {
    title: "Backend Development",
    skills: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "REST APIs",
      "GraphQL",
      "JWT Authentication",
    ],
  },
  {
    title: "Databases",
    skills: ["MongoDB", "MySQL", "PostgreSQL", "ChromaDB"],
  },
  {
    title: "AI & Machine Learning",
    skills: [
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "Gradient Descent",
      "CNN",
      "RNN",
      "LSTM",
      "GRU",
      "NumPy",
      "Pandas",
    ],
  },
  {
    title: "LLMs & Generative AI",
    skills: [
      "Transformer Architecture",
      "Self-Attention",
      "Multi-Head Attention",
      "BERT",
      "GPT",
      "LLMs",
      "Prompt Engineering",
      "LangChain",
      "Hugging Face",
      "AI Agents",
      "Tool Calling",
    ],
  },
  {
    title: "RAG & Semantic Search",
    skills: [
      "Retrieval-Augmented Generation (RAG)",
      "Sentence Transformers",
      "Embeddings",
      "Semantic Search",
      "Vector Databases",
    ],
  },
  {
    title: "Computer Vision",
    skills: [
      "OpenCV",
      "MediaPipe",
      "DeepFace",
      "Head Pose Estimation",
      "Eye Aspect Ratio (EAR)",
    ],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      "Docker",
      "Kubernetes",
      "Git",
      "GitHub",
      "GitHub Actions",
      "Linux",
      "Nginx",
      "Cloudinary",
      "Ollama",
    ],
  },
  {
    title: "Software Engineering",
    skills: [
      "Clean Architecture",
      "Scalable Systems",
      "Modular Design",
      "Performance Optimization",
      "Software Design Patterns",
      "Data Structures & Algorithms",
    ],
  },
];

export default function PortfolioPage() {
  const [theme, setTheme] = useState("dark");
  const [chatOpen, setChatOpen] = useState(false);
  const chat = useAgentChat();
  const projects = useLiveProjects();

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme");
    if (saved) {
      setTheme(saved);
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches)
      setTheme("light");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  // Optional: ping /health once on load, just to log backend reachability
  useEffect(() => {
    getHealth().catch(() =>
      console.warn(
        "Backend health check failed — using preview data where needed.",
      ),
    );
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className={`page theme-${theme}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Portfolio home">
          <span>AH</span>
        </a>
        <nav aria-label="Portfolio sections">
          <a href="#about">About</a>
          <a href="#ai-playground">AI Assistant</a>
          <a href="#activity-intelligence">Activity</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
        </nav>
        <ThemeButton theme={theme} setTheme={setTheme} />
      </header>

      <div className="shell" id="top">
        <StickySnapshot />
        <div className="content">
          <ProfileHero onAskAI={() => setChatOpen(true)} />

          <Section title="Analytics">
            <div className="stats-grid">
              {stats.map(([label, value, text]) => (
                <article className="stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section
            title="About"
            action={
              <a className="tiny-action" href="#contact">
                Contact
              </a>
            }
          >
            <p className="about-text" id="about">
              I&apos;m a Full-Stack AI Engineer with a strong foundation in
              Software Engineering, passionate about building intelligent,
              scalable, and production-ready applications that combine modern
              software development with Artificial Intelligence.
              <br />
              <br />
              My expertise spans Python, React.js, Node.js, FastAPI, Express.js,
              PostgreSQL, MongoDB, Docker, REST APIs, CI/CD, and cloud-native
              development, alongside AI technologies including Large Language
              Models (LLMs), Retrieval-Augmented Generation (RAG), AI Agents,
              Vector Databases, Semantic Search, Prompt Engineering, and
              Transformer-based architectures.
              <br />
              <br />
              I enjoy designing end-to-end AI systems by applying software
              engineering principles such as clean architecture, modular design,
              scalability, maintainability, and performance optimization. My
              interests include Generative AI, intelligent automation,
              autonomous agents, AI-powered developer tools, and production AI
              applications.
              <br />
              <br />
              I&apos;m always exploring new technologies, solving challenging
              engineering problems, and collaborating on projects that push the
              boundaries of AI and software engineering.
            </p>
          </Section>

          <AIPlayground chat={chat} />
          <ActivityIntelligence />

          <Section title="Posts">
            <div className="tabs" aria-label="Activity filters">
              <button type="button" className="active">
                Posts
              </button>
            </div>
            <Slider ariaLabel="Recent posts">
              {activities.map((activity) => (
                <article
                  className="activity-card slide-item"
                  key={activity.title}
                >
                  <div className="activity-head">
                    <span className="mini-avatar avatar-photo" />
                    <div>
                      <strong>{profile.name}</strong>
                      <p>{activity.tag}</p>
                    </div>
                  </div>
                  <h3>{activity.title}</h3>
                  <p>{activity.text}</p>
                  <a
                    href="https://www.linkedin.com/in/abdulhanan394"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-btn"
                  >
                    View on LinkedIn →
                  </a>
                </article>
              ))}
            </Slider>
          </Section>

          <Section
            title="Projects"
            action={
              <a className="tiny-action" href="#contact">
                Hire me
              </a>
            }
            id="projects"
          >
            <div className="project-list">
              {projects.map((project) => {
                const stack = project.stack || project.technologies || [];
                const desc = project.text || project.description || "";
                const link = project.link || project.url;
                return (
                  <article
                    className="project-card"
                    key={project.id || project.title}
                  >
                    <div>
                      <h3>{project.title}</h3>
                      {project.meta && <p className="muted">{project.meta}</p>}
                      <p>{desc}</p>
                    </div>
                    <div className="chip-row">
                      {stack.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="linkedin-btn"
                        style={{ marginTop: "16px", alignSelf: "flex-start" }}
                      >
                        View Project →
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </Section>

          <Section title="Experience" id="experience">
            <div className="timeline">
              {experience.map(([role, org, date, text]) => (
                <article className="timeline-item" key={`${role}-${org}`}>
                  <span className="company-logo" />
                  <div>
                    <h3>{role}</h3>
                    <p>{org}</p>
                    <small>{date}</small>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section title="Education">
            <article className="education">
              <span className="school-logo">U</span>
              <div>
                <h3>{profile.university}</h3>
                <p>Bachelor of Science, Computer Software Engineering</p>
                <small>2022 - Present</small>
                <p>
                  Relevant coursework: Data Structures & Algorithms, Database
                  Systems, Web Engineering, Applied Machine Learning, Software
                  Design Patterns, Operating Systems, Computer Networks,
                  Information Security.
                </p>
              </div>
            </article>
          </Section>

          <Section title="Technical Skills" id="skills">
            <div className="skills-section">
              {skillCategories.map((category) => (
                <div className="skill-category" key={category.title}>
                  <h3>{category.title}</h3>
                  <div className="skills">
                    {category.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <footer className="footer" id="contact">
            <div className="footer-content">
              <div className="footer-left">
                <h3>{profile.name}</h3>
                <p>Software Engineer • Full-Stack AI Engineer</p>
                <a href={`mailto:${profile.email}`} className="footer-email">
                  <FaEnvelope size={18} />
                  <span>{profile.email}</span>
                </a>
              </div>
              <div className="footer-right">
                <a
                  href="https://www.linkedin.com/in/abdulhanan394"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={22} />
                </a>
                <a
                  href="https://github.com/AbdulHanan394"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <FaGithub size={22} />
                </a>
                <a
                  href="https://x.com/AbdulHanan394"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                >
                  <FaXTwitter size={22} />
                </a>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {year} Abdul Hanan. All Rights Reserved.</span>
            </div>
          </footer>
        </div>

        <RightRail theme={theme} setTheme={setTheme} />
      </div>

      <FloatingChatWidget open={chatOpen} setOpen={setChatOpen} chat={chat} />
    </main>
  );
}
