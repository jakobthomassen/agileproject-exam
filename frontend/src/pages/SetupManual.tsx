import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";

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

    const participantsNumber =
      participants === "" ? null : Number(participants);
    const audienceLimitNumber =
      audienceLimit === "" ? null : Number(audienceLimit);

    setEventData({
      eventName: eventName || null,
      eventType: eventType || null,
      participants: participantsNumber,
      scoringMode: "mixed",
      scoringAudience: audienceWeight,
      scoringJudge: judgesWeight,
      venue: venue || null,
      startDateTime: startDateTime || null,
      endDateTime: endDateTime || null,
      sponsor: sponsor || null,
      rules: rules || null,
      audienceLimit: audienceLimitNumber,
      image: null
    });

    navigate("/setup/summary");
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #020617, #020617)",
    color: "white",
    fontFamily: "Inter, system-ui, sans-serif",
    display: "flex",
    justifyContent: "center"
  };

  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 960,
    padding: "40px 16px"
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "3fr 2fr",
    gap: 24,
    alignItems: "flex-start"
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(15,23,42,0.9)",
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.6)",
    padding: 20
  };

  return (
    <div style={pageStyle}>
      <div style={wrapperStyle}>
        <button
          onClick={() => navigate("/setup/method")}
          style={{
            marginBottom: 16,
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.7)",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: 13
          }}
        >
          ← Back
        </button>

        <h1 style={{ marginBottom: 10 }}>Manual setup</h1>
        <p
          style={{
            maxWidth: 520,
            color: "#d1d5db",
            marginBottom: 24
          }}
        >
          Fill out your event details. Required fields must be completed before
          continuing.
        </p>

        <div style={gridStyle}>
          {/* Left side: form */}
          <div style={cardStyle}>
            <Field label="Event name" required>
              <input
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Event type" required>
              <input
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Number of contestants" required>
              <input
                type="number"
                min={1}
                value={participants}
                onChange={e =>
                  setParticipants(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Scoring (audience vs judges)">
              <div
                style={{
                  marginBottom: 4,
                  fontSize: 13,
                  color: "#9ca3af"
                }}
              >
                Audience {audienceWeight}% - Judges {judgesWeight}%
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
              <input
                value={venue}
                onChange={e => setVenue(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Event date and time range">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginBottom: 4
                    }}
                  >
                    Start
                  </div>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={e => setStartDateTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ color: "#9ca3af", paddingTop: 20 }}>→</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginBottom: 4
                    }}
                  >
                    End
                  </div>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={e => setEndDateTime(e.target.value)}
                    min={startDateTime || undefined}
                    style={inputStyle}
                  />
                </div>
              </div>
            </Field>

            <Field label="Sponsor (optional)">
              <input
                value={sponsor}
                onChange={e => setSponsor(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Rules (optional)">
              <textarea
                value={rules}
                onChange={e => setRules(e.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              />
            </Field>

            <Field label="Audience limit (optional)">
              <input
                type="number"
                min={1}
                value={audienceLimit}
                onChange={e =>
                  setAudienceLimit(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                style={inputStyle}
              />
            </Field>

            <button
              onClick={handleContinue}
              disabled={!canContinue()}
              style={{
                marginTop: 16,
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "none",
                background: canContinue() ? "#10b981" : "#334155",
                color: canContinue() ? "#020617" : "#64748b",
                cursor: canContinue() ? "pointer" : "not-allowed",
                fontWeight: 500
              }}
            >
              Continue
            </button>
          </div>

          {/* Right side: live preview */}
          <div style={cardStyle}>
            <h3 style={{ marginBottom: 12 }}>Live preview</h3>

            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Name:</strong> {eventName || "Not set"}
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Type:</strong> {eventType || "Not set"}
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Contestants:</strong>{" "}
              {participants !== "" ? participants : "Not set"}
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Scoring:</strong> Audience {audienceWeight}% - Judges{" "}
              {judgesWeight}%
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Venue:</strong> {venue || "Not set"}
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Date and time:</strong>{" "}
              {startDateTime || endDateTime
                ? `${startDateTime || "?"} to ${endDateTime || "?"}`
                : "Not set"}
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Sponsor:</strong> {sponsor || "Not set"}
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Audience limit:</strong>{" "}
              {audienceLimit !== "" ? audienceLimit : "Not set"}
            </div>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <strong>Rules:</strong>{" "}
              {rules ? (
                <span style={{ whiteSpace: "pre-wrap" }}>{rules}</span>
              ) : (
                "Not set"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  const { label, children, required } = props;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 13,
          color: "#e5e7eb",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}
      >
        <span>{label}</span>
        {required && (
          <span
            style={{
              fontSize: 11,
              color: "#f97316"
            }}
          >
            Required
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "#020617",
  color: "#e5e7eb",
  fontSize: 14,
  marginTop: 4
};
