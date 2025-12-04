import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "../components/layout/PageContainer";
import FAQWidget from "../components/ui/FAQ";

/* Shared UI components */
import { Card } from "../components/ui/Card";
import { TwoColumn } from "../components/ui/Grid";
import { muted } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { BackButton } from "../components/ui/BackButton";
import { SetupPageHeader } from "../components/ui/SetupPageHeader";
import { TextInput } from "../components/ui/TextInput";
import { FieldRow } from "../components/ui/FieldRow";

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      audienceLimit: audienceLimit === "" ? null : Number(audienceLimit),
      image: null,
    });

    navigate("/setup/summary");
  }

  return (
    <PageContainer kind='solid'>
      <div style={{ width: "100%" }}>
        <BackButton to="/setup/method">Back</BackButton>

        <SetupPageHeader
          title="Manual setup"
          description="Fill out your event details. Required fields must be completed before continuing."
        />

        <TwoColumn>
          {/* LEFT: Form */}
          <Card padding={20}>
            <Field label='Event name' required>
              <TextInput
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </Field>

            <Field label='Event type' required>
              <TextInput
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              />
            </Field>

            <Field label='Number of contestants' required>
              <TextInput
                type='number'
                min={1}
                value={participants}
                onChange={(e) =>
                  setParticipants(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field label='Scoring (audience vs judges)'>
              <div style={{ marginBottom: 4, fontSize: 13, ...muted }}>
                Audience {audienceWeight}% — Judges {judgesWeight}%
              </div>
              <input
                type='range'
                min={0}
                max={100}
                value={audienceWeight}
                onChange={(e) => setAudienceWeight(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </Field>

            <Field label='Venue'>
              <TextInput
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </Field>

            <Field label='Event date and time range'>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, ...muted }}>Start</span>
                  <TextInput
                    type='datetime-local'
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                  />
                </div>

                <div style={{ paddingTop: 20, ...muted }}>→</div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, ...muted }}>End</span>
                  <TextInput
                    type='datetime-local'
                    value={endDateTime}
                    min={startDateTime || undefined}
                    onChange={(e) => setEndDateTime(e.target.value)}
                  />
                </div>
              </div>
            </Field>

            <Field label='Sponsor (optional)'>
              <TextInput
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
              />
            </Field>

            <Field label='Rules (optional)'>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: 14,
                  marginTop: 4,
                  resize: "vertical",
                  minHeight: 80,
                }}
              />
            </Field>

            <Field label='Audience limit (optional)'>
              <TextInput
                type='number'
                min={1}
                value={audienceLimit}
                onChange={(e) =>
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

            <FieldRow label='Name' value={eventName} />
            <FieldRow label='Type' value={eventType} />
            <FieldRow
              label='Contestants'
              value={participants !== "" ? participants : ""}
            />
            <FieldRow
              label='Scoring'
              value={`Audience ${audienceWeight}% — Judges ${judgesWeight}%`}
            />
            <FieldRow label='Venue' value={venue} />
            <FieldRow
              label='Date and time'
              value={
                startDateTime || endDateTime
                  ? `${formatDateTime(startDateTime) ?? "?"} to ${
                      formatDateTime(endDateTime) ?? "?"
                    }`
                  : ""
              }
            />
            <FieldRow label='Sponsor' value={sponsor} />
            <FieldRow
              label='Audience limit'
              value={audienceLimit !== "" ? audienceLimit : ""}
            />
            <FieldRow label='Rules'>
              {rules ? (
                <div style={{ whiteSpace: "pre-wrap" }}>{rules}</div>
              ) : null}
            </FieldRow>
          </Card>
        </TwoColumn>
      </div>
      <FAQWidget />
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
  children,
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
          fontSize: 13,
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
/* Local textarea still uses inline style; inputs use shared TextInput component above. */
