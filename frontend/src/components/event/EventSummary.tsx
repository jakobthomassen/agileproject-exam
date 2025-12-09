import { FieldRow } from "../ui/FieldRow";
import styles from "./EventSummary.module.css";

type EventSummaryProps = {
  event: {
    eventName?: string | null;
    eventType?: string | null;
    participants?: number | null;
    venue?: string | null;
    sponsor?: string | null;
    audienceLimit?: number | null;
    rules?: string | null;
    image?: string | null;

    startDateTime?: string | null;
    endDateTime?: string | null;

    sport?: string | null;
    format?: string | null;
    status?: string | null;
    startDate?: string | null;
    athletes?: number | null;
    eventCode?: string | null;
  };

  compact?: boolean;
  showHero?: boolean;
  showRules?: boolean;
};

export function EventSummary({
  event,
  compact = false,
  showHero = false,
  showRules = false,
}: EventSummaryProps) {
  const heroImage =
    event.image ||
    "https://img.redbull.com/images/c_crop,w_4105,h_2053,x_0,y_262/c_auto,w_1200,h_600/f_auto,q_auto/redbullcom/2020/9/14/o0lvketc4ibxdhngilos/fo-1m549fcrh2111-featuremedia";

  return (
    <div className={`${styles.mainPanel} ${compact ? styles.compact : ""}`}>
      <div className={styles.leftColumn}>
        <h2 className={styles.title}>
          {event.eventName || "Untitled event"}
        </h2>

        {/* DATE */}
        {event.startDateTime && (
          <SummaryIconRow
            icon="📅"
            text={formatDateTime(event.startDateTime)}
          />
        )}

        {/* VENUE */}
        {event.venue && (
          <SummaryIconRow
            icon="📍"
            text={event.venue}
          />
        )}

        <h3 className={styles.sectionHeading}>Event info</h3>

        <FieldRow label="Type" value={event.eventType || event.sport} />

        <FieldRow
          label="Participants"
          value={
            event.participants !== null
              ? String(event.participants)
              : event.athletes !== null
              ? String(event.athletes)
              : undefined
          }
        />

        <FieldRow label="Format" value={event.format} />
        <FieldRow label="Status" value={event.status} />
        <FieldRow label="Sponsor" value={event.sponsor} />

        {showRules && (
          <>
            <h3 className={styles.rulesHeading}>Rules</h3>
            <div className={styles.rulesBox}>
              <span
                className={
                  event.rules ? styles.rulesText : styles.rulesPlaceholder
                }
              >
                {event.rules || "No rules defined"}
              </span>
            </div>
          </>
        )}
      </div>

      {showHero && (
        <img
          src={heroImage}
          alt="Event"
          className={
            compact ? styles.heroImageCompact : styles.heroImage
          }
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SummaryIconRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className={styles.summaryIconRow}>
      <span className={styles.summaryIcon}>{icon}</span>
      <span className={styles.summaryText}>{text}</span>
    </div>
  );
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
