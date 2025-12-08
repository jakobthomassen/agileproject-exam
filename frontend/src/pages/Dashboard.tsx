import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/TextInput";
import { muted } from "../components/ui/Text";
import { FieldRow } from "../components/ui/FieldRow";
import { useEventSetup, type SavedEvent } from "../context/EventSetupContext";
import styles from "./Dashboard.module.css";

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

export default function Dashboard() {
  const { savedEvents, deleteSavedEvent } = useEventSetup();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<SavedEvent | null>(null);

  return (
    <PageContainer kind="solid" maxWidth={1100}>
      <div className={styles.pageInner}>
        <h1 className={styles.title}>My Events</h1>

        <Button
          onClick={() => navigate("/setup/method")}
          className={styles.newEventButton}
        >
          New Peers Event
        </Button>

        <div className={styles.searchRow}>
          <TextInput
            placeholder="Search my events..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tableWrapper}>
          <TableHeader />

          {savedEvents.length === 0 && (
            <div className={styles.emptyState} style={muted}>
              No events yet.
            </div>
          )}

          {savedEvents.map(ev => (
            <TableRow
              key={ev.id}
              ev={ev}
              onDelete={() => deleteSavedEvent(ev.id)}
              onEdit={() => navigate(`/dashboard/edit/${ev.id}`)}
              onOpen={() => setSelectedEvent(ev)}
            />
          ))}
        </div>

        {selectedEvent && (
          <EventSummaryModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */

function TableHeader() {
  return (
    <div className={styles.tableHeader}>
      <span>Event Name</span>
      <span>Sport</span>
      <span>Format</span>
      <span>Status</span>
      <span>Start Date</span>
      <span>Athletes</span>
      <span>Event Code</span>
      <span>Actions</span>
    </div>
  );
}

function TableRow({
  ev,
  onDelete,
  onEdit,
  onOpen,
}: {
  ev: SavedEvent;
  onDelete: () => void;
  onEdit: () => void;
  onOpen: () => void;
}) {
  return (
    <div className={styles.tableRow}>
      <span className={styles.eventNameLink} onClick={onOpen}>
        {ev.eventName || "Untitled Event"}
      </span>

      <span>{ev.sport || "—"}</span>
      <span>{ev.format || "—"}</span>
      <StatusBubble status={ev.status} />
      <span>{formatDateTime(ev.startDate) || "—"}</span>
      <span>{ev.athletes}</span>
      <span>{ev.eventCode || "—"}</span>

      <div className={styles.actionsRow}>
        <span className={styles.actionEdit} onClick={onEdit}>
          Edit
        </span>
        <span className={styles.actionDelete} onClick={onDelete}>
          🗑
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function EventSummaryModal({
  event,
  onClose,
}: {
  event: SavedEvent;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalBackdrop}>
      <Card className={styles.modalCard}>
        <h2 className={styles.modalTitle}>
          {event.eventName || "Untitled Event"}
        </h2>

        <div className={styles.modalContent}>
          <FieldRow label="Sport" value={event.sport} />
          <FieldRow label="Format" value={event.format} />
          <FieldRow label="Status" value={event.status} />
          <FieldRow
            label="Start"
            value={formatDateTime(event.startDate) ?? undefined}
          />
          <FieldRow
            label="Athletes"
            value={event.athletes !== null ? String(event.athletes) : undefined}
          />
          <FieldRow label="Event code" value={event.eventCode} />
        </div>

        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function StatusBubble({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: "#fbbf24",
    OPEN: "#34d399",
    FINISHED: "#60a5fa",
  };

  return (
    <span
      className={styles.statusBubble}
      style={{ background: colors[status] || "#94a3b8" }}
    >
      {status}
    </span>
  );
}
