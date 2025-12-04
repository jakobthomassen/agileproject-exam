/* THIS FILE IS A MESS. NEW AI AGENT WILL FIX THIS (HOPEFULLY, MAYBE) */

import { useState } from "react";
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
import styles from "./SetupAI.module.css";

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

  const dateInfo = formatDateTimeRange(
    fields.startDateTime,
    fields.endDateTime
  );
  const hasDate = !!(dateInfo.dateLine || dateInfo.timeLine);

  return (
    <PageContainer kind='solid' maxWidth={1200}>
      <div className={styles.pageInner}>
        <BackButton to="/setup/method">Back</BackButton>

        <SetupPageHeader
          title="AI Assisted Setup"
          description="Describe your event and refine details interactively."
        />

        <TwoColumn>
          {/* CHAT PANEL */}
          <Card padding={16}>
            <div className={styles.chatPanel}>
              <div className={styles.chatMessages}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.chatRow} ${
                      m.sender === "user"
                        ? styles.chatRowUser
                        : styles.chatRowAssistant
                    }`}
                  >
                    <span
                      className={
                        m.sender === "user"
                          ? styles.chatBubbleUser
                          : styles.chatBubbleAssistant
                      }
                    >
                      {m.text}
                    </span>
                  </div>
                ))}

                {thinking && (
                  <div className={styles.thinkingRow}>
                    <span className={styles.thinkingDots}>
                      <span className={styles.thinkingDot} />
                      <span
                        className={`${styles.thinkingDot} ${styles.thinkingDotMid}`}
                      />
                      <span
                        className={`${styles.thinkingDot} ${styles.thinkingDotLight}`}
                      />
                    </span>
                    <span>Assistant is thinking…</span>
                  </div>
                )}
              </div>

              <div className={styles.chatInputRow}>
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
            <div className={styles.checklistCardInner}>
              {/* Required */}
              <h3 className={styles.checklistHeading}>Required</h3>

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
              <h3 className={styles.checklistHeadingOptional}>Optional</h3>

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
                value={
                  fields.audienceLimit !== null ? fields.audienceLimit : ""
                }
              />

              <Button
                fullWidth
                disabled={!requiredComplete}
                onClick={continueClick}
                className={styles.checklistContinueButton}
              >
                Continue
              </Button>
            </div>
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
    <div className={styles.checkRow}>
      <div className={styles.checkRowLabel}>
        <span>{isSet ? (required ? "✔" : "•") : required ? "✗" : "○"}</span>
        <span>{label}</span>
      </div>

      <div className={styles.checkRowValue}>
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
  if (!start && !end) return { dateLine: null, timeLine: null };

  const base = start || end;
  const ref = base ? new Date(base) : null;
  if (!ref || Number.isNaN(ref.getTime())) {
    return { dateLine: null, timeLine: null };
  }

  const dateLine = ref.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const startD = start ? new Date(start) : null;
  const endD = end ? new Date(end) : null;

  const s =
    startD && !Number.isNaN(startD.getTime())
      ? startD.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const e =
    endD && !Number.isNaN(endD.getTime())
      ? endD.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const timeLine = s && e ? `${s} to ${e}` : s ?? e ?? null;

  return { dateLine, timeLine };
}
