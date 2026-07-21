"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Send, Sparkles, Bot, Github, Linkedin, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaEnvelope,
} from "react-icons/fa6";
const profile = {
  name: "Abdul Hanan",
  title:
    "Software Engineer || Full Stack AI Engineer || Building scalable web & AI applications.",
  location: "Lahore, Punjab, Pakistan",
  company: "JBeasyMovingLLC",
  university: "University Of Central Punjab",
  followers: "1041 connections",
  availability: "Open to work",
  focus: "Full Stack AI Engineer || Software Engineer || Building scalable web & AI applications.",
  linkedin: "linkedin.com/in/abdulhanan394",
  email: "abdulhanan04@icloud.com"
};


const stats = [
  ["Profile views", "900", "Discover who viewed your portfolio."],
  ["Post impressions", "11500", "Engagement from your latest AI posts."],
  ["Search appearances", "500", "How often you appear in recruiter searches."]
];

// dummy activities

const activities = [
  {
    title: "BERT vs GPT",
    text:
      "A breakdown of transformer architecture and where each model family shines in modern AI workflows.",
    tag: "AI Notes",
    image: "/linkedin-page.png"
  },
  {
    title: "Activation Functions",
    text:
      "Why Tanh, ReLU, Sigmoid, and Softmax matter when building neural network intuition.",
    tag: "Deep Learning",
    image: "/linkedin-page.png"
  }
];

// ---------------------------------------------------------------------------
// Activity Intelligence feed
// This is the client-facing surface for the "Abdul Core" pipeline:
// Collector -> Normalizer -> AI Summarizer -> Tag Extractor -> Embedding -> API
// Replace `intelActivities` with a fetch() to the Abdul Core Portfolio API,
// e.g. GET /api/activities?source=all&limit=12
// Expected shape per item mirrors the Activity entity from the backend design:
// { id, source, type, title, summary, tags[], technologies[], category, date, url }
// ---------------------------------------------------------------------------
const intelActivities = [
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
    url: "https://github.com/AbdulHanan394"
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
    url: "https://github.com/AbdulHanan394"
  },
  {
    id: "a3",
    source: "linkedin",
    type: "Post",
    title: "Shared a breakdown of BERT vs GPT architectures",
    summary:
      "Published a explainer comparing encoder-only and decoder-only transformer designs, aimed at engineers building intuition before diving into LLM internals.",
    tags: ["AI Notes", "Deep Learning"],
    technologies: ["Transformers", "LLMs"],
    category: "Thought Leadership",
    date: "2026-07-12",
    url: "https://www.linkedin.com/in/abdulhanan394"
  },
  {
    id: "a4",
    source: "x",
    type: "Post",
    title: "Thread on building a private RAG assistant with Ollama",
    summary:
      "Walked through hosting local LLMs with Ollama alongside Sentence Transformers for retrieval, and why keeping the assistant's memory local matters for a personal AI core.",
    tags: ["RAG", "Local LLMs"],
    technologies: ["Ollama", "Sentence Transformers"],
    category: "AI Notes",
    date: "2026-07-09",
    url: "https://x.com/AbdulHanan394"
  },
  {
    id: "a5",
    source: "github",
    type: "Release",
    title: "Shipped FocusSpark's real-time focus detection module",
    summary:
      "Integrated MediaPipe and DeepFace to compute head pose and eye-aspect-ratio in real time, feeding a behavioral analytics layer for the FocusSpark learning assistant.",
    tags: ["Computer Vision", "Final Year Project"],
    technologies: ["MediaPipe", "OpenCV", "DeepFace"],
    category: "Applied AI",
    date: "2026-07-04",
    url: "https://focusspark-frontend.vercel.app/"
  },
  {
    id: "a6",
    source: "linkedin",
    type: "Post",
    title: "Notes on activation functions for neural network intuition",
    summary:
      "Broke down when Tanh, ReLU, Sigmoid, and Softmax actually matter in practice, with a focus on building intuition rather than memorizing formulas.",
    tags: ["Deep Learning"],
    technologies: ["Neural Networks"],
    category: "Thought Leadership",
    date: "2026-06-28",
    url: "https://www.linkedin.com/in/abdulhanan394"
  }
];

const sourceMeta = {
  github: { label: "GitHub", icon: FaGithub, className: "source-github" },
  linkedin: { label: "LinkedIn", icon: FaLinkedin, className: "source-linkedin" },
  x: { label: "X", icon: FaXTwitter, className: "source-x" }
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

// ---------------------------------------------------------------------------
// AI Playground
// Ask-Abdul chat surface, styled to sit inside the same LinkedIn-like shell.
// `askAgent` below is a lightweight local stand-in for the real call to the
// Abdul Core AI Assistant endpoint (POST /api/assistant/query), which performs
// RAG over the embedded activity + profile data. Swap the body of `askAgent`
// for a fetch() once that endpoint is live:
//
// const res = await fetch("/api/assistant/query", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ question })
// });
// const { answer } = await res.json();
// ---------------------------------------------------------------------------
const suggestedPrompts = [
  "What has Abdul built recently?",
  "What's Abdul's AI stack?",
  "Is Abdul open to work?",
  "Tell me about FocusSpark"
];

function askAgent(question) {
  const q = question.toLowerCase();

  if (q.includes("recent") || q.includes("built") || q.includes("working on")) {
    return "Lately Abdul has been reworking the embedding pipeline for his personal AI Core (batched ChromaDB upserts, a GitHub collector on APScheduler), and shipping real-time focus detection for FocusSpark using MediaPipe and DeepFace.";
  }
  if (q.includes("stack") || q.includes("technolog") || q.includes("tools")) {
    return "On the AI side: FastAPI, PostgreSQL, ChromaDB, RAG, Sentence Transformers, LangChain, and Ollama for local LLMs. On the product side: React, Next.js, and TypeScript. He leans on clean, modular architecture across both.";
  }
  if (q.includes("open to work") || q.includes("hire") || q.includes("available")) {
    return "Yes — Abdul is open to Full Stack / AI Engineer roles. You can reach him at abdulhanan04@icloud.com or via LinkedIn (linkedin.com/in/abdulhanan394).";
  }
  if (q.includes("focusspark")) {
    return "FocusSpark is Abdul's final year project: an AI-powered productivity and learning assistant with real-time focus detection, document chat, flashcard/quiz generation, and behavioral analytics, built with React, FastAPI, and computer vision models.";
  }
  if (q.includes("project")) {
    return "Current projects include a Truck Dispatching Platform, a Truck Moving Company Platform, FocusSpark (an AI learning assistant), and his own Personal AI Assistant powered by RAG and ChromaDB.";
  }
  return "I'm a lightweight preview of Abdul's AI assistant — once the Abdul Core backend is wired up, this will pull live, embedding-backed answers about his projects and activity. For now, try asking about his recent work, stack, or availability.";
}

const projects = [
  {
    title: "Truck Dispatching Platform",
    meta: "BURAQDispatches • 2025",
    text:
      "Built the complete React.js frontend for a truck dispatching platform, integrated Cloudinary for document management, and consumed REST APIs to keep dispatch operations synchronized in real time.",
    stack: [
      "React.js",
      "REST APIs",
      "Cloudinary",
      "Logistics",
      "Frontend"
    ],
    link: "https://buraqdispatcher.netlify.app/"
  },
  {
    title: "FocusSpark – AI Productivity & Learning Assistant",
    meta: "Final Year Project • In Progress",
    text:
      "Developing an AI-powered productivity platform with real-time focus detection, document chat, flashcard and quiz generation, behavioral analytics, and personalized learning assistance.",
    stack: [
      "React",
      "TypeScript",
      "FastAPI",
      "PostgreSQL",
      "MediaPipe",
      "OpenCV",
      "DeepFace",
      "LLMs",
      "AI"
    ],
    link: "https://focusspark-frontend.vercel.app/"
  },
  {
    title: "Truck Moving Company Platform",
    meta: "JBeasyMovingLLC • 2025",
    text:
      "Developed a high-performance React.js frontend with Google Maps integration and Redux-powered predictive location auto-fill, improving booking accuracy and operational efficiency.",
    stack: [
      "React.js",
      "Redux",
      "Google Maps API",
      "Logistics",
      "Frontend"
    ],
    link: "https://jbeasymovingllc.netlify.app/"
  },
  {
    title: "Personal AI Assistant",
    meta: "Self-Initiated • In Progress",
    text:
      "Building a private memory-enabled AI assistant using RAG, ChromaDB, Sentence Transformers, FastAPI, Ollama, and hosted LLMs with an extensible AI agent architecture.",
    stack: [
      "React",
      "FastAPI",
      "ChromaDB",
      "RAG",
      "LLMs",
      "AI Agents",
      "Ollama"
    ],
    link: "https://github.com/AbdulHanan394"
  }
];

const experience = [
  ["Full Stack Engineer", "JBeasyMovingLLC", "2025 - Present", "Truck Moving Company Platform - Logistics Industry"],
  ["Full Stack Engineer", "BURAQDispatches", "2025 - Present", "Truck Dispatching Platform - Logistics Industry"]
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
      "CSS3"
    ]
  },
  {
    title: "Frontend Development",
    skills: [
      "React.js",
      "Next.js",
      "Redux",
      "Context API",
      "Tailwind CSS"
    ]
  },
  {
    title: "Backend Development",
    skills: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "REST APIs",
      "GraphQL",
      "JWT Authentication"
    ]
  },
  {
    title: "Databases",
    skills: [
      "MongoDB",
      "MySQL",
      "PostgreSQL",
      "ChromaDB"
    ]
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
      "Pandas"
    ]
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
      "Tool Calling"
    ]
  },
  {
    title: "RAG & Semantic Search",
    skills: [
      "Retrieval-Augmented Generation (RAG)",
      "Sentence Transformers",
      "Embeddings",
      "Semantic Search",
      "Vector Databases"
    ]
  },
  {
    title: "Computer Vision",
    skills: [
      "OpenCV",
      "MediaPipe",
      "DeepFace",
      "Head Pose Estimation",
      "Eye Aspect Ratio (EAR)"
    ]
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
      "Ollama"
    ]
  },
  {
    title: "Software Engineering",
    skills: [
      "Clean Architecture",
      "Scalable Systems",
      "Modular Design",
      "Performance Optimization",
      "Software Design Patterns",
      "Data Structures & Algorithms"
    ]
  }
];

const viewers = [
  "Customer Service Specialist at AT&T",
  "Software Developer at NeuroFive solutions",
  "Someone at University of Central Punjab",
  "AI Engineer in Lahore"
];

function Icon({ children }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

// ---------------------------------------------------------------------------
// Slider — horizontal, scroll-snapped carousel used for feeds that can grow
// large (Activity Intelligence, Posts). Avoids ever-growing vertical scroll
// when there are dozens/hundreds of items; drag/swipe works natively via
// native overflow scroll, arrows are a convenience for pointer/keyboard users.
// ---------------------------------------------------------------------------
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

      <div className="slider-track" ref={trackRef} role="list" aria-label={ariaLabel}>
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
          <p className="muted">{profile.location} - <a href="#contact">Contact info</a></p>
          <p className="linkline">{profile.followers}</p>
          <div className="profile-actions">
            <a className="outline-pill" href="#contact">Open to</a>
            <a className="outline-pill" href="#projects">Projects</a>
            <a className="outline-pill" href="#skills">Skills</a>
            <button type="button" className="outline-pill" onClick={onAskAI}>
              Ask AI
            </button>
          </div>
        </div>
        <div className="profile-orgs">
         
          <p><span className="org-mark blue">U</span>{profile.university}</p>
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
        <img
          src="/profile-card_01.png"
          alt="Abdul Hanan"
        />
      </div>

      <div className="snapshot-body">
        <h2>{profile.name}</h2>

        <p className="snapshot-focus">
          {profile.focus}
        </p>

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

    setTimeout(() => {
      setCopied("");
    }, 2000); // Reset after 2 seconds
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};
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
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  }}
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
      "linkedin"
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
    copyToClipboard(
      "https://github.com/AbdulHanan394",
      "github"
    )
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
    copyToClipboard(
      "https://x.com/AbdulHanan394",
      "x"
    )
  }
/>
    </div>
  </div>
</div>
        <ThemeButton theme={theme} setTheme={setTheme} />
      </div>

      <div className="rail-card">
        <h3>You May Know</h3>
        {viewers.map((item, index) => (
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
// Activity Intelligence section — renders the AI-enriched activity feed
// produced by the Abdul Core pipeline (Collector -> Normalizer -> AI
// Summarizer -> Tag Extractor -> Embedding Generator -> Storage -> API).
// ---------------------------------------------------------------------------
function ActivityIntelligence() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? intelActivities
      : intelActivities.filter((item) => item.source === filter);

  return (
    <Section
      id="activity-intelligence"
      title="Activity Intelligence"
      action={<span className="tiny-action live-pill"><span className="live-dot" />Live feed</span>}
    >
      <p className="about-text intel-lede">
        Auto-collected from GitHub, LinkedIn, and X, then summarized and tagged by
        Abdul&apos;s own AI pipeline — no manual copywriting.
      </p>

      <div className="tabs" aria-label="Filter activity by source">
        {[
          { id: "all", label: "All" },
          { id: "github", label: "GitHub" },
          { id: "linkedin", label: "LinkedIn" },
          { id: "x", label: "X" }
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
          const meta = sourceMeta[item.source];
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
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                {item.technologies.map((tech) => (
                  <span key={tech} className="tech-chip">{tech}</span>
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
// Shared chat state — used by both the "AI Playground" teaser section and the
// floating widget, so a prompt started from either place lands in the same
// conversation.
// ---------------------------------------------------------------------------
function useAgentChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey, I'm a preview of Abdul's AI assistant. Ask me about his projects, stack, or availability."
    }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = (text) => {
    const question = (text ?? input).trim();
    if (!question || thinking) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setThinking(true);

    // Stand-in for a call to the Abdul Core RAG endpoint. See comment above
    // `askAgent` for the real fetch() to swap in.
    setTimeout(() => {
      const answer = askAgent(question);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      setThinking(false);
    }, 650);
  };

  return { messages, input, setInput, thinking, send };
}

// ---------------------------------------------------------------------------
// AI Playground — full inline chat surface, kept in the page flow. Shares
// the same `chat` state as the floating widget below, so a conversation
// started here or from the floating button stays in sync either way.
// ---------------------------------------------------------------------------
function AIPlayground({ chat }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages, chat.thinking]);

  return (
    <Section
      id="ai-playground"
      title="AI Playground"
      action={<span className="tiny-action live-pill"><Bot size={14} />Ask Abdul</span>}
    >
      <p className="about-text intel-lede">
        A preview of Abdul&apos;s personal AI assistant — answers are grounded in
        his real projects and activity, powered by RAG once the Abdul Core
        backend is live. It&apos;s also docked bottom-right so you can keep
        chatting while you browse.
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
              <p>{m.content}</p>
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

// ---------------------------------------------------------------------------
// Floating chat widget — a persistent, dockable "menu bar" style entry point.
// A round button stays fixed in the corner at all times; clicking it toggles
// an expandable chat panel open/closed without leaving whatever section
// you're scrolled to.
// ---------------------------------------------------------------------------
function FloatingChatWidget({ open, setOpen, chat }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
        <div className="floating-chat-panel" role="dialog" aria-label="Ask Abdul's AI assistant">
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
                <p>{m.content}</p>
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

export default function PortfolioPage() {
  const [theme, setTheme] = useState("dark");
  const [chatOpen, setChatOpen] = useState(false);
  const chat = useAgentChat();

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme");
    if (saved) {
      setTheme(saved);
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

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

          <Section title="About" action={<a className="tiny-action" href="#contact">Contact</a>}>
            <p className="about-text" id="about">
            I'm a Full-Stack AI Engineer with a strong foundation in Software Engineering, passionate about building intelligent, scalable, and production-ready applications that combine modern software development with Artificial Intelligence.
 <br></br><br></br>
My expertise spans Python, React.js, Node.js, FastAPI, Express.js, PostgreSQL, MongoDB, Docker, REST APIs, CI/CD, and cloud-native development, alongside AI technologies including Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), AI Agents, Vector Databases, Semantic Search, Prompt Engineering, and Transformer-based architectures. <br></br><br></br>
 
I enjoy designing end-to-end AI systems by applying software engineering principles such as clean architecture, modular design, scalability, maintainability, and performance optimization. My interests include Generative AI, intelligent automation, autonomous agents, AI-powered developer tools, and production AI applications.
 <br></br><br></br>
I'm always exploring new technologies, solving challenging engineering problems, and collaborating on projects that push the boundaries of AI and software engineering.
            </p>
          </Section>

          <AIPlayground chat={chat} />

          <ActivityIntelligence />

          <Section title="Posts">
            <div className="tabs" aria-label="Activity filters">
              <button type="button" className="active">Posts</button>
        
            </div>
            <Slider ariaLabel="Recent posts">
              {activities.map((activity, index) => (
                <article className="activity-card slide-item" key={activity.title}>
                  <div className="activity-head">
                    <span className="mini-avatar avatar-photo" />
                    <div>
                      <strong>{profile.name}</strong>
                      <p>{activity.tag}</p>
                    </div>
                  </div>
                  <h3>{activity.title}</h3>
                  <p >{activity.text}</p>
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
  action={<a className="tiny-action" href="#contact">Hire me</a>}
  id="projects"
>
  <div className="project-list">
    {projects.map((project) => (
      <article className="project-card" key={project.title}>
        <div>
          <h3>{project.title}</h3>
          <p className="muted">{project.meta}</p>
          <p>{project.text}</p>
        </div>

        <div className="chip-row">
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="linkedin-btn"
            style={{
              marginTop: "16px",
              alignSelf: "flex-start",
            }}
          >
            View Project →
          </a>
        )}
      </article>
    ))}
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
                  Relevant coursework: Data Structures & Algorithms, Database Systems,
                  Web Engineering, Applied Machine Learning, Software Design Patterns,
                  Operating Systems, Computer Networks, Information Security.
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

      <a
        href={`mailto:${profile.email}`}
        className="footer-email"
      >
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