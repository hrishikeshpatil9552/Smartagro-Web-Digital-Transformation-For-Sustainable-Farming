// frontend/src/pages/ExplanationPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Leaf,
  Volume2,
  Pause,
  Share2,
  Printer,
  RefreshCw,
  ArrowLeft,
  FileText,
  CheckCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import NotificationToggle from "../components/NotificationToggle";

/**
 * Note: this component uses browser SpeechSynthesis (no external TTS).
 * It also loads Google fonts dynamically for nicer typography.
 */

type WhereToApply = { url: string | null; text: string | null };
type Explanation = {
  english: string;
  eligibility_rules: string[];
  documents_required: string[];
  where_to_apply: WhereToApply;
  last_date: string | null;
  raw_text?: string;
};

export default function ExplanationPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 💡 read farmerId from URL query string (if present)
  const searchParams = new URLSearchParams(location.search);
  const initialFarmerId = searchParams.get("farmerId");
  const [farmerId] = useState<string | null>(initialFarmerId);

  const [exp, setExp] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  // Speech state
  const synthRef = useRef(window.speechSynthesis);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState<number>(1);

  // Load a nicer font (only once)
  useEffect(() => {
    const id = "agri-sarathi-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Merriweather:wght@300;400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Fetch explanation when component mounts
  useEffect(() => {
    if (!matchId) {
      navigate("/government");
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const r = await axios.post(
          "http://localhost:5000/api/schemes/explain",
          { matchId }
        );
        setExp(r.data?.explanation ?? null);
      } catch (err) {
        console.error("Failed to load explanation", err);
        setExp(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId, navigate]);

  // Build full readable text for the whole page
  const buildFullText = (data: Explanation) => {
    let parts: string[] = [];
    if (data.english) {
      parts.push("Overview:");
      parts.push(data.english);
    }
    if (data.eligibility_rules?.length) {
      parts.push("Eligibility rules:");
      data.eligibility_rules.forEach((r, i) => parts.push(`${i + 1}. ${r}`));
    }
    if (data.documents_required?.length) {
      parts.push("Required documents:");
      data.documents_required.forEach((d, i) => parts.push(`${i + 1}. ${d}`));
    }
    if (data.where_to_apply) {
      parts.push("Where to apply:");
      if (data.where_to_apply.text) parts.push(data.where_to_apply.text);
      if (data.where_to_apply.url) parts.push(data.where_to_apply.url);
    }
    if (data.last_date) {
      parts.push(`Last date to apply: ${data.last_date}`);
    }
    return parts.join("\n\n");
  };

  // Start reading ENTIRE explanation
  const startReadingAll = () => {
    if (!exp) return;
    stopSpeaking();

    const text = buildFullText(exp);
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-IN";
    utt.rate = rate;
    utterRef.current = utt;

    utt.onend = () => {
      setSpeaking(false);
      setPaused(false);
      utterRef.current = null;
    };
    utt.onerror = () => {
      setSpeaking(false);
      setPaused(false);
      utterRef.current = null;
    };

    synthRef.current.speak(utt);
    setSpeaking(true);
    setPaused(false);
  };

  // Read only the short overview (Scheme Overview)
  const readOverview = () => {
    if (!exp?.english) return;

    if (speaking && !paused) {
      synthRef.current.pause();
      setPaused(true);
      return;
    }
    if (speaking && paused) {
      synthRef.current.resume();
      setPaused(false);
      return;
    }

    stopSpeaking();
    const utt = new SpeechSynthesisUtterance(exp.english);
    utt.lang = "en-IN";
    utt.rate = rate;
    utterRef.current = utt;
    utt.onend = () => {
      setSpeaking(false);
      setPaused(false);
      utterRef.current = null;
    };
    synthRef.current.speak(utt);
    setSpeaking(true);
    setPaused(false);
  };

  const stopSpeaking = () => {
    try {
      synthRef.current.cancel();
    } catch {}
    utterRef.current = null;
    setSpeaking(false);
    setPaused(false);
  };

  // Regenerate explanation (calls Gemini regenerate endpoint)
  const handleRegenerate = async () => {
    if (!matchId) return;
    if (!window.confirm("Regenerate explanation? This will call Gemini.")) return;
    setRegenerating(true);
    try {
      await axios.post("http://localhost:5000/api/gemini/explain", { matchId });

      const r = await axios.post(
        "http://localhost:5000/api/schemes/explain",
        { matchId }
      );

      setExp(r.data?.explanation ?? null);
      stopSpeaking();
    } catch (err) {
      console.error("Regenerate error", err);
      alert("Failed to regenerate explanation.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleShare = async () => {
    if (!exp) return;
    try {
      const text = exp.english;
      if ((navigator as any).share) {
        await (navigator as any).share({ title: "Scheme Explanation", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard");
      }
    } catch {
      alert("Share failed");
    }
  };

  // Loading
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
          <div
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-lg text-green-700 font-medium"
          >
            Analyzing scheme details...
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(180deg,#eafaf0,#ffffff)",
        padding: "20px",
      }}
    >
      {/* Header */}
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto 24px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {/* Logo Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="bg-white p-2 rounded-lg shadow-md border border-green-100">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Leaf
                className="w-8 h-8 text-green-600"
                style={{ strokeWidth: 2.5 }}
              />
              <span className="absolute text-[10px] font-bold text-orange-500 -top-1 right-0">
                AI
              </span>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 20,
                color: "#166534",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Agri Sarathi
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#16653499",
                fontWeight: 500,
              }}
            >
              Smart Scheme Analysis
            </div>
          </div>
        </div>

        {/* Right side: Notification toggle + speech controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          {/* 🔔 Enable notifications for this farmer (if farmerId present) */}
          <div>
            <NotificationToggle farmerId={farmerId} />
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              background: "white",
              padding: "8px 16px",
              borderRadius: 50,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <label
              style={{
                fontSize: 13,
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Speed:
            </label>
            <input
              type="range"
              min={0.7}
              max={1.6}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              style={{ accentColor: "#16a34a", width: 80 }}
            />

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            <button
              onClick={startReadingAll}
              style={{
                background: "#16a34a",
                color: "white",
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Volume2 size={16} /> Read All
            </button>
            <button
              onClick={stopSpeaking}
              style={{
                background: "#fee2e2",
                color: "#ef4444",
                padding: "8px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              title="Stop Reading"
            >
              <Pause size={16} fill="currentColor" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate("/government")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              padding: 0,
            }}
            className="hover:text-green-600 transition-colors"
          >
            <ArrowLeft size={18} /> Back to Search Results
          </button>
        </div>

        {/* Overview card */}
        <section
          style={{
            padding: 30,
            borderRadius: 20,
            background: "white",
            boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
            border: "1px solid rgba(16,185,129,0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 6,
              background: "linear-gradient(90deg, #10b981, #34d399)",
            }}
          ></div>

          <div
            style={{
              display: "flex",
              gap: 30,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 300 }}>
              <h2
                style={{
                  margin: 0,
                  color: "#064e3b",
                  fontFamily: "'Merriweather', serif",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                Scheme Overview
              </h2>
              <p
                style={{
                  color: "#334155",
                  marginTop: 16,
                  lineHeight: 1.8,
                  fontSize: 16,
                }}
              >
                {exp?.english || "No overview available."}
              </p>

              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={readOverview}
                  style={{
                    background:
                      speaking && !paused ? "#dcfce7" : "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    padding: "10px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <Volume2 size={18} />{" "}
                  {speaking && !paused ? "Pause" : "Listen"}
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    background: "white",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    padding: "10px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <Share2 size={18} /> Share
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: "white",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    padding: "10px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <Printer size={18} /> Print
                </button>
              </div>
            </div>

            {/* Quick Actions / AI Box */}
            <div
              style={{
                width: 260,
                background: "#f8fafc",
                padding: 20,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#64748b",
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                AI Controls
              </div>

              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: regenerating ? "#e2e8f0" : "white",
                  color: regenerating ? "#94a3b8" : "#0f172a",
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  cursor: regenerating ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <RefreshCw
                  size={16}
                  className={regenerating ? "animate-spin" : ""}
                />
                {regenerating ? "Regenerating..." : "Regenerate Info"}
              </button>

              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  marginTop: 12,
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                Information is generated by AI (Gemini) and may need
                verification.
              </div>
            </div>
          </div>
        </section>

        {/* Details Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: 24,
          }}
        >
          {/* Eligibility */}
          <section
            style={{
              padding: 24,
              borderRadius: 16,
              background: "white",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: "#dcfce7",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <h3
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Eligibility Rules
              </h3>
            </div>

            {exp?.eligibility_rules?.length ? (
              <ul
                style={{
                  paddingLeft: 20,
                  color: "#475569",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                {exp.eligibility_rules.map((r, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p
                style={{
                  color: "#94a3b8",
                  fontStyle: "italic",
                }}
              >
                No specific rules listed.
              </p>
            )}
          </section>

          {/* Documents */}
          <section
            style={{
              padding: 24,
              borderRadius: 16,
              background: "white",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: "#e0f2fe",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <FileText size={20} className="text-blue-600" />
              </div>
              <h3
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Required Documents
              </h3>
            </div>

            {exp?.documents_required?.length ? (
              <ul
                style={{
                  paddingLeft: 20,
                  color: "#475569",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                {exp.documents_required.map((d, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    {d}
                  </li>
                ))}
              </ul>
            ) : (
              <p
                style={{
                  color: "#94a3b8",
                  fontStyle: "italic",
                }}
              >
                No documents listed.
              </p>
            )}
          </section>
        </div>

        {/* Where to Apply */}
        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: "linear-gradient(to right, #f0fdf4, white)",
            border: "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#16a34a",
                padding: 10,
                borderRadius: 50,
                color: "white",
              }}
            >
              <MapPin size={24} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#166534",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Where to Apply
              </h3>

              {exp?.where_to_apply?.url ? (
                <a
                  href={exp.where_to_apply.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#0ea5e9",
                    textDecoration: "underline",
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                >
                  {exp.where_to_apply.text ||
                    "Click here to visit official website"}
                </a>
              ) : (
                <p
                  style={{
                    color: "#334155",
                    margin: 0,
                  }}
                >
                  {exp?.where_to_apply?.text ||
                    "Visit your local agriculture office or the main government portal."}
                </p>
              )}

              {exp?.last_date && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#b91c1c",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  <Calendar size={16} />
                  <span>Last Date: {exp.last_date}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
