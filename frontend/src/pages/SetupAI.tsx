import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEventSetup } from "../context/EventSetupContext";

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

const REQUIRED_KEYS = ["eventName", "eventType", "participants"] as const;

type FollowupKey =
  | "askName"
  | "askType"
  | "askParticipants"
  | "askOptional"
  | "finalConfirmation"
  | "postFinalAdjust";

export default function SetupAI() {
  const navigate = useNavigate();
  const { eventData, setEventData } = useEventSetup();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "Describe your event in one or two sentences, and I will help you capture the key details."
    }
  ]);

  const [input, setInput] = useState("");
  const [fields, setFields] = useState<AIFields>(() => ({
    ...initialFields,
    eventName: eventData.eventName,
    eventType: eventData.eventType,
    participants: eventData.participants,
    scoringMode: eventData.scoringMode,
    scoringAudience: eventData.scoringAudience,
    scoringJudge: eventData.scoringJudge,
    venue: eventData.venue,
    startDateTime: eventData.startDateTime,
    endDateTime: eventData.endDateTime,
    sponsor: eventData.sponsor,
    rules: eventData.rules,
    audienceLimit: eventData.audienceLimit
  }));
  const [thinking, setThinking] = useState(false);

  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  const [lastFollowupKey, setLastFollowupKey] = useState<FollowupKey | null>(
    null
  );
  const [lastFollowupText, setLastFollowupText] = useState<string | null>(null);

  const requiredComplete = isRequiredComplete(fields);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    const newMessages = [...messages, { sender: "user", text }];
    setMessages(newMessages);
    setInput("");
    setThinking(true);

    const apiMessages = newMessages.slice(-8).map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));

    const knownFields = {
      event_name: fields.eventName,
      event_type: fields.eventType,
      participant_count: fields.participants,
      scoring_mode: fields.scoringMode,
      scoring_audience: fields.scoringAudience,
      scoring_judge: fields.scoringJudge,
      venue: fields.venue,
      start_date_time: fields.startDateTime,
      end_date_time: fields.endDateTime,
      sponsor: fields.sponsor,
      rules: fields.rules,
      audience_limit: fields.audienceLimit
    };

    try {
      const res = await axios.post("http://localhost:8000/ai/extract", {
        messages: apiMessages,
        knownFields
      });

      const snap = res.data || {};

      const updated: AIFields = {
        eventName: snap.eventName ?? fields.eventName,
        eventType: snap.eventType ?? fields.eventType,
        participants: snap.participants ?? fields.participants,
        scoringMode: (snap.scoringMode as ScoringMode) ?? fields.scoringMode,
        scoringAudience: snap.scoringAudience ?? fields.scoringAudience,
        scoringJudge: snap.scoringJudge ?? fields.scoringJudge,
        venue: snap.venue ?? fields.venue,
        startDateTime: snap.startDateTime ?? fields.startDateTime,
        endDateTime: snap.endDateTime ?? fields.endDateTime,
        sponsor: snap.sponsor ?? fields.sponsor,
        rules: snap.rules ?? fields.rules,
        audienceLimit: snap.audienceLimit ?? fields.audienceLimit
      };

      setFields(updated);

      setEventData({
        eventName: updated.eventName,
        eventType: updated.eventType,
        participants: updated.participants,
        scoringMode: updated.scoringMode,
        scoringAudience: updated.scoringAudience,
        scoringJudge: updated.scoringJudge,
        venue: updated.venue,
        startDateTime: updated.startDateTime,
        endDateTime: updated.endDateTime,
        sponsor: updated.sponsor,
        rules: updated.rules,
        audienceLimit: updated.audienceLimit,
        image: eventData.image ?? null
      });

      const optionalComplete = isOptionalComplete(updated);
      const requiredNow = isRequiredComplete(updated);

      if (!optionalComplete || !requiredNow) {
        if (hasShownCompletion) setHasShownCompletion(false);
      }

      const { text: followText, key } = buildFollowup(
        updated,
        requiredNow,
        optionalComplete,
        hasShownCompletion,
        lastFollowupKey,
        lastFollowupText
      );

      if (key === "finalConfirmation") {
        setHasShownCompletion(true);
      }

      setLastFollowupKey(key);
      setLastFollowupText(followText);

      setMessages(prev => [...prev, { sender: "assistant", text: followText }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "assistant", text: "Something went wrong. Please try again." }
      ]);
    } finally {
      setThinking(false);
    }
  }

  function continueClick() {
    if (!requiredComplete) return;
    navigate("/setup/summary");
  }

  const container: React.CSSProperties = {
    padding: 24,
    maxWidth: 1200,
    margin: "0 auto",
    color: "white"
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "3fr 2fr",
    gap: 24,
    height: "82vh"
  };

  const panel: React.CSSProperties = {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column"
  };

  const chatScroll: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: 8
  };

  const bubbleUser: React.CSSProperties = {
    background: "#1e293b",
    padding: "8px 12px",
    borderRadius: 8,
    display: "inline-block",
    maxWidth: "70%",
    textAlign: "left"
  };

  const bubbleAssistant: React.CSSProperties = {
    background: "#14532d",
    padding: "8px 12px",
    borderRadius: 8,
    display: "inline-block",
    maxWidth: "70%",
    textAlign: "left"
  };

  const checklistSection: React.CSSProperties = {
    marginBottom: 20
  };

  const row: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: 12,
    alignItems: "baseline",
    marginBottom: 6
  };

  const rowLabel: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14
  };

  const rowValue: React.CSSProperties = {
    textAlign: "right",
    fontSize: 14,
    whiteSpace: "pre-line"
  };

  const dateInfo = formatDateTimeRange(fields.startDateTime, fields.endDateTime);
  const hasDate = !!(dateInfo.dateLine || dateInfo.timeLine);

  return (
    <div style={container}>
      <h1 style={{ marginBottom: 16 }}>AI Assisted Setup</h1>

      <div style={grid}>
        {/* Chat panel */}
        <div style={panel}>
          <div style={chatScroll}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: m.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                <span style={m.sender === "user" ? bubbleUser : bubbleAssistant}>
                  {m.text}
                </span>
              </div>
            ))}
            {thinking && (
              <div style={{ opacity: 0.7, marginBottom: 10 }}>
                Assistant is thinking...
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Write something..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#020617",
                color: "white"
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                background: "#10b981",
                cursor: "pointer",
                border: "none"
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Checklist panel */}
        <div style={panel}>
          <div style={checklistSection}>
            <h3 style={{ marginBottom: 8 }}>Required</h3>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.eventName ? "✔" : "✗"}</span>
                <span>Name</span>
              </div>
              <div style={rowValue}>{fields.eventName || ""}</div>
            </div>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.eventType ? "✔" : "✗"}</span>
                <span>Type</span>
              </div>
              <div style={rowValue}>{fields.eventType || ""}</div>
            </div>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.participants ? "✔" : "✗"}</span>
                <span>Contestants</span>
              </div>
              <div style={rowValue}>
                {fields.participants !== null ? fields.participants : ""}
              </div>
            </div>
          </div>

          <div style={checklistSection}>
            <h3 style={{ marginBottom: 8 }}>Optional</h3>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.scoringMode ? "•" : "○"}</span>
                <span>Scoring</span>
              </div>
              <div style={rowValue}>{fields.scoringMode || ""}</div>
            </div>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.venue ? "•" : "○"}</span>
                <span>Venue</span>
              </div>
              <div style={rowValue}>{fields.venue || ""}</div>
            </div>

            <div style={row}>
              <div style={rowLabel}>
                <span>{hasDate ? "•" : "○"}</span>
                <span>Date and time</span>
              </div>
              <div style={rowValue}>
                {dateInfo.dateLine && <div>{dateInfo.dateLine}</div>}
                {dateInfo.timeLine && <div>{dateInfo.timeLine}</div>}
              </div>
            </div>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.sponsor ? "•" : "○"}</span>
                <span>Sponsor</span>
              </div>
              <div style={rowValue}>{fields.sponsor || ""}</div>
            </div>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.rules ? "•" : "○"}</span>
                <span>Rules</span>
              </div>
              <div style={rowValue}>{fields.rules || ""}</div>
            </div>

            <div style={row}>
              <div style={rowLabel}>
                <span>{fields.audienceLimit ? "•" : "○"}</span>
                <span>Audience limit</span>
              </div>
              <div style={rowValue}>
                {fields.audienceLimit !== null ? fields.audienceLimit : ""}
              </div>
            </div>
          </div>

          <button
            onClick={continueClick}
            disabled={!requiredComplete}
            style={{
              marginTop: "auto",
              padding: 12,
              width: "100%",
              borderRadius: 8,
              border: "none",
              background: requiredComplete ? "#10b981" : "#334155",
              color: requiredComplete ? "black" : "#64748b",
              cursor: requiredComplete ? "pointer" : "not-allowed"
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function isRequiredComplete(f: AIFields): boolean {
  return REQUIRED_KEYS.every(key => f[key] !== null);
}

function isOptionalComplete(f: AIFields): boolean {
  const hasDate = !!formatDateTimeRange(f.startDateTime, f.endDateTime).dateLine;
  return (
    !!f.scoringMode &&
    !!f.venue &&
    hasDate &&
    !!f.sponsor &&
    !!f.rules &&
    f.audienceLimit !== null
  );
}

function buildFollowup(
  f: AIFields,
  requiredComplete: boolean,
  optionalComplete: boolean,
  hasShownCompletion: boolean,
  lastKey: FollowupKey | null,
  lastText: string | null
): { text: string; key: FollowupKey } {
  function pick(
    key: FollowupKey,
    variants: string[]
  ): { text: string; key: FollowupKey } {
    let pool = [...variants];
    if (lastKey === key && lastText && pool.length > 1) {
      pool = pool.filter(v => v !== lastText);
      if (pool.length === 0) pool = [...variants];
    }
    const choice = pool[Math.floor(Math.random() * pool.length)];
    return { text: choice, key };
  }

  if (!f.eventName) {
    return pick("askName", [
      "What should the event be called?",
      "What is the event name?",
      "How do you want to name this event?",
      "What name do you want to use for the event?"
    ]);
  }

  if (!f.eventType) {
    return pick("askType", [
      "How would you describe the type of event?",
      "What kind of event is this?",
      "What category does this event belong to?",
      "How would you classify this event?"
    ]);
  }

  if (!f.participants) {
    return pick("askParticipants", [
      "How many contestants are taking part?",
      "What is the participant count?",
      "How many people are expected to participate?",
      "How many individuals will compete?"
    ]);
  }

  const missing: string[] = [];
  if (!f.venue) missing.push("venue");
  if (!f.startDateTime && !f.endDateTime) missing.push("timing");
  if (!f.sponsor) missing.push("sponsor");
  if (!f.rules) missing.push("rules");
  if (!f.audienceLimit) missing.push("audience limit");
  if (!f.scoringMode) missing.push("scoring");

  if (requiredComplete && optionalComplete && missing.length === 0) {
    if (!hasShownCompletion) {
      return pick("finalConfirmation", [
        "Everything seems complete. Does this reflect your event? You can adjust answers here or refine them in the summary on the next page.",
        "All details appear to be captured. Would you like to revise anything? You may also refine the information in the summary view.",
        "The event setup looks complete. Tell me if you want to adjust anything. You can also update details in the summary screen.",
        "All fields are filled. Does this match your event? You can still change answers here or refine them in the summary section."
      ]);
    }

    return pick("postFinalAdjust", [
      "Tell me if there is anything you want to modify.",
      "I can update any detail you want to change.",
      "Let me know if something should be adjusted."
    ]);
  }

  const list = missing.join(", ");

  return pick("askOptional", [
    `Good progress. You can tell me about the ${list}, or continue whenever you prefer.`,
    `Everything is coming together. You may add details about the ${list}.`,
    `You can include more information about the ${list}, or continue when you are ready.`,
    `Feel free to describe the ${list}, or move on when you prefer.`
  ]);
}

function formatDateTimeRange(
  start: string | null,
  end: string | null
): { dateLine: string | null; timeLine: string | null } {
  if (!start && !end) {
    return { dateLine: null, timeLine: null };
  }

  const base = start || end;
  if (!base) return { dateLine: null, timeLine: null };

  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  const refDate = startDate || endDate;
  if (!refDate || isNaN(refDate.getTime())) {
    return { dateLine: null, timeLine: null };
  }

  const day = refDate.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const month = monthNames[refDate.getMonth()];
  const suffix = getDaySuffix(day);
  const dateLine = `${day}${suffix} ${month}`;

  const startTime =
    startDate && !isNaN(startDate.getTime()) ? toTimeString(startDate) : null;
  const endTime =
    endDate && !isNaN(endDate.getTime()) ? toTimeString(endDate) : null;

  let timeLine: string | null = null;
  if (startTime && endTime) {
    timeLine = `${startTime} to ${endTime}`;
  } else if (startTime) {
    timeLine = startTime;
  } else if (endTime) {
    timeLine = endTime;
  }

  return { dateLine, timeLine };
}

function toTimeString(d: Date): string {
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  const last = day % 10;
  if (last === 1) return "st";
  if (last === 2) return "nd";
  if (last === 3) return "rd";
  return "th";
}
