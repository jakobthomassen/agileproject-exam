import { useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { muted } from "../components/ui/Text";
import { TextInput } from "../components/ui/TextInput";
import { Card } from "../components/ui/Card";
import { useEventSetup, type SavedEvent } from "../context/EventSetupContext";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

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

        <EventsTable
          events={savedEvents}
          onDelete={deleteSavedEvent}
          onEdit={startEdit}
        />

        {editingId && editDraft && (
          <div className={styles.editSection}>
            <Card padding={16}>
              <h3>Edit event</h3>

              <div className={styles.editGrid}>
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
                    className={styles.statusSelect}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="FINISHED">Finished</option>
                  </select>
                </div>
              </div>

              <div className={styles.editActions}>
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
    <div className={styles.tableWrapper}>
      <TableHeader />

      {events.length === 0 && (
        <div className={styles.emptyState} style={muted}>
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
}: {
  ev: SavedEvent;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.tableRow}>
      <span
        className={styles.eventNameLink}
        onClick={() => navigate(`/event/${ev.id}`)}
      >
        {ev.eventName || "Untitled Event"}
      </span>

      <span>{ev.sport || "—"}</span>
      <span>{ev.format || "—"}</span>

      <StatusBubble status={ev.status} />

      <span>{ev.startDate || "—"}</span>
      <span>{ev.athletes}</span>
      <span>{ev.eventCode || "No code"}</span>

      <div className={styles.actionsRow}>
        <span
          className={styles.actionEdit}
          onClick={onEdit}
        >
          Edit
        </span>

        <span
          onClick={onDelete}
          className={styles.actionDelete}
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
      className={styles.statusBubble}
      style={{ background: colors[status] || "#94a3b8" }}
    >
      {status}
    </span>
  );
}
