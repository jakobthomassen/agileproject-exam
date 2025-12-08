import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { Card } from "../components/ui/Card";
import { FieldRow } from "../components/ui/FieldRow";
import { muted } from "../components/ui/Text";
import { useEventSetup, type SavedEvent } from "../context/EventSetupContext";

export default function DashboardEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedEvents, updateSavedEvent } = useEventSetup();

  const event = useMemo(
    () => savedEvents.find(e => e.id === id),
    [savedEvents, id]
  );

  const [draft, setDraft] = useState(() => {
    if (!event) return null;
    return {
      eventName: event.eventName ?? "",
      sport: event.sport ?? "",
      startDate: event.startDate ?? "",
      athletes: event.athletes ?? 0,
      status: event.status,
    };
  });

  if (!event || !draft) {
    return (
      <PageContainer kind="solid">
        <p style={muted}>Event not found.</p>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
      </PageContainer>
    );
  }

  function handleSave() {
    updateSavedEvent(event.id, {
      eventName: draft.eventName || null,
      sport: draft.sport || null,
      startDate: draft.startDate || null,
      athletes: draft.athletes,
      status: draft.status,
    });

    navigate("/dashboard");
  }

  return (
    <PageContainer kind="solid" maxWidth={640}>
      <Card padding={20}>
        <h1>Edit event</h1>

        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
  <div>
    <div style={{ fontSize: 13, ...muted }}>Event name</div>
    <TextInput
      value={draft.eventName}
      onChange={e =>
        setDraft(d => d && { ...d, eventName: e.target.value })
      }
    />
  </div>

  <div>
    <div style={{ fontSize: 13, ...muted }}>Sport</div>
    <TextInput
      value={draft.sport}
      onChange={e =>
        setDraft(d => d && { ...d, sport: e.target.value })
      }
    />
  </div>

  <div>
    <div style={{ fontSize: 13, ...muted }}>Start date</div>
    <TextInput
      type="datetime-local"
      value={draft.startDate}
      onChange={e =>
        setDraft(d => d && { ...d, startDate: e.target.value })
      }
    />
  </div>

  <div>
    <div style={{ fontSize: 13, ...muted }}>Athletes</div>
    <TextInput
      type="number"
      min={0}
      value={draft.athletes}
      onChange={e =>
        setDraft(d =>
          d && {
            ...d,
            athletes:
              e.target.value === "" ? 0 : Number(e.target.value),
          }
        )
      }
    />
  </div>

  <div>
    <div style={{ fontSize: 13, ...muted }}>Status</div>
    <select
      value={draft.status}
      onChange={e =>
        setDraft(d =>
          d && {
            ...d,
            status: e.target.value as SavedEvent["status"],
          }
        )
      }
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 6,
        background: "#020617",
        border: "1px solid var(--color-border-strong)",
        color: "var(--color-text-primary)",
      }}
    >
      <option value="DRAFT">Draft</option>
      <option value="OPEN">Open</option>
      <option value="FINISHED">Finished</option>
    </select>
  </div>
</div>


        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 24,
          }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </Card>
    </PageContainer>
  );
}
