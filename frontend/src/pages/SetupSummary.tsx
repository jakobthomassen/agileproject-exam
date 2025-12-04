import React from "react";
import { useNavigate } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";

/* Layout + UI */
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { BackButton } from "../components/ui/BackButton";
import { SetupPageHeader } from "../components/ui/SetupPageHeader";
import { FieldRow } from "../components/ui/FieldRow";
import styles from "./SetupSummary.module.css";

export default function SetupSummary() {
  const navigate = useNavigate();
  const { eventData, addSavedEvent, resetEventData } = useEventSetup();

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
    image,
  } = eventData;

  const { dateLine, timeLine } = formatDateTimeRange(
    startDateTime,
    endDateTime
  );
  const scoringText = formatScoring(scoringMode, scoringAudience, scoringJudge);

  function handleFinish() {
    const id = crypto.randomUUID();

    addSavedEvent({
      ...eventData,
      id,
      sport: eventData.eventType, // OR separate field if needed
      format: eventData.scoringMode === "mixed" ? "Mixed" : "Ranking",
      status: "DRAFT",
      startDate: eventData.startDateTime,
      athletes: eventData.participants ?? 0,
      eventCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    resetEventData();

    navigate("/dashboard");
  }

  const heroImage =
    image ||
    "https://img.redbull.com/images/c_crop,w_4105,h_2053,x_0,y_262/c_auto,w_1200,h_600/f_auto,q_auto/redbullcom/2020/9/14/o0lvketc4ibxdhngilos/fo-1m549fcrh2111-featuremedia";

  return (
    <PageContainer kind='solid'>
      <div className={styles.pageInner}>
        <BackButton to="/setup/method">Back</BackButton>

        <SetupPageHeader
          title="Event summary"
          description="Review the event configuration before saving it."
        />
        {/* MAIN PANEL */}
        <div className={styles.mainPanel}>
          {/* LEFT SIDE */}
          <div className={styles.leftColumn}>
            <h2 className={styles.title}>
              {eventName || "[placeholder]"}
            </h2>

            {/* DATE */}
            <SummaryIconRow icon='📅' text={dateLine || "[placeholder]"} />

            {/* LOCATION */}
            <SummaryIconRow icon='📍' text={venue || "[placeholder]"} />

            {/* EVENT INFO */}
            <h3 className={styles.sectionHeading}>Event Info</h3>

            <FieldRow label='Type' value={eventType} />
            <FieldRow
              label='Participants'
              value={participants !== null ? String(participants) : undefined}
            />
            <FieldRow label='Scoring' value={scoringText} />
            <FieldRow label='Sponsor' value={sponsor} />
            <FieldRow
              label='Audience limit'
              value={audienceLimit !== null ? String(audienceLimit) : undefined}
            />

            {/* RULES */}
            <h3 className={styles.rulesHeading}>Rules</h3>
            <div className={styles.rulesBox}>
              <span className={rules ? styles.rulesText : styles.rulesPlaceholder}>
                {rules || "[placeholder]"}
              </span>
            </div>
          </div>

          {/* HERO IMAGE */}
          <img
            src={heroImage}
            alt='Event'
            className={styles.heroImage}
          />
        </div>

        {/* BUTTONS */}
        <div className={styles.buttonsRow}>
          <Button
            variant='ghost'
            onClick={() => navigate("/setup/method")}
            className={styles.backButtonInner}
          >
            Back
          </Button>

          <Button
            onClick={handleFinish}
            className={styles.primaryButtonInner}
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
    <div className={styles.summaryIconRow}>
      <span className={styles.summaryIcon}>{icon}</span>
      <span className={styles.summaryText}>{text}</span>
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
    "December",
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
