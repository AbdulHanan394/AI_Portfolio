"use client";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Send,
  Sparkles,
  Bot,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Menu,
  Sun,
  Moon,
  GraduationCap,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaUser,
  FaXTwitter,
  FaEnvelope,
} from "react-icons/fa6";
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
  {
    title: "Dynamic AI Portfolio",
    meta: "Personal Portfolio • 2026",
    text: "Built this portfolio as a live AI-powered platform rather than a static page — an Abdul Core RAG backend grounds a chat assistant in real project and activity data, with in-response Mermaid diagrams and live in-browser Python execution (via Pyodide) rendered directly inside the chat.",
    stack: [
      "Next.js",
      "React",
      "FastAPI",
      "PostgreSQL",
      "ChromaDB",
      "RAG",
      "LangChain",
      "Mermaid",
      "Pyodide",
    ],
    link: "https://abdulhanan394.netlify.app/",
  },
];
const sourceMeta = {
  github: {
    label: "GitHub",
    icon: FaGithub,
    className: "source-github",
  },

  linkedin: {
    label: "LinkedIn",
    icon: FaLinkedin,
    className: "source-linkedin",
  },

  x: {
    label: "X",
    icon: FaXTwitter,
    className: "source-x",
  },

  portfolio: {
    label: "Portfolio",
    icon: FaUser,
    className: "source-portfolio",
  },
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
];

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

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function Icon({ children }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}

/* -----------------------------------------------------------------------
 * Mermaid diagram renderer
 * Renders fenced ```mermaid code blocks coming back from the AI assistant
 * as actual SVG diagrams instead of raw text. Kept in this file per request.
 * --------------------------------------------------------------------- */

let mermaidInitialized = false;
let mermaidCurrentTheme = null;

function ensureMermaidInitialized(theme) {
  const mermaidTheme = theme === "light" ? "default" : "dark";
  if (!mermaidInitialized || mermaidCurrentTheme !== mermaidTheme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: mermaidTheme,
      fontFamily: "inherit",
    });
    mermaidInitialized = true;
    mermaidCurrentTheme = mermaidTheme;
  }
}

function Mermaid({ chart, theme = "dark" }) {
  const containerRef = useRef(null);
  const rawId = useId().replace(/[:]/g, "");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setError(null);
      try {
        ensureMermaidInitialized(theme);
        const { svg } = await mermaid.render(`mermaid-${rawId}`, chart.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (!cancelled) setError(err?.message || "Failed to render diagram");
      }
    }

    if (chart && chart.trim()) render();

    return () => {
      cancelled = true;
    };
  }, [chart, theme, rawId]);

  return (
    <div className="mermaid-wrap">
      <div className="mermaid-diagram" ref={containerRef} />
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Live in-browser Python execution (Pyodide)
 * Renders fenced ```python code blocks with a Run button. Executing runs
 * real Python — including matplotlib — inside a sandboxed WebAssembly
 * runtime in the visitor's own tab. Nothing leaves the browser and it
 * can't touch the filesystem or network. Pyodide + matplotlib are loaded
 * lazily, on first "Run" click, and cached for the rest of the session.
 * --------------------------------------------------------------------- */

const PYODIDE_VERSION = "0.26.1";
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideLoadPromise = null;

function loadPyodideScriptTag() {
  if (typeof window === "undefined")
    return Promise.reject(new Error("No window"));
  if (window.loadPyodide) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-pyodide-loader="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Pyodide script")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `${PYODIDE_CDN_BASE}pyodide.js`;
    script.async = true;
    script.dataset.pyodideLoader = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pyodide script"));
    document.head.appendChild(script);
  });
}

// Returns a shared, cached Pyodide instance (with matplotlib/numpy
// preloaded) for the whole tab. Only the first caller pays the cold-start
// cost; everyone after gets the same warm instance.
function getSharedPyodide(onStatus) {
  if (!pyodideLoadPromise) {
    pyodideLoadPromise = (async () => {
      onStatus?.("Downloading Python runtime…");
      await loadPyodideScriptTag();
      const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN_BASE });
      onStatus?.("Installing matplotlib & numpy…");
      await pyodide.loadPackage(["matplotlib", "numpy"]);
      return pyodide;
    })().catch((err) => {
      // Allow retrying on failure instead of caching a broken promise forever.
      pyodideLoadPromise = null;
      throw err;
    });
  }
  return pyodideLoadPromise;
}

function indentPythonBlock(code) {
  return code
    .split("\n")
    .map((line) => "    " + line)
    .join("\n");
}

function PythonRunner({ code }) {
  const [status, setStatus] = useState("idle"); // idle | loading | running | done | error
  const [statusMessage, setStatusMessage] = useState("");
  const [images, setImages] = useState([]);
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState(null);
  const [showCode, setShowCode] = useState(true);

  const isBusy = status === "loading" || status === "running";

  const run = async () => {
    setStatus("loading");
    setError(null);
    setImages([]);
    setStdout("");

    try {
      const pyodide = await getSharedPyodide((msg) => setStatusMessage(msg));
      setStatus("running");
      setStatusMessage("Running…");

      // Force a non-interactive backend, capture stdout, and collect any
      // matplotlib figures the user's code opened as base64 PNGs.
      const wrapped = `
import io, base64, json, sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

__stdout_buf = io.StringIO()
__real_stdout = sys.stdout
sys.stdout = __stdout_buf
__error = None

try:
${indentPythonBlock(code)}
except Exception as __exc:
    __error = f"{type(__exc).__name__}: {__exc}"
finally:
    sys.stdout = __real_stdout

__images = []
for __fignum in plt.get_fignums():
    __fig = plt.figure(__fignum)
    __buf = io.BytesIO()
    __fig.savefig(__buf, format="png", bbox_inches="tight", dpi=140)
    __buf.seek(0)
    __images.append(base64.b64encode(__buf.read()).decode("utf-8"))
plt.close("all")

json.dumps({"images": __images, "stdout": __stdout_buf.getvalue(), "error": __error})
`;

      const resultJson = await pyodide.runPythonAsync(wrapped);
      const result = JSON.parse(resultJson);

      if (result.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setImages(result.images || []);
        setStdout(result.stdout || "");
        setStatus("done");
      }
    } catch (err) {
      console.error("Pyodide execution failed:", err);
      setError(err?.message || String(err));
      setStatus("error");
    }
  };

  return (
    <div className="py-runner">
      <div className="py-runner-head">
        <span className="py-runner-label">
          <Sparkles size={12} />
          Python (runs in your browser)
        </span>
        <div className="py-runner-actions">
          <button
            type="button"
            className="py-mini-btn"
            onClick={() => setShowCode((v) => !v)}
          >
            {showCode ? "Hide code" : "Show code"}
          </button>
          <button
            type="button"
            className="py-run-btn"
            onClick={run}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <RefreshCw size={12} className="py-spin" />
                {statusMessage || "Working…"}
              </>
            ) : status === "done" ? (
              <>
                <RefreshCw size={12} />
                Run again
              </>
            ) : (
              <>▶ Run</>
            )}
          </button>
        </div>
      </div>

      {showCode && (
        <pre className="py-code-block">
          <code>{code}</code>
        </pre>
      )}

      {status === "error" && (
        <div className="py-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      {stdout && <pre className="py-stdout">{stdout}</pre>}

      {images.length > 0 && (
        <div className="py-images">
          {images.map((b64, i) => (
            <img
              key={i}
              src={`data:image/png;base64,${b64}`}
              alt={`Python output ${i + 1}`}
              className="py-output-image"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function useAutoScrollOnSend(scrollRef, messages, thinking) {
  const prevLenRef = useRef(messages.length);
  const prevThinkingRef = useRef(thinking);

  useEffect(() => {
    const el = scrollRef.current;
    const lastMessage = messages[messages.length - 1];
    const grew = messages.length > prevLenRef.current;
    const thinkingJustStarted = thinking && !prevThinkingRef.current;
    const isNewUserMessage = grew && lastMessage?.role === "user";

    if (el && (isNewUserMessage || thinkingJustStarted)) {
      el.scrollTop = el.scrollHeight;
    }

    prevLenRef.current = messages.length;
    prevThinkingRef.current = thinking;
  }, [messages, thinking, scrollRef]);
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

function ThemeButton({ theme, setTheme, fullWidth = false }) {
  const isDark = theme === "dark";
  const [hover, setHover] = useState(false);

  const wrapStyle = {
    position: "relative",
    display: "inline-flex",
    width: "16px",
    height: "16px",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const iconBaseStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    transition:
      "transform 0.35s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.25s ease",
  };

  const sunStyle = {
    ...iconBaseStyle,
    color: "var(--gold)",
    opacity: isDark ? 0 : 1,
    transform: isDark ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
  };

  const moonStyle = {
    ...iconBaseStyle,
    color: "var(--accent)",
    opacity: isDark ? 1 : 0,
    transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: fullWidth ? "center" : "flex-start",
    gap: "8px",
    width: fullWidth ? "100%" : "auto",
    padding: fullWidth ? "11px 14px" : "7px 12px",
    borderRadius: "999px",
    border: "1px solid var(--line)",
    background: hover ? "var(--surface-3)" : "var(--surface-2)",
    color: "var(--text)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
  };

  return (
    <button
      type="button"
      style={buttonStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span style={wrapStyle}>
        <Sun size={16} style={sunStyle} />
        <Moon size={16} style={moonStyle} />
      </span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#ai-playground", label: "AI Assistant" },
  { href: "#activity-intelligence", label: "Activity" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
];

function NavLink({ href, label, isActive, isMobile, onNavigate }) {
  const [hover, setHover] = useState(false);
  const underlineOn = hover || isActive;

  const linkStyle = isMobile
    ? {
        position: "relative",
        display: "block",
        margin: 0,
        padding: "13px 14px",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: 600,
        color: "inherit",
        opacity: isActive ? 1 : 0.68,
        textDecoration: "none",
        background: isActive
          ? "color-mix(in srgb, var(--accent) 14%, transparent)"
          : hover
            ? "color-mix(in srgb, var(--accent) 10%, transparent)"
            : "transparent",
        transition: "opacity 0.2s ease, color 0.2s ease, background 0.15s ease",
      }
    : {
        position: "relative",
        display: "inline-block",
        padding: "7px 4px",
        margin: "0 10px",
        fontSize: "13.5px",
        fontWeight: 600,
        color: isActive || hover ? "var(--accent)" : "inherit",
        opacity: isActive || hover ? 1 : 0.68,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "opacity 0.2s ease, color 0.2s ease",
      };

  const underlineStyle = isMobile
    ? {
        content: '""',
        position: "absolute",
        left: "14px",
        right: "14px",
        bottom: "6px",
        height: "2px",
        borderRadius: "2px",
        background:
          "linear-gradient(90deg, var(--accent), var(--accent-strong))",
        transform: underlineOn ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "center",
        transition: "transform 0.28s cubic-bezier(0.65, 0, 0.35, 1)",
      }
    : {
        content: '""',
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "2px",
        height: "2px",
        borderRadius: "2px",
        background:
          "linear-gradient(90deg, var(--accent), var(--accent-strong))",
        transform: underlineOn ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "center",
        transition: "transform 0.28s cubic-bezier(0.65, 0, 0.35, 1)",
      };

  return (
    <a
      href={href}
      style={linkStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onNavigate}
    >
      {label}
      <span style={underlineStyle} aria-hidden="true" />
    </a>
  );
}

function TopBar({ theme, setTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("about");
  const [isMobile, setIsMobile] = useState(false);
  const [isTiny, setIsTiny] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(62);
  const [brandHover, setBrandHover] = useState(false);
  const [toggleHover, setToggleHover] = useState(false);
  const navRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 860px)");
    const tinyQuery = window.matchMedia("(max-width: 380px)");

    const updateMobile = () => setIsMobile(mobileQuery.matches);
    const updateTiny = () => setIsTiny(tinyQuery.matches);

    updateMobile();
    updateTiny();

    mobileQuery.addEventListener("change", updateMobile);
    tinyQuery.addEventListener("change", updateTiny);
    return () => {
      mobileQuery.removeEventListener("change", updateMobile);
      tinyQuery.removeEventListener("change", updateTiny);
    };
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [isMobile, scrolled]);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) =>
      document.getElementById(l.href.slice(1)),
    ).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const headerOuterStyle = {
    position: "sticky",
    top: 0,
    zIndex: 9998,
  };

  const headerBarStyle = {
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    background: "color-mix(in srgb, var(--surface) 85%, transparent)",
    borderBottom: "1px solid var(--line)",
    boxShadow: scrolled ? "0 10px 28px -14px rgba(0, 0, 0, .35)" : "none",
    transition: "box-shadow 0.25s ease, background 0.2s ease",
  };

  const innerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: isMobile ? "10px" : "20px",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: isMobile
      ? scrolled
        ? "8px 18px"
        : "10px 18px"
      : scrolled
        ? "8px 32px"
        : "12px 32px",
    transition: "padding 0.25s ease",
  };

  const brandStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    flexShrink: 0,
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: isTiny ? "13px" : "14px",
    letterSpacing: "0.02em",
    color: "#fff",
    background:
      "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
    boxShadow: brandHover
      ? "0 6px 20px -4px color-mix(in srgb, var(--accent-strong) 55%, transparent)"
      : "0 4px 14px -4px color-mix(in srgb, var(--accent-strong) 45%, transparent)",
    transform: brandHover
      ? "translateY(-1px) scale(1.05)"
      : "translateY(0) scale(1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",

    textDecoration: "none",
  };

  const navStyle = isMobile
    ? {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "10px",
        position: "fixed",
        top: `${headerHeight}px`,
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: "none",
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        padding: "12px 16px calc(24px + env(safe-area-inset-bottom))",
        background: "color-mix(in srgb, var(--surface) 97%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--line)",
        transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
        opacity: menuOpen ? 1 : 0,
        visibility: menuOpen ? "visible" : "hidden",
        pointerEvents: menuOpen ? "auto" : "none",
        transition:
          "transform 0.22s ease, opacity 0.22s ease, visibility 0.22s",
        zIndex: 9999,
      }
    : {
        display: "flex",
        alignItems: "center",
        gap: "2px",
        flex: 1,
        justifyContent: "center",
      };

  const actionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  };

  const toggleStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    border: "1px solid var(--line)",
    background: toggleHover ? "var(--surface-3)" : "var(--surface-2)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
    flexShrink: 0,
  };

  const mobileThemeWrapStyle = {
    marginTop: "10px",
    paddingTop: "14px",
    borderTop: "1px solid var(--line)",
  };

  const navLinksNode = NAV_LINKS.map((link) => (
    <NavLink
      key={link.href}
      href={link.href}
      label={link.label}
      isActive={activeId === link.href.slice(1)}
      isMobile={isMobile}
      onNavigate={() => setMenuOpen(false)}
    />
  ));

  return (
    <header ref={headerRef} style={headerOuterStyle}>
      <div ref={navRef}>
        <div style={headerBarStyle}>
          <div style={innerStyle}>
            <a
              href="#top"
              aria-label="Portfolio home"
              style={brandStyle}
              onMouseEnter={() => setBrandHover(true)}
              onMouseLeave={() => setBrandHover(false)}
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  filter: brandHover
                    ? "drop-shadow(0 0 5px rgba(255,255,255,0.75))"
                    : "drop-shadow(0 0 0px rgba(255,255,255,0))",
                  transition: "filter 0.3s ease",
                }}
              >
                <path
                  d="M12 4L5 18M12 4L19 18M12 4L12 12M5 18L12 12M19 18L12 12"
                  stroke="#fff"
                  strokeWidth="1.3"
                  strokeOpacity="0.6"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="4" r="2.1" fill="#fff" />
                <circle cx="5" cy="18" r="2.1" fill="#fff" />
                <circle cx="19" cy="18" r="2.1" fill="#fff" />
                <circle
                  cx="12"
                  cy="12"
                  r="1.6"
                  fill="#fff"
                  opacity={brandHover ? 1 : 0.85}
                  style={{ transition: "opacity 0.3s ease" }}
                />
              </svg>
            </a>

            {!isMobile && (
              <nav style={navStyle} aria-label="Portfolio sections">
                {navLinksNode}
              </nav>
            )}

            <div style={actionsStyle}>
              {!isMobile && <ThemeButton theme={theme} setTheme={setTheme} />}
              {isMobile && (
                <button
                  type="button"
                  style={toggleStyle}
                  onMouseEnter={() => setToggleHover(true)}
                  onMouseLeave={() => setToggleHover(false)}
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {isMobile && (
          <nav style={navStyle} aria-label="Portfolio sections">
            {navLinksNode}
            <div style={mobileThemeWrapStyle}>
              <ThemeButton theme={theme} setTheme={setTheme} fullWidth />
            </div>
          </nav>
        )}
      </div>
    </header>
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
            <span className="org-mark blue">
              <GraduationCap size={16} color="#fff" />
            </span>
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
          const meta =
            item.type === "linkedin_post"
              ? sourceMeta.linkedin
              : sourceMeta[item.source] || sourceMeta.portfolio;
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

function useAgentChat() {
  const [messages, setMessages] = useState([
    {
      id: genId(),
      role: "assistant",
      content:
        "Hey, I'm Abdul's AI assistant. Ask me about his projects, stack, or availability.",
      status: "sent",
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingOriginal, setEditingOriginal] = useState("");

  const updateMessage = (id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  };

  const removeMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const extractContent = (response) => {
    if (typeof response === "string") return response;
    if (response?.content) {
      return typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    }
    if (response?.answer) return response.answer;
    if (response?.response) return response.response;
    if (response?.message) {
      return typeof response.message === "string"
        ? response.message
        : response.message.content || JSON.stringify(response.message);
    }
    return JSON.stringify(response);
  };

  const performSend = async (question, userMsgId) => {
    setThinking(true);
    try {
      const history = messages
        .filter((m) => m.role === "user" || m.status === "sent")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await askAssistant(question, history);
      console.log("AI RESPONSE:", response);

      const content = extractContent(response);

      updateMessage(userMsgId, { status: "sent" });
      setMessages((prev) => [
        ...prev,
        { id: genId(), role: "assistant", content, status: "sent", userMsgId },
      ]);
    } catch (err) {
      console.error("Assistant request failed:", err);
      updateMessage(userMsgId, { status: "error" });
      setMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: "assistant",
          content: askAgentOffline(question),
          status: "offline",
          retryText: question,
          userMsgId,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const beginEdit = (message) => {
    if (thinking) return;
    setEditingId(message.id);
    setEditingOriginal(message.content);
    setInput(message.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingOriginal("");
    setInput("");
  };

  const send = async (text) => {
    if (text === undefined && editingId) {
      const value = input.trim();
      if (!value || value === editingOriginal.trim() || thinking) return;

      const targetId = editingId;
      setEditingId(null);
      setEditingOriginal("");
      setInput("");

      setMessages((prev) =>
        prev.filter(
          (m) => !(m.role === "assistant" && m.userMsgId === targetId),
        ),
      );
      updateMessage(targetId, { content: value, status: "sending" });

      await performSend(value, targetId);
      return;
    }

    if (editingId) {
      setEditingId(null);
      setEditingOriginal("");
    }

    const question = (text ?? input).trim();
    if (!question || thinking) return;

    const userMsgId = genId();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: question, status: "sending" },
    ]);
    setInput("");

    await performSend(question, userMsgId);
  };

  const retry = async (message) => {
    if (thinking) return;

    let question;
    let userMsgId;

    if (message.role === "user") {
      question = message.content;
      userMsgId = message.id;
    } else {
      question = message.retryText;
      userMsgId = message.userMsgId;
      if (!question || !userMsgId) return;
      removeMessage(message.id);
    }

    updateMessage(userMsgId, { status: "sending" });
    await performSend(question, userMsgId);
  };

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(
        () => setCopiedId((current) => (current === id ? "" : current)),
        1500,
      );
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return {
    messages,
    input,
    setInput,
    thinking,
    send,
    retry,
    beginEdit,
    cancelEditing,
    editingId,
    editingOriginal,
    copy,
    copiedId,
  };
}

function ChatBubble({
  message,
  thinking,
  onCopy,
  onRetry,
  onStartEdit,
  copied,
  editingId,
  theme,
}) {
  const isFailed = message.status === "error";
  const isOffline = message.status === "offline";
  const isSending = message.status === "sending";
  const isUser = message.role === "user";
  const isBeingEdited = editingId === message.id;

  return (
    <div
      className={`chat-message ${message.role} ${isFailed ? "is-error" : ""} ${
        isBeingEdited ? "is-editing-target" : ""
      }`}
    >
      {message.role === "assistant" && (
        <span className="chat-avatar">
          <Bot size={16} />
        </span>
      )}
      <div className="chat-bubble-wrap">
        <div className="chat-bubble-wrap">
          <div className="markdown-content">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="markdown-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),

                table: ({ children }) => (
                  <div className="markdown-table-wrap">
                    <table className="markdown-table">{children}</table>
                  </div>
                ),

                thead: ({ children }) => <thead>{children}</thead>,

                th: ({ children }) => <th>{children}</th>,

                td: ({ children }) => <td>{children}</td>,

                // Intercept fenced code blocks. If the language is
                // "mermaid", render an actual diagram instead of a
                // plain <code> block.
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match?.[1];
                  const raw = String(children).replace(/\n$/, "");

                  if (lang === "mermaid") {
                    return <Mermaid chart={raw} theme={theme} />;
                  }

                  if (lang === "python" || lang === "py") {
                    return <PythonRunner code={raw} />;
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
          </div>
        </div>

        {isBeingEdited && (
          <div className="chat-meta-row">
            <span className="chat-badge chat-badge-editing">
              <Pencil size={12} />
              Editing…
            </span>
          </div>
        )}

        {isSending && (
          <div className="chat-meta-row">
            <span className="chat-badge chat-badge-sending">Sending…</span>
          </div>
        )}

        {isFailed && (
          <div className="chat-meta-row">
            <span className="chat-badge chat-badge-error">
              <AlertCircle size={12} />
              Failed to send
            </span>
            <button
              type="button"
              className="chat-mini-btn"
              onClick={() => onRetry(message)}
              disabled={thinking}
            >
              <RefreshCw size={12} />
              Resend
            </button>
          </div>
        )}

        {isOffline && (
          <div className="chat-meta-row">
            <span className="chat-badge chat-badge-offline">
              Offline preview
            </span>
            <button
              type="button"
              className="chat-mini-btn"
              onClick={() => onRetry(message)}
              disabled={thinking}
            >
              <RefreshCw size={12} />
              Try live answer
            </button>
            <button
              type="button"
              className="chat-icon-btn chat-icon-btn-inline"
              onClick={() => onCopy(message.id, message.content)}
              aria-label="Copy message"
              title={copied ? "Copied" : "Copy"}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        )}

        {!isOffline && !isBeingEdited && (
          <div className="chat-actions">
            {isUser && !isSending && (
              <button
                type="button"
                className="chat-icon-btn"
                onClick={() => onStartEdit(message)}
                aria-label="Edit message"
                title="Edit"
                disabled={thinking}
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              type="button"
              className="chat-icon-btn"
              onClick={() => onCopy(message.id, message.content)}
              aria-label="Copy message"
              title={copied ? "Copied" : "Copy"}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AIPlayground({ chat, theme }) {
  const scrollRef = useRef(null);

  useAutoScrollOnSend(scrollRef, chat.messages, chat.thinking);

  return (
    <Section
      id="ai-playground"
      title="AI Playground"
      action={
        <span className="tiny-action live-pill">
          <Bot size={14} />
          Ask about Hanan
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
          {chat.messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              thinking={chat.thinking}
              onCopy={chat.copy}
              onRetry={chat.retry}
              onStartEdit={chat.beginEdit}
              editingId={chat.editingId}
              copied={chat.copiedId === m.id}
              theme={theme}
            />
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

        {chat.editingId && (
          <div className="chat-editing-banner">
            <span>
              <Pencil size={12} />
              Editing message
            </span>
            <button
              type="button"
              onClick={chat.cancelEditing}
              aria-label="Cancel edit"
              className="chat-editing-cancel"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        )}

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
            placeholder={
              chat.editingId
                ? "Edit your message..."
                : "Ask about Abdul's work..."
            }
            aria-label="Ask Abdul Hanan's AI assistant"
          />
          <button
            type="submit"
            className="chat-send"
            disabled={
              chat.thinking ||
              !chat.input.trim() ||
              (chat.editingId &&
                chat.input.trim() === chat.editingOriginal.trim())
            }
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Section>
  );
}

function FloatingChatWidget({ open, setOpen, chat, theme }) {
  const scrollRef = useRef(null);

  useAutoScrollOnSend(scrollRef, chat.messages, chat.thinking);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open]);

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
          aria-label="Ask My AI assistant"
        >
          <div className="floating-chat-header">
            <span className="floating-chat-title">
              <Bot size={16} />
              Ask Abdul Hanan's AI
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
            {chat.messages.map((m) => (
              <ChatBubble
                key={m.id}
                message={m}
                thinking={chat.thinking}
                onCopy={chat.copy}
                onRetry={chat.retry}
                onStartEdit={chat.beginEdit}
                editingId={chat.editingId}
                copied={chat.copiedId === m.id}
                theme={theme}
              />
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

          {chat.editingId && (
            <div className="chat-editing-banner floating-chat-editing-banner">
              <span>
                <Pencil size={12} />
                Editing message
              </span>
              <button
                type="button"
                onClick={chat.cancelEditing}
                aria-label="Cancel edit"
                className="chat-editing-cancel"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          )}

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
              placeholder={
                chat.editingId
                  ? "Edit your message..."
                  : "Ask about Abdul's work..."
              }
              aria-label="Message Abdul's AI assistant"
            />
            <button
              type="submit"
              className="chat-send"
              disabled={
                chat.thinking ||
                !chat.input.trim() ||
                (chat.editingId &&
                  chat.input.trim() === chat.editingOriginal.trim())
              }
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
      <TopBar theme={theme} setTheme={setTheme} />

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

          <AIPlayground chat={chat} theme={theme} />
          <ActivityIntelligence />

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
              <span className="school-logo">
                <GraduationCap size={22} color="#fff" />
              </span>
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

      <FloatingChatWidget
        open={chatOpen}
        setOpen={setChatOpen}
        chat={chat}
        theme={theme}
      />

      <style jsx global>{`
        .chat-bubble-wrap {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .markdown-content > *:first-child {
          margin-top: 0;
        }
        .markdown-content > *:last-child {
          margin-bottom: 0;
        }
        .chat-message:hover .chat-actions {
          opacity: 1;
          pointer-events: auto;
        }
        .chat-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 6px;
          margin-top: 1px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }
        .chat-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(148, 163, 184, 0.08);
          color: inherit;
          cursor: pointer;
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }
        .chat-icon-btn:hover {
          background: rgba(148, 163, 184, 0.2);
        }
        .chat-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .chat-icon-btn-inline {
          width: 20px;
          height: 20px;
          margin-left: 2px;
        }
        .chat-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .chat-badge-sending {
          color: #94a3b8;
          background: rgba(148, 163, 184, 0.15);
        }
        .chat-badge-error {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
        }
        .chat-badge-offline {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
        }
        .chat-mini-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: transparent;
          color: inherit;
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }
        .chat-mini-btn:hover:not(:disabled) {
          background: rgba(148, 163, 184, 0.15);
          border-color: rgba(148, 163, 184, 0.6);
        }
        .chat-mini-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-edit-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .chat-message.is-editing-target {
          opacity: 0.75;
        }
        .chat-badge-editing {
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 12%, transparent);
        }
        .chat-editing-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 10px;
          margin-bottom: 4px;
          border-radius: 10px;
          border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
          background: color-mix(in srgb, var(--accent) 8%, transparent);
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
        }
        .chat-editing-banner span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .chat-editing-cancel {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          color: inherit;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 6px;
        }
        .chat-editing-cancel:hover {
          background: color-mix(in srgb, var(--accent) 15%, transparent);
        }

        /* Mermaid diagram styling */
        .mermaid-wrap {
          margin: 10px 0;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: color-mix(in srgb, var(--surface-2) 60%, transparent);
          overflow-x: auto;
        }
        .mermaid-diagram {
          display: flex;
          justify-content: center;
          min-width: max-content;
        }
        .mermaid-diagram svg {
          max-width: none;
          height: auto;
        }
        .mermaid-error {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          font-size: 12px;
        }
        .mermaid-error pre {
          white-space: pre-wrap;
          font-size: 11px;
          opacity: 0.8;
          margin: 0;
        }

        /* Prevent wide content (tables, long code, diagrams) from
           blowing out the chat bubble / floating panel width. Flex
           children default to min-width:auto, which lets oversized
           content force the whole chain wider instead of scrolling
           inside its own box. */
        .chat-message {
          min-width: 0;
        }
        .chat-bubble-wrap {
          min-width: 0;
          max-width: 100%;
        }
        .markdown-content {
          min-width: 0;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Assistant replies get real room to breathe — the 82% cap from
           the base .chat-message rule was leaving a dead gap on the right
           for anything with headings/lists/tables. User bubbles stay
           compact and right-aligned. */
        .chat-message.assistant {
          max-width: 96%;
        }
        .chat-message.user {
          max-width: 82%;
        }

        /* One card background for the whole assistant response instead of
           one box per <p>/<h3> inside it — this is what was causing the
           "boxed header" look, since the base CSS applies the bubble
           background to every <p> tag markdown renders. */
        .chat-message.assistant .markdown-content {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          border-top-left-radius: 4px;
          padding: 12px 16px;
          color: var(--text);
        }
        .chat-message.assistant .markdown-content p {
          background: none;
          border: none;
          border-radius: 0;
          padding: 0;
        }
        .floating-chat-window .chat-message.assistant .markdown-content {
          background: var(--surface-2);
        }

        /* De-box headings inside markdown responses — plain bold text */
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4 {
          background: none;
          border: none;
          box-shadow: none;
          padding: 0;
          font-weight: 800;
          line-height: 1.3;
        }
        .markdown-content h3 {
          font-size: 15px;
        }
        .markdown-content h4 {
          font-size: 14px;
          color: var(--accent);
        }

        /* Markdown table styling — follows the light/dark theme vars */
        .markdown-table-wrap {
          margin: 10px 0;
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          border: 1px solid var(--line);
        }
        .markdown-table {
          width: 100%;
          min-width: 480px;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 13px;
        }
        .markdown-table thead {
          background: var(--surface-3);
        }
        .markdown-table th,
        .markdown-table td {
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
          border-bottom: 1px solid var(--line);
          border-right: 1px solid var(--line);
          white-space: normal;
          word-break: normal;
          overflow-wrap: break-word;
          min-width: 90px;
        }
        .markdown-table th:last-child,
        .markdown-table td:last-child {
          border-right: none;
        }
        .markdown-table tr:last-child td {
          border-bottom: none;
        }
        .markdown-table th {
          font-weight: 600;
          color: var(--text);
        }
        .markdown-table td {
          color: var(--text);
          opacity: 0.9;
        }
        .markdown-table tbody tr:hover {
          background: color-mix(in srgb, var(--accent) 6%, transparent);
        }

        /* Let messages containing a table breathe wider than plain-text bubbles */
        .chat-message:has(.markdown-table-wrap) {
          max-width: min(760px, 96%) !important;
        }
        .floating-chat-panel:has(.markdown-table-wrap) {
          width: min(600px, 96vw) !important;
        }

        /* Safety net: whatever the panel's own width is set to
           elsewhere, never let its contents force it wider. */
        .floating-chat-panel,
        .chat-window,
        .chat-shell {
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Widen the docked panel a bit for structured responses */
        .floating-chat-panel {
          width: min(440px, calc(100vw - 40px));
        }

        /* Live Python (Pyodide) runner */
        .py-runner {
          margin: 10px 0;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: color-mix(in srgb, var(--surface-2) 60%, transparent);
          overflow: hidden;
        }
        .py-runner-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 10px;
          border-bottom: 1px solid var(--line);
          background: var(--surface-3);
          flex-wrap: wrap;
        }
        .py-runner-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--text);
          opacity: 0.75;
        }
        .py-runner-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .py-mini-btn {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: transparent;
          color: inherit;
          cursor: pointer;
        }
        .py-mini-btn:hover {
          background: rgba(148, 163, 184, 0.15);
        }
        .py-run-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
          background: color-mix(in srgb, var(--accent) 14%, transparent);
          color: var(--accent);
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .py-run-btn:hover:not(:disabled) {
          background: color-mix(in srgb, var(--accent) 22%, transparent);
        }
        .py-run-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }
        .py-spin {
          animation: py-spin-anim 0.8s linear infinite;
        }
        @keyframes py-spin-anim {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .py-code-block {
          margin: 0;
          padding: 10px 12px;
          max-width: 100%;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.5;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          color: var(--text);
          opacity: 0.9;
          white-space: pre;
        }
        .py-error {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin: 0 10px 10px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          font-size: 12px;
          white-space: pre-wrap;
        }
        .py-stdout {
          margin: 0 10px 10px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: color-mix(in srgb, var(--surface) 70%, transparent);
          font-size: 12px;
          max-width: calc(100% - 20px);
          overflow-x: auto;
          white-space: pre-wrap;
          color: var(--text);
        }
        .py-images {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 0 10px 10px;
          max-width: 100%;
          overflow-x: auto;
        }
        .py-output-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: #fff;
        }

        /* ---------- Mobile adjustments ---------- */
        @media (max-width: 680px) {
          .chat-message.assistant,
          .chat-message.user {
            max-width: 94%;
          }
          .chat-message:has(.markdown-table-wrap) {
            max-width: 98% !important;
          }
          .chat-message.assistant .markdown-content {
            padding: 10px 12px;
            font-size: 13.5px;
          }
          .markdown-content h3 {
            font-size: 14px;
          }
          .markdown-content h4 {
            font-size: 13px;
          }
          .markdown-table {
            min-width: 420px;
            font-size: 12px;
          }
          .markdown-table th,
          .markdown-table td {
            padding: 6px 9px;
            min-width: 70px;
          }
          .py-runner-head {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .py-runner-actions {
            width: 100%;
            justify-content: space-between;
          }
          .py-code-block {
            font-size: 11px;
          }
          .py-output-image {
            width: 100%;
          }
        }

        @media (max-width: 430px) {
          .floating-chat-panel {
            width: calc(100vw - 24px) !important;
          }
          .floating-chat-panel:has(.markdown-table-wrap) {
            width: calc(100vw - 24px) !important;
          }
          .chat-message.assistant .markdown-content {
            padding: 9px 10px;
            font-size: 13px;
          }
          .markdown-table {
            min-width: 360px;
          }
        }
      `}</style>
    </main>
  );
}
