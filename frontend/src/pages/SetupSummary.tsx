import React from "react";
import { useNavigate } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";

/* Layout + UI */
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { leadText, muted } from "../components/ui/Text";
import { cardBaseStyle } from "../components/ui/Card";

export default function SetupSummary() {
  const navigate = useNavigate();
  const { eventData } = useEventSetup();

  const {
    eventName,
    eventType,
    participants,
    scoringMode,
    scoringAudience,
    scoringJudge,
    venue,
    startDateTime,
    endDateTime,
    sponsor,
    rules,
    audienceLimit,
    image
  } = eventData;

  const { dateLine, timeLine } = formatDateTimeRange(startDateTime, endDateTime);
  const scoringText = formatScoring(scoringMode, scoringAudience, scoringJudge);

  const heroImage =
    image ||
    "https://img.redbull.com/images/c_crop,w_4105,h_2053,x_0,y_262/c_auto,w_1200,h_600/f_auto,q_auto/redbullcom/2020/9/14/o0lvketc4ibxdhngilos/fo-1m549fcrh2111-featuremedia";

  return (
    <PageContainer kind="solid">
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Event summary</h1>
        <p style={{ ...leadText, marginBottom: 32 }}>
          Review the event configuration before saving it.
        </p>
          {/* MAIN PANEL */}
          <div
            style={{
              background: cardBaseStyle.background,
              border: cardBaseStyle.border,
              borderRadius: cardBaseStyle.borderRadius,
              padding: 32,
              display: "flex",
              gap: 32
            }}
          >
          {/* LEFT SIDE */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>
              {eventName || "[placeholder]"}
            </h2>

            {/* DATE */}
            <SummaryIconRow icon="📅" text={dateLine || "[placeholder]"} />

            {/* LOCATION */}
            <SummaryIconRow icon="📍" text={venue || "[placeholder]"} />

            {/* EVENT INFO */}
            <h3 style={{ fontSize: 18, marginBottom: 14 }}>Event Info</h3>

            <Field label="Type" value={eventType} />
            <Field
              label="Participants"
              value={participants !== null ? String(participants) : undefined}
            />
            <Field label="Scoring" value={scoringText} />
            <Field label="Sponsor" value={sponsor} />
            <Field
              label="Audience limit"
              value={audienceLimit !== null ? String(audienceLimit) : undefined}
            />

            {/* RULES */}
            <h3 style={{ fontSize: 18, marginTop: 26, marginBottom: 10 }}>Rules</h3>
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                padding: 12,
                borderRadius: 8,
                minHeight: 48,
                whiteSpace: "pre-wrap",
                color: rules ? "#e2e8f0" : "#64748b"
              }}
            >
              {rules || "[placeholder]"}
            </div>
          </div>

          {/* HERO IMAGE */}
          <img
            src={heroImage}
            alt="Event"
            style={{
              width: 320,
              height: 200,
              objectFit: "cover",
              borderRadius: 12
            }}
          />
        </div>

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Button
            variant="ghost"
            onClick={() => navigate("/setup/method")}
            style={{ padding: "10px 18px" }}
          >
            Back
          </Button>

          <Button
            onClick={() => alert("Saving disabled in prototype.")}
            style={{ padding: "10px 24px" }}
          >
            Confirm & save
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS */
/* -------------------------------------------------------------------------- */

function SummaryIconRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
        color: "#e2e8f0"
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Field({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  const isSet = value !== null && value !== undefined && value !== "";

  return (
    <div style={{ marginBottom: 12 }}>
      <span style={{ color: "#94a3b8" }}>{label}:</span>{" "}
      <span style={{ color: isSet ? "#e2e8f0" : "#64748b" }}>
        {value || "[placeholder]"}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------------------------------- */

function formatDateTimeRange(
  start: string | null,
  end: string | null
): { dateLine: string | null; timeLine: string | null } {
  if (!start && !end) return { dateLine: null, timeLine: null };

  const base = start || end;
  const ref = base ? new Date(base) : null;
  if (!ref || isNaN(ref.getTime())) return { dateLine: null, timeLine: null };

  const day = ref.getDate();
  const suffix = getDaySuffix(day);

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
  const month = monthNames[ref.getMonth()];

  const dateLine = `${day}${suffix} ${month}`;

  const startD = start ? new Date(start) : null;
  const endD = end ? new Date(end) : null;

  const s =
    startD && !isNaN(startD.getTime())
      ? pad(startD.getHours()) + ":" + pad(startD.getMinutes())
      : null;
  const e =
    endD && !isNaN(endD.getTime())
      ? pad(endD.getHours()) + ":" + pad(endD.getMinutes())
      : null;

  const timeLine = s && e ? `${s} to ${e}` : s ?? e ?? null;

  return { dateLine, timeLine };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function getDaySuffix(day: number) {
  if (day >= 11 && day <= 13) return "th";
  const last = day % 10;
  if (last === 1) return "st";
  if (last === 2) return "nd";
  if (last === 3) return "rd";
  return "th";
}

function formatScoring(
  mode: string | null,
  audience: number | null,
  judges: number | null
) {
  if (!mode) return "[placeholder]";

  if (mode === "audience") return "Audience";
  if (mode === "judges") return "Judges";

  if (mode === "mixed") {
    if (audience !== null && judges !== null) {
      return `Mixed (audience ${audience}, judges ${judges})`;
    }
    return "Mixed";
  }

  return "[placeholder]";
}
