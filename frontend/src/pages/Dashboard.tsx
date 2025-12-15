import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/TextInput";
import { muted } from "../components/ui/Text";
import { type SavedEvent } from "../context/EventSetupContext";
import { EventSummary } from "../components/event/EventSummary";
import styles from "./Dashboard.module.css";
import { API_URL } from "../config";

// Backend API base URL
const API_BASE_URL = API_URL;

// Type for events coming from the backend API
interface BackendEvent {
  id: number;
  eventName: string | null;
  sport: string | null;
  format: string | null;
  status: string;
  location: string | null;
  startDate: string | null;
  athletes: number;
  eventCode: string | null;
  image?: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<SavedEvent | null>(null);

  // State for backend events
  const [backendEvents, setBackendEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<BackendEvent[]>(`${API_BASE_URL}/api/events`);
      setBackendEvents(response.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events from server.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch events from backend on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const deleteBackendEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
      // Refresh the list after deletion
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  // Toggle event status
  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    const statusOrder = ["DRAFT", "OPEN", "FINISHED"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    try {
      await axios.patch(`${API_BASE_URL}/api/events/${eventId}/status`, { status: newStatus });
      fetchEvents();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  // Convert backend events to SavedEvent format for the table
  const mappedBackendEvents: SavedEvent[] = backendEvents.map(ev => ({
    id: String(ev.id),

    // Use eventName from backend (which comes from DB event_name column)
    eventName: ev.eventName || "Untitled Event",

    eventType: null,
    participants: ev.athletes,
    scoringMode: null,
    scoringAudience: null,
    scoringJudge: null,

    venue: ev.location || "",

    startDateTime: ev.startDate || "",
    endDateTime: null,
    sponsor: null,
    rules: null,
    audienceLimit: null,
    image: ev.image || null,
    judgingSettings: null,

    // Map backend fields to SavedEvent format
    sport: ev.sport || "General",
    format: ev.format || "Standard",
    status: (ev.status as "DRAFT" | "OPEN" | "FINISHED") || "DRAFT",
    startDate: ev.startDate || "",
    athletes: ev.athletes,
    eventCode: ev.eventCode || "---",
  }));

  const allEvents = [...mappedBackendEvents];

  // Filter events based on search query
  const filteredEvents = allEvents.filter(ev => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      ev.eventName?.toLowerCase().includes(query) ||
      ev.venue?.toLowerCase().includes(query) ||
      ev.eventCode?.toLowerCase().includes(query) ||
      ev.format?.toLowerCase().includes(query) ||
      ev.status?.toLowerCase().includes(query) ||
      ev.startDate?.toLowerCase().includes(query)
    );
  });

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
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.tableWrapper}>
          <TableHeader />

          {loading && (
            <div className={styles.emptyState} style={muted}>
              <div className="flex items-center justify-center gap-2">
                Loading events...
              </div>
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

          {!loading && !error && allEvents.length > 0 && filteredEvents.length === 0 && (
            <div className={styles.emptyState} style={muted}>
              No events match your search.
            </div>
          )}

          {!loading && filteredEvents.map(ev => (
            <TableRow
              key={ev.id}
              ev={ev}
              onDelete={() => deleteBackendEvent(ev.id)}
              onEdit={() => navigate(`/dashboard/edit/${ev.id}`)}
              onOpen={() => setSelectedEvent(ev)}
              onToggleStatus={() => toggleEventStatus(ev.id, ev.status)}
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

function formatTableDate(value: string | null | undefined): string {
  if (!value) return "—";

  // Handle date-only format (YYYY-MM-DD) or datetime format (YYYY-MM-DDTHH:MM)
  let dateStr = value;
  if (value.includes("T")) {
    // Already has time component
    dateStr = value;
  } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Date only - don't parse as datetime (avoids timezone issues)
    // Just return the date part formatted nicely
    const [year, month, day] = value.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  }

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function TableHeader() {
  return (
    <div className={styles.tableHeader}>
      <span>Event</span>
      <span>Format</span>
      <span>Status</span>
      <span>Location</span>
      <span>Start Date</span>
      <span>Participants</span>
      <span>Event Code</span>
      <span>Actions</span>
    </div>
  );
}

function TableRow({ ev, onDelete, onEdit, onOpen, onToggleStatus }: { ev: SavedEvent; onDelete: () => void; onEdit: () => void; onOpen: () => void; onToggleStatus: () => void; }) {
  return (
    <div className={styles.tableRow}>
      <span className={styles.eventNameLink} onClick={onOpen}>
        {ev.eventName}
      </span>
      <span>{ev.format}</span>
      <StatusBubble status={ev.status} onClick={onToggleStatus} />
      <span>{ev.venue || "—"}</span>
      <span>{formatTableDate(ev.startDate)}</span>
      <span>{ev.athletes}</span>
      <span>{ev.eventCode}</span>
      <div className={styles.actionsRow}>
        <span className={styles.actionEdit} onClick={onEdit}>Edit</span>
        <span className={styles.actionDelete} onClick={onDelete}>🗑</span>
      </div>
    </div>
  );
}

function StatusBubble({ status, onClick }: { status: string; onClick?: () => void }) {
  const colors: Record<string, string> = { DRAFT: "#fbbf24", OPEN: "#34d399", FINISHED: "#60a5fa" };
  return (
    <span
      className={styles.statusBubble}
      style={{
        background: colors[status] || "#94a3b8",
        cursor: onClick ? "pointer" : "default"
      }}
      onClick={onClick}
      title={onClick ? "Click to toggle status" : undefined}
    >
      {status}
    </span>
  );
}