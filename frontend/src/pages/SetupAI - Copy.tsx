import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

type ChatMessage = {
  sender: "user" | "assistant";
  text: string;
};

type ScoringMode = "judges" | "audience" | "mixed" | null;

type AIFields = {
  eventName: string | null;
  eventType: string | null;
  participants: number | null;

  scoringMode: ScoringMode;
  scoringAudience: number | null;
  scoringJudge: number | null;

  venue: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  sponsor: string | null;
  rules: string | null;
  audienceLimit: number | null;
};

const initialFields: AIFields = {
  eventName: null,
  eventType: null,
  participants: null,

  scoringMode: null,
  scoringAudience: null,
  scoringJudge: null,

  venue: null,
  startDateTime: null,
  endDateTime: null,
  sponsor: null,
  rules: null,
  audienceLimit: null
};

const REQUIRED_KEYS: (keyof AIFields)[] = ["eventName", "eventType", "participants"];

type FollowupKey = "eventName" | "eventType" | "participants" | "optional" | null;

export default function SetupAI() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "Describe your event in one or two sentences, and I will help you capture the key details."
    }
  ]);
  const [input, setInput] = useState("");
  const [fields, setFields] = useState<AIFields>(initialFields);
  const [isThinking, setIsThinking] = useState(false);
  const [lastFollowupKey, setLastFollowupKey] = useState<FollowupKey>(null);

  function canContinue() {
    return REQUIRED_KEYS.every(key => fields[key] !== null);
  }

  function handleContinue() {
    if (!canContinue()) return;
    // TODO: persist fields somewhere (context/state) before navigate if needed
    navigate("/setup/summary");
  }

  function looksRepeated(userText: string, prevAssistant: string) {
    const a = userText.trim().toLowerCase();
    const b = prevAssistant.trim().toLowerCase();
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.replace(/['"]/g, "") === b.replace(/['"]/g, "")) return true;
    return false;
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { sender: "user", text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    const lastAssistant = [...messages].reverse().find(m => m.sender === "assistant");
    const lastAssistantText = lastAssistant?.text || "";

    if (looksRepeated(text, lastAssistantText)) {
      setMessages(prev => [
        ...prev,
        {
          sender: "assistant",
          text: "I have that noted. Could you add a bit more detail or clarify what you want to change?"
        }
      ]);
      return;
    }

    setIsThinking(true);

    try {
      // Build rolling window (last 8 messages) for backend
      const lastEight = newMessages.slice(-8).map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await axios.post("http://localhost:8000/ai/extract", {
        messages: lastEight
      });

      const raw = res.data || {};

      const snapshot: AIFields = {
        eventName: raw.eventName ?? null,
        eventType: raw.eventType ?? null,
        participants: raw.participants ?? null,

        scoringMode: (raw.scoringMode as ScoringMode) ?? null,
        scoringAudience: raw.scoringAudience ?? null,
        scoringJudge: raw.scoringJudge ?? null,

        venue: raw.venue ?? null,
        startDateTime: raw.startDateTime ?? null,
        endDateTime: raw.endDateTime ?? null,
        sponsor: raw.sponsor ?? null,
        rules: raw.rules ?? null,
        audienceLimit: raw.audienceLimit ?? null
      };

      setFields(snapshot);

      const missingRequired = REQUIRED_KEYS.filter(key => snapshot[key] === null);

      const { followupText, followupKey } = buildFollowup(
        missingRequired,
        snapshot,
        lastFollowupKey
      );

      setLastFollowupKey(followupKey);

      setMessages(prev => [
        ...prev,
        {
          sender: "assistant",
          text: followupText
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: "assistant",
          text: "Something went wrong on my side. Please try again."
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  const requiredComplete = REQUIRED_KEYS.map(key => fields[key] !== null);
  const optionalComplete = [
    fields.scoringMode !== null,
    fields.venue !== null,
    fields.startDateTime !== null || fields.endDateTime !== null,
    fields.sponsor !== null,
    fields.rules !== null,
    fields.audienceLimit !== null
  ];

  function formatScoring(f: AIFields): string | null {
    if (!f.scoringMode) return null;
    if (f.scoringMode === "judges") {
      return "Judges decide (100% judges)";
    }
    if (f.scoringMode === "audience") {
      return "Audience decides (100% audience)";
    }
    if (f.scoringMode === "mixed") {
      if (f.scoringAudience != null && f.scoringJudge != null) {
        return `Mixed: audience ${f.scoringAudience}%, judges ${f.scoringJudge}%`;
      }
      return "Mixed: audience and judges";
    }
    return null;
  }

  function formatDateRange(f: AIFields): string | null {
    if (f.startDateTime && f.endDateTime) {
      return `${f.startDateTime} → ${f.endDateTime}`;
    }
    return f.startDateTime || f.endDateTime;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #020617, #020617)",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "60px 16px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "960px" }}>
        <button
          onClick={() => navigate("/setup/method")}
          style={{
            marginBottom: "16px",
            padding: "6px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.7)",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          ← Back
        </button>

        <h1 style={{ marginBottom: "10px" }}>AI assisted setup</h1>
        <p
          style={{
            maxWidth: "520px",
            color: "#d1d5db",
            marginBottom: "24px"
          }}
        >
          Describe your event, and I will fill in the details. Once I know the name,
          type and number of contestants, you can continue.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
            gap: "16px"
          }}
        >
          {/* Chat */}
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.9)",
              display: "flex",
              flexDirection: "column",
              height: "60vh",
              maxHeight: "70vh"
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto"
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: m.sender === "user" ? "right" : "left",
                    margin: "6px 0"
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      maxWidth: "90%",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      background:
                        m.sender === "user"
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(0,255,120,0.14)",
                      border:
                        m.sender === "assistant"
                          ? "1px solid #00ff99"
                          : "1px solid rgba(255,255,255,0.12)",
                      fontSize: "13px"
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div
                  style={{
                    textAlign: "left",
                    marginTop: "4px",
                    opacity: 0.8
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "10px",
                      background: "rgba(0,255,120,0.12)",
                      border: "1px solid #00ff99",
                      fontSize: "12px",
                      fontStyle: "italic"
                    }}
                  >
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "8px 10px",
                borderTop: "1px solid rgba(148,163,184,0.7)",
                display: "flex",
                gap: "8px"
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Example: A skate contest with 12 riders, judges only."
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: "8px",
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: "13px"
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #00ff99, #00cc77)",
                  color: "#020617",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.9)",
              padding: "14px",
              fontSize: "13px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Required to continue</strong>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li>
                  {requiredComplete[0] ? "✔" : "✗"} Name
                  {fields.eventName && <> — <span>{fields.eventName}</span></>}
                </li>
                <li>
                  {requiredComplete[1] ? "✔" : "✗"} Type
                  {fields.eventType && <> — <span>{fields.eventType}</span></>}
                </li>
                <li>
                  {requiredComplete[2] ? "✔" : "✗"} Contestants
                  {fields.participants !== null && (
                    <> — <span>{fields.participants}</span></>
                  )}
                </li>
              </ul>

              <div style={{ marginTop: "12px", marginBottom: "4px" }}>
                <strong>Optional details</strong>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li>
                  {optionalComplete[0] ? "•" : "○"} Scoring
                  {formatScoring(fields) && <> — <span>{formatScoring(fields)}</span></>}
                </li>
                <li>
                  {optionalComplete[1] ? "•" : "○"} Venue
                  {fields.venue && <> — <span>{fields.venue}</span></>}
                </li>
                <li>
                  {optionalComplete[2] ? "•" : "○"} Date &amp; time
                  {formatDateRange(fields) && (
                    <> — <span>{formatDateRange(fields)}</span></>
                  )}
                </li>
                <li>
                  {optionalComplete[3] ? "•" : "○"} Sponsor
                  {fields.sponsor && <> — <span>{fields.sponsor}</span></>}
                </li>
                <li>
                  {optionalComplete[4] ? "•" : "○"} Rules
                  {fields.rules && <> — <span>{fields.rules}</span></>}
                </li>
                <li>
                  {optionalComplete[5] ? "•" : "○"} Audience limit
                  {fields.audienceLimit !== null && (
                    <> — <span>{fields.audienceLimit}</span></>
                  )}
                </li>
              </ul>
            </div>

            <div style={{ marginTop: "16px" }}>
              <button
                onClick={handleContinue}
                disabled={!canContinue()}
                style={{
                  width: "100%",
                  padding: "10px 22px",
                  borderRadius: "999px",
                  border: "none",
                  background: canContinue()
                    ? "linear-gradient(135deg, #00ff99, #00cc77)"
                    : "rgba(75,85,99,0.8)",
                  color: canContinue() ? "#020617" : "#9ca3af",
                  fontWeight: 600,
                  cursor: canContinue() ? "pointer" : "not-allowed"
                }}
              >
                Continue
              </button>
              {!canContinue() && (
                <p
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: "#9ca3af"
                  }}
                >
                  Once name, type and number of contestants are captured, you can continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildFollowup(
  missingRequired: (keyof AIFields)[],
  merged: AIFields,
  lastKey: FollowupKey
): { followupText: string; followupKey: FollowupKey } {
  let key: FollowupKey;
  let text: string;

  if (missingRequired.length > 0) {
    if (missingRequired.includes("eventName")) {
      key = "eventName";
      text =
        lastKey === "eventName"
          ? "I still need the event name. What should we call it?"
          : "Great. What would you like to name this event?";
    } else if (missingRequired.includes("eventType")) {
      key = "eventType";
      text =
        lastKey === "eventType"
          ? "I do not have the event type yet. How would you describe it?"
          : "What type of event is it?";
    } else {
      key = "participants";
      text =
        lastKey === "participants"
          ? "Still missing the number of contestants. How many are competing?"
          : "How many contestants will participate?";
    }
  } else {
    key = "optional";
    text =
      lastKey === "optional"
        ? "You can add optional details like venue, timing, sponsors or rules, or continue when you are ready."
        : "Nice. You can add details like venue, timing, sponsors or rules if you want, or continue whenever you are ready.";
  }

  return { followupText: text, followupKey: key };
}
