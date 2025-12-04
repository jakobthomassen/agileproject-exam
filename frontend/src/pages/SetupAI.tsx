import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";

import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TwoColumn } from "../components/ui/Grid";
import { BackButton } from "../components/ui/BackButton";
import { SetupPageHeader } from "../components/ui/SetupPageHeader";
import { TextInput } from "../components/ui/TextInput";

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
  audienceLimit: null,
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
      text: "Describe your event in one or two sentences, and I will help you capture the key details.",
    },
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
    audienceLimit: eventData.audienceLimit,
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

    const newMessages: ChatMessage[] = [
      ...messages,
      { sender: "user", text },
    ];
    setMessages(newMessages);
    setInput("");
    setThinking(true);

    const apiMessages = newMessages.slice(-8).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
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
      audience_limit: fields.audienceLimit,
    };

    try {
      const res = await axios.post("http://localhost:8000/ai/extract", {
        messages: apiMessages,
        knownFields,
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
        audienceLimit: snap.audienceLimit ?? fields.audienceLimit,
      };

      setFields(updated);

      setEventData({
        ...updated,
        image: eventData.image ?? null,
      });

      const optionalComplete = isOptionalComplete(updated);

      if (!optionalComplete || !requiredComplete) {
        if (hasShownCompletion) setHasShownCompletion(false);
      }

      const { text: followText, key } = buildFollowup(
        updated,
        isRequiredComplete(updated),
        optionalComplete,
        hasShownCompletion,
        lastFollowupKey,
        lastFollowupText
      );

      if (key === "finalConfirmation") setHasShownCompletion(true);

      setLastFollowupKey(key as FollowupKey);
      setLastFollowupText(followText);

      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: followText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "Something went wrong. Try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function continueClick() {
    if (!requiredComplete) return;
    navigate("/setup/summary");
  }

  const chatBubbleUser = {
    background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
    padding: "10px 14px",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    display: "inline-block",
    maxWidth: "72%",
    textAlign: "left" as const,
    color: "#0b1120",
    fontSize: 14,
    boxShadow: "0 10px 25px rgba(15,23,42,0.45)",
  };

  const chatBubbleAssistant = {
    background: "rgba(15,23,42,0.95)",
    padding: "10px 14px",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    display: "inline-block",
    maxWidth: "72%",
    textAlign: "left" as const,
    color: "#e5e7eb",
    fontSize: 14,
    border: "1px solid rgba(148,163,184,0.45)",
    boxShadow: "0 12px 30px rgba(15,23,42,0.6)",
  };

  const dateInfo = formatDateTimeRange(
    fields.startDateTime,
    fields.endDateTime
  );
  const hasDate = !!(dateInfo.dateLine || dateInfo.timeLine);

  return (
    <PageContainer kind='solid' maxWidth={1200}>
      <div style={{ width: "100%" }}>
        <BackButton to="/setup/method">Back</BackButton>

        <SetupPageHeader
          title="AI Assisted Setup"
          description="Describe your event and refine details interactively."
        />

        <TwoColumn>
          {/* CHAT PANEL */}
          <Card padding={16}>
            <div
              style={{
                height: "70vh",
                display: "flex",
                flexDirection: "column",
                background:
                  "radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 55%), radial-gradient(circle at bottom, rgba(16,185,129,0.16), transparent 55%)",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.2)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px 10px 14px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent:
                        m.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <span
                      style={
                        m.sender === "user"
                          ? chatBubbleUser
                          : chatBubbleAssistant
                      }
                    >
                      {m.text}
                    </span>
                  </div>
                ))}

                {thinking && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: 0.8,
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "999px",
                          background: "#6b7280",
                          animation: "pulse 1.2s ease-in-out infinite",
                        }}
                      />
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "999px",
                          background: "#9ca3af",
                          animation: "pulse 1.2s ease-in-out infinite",
                          animationDelay: "0.15s",
                        }}
                      />
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "999px",
                          background: "#e5e7eb",
                          animation: "pulse 1.2s ease-in-out infinite",
                          animationDelay: "0.3s",
                        }}
                      />
                    </span>
                    <span>Assistant is thinking…</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: "10px 10px 8px 10px",
                  borderTop: "1px solid rgba(31,41,55,0.8)",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <TextInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder='Describe your event or ask a question…'
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </Card>

          {/* CHECKLIST PANEL */}
          <Card padding={16}>
            {/* Required */}
            <h3 style={{ marginBottom: 12 }}>Required</h3>

            <CheckRow label='Name' value={fields.eventName} required />
            <CheckRow label='Type' value={fields.eventType} required />
            <CheckRow
              label='Contestants'
              value={
                fields.participants !== null ? String(fields.participants) : ""
              }
              required
            />

            {/* Optional */}
            <h3 style={{ marginTop: 24, marginBottom: 12 }}>Optional</h3>

            <CheckRow label='Scoring' value={fields.scoringMode} />
            <CheckRow label='Venue' value={fields.venue} />

            <CheckRow
              label='Date & Time'
              value={
                hasDate
                  ? `${dateInfo.dateLine || ""}\n${dateInfo.timeLine || ""}`
                  : ""
              }
            />

            <CheckRow label='Sponsor' value={fields.sponsor} />
            <CheckRow label='Rules' value={fields.rules} />
            <CheckRow
              label='Audience limit'
              value={fields.audienceLimit !== null ? fields.audienceLimit : ""}
            />

            <Button
              fullWidth
              disabled={!requiredComplete}
              onClick={continueClick}
              style={{ marginTop: "auto" }}
            >
              Continue
            </Button>
          </Card>
        </TwoColumn>
      </div>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS */
/* -------------------------------------------------------------------------- */

function CheckRow({
  label,
  value,
  required,
}: {
  label: string;
  value: string | number | null | undefined;
  required?: boolean;
}) {
  const isSet = value !== null && value !== "" && value !== undefined;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 12,
        marginBottom: 8,
        alignItems: "baseline",
      }}
    >
      <div style={{ display: "flex", gap: 6, fontSize: 14 }}>
        <span>{isSet ? (required ? "✔" : "•") : required ? "✗" : "○"}</span>
        <span>{label}</span>
      </div>

      <div style={{ textAlign: "right", fontSize: 14, whiteSpace: "pre-line" }}>
        {isSet ? value : ""}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------------------------------- */

function isRequiredComplete(f: AIFields): boolean {
  return REQUIRED_KEYS.every((key) => f[key] !== null);
}

function isOptionalComplete(f: AIFields): boolean {
  const hasDate = !!formatDateTimeRange(f.startDateTime, f.endDateTime)
    .dateLine;
  return (
    !!f.scoringMode &&
    !!f.venue &&
    hasDate &&
    !!f.sponsor &&
    !!f.rules &&
    f.audienceLimit !== null
  );
}

/* Build a short follow-up prompt based on which fields are filled in. */
function buildFollowup(
  f: AIFields,
  requiredComplete: boolean,
  optionalComplete: boolean,
  hasShownCompletion: boolean,
  lastKey: FollowupKey | null,
  lastText: string | null
): { text: string; key: FollowupKey } {
  // If required fields are missing, focus on those first.
  if (!requiredComplete) {
    const missing: string[] = [];
    if (!f.eventName) missing.push("the event name");
    if (!f.eventType) missing.push("the event type");
    if (f.participants == null) missing.push("how many participants you expect");

    const text =
      missing.length > 0
        ? `Got it. Could you specify ${missing.join(", ")} so we can lock in the basics?`
        : "Tell me the core details like name, type and participant count.";

    return { text, key: "askName" };
  }

  // Required fields are set, guide through optional details.
  if (!optionalComplete) {
    const missing: string[] = [];
    if (!f.scoringMode) missing.push("how you want scoring to work");
    if (!f.venue) missing.push("the venue");
    if (!f.startDateTime || !f.endDateTime)
      missing.push("the date and time range");
    if (!f.sponsor) missing.push("any sponsor details");
    if (!f.rules) missing.push("key rules or constraints");
    if (f.audienceLimit == null)
      missing.push("whether there's an audience limit");

    const text =
      missing.length > 0
        ? `We have the basics. Next, tell me ${missing.join(", ")} and I’ll refine the setup.`
        : "Share any extra preferences (format, mood, or constraints) you want reflected in the event.";

    return { text, key: "askOptional" };
  }

  // Everything looks filled in.
  if (!hasShownCompletion || lastKey !== "finalConfirmation") {
    const text =
      "Nice, we have a complete configuration. You can still tweak details or say 'looks good' to continue.";
    return { text, key: "finalConfirmation" };
  }

  // After final confirmation, nudge toward summary.
  const text =
    lastText ||
    "If you’re happy with this setup, you can proceed to the summary. Otherwise, tell me what you’d like to adjust.";
  return { text, key: "postFinalAdjust" };
}

function formatDateTimeRange(
  start: string | null,
  end: string | null
): { dateLine: string | null; timeLine: string | null } {
  /* unchanged */
  return { dateLine: null, timeLine: null };
}
