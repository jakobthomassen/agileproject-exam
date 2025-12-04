import { useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { muted } from "../components/ui/Text";
import { TextInput } from "../components/ui/TextInput";
import { Card } from "../components/ui/Card";
import { useEventSetup, type SavedEvent } from "../context/EventSetupContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { savedEvents, deleteSavedEvent, updateSavedEvent } = useEventSetup();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<
    | {
        eventName: string;
        sport: string;
        startDate: string;
        athletes: number;
        status: SavedEvent["status"];
      }
    | null
  >(null);

  function startEdit(ev: SavedEvent) {
    setEditingId(ev.id);
    setEditDraft({
      eventName: ev.eventName ?? "",
      sport: ev.sport ?? "",
      startDate: ev.startDate ?? "",
      athletes: ev.athletes ?? 0,
      status: ev.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  function saveEdit() {
    if (!editingId || !editDraft) return;
    updateSavedEvent(editingId, {
      eventName: editDraft.eventName || null,
      sport: editDraft.sport || null,
      startDate: editDraft.startDate || null,
      athletes: editDraft.athletes,
      status: editDraft.status,
    });
    setEditingId(null);
    setEditDraft(null);
  }

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
          <TextInput
            placeholder="Search my events..."
            style={{ width: 260 }}
          />
        </div>

        <EventsTable
          events={savedEvents}
          onDelete={deleteSavedEvent}
          onEdit={startEdit}
        />

        {editingId && editDraft && (
          <div style={{ marginTop: 16 }}>
            <Card padding={16}>
              <h3 style={{ marginBottom: 12 }}>Edit event</h3>

              <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, ...muted }}>Event name</div>
                  <TextInput
                    value={editDraft.eventName}
                    onChange={e =>
                      setEditDraft(d =>
                        d ? { ...d, eventName: e.target.value } : d
                      )
                    }
                  />
                </div>

                <div>
                  <div style={{ fontSize: 13, ...muted }}>Sport</div>
                  <TextInput
                    value={editDraft.sport}
                    onChange={e =>
                      setEditDraft(d =>
                        d ? { ...d, sport: e.target.value } : d
                      )
                    }
                  />
                </div>

                <div>
                  <div style={{ fontSize: 13, ...muted }}>Start date</div>
                  <TextInput
                    type="datetime-local"
                    value={editDraft.startDate}
                    onChange={e =>
                      setEditDraft(d =>
                        d ? { ...d, startDate: e.target.value } : d
                      )
                    }
                  />
                </div>

                <div>
                  <div style={{ fontSize: 13, ...muted }}>Athletes</div>
                  <TextInput
                    type="number"
                    min={0}
                    value={editDraft.athletes}
                    onChange={e => {
                      const val = e.target.value;
                      const num = val === "" ? 0 : Number(val);
                      setEditDraft(d => (d ? { ...d, athletes: num } : d));
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: 13, ...muted }}>Status</div>
                  <select
                    value={editDraft.status}
                    onChange={e =>
                      setEditDraft(d =>
                        d
                          ? {
                              ...d,
                              status: e.target.value as SavedEvent["status"],
                            }
                          : d
                      )
                    }
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
                    }}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="FINISHED">Finished</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>Save changes</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function EventsTable({
  events,
  onDelete,
  onEdit,
}: {
  events: SavedEvent[];
  onDelete: (id: string) => void;
  onEdit: (ev: SavedEvent) => void;
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
        <TableRow
          key={ev.id}
          ev={ev}
          onDelete={() => onDelete(ev.id)}
          onEdit={() => onEdit(ev)}
        />
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
  onDelete,
  onEdit,
}: {
  ev: SavedEvent;
  onDelete: () => void;
  onEdit: () => void;
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
          onClick={onEdit}
        >
          Edit
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
