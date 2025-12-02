import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "../components/layout/PageContainer";

/* Shared UI components */
import { Card } from "../components/ui/Card";
import { TwoColumn } from "../components/ui/Grid";
import { leadText, muted } from "../components/ui/Text";
import { Button } from "../components/ui/Button";

export default function SetupManual() {
  const navigate = useNavigate();
  const { setEventData } = useEventSetup();

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [participants, setParticipants] = useState<number | "">("");
  const [audienceWeight, setAudienceWeight] = useState(50);
  const [venue, setVenue] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [rules, setRules] = useState("");
  const [audienceLimit, setAudienceLimit] = useState<number | "">("");

  const judgesWeight = 100 - audienceWeight;

  function canContinue() {
    return (
      eventName.trim().length > 0 &&
      eventType.trim().length > 0 &&
      participants !== ""
    );
  }

  function handleContinue() {
    if (!canContinue()) return;

    setEventData({
      eventName: eventName || null,
      eventType: eventType || null,
      participants: participants === "" ? null : Number(participants),
      scoringMode: "mixed",
      scoringAudience: audienceWeight,
      scoringJudge: judgesWeight,
      venue: venue || null,
      startDateTime: startDateTime || null,
      endDateTime: endDateTime || null,
      sponsor: sponsor || null,
      rules: rules || null,
      audienceLimit:
        audienceLimit === "" ? null : Number(audienceLimit),
      image: null
    });

    navigate("/setup/summary");
  }

  return (
    <PageContainer kind="solid">
      <div style={{ width: "100%" }}>
        <Button
          variant="ghost"
          onClick={() => navigate("/setup/method")}
          style={{ marginBottom: 16, padding: "6px 14px", fontSize: 13 }}
        >
          ← Back
        </Button>

        <h1 style={{ marginBottom: 10 }}>Manual setup</h1>
        <p style={leadText}>
          Fill out your event details. Required fields must be completed
          before continuing.
        </p>

        <TwoColumn>
          {/* LEFT: Form */}
          <Card padding={20}>
            <Field label="Event name" required>
              <TextInput
                value={eventName}
                onChange={e => setEventName(e.target.value)}
              />
            </Field>

            <Field label="Event type" required>
              <TextInput
                value={eventType}
                onChange={e => setEventType(e.target.value)}
              />
            </Field>

            <Field label="Number of contestants" required>
              <TextInput
                type="number"
                min={1}
                value={participants}
                onChange={e =>
                  setParticipants(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field label="Scoring (audience vs judges)">
              <div style={{ marginBottom: 4, fontSize: 13, ...muted }}>
                Audience {audienceWeight}% — Judges {judgesWeight}%
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={audienceWeight}
                onChange={e => setAudienceWeight(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </Field>

            <Field label="Venue">
              <TextInput
                value={venue}
                onChange={e => setVenue(e.target.value)}
              />
            </Field>

            <Field label="Event date and time range">
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, ...muted }}>Start</span>
                  <TextInput
                    type="datetime-local"
                    value={startDateTime}
                    onChange={e => setStartDateTime(e.target.value)}
                  />
                </div>

                <div style={{ paddingTop: 20, ...muted }}>→</div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, ...muted }}>End</span>
                  <TextInput
                    type="datetime-local"
                    value={endDateTime}
                    min={startDateTime || undefined}
                    onChange={e => setEndDateTime(e.target.value)}
                  />
                </div>
              </div>
            </Field>

            <Field label="Sponsor (optional)">
              <TextInput
                value={sponsor}
                onChange={e => setSponsor(e.target.value)}
              />
            </Field>

            <Field label="Rules (optional)">
              <textarea
                value={rules}
                onChange={e => setRules(e.target.value)}
                style={{
                  ...inputBase,
                  resize: "vertical",
                  minHeight: 80
                }}
              />
            </Field>

            <Field label="Audience limit (optional)">
              <TextInput
                type="number"
                min={1}
                value={audienceLimit}
                onChange={e =>
                  setAudienceLimit(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </Field>

            <Button
              fullWidth
              onClick={handleContinue}
              disabled={!canContinue()}
              style={{ marginTop: 16 }}
            >
              Continue
            </Button>
          </Card>

          {/* RIGHT: Live preview */}
          <Card padding={20}>
            <h3 style={{ marginBottom: 12 }}>Live preview</h3>

            <Preview label="Name" value={eventName} />
            <Preview label="Type" value={eventType} />
            <Preview
              label="Contestants"
              value={participants !== "" ? participants : ""}
            />
            <Preview
              label="Scoring"
              value={`Audience ${audienceWeight}% — Judges ${judgesWeight}%`}
            />
            <Preview label="Venue" value={venue} />
            <Preview
              label="Date and time"
              value={
                startDateTime || endDateTime
                  ? `${startDateTime || "?"} to ${endDateTime || "?"}`
                  : ""
              }
            />
            <Preview label="Sponsor" value={sponsor} />
            <Preview
              label="Audience limit"
              value={audienceLimit !== "" ? audienceLimit : ""}
            />
            <Preview label="Rules">
              {rules ? (
                <div style={{ whiteSpace: "pre-wrap" }}>{rules}</div>
              ) : (
                ""
              )}
            </Preview>
          </Card>
        </TwoColumn>
      </div>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* UI Helpers */
/* -------------------------------------------------------------------------- */

import { useEventSetup } from "../context/EventSetupContext";

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#e5e7eb",
          fontSize: 13
        }}
      >
        <span>{label}</span>
        {required && (
          <span style={{ color: "#f97316", fontSize: 11 }}>Required</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Preview({
  label,
  value,
  children
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}) {
  const hasValue = value !== "" && value !== null && value !== undefined;
  return (
    <div style={{ marginBottom: 8, fontSize: 14 }}>
      <strong>{label}:</strong>{" "}
      {children ? (
        children
      ) : hasValue ? (
        value
      ) : (
        <span style={muted}>Not set</span>
      )}
    </div>
  );
}

/* Input style shared locally */
const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "#020617",
  color: "#e5e7eb",
  fontSize: 14,
  marginTop: 4
};


function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return <input {...props} style={inputBase} />;
}
