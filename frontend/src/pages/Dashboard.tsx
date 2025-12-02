import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { muted } from "../components/ui/Text";
import { useEventSetup } from "../context/EventSetupContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { savedEvents, deleteSavedEvent } = useEventSetup();
  const navigate = useNavigate();

  return (
    <PageContainer kind="solid" maxWidth={1100}>
      <div style={{ width: "100%", marginTop: 12 }}>
        <h1 style={{ marginBottom: 20 }}>My Events</h1>

        <Button
          onClick={() => navigate("/setup/method")}
          style={{ marginBottom: 20 }}
        >
          New Peers Event
        </Button>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <input
            placeholder="Search my events..."
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#020617",
              color: "white",
              width: 260,
              boxSizing: "border-box"
            }}
          />
        </div>

        <EventsTable events={savedEvents} onDelete={deleteSavedEvent} />
      </div>
    </PageContainer>
  );
}

function EventsTable({
  events,
  onDelete
}: {
  events: any[];
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 12,
        border: "1px solid #1f2937",
        overflow: "hidden"
      }}
    >
      <TableHeader />

      {events.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", ...muted }}>
          No events yet.
        </div>
      )}

      {events.map(ev => (
        <TableRow key={ev.id} ev={ev} onDelete={() => onDelete(ev.id)} />
      ))}
    </div>
  );
}

function TableHeader() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "180px 140px 120px 120px 130px 100px 120px 100px",
        padding: "12px 16px",
        background: "#0f172a",
        fontWeight: 600,
        fontSize: 14
      }}
    >
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
  onDelete
}: {
  ev: any;
  onDelete: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "180px 140px 120px 120px 130px 100px 120px 100px",
        padding: "12px 16px",
        borderTop: "1px solid #1e293b",
        alignItems: "center",
        fontSize: 14
      }}
    >
      <span style={{ color: "#7dd3fc", cursor: "pointer" }}
            onClick={() => navigate(`/event/${ev.id}`)}>
        {ev.eventName || "Untitled Event"}
      </span>

      <span>{ev.sport || "—"}</span>
      <span>{ev.format || "—"}</span>

      <StatusBubble status={ev.status} />

      <span>{ev.startDate || "—"}</span>
      <span>{ev.athletes}</span>
      <span>{ev.eventCode || "No code"}</span>

      <div style={{ display: "flex", gap: 10 }}>
        <span
          style={{ color: "#38bdf8", cursor: "pointer" }}
          onClick={() => navigate(`/event/${ev.id}`)}
        >
          Manage
        </span>

        <span
          onClick={onDelete}
          style={{ cursor: "pointer", color: "#f87171" }}
        >
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
    FINISHED: "#60a5fa"
  };

  return (
    <span
      style={{
        color: "#0f172a",
        background: colors[status] || "#94a3b8",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        justifySelf: "start"
      }}
    >
      {status}
    </span>
  );
}
