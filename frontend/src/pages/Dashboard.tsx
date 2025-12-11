import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/TextInput";
import { muted } from "../components/ui/Text";
import { useEventSetup, type SavedEvent } from "../context/EventSetupContext";
import { EventSummary } from "../components/event/EventSummary";
import styles from "./Dashboard.module.css";

// Backend API base URL
const API_BASE_URL = "http://localhost:8000";

// Type for events coming from the backend API
interface BackendEvent {
  id: number;
  name: string | null;
  sport: string | null;
  format: string | null;
  status: string;
  start_date: string | null;
  athletes: number;
  event_code: string | null;
  location: string | null;
}

export default function Dashboard() {
  const { savedEvents, deleteSavedEvent } = useEventSetup();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<SavedEvent | null>(null);

  // State for backend events
  const [backendEvents, setBackendEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from backend on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<BackendEvent[]>(`${API_BASE_URL}/events`);
        setBackendEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Convert backend events to SavedEvent format for the table
  const mappedBackendEvents: SavedEvent[] = backendEvents.map(ev => ({
    id: String(ev.id),
    eventName: ev.name,
    eventType: null,
    participants: ev.athletes,
    scoringMode: null,
    scoringAudience: null,
    scoringJudge: null,
    venue: ev.location,
    startDateTime: ev.start_date,
    endDateTime: null,
    sponsor: null,
    rules: null,
    audienceLimit: null,
    image: null,
    judgingSettings: null,
    sport: ev.sport,
    format: ev.format,
    status: (ev.status as "DRAFT" | "OPEN" | "FINISHED") || "DRAFT",
    startDate: ev.start_date,
    athletes: ev.athletes,
    eventCode: ev.event_code,
  }));

  // Combine backend events with local saved events (backend first)
  const allEvents = [...mappedBackendEvents, ...savedEvents];

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

          {loading && (
            <div className={styles.emptyState} style={muted}>
              Loading events...
            </div>
          )}

          {error && (
            <div className={styles.emptyState} style={{ ...muted, color: "#f87171" }}>
              {error}
            </div>
          )}

          {!loading && !error && allEvents.length === 0 && (
            <div className={styles.emptyState} style={muted}>
              No events yet.
            </div>
          )}

          {!loading && allEvents.map(ev => (
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
          <div className={styles.modalBackdrop}>
            <Card className={styles.modalCard}>
              <EventSummary
                event={selectedEvent}
                compact
                showHero
              />

              <div className={styles.modalActions}>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
function formatTableDate(value: string | null | undefined): string {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      <span>{formatTableDate(ev.startDate)}</span>
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
