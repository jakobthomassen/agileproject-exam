/*
README!

This page stores everything in local storage. The idea is we sync the most important fields to db and leave the rest in sessionstorage for demo purposes.

Athlete count updates dynamically with our added athletes, so the number of athletes defined earlier is currently redundant.

Scoring to be implemented.

Experts to be implemented.

Minor format inconsistencies to be fixed.

*/

import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/TextInput";
import { Button } from "../components/ui/Button";
import { muted } from "../components/ui/Text";
import { useEventSetup, type SavedEvent } from "../context/EventSetupContext";
import { BackButton } from "../components/ui/BackButton";
import styles from "./DashboardEdit.module.css";

export default function DashboardEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedEvents, updateSavedEvent } = useEventSetup();

  const event = useMemo(
    () => savedEvents.find(e => e.id === id),
    [savedEvents, id]
  );

  const [activeTab, setActiveTab] = useState<
    "general" | "scoring" | "athletes" | "experts"
  >("general");

  /* ------------------------------------------------------------
     DRAFT STATE (loads AFTER event becomes available)
  ------------------------------------------------------------ */
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    if (!event) return;

    setDraft({
      eventName: event.eventName ?? "",
      sport: event.sport ?? "",
      startDate: event.startDate ?? "",
      athletes: event.athletes ?? 0,
      status: event.status,
      scoringRules: "",
      expertNotes: ""
    });
  }, [event]);

  /* ------------------------------------------------------------
     ATHLETES (persist with saved event, no cross-tab persistence needed)
  ------------------------------------------------------------ */

  const [athletes, setAthletes] = useState<
    { number: number; name: string }[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load athletes from saved event when available
  useEffect(() => {
    if (!event) return;
    if (Array.isArray((event as any).athleteList)) {
      setAthletes((event as any).athleteList as { number: number; name: string }[]);
    } else {
      setAthletes([]);
    }
  }, [event]);

  // Modal for "Import Athletes" explanation
  const [importInfoOpen, setImportInfoOpen] = useState(false);

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

  function triggerFileDialog() {
    fileInputRef.current?.click();
  }

  /* ------------------------------------------------------------
     FILE IMPORT (test athletes for now)
  ------------------------------------------------------------ */
  function handleParseAthletes(file: File) {
    alert("Athletes added");

    const testAthletes = [
      { number: 1, name: "Alice Runner" },
      { number: 2, name: "Bob Jumper" },
      { number: 3, name: "Carmen Thrower" },
      { number: 4, name: "David Sprinter" },
      { number: 5, name: "Elena Swimmer" }
    ];

    setAthletes(prev => [...prev, ...testAthletes]);
  }

  /* ------------------------------------------------------------
     SAVE EVENT
  ------------------------------------------------------------ */
  function handleSave() {
    updateSavedEvent(event.id, {
      eventName: draft.eventName || null,
      sport: draft.sport || null,
      startDate: draft.startDate || null,
      // keep numeric athletes field in sync with table length
      athletes: athletes.length,
      status: draft.status,
      // persist full athlete list on the event so it is available on reopen
      athleteList: athletes
    });

    navigate("/dashboard");
  }

  /* ------------------------------------------------------------
     RENDER TABS
  ------------------------------------------------------------ */
  function renderTab() {
    switch (activeTab) {
      case "general":
        return (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label>Event name</label>
              <TextInput
                value={draft.eventName}
                onChange={e =>
                  setDraft(d => d && { ...d, eventName: e.target.value })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Sport</label>
              <TextInput
                value={draft.sport}
                onChange={e =>
                  setDraft(d => d && { ...d, sport: e.target.value })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Start date</label>
              <TextInput
                type="datetime-local"
                value={draft.startDate}
                onChange={e =>
                  setDraft(d => d && { ...d, startDate: e.target.value })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Athletes</label>
              <TextInput
                type="number"
                min={0}
                value={draft.athletes}
                onChange={e =>
                  setDraft(d => d && {
                    ...d,
                    athletes: e.target.value === "" ? 0 : Number(e.target.value)
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Status</label>
              <select
                value={draft.status}
                onChange={e =>
                  setDraft(d => d && {
                    ...d,
                    status: e.target.value as SavedEvent["status"]
                  })
                }
                className={styles.select}
              >
                <option value="DRAFT">Draft</option>
                <option value="OPEN">Open</option>
                <option value="FINISHED">Finished</option>
              </select>
            </div>
          </div>
        );

      case "scoring":
        return (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label>Scoring rules (WIP)</label>
              <textarea
                className={styles.textarea}
                placeholder="This tab should reuse the SetupManual scoring config modal. WIP."
                value={draft.scoringRules}
                onChange={e =>
                  setDraft(d => d && { ...d, scoringRules: e.target.value })
                }
              />
            </div>
          </div>
        );

      /* ------------------------------------------------------------
         UNIFIED ATHLETES TAB
      ------------------------------------------------------------ */
      case "athletes":
        return (
          <div className={styles.tabContent}>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleParseAthletes(file);
              }}
            />

            {/* Import button row */}
            <div className={styles.importRow}>
              <button
                className={styles.importButton}
                onClick={triggerFileDialog}
              >
                Import Athletes
              </button>

              <div
                className={styles.infoButtonSmall}
                onClick={() => setImportInfoOpen(true)}
              >
                ?
              </div>
            </div>

            {/* Modal */}
            {importInfoOpen && (
              <div
                className={styles.modalOverlay}
                onClick={() => setImportInfoOpen(false)}
              >
                <div
                  className={styles.modalContent}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className={styles.closeButton}
                    onClick={() => setImportInfoOpen(false)}
                  >
                    ×
                  </button>

                  <h3 className={styles.modalTitle}>Import Athletes</h3>

                  <p>
                    Upload a <strong>CSV</strong> or <strong>Excel (.xlsx)</strong> file to add
                    athletes automatically. Imported athletes can be edited afterward.
                  </p>

                  <p style={{ marginTop: 12 }}>
                    <strong>Supported formats</strong>
                    <ul style={{ marginLeft: 20 }}>
                      <li>.csv (comma or semicolon separated)</li>
                      <li>.xlsx (Excel workbook)</li>
                    </ul>
                  </p>
                </div>
              </div>
            )}

            {/* Table */}
            {(athletes.length > 0) && (
              <>
                <table className={styles.athleteTable}>
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Name</th>
                    </tr>
                  </thead>

                  <tbody>
                    {athletes.map((a, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="number"
                            value={a.number}
                            onChange={e => {
                              const updated = [...athletes];
                              updated[idx].number = Number(e.target.value);
                              setAthletes(updated);
                            }}
                            className={styles.athleteInput}
                          />
                        </td>

                        <td>
                          <input
                            type="text"
                            value={a.name}
                            onChange={e => {
                              const updated = [...athletes];
                              updated[idx].name = e.target.value;
                              setAthletes(updated);
                            }}
                            className={styles.athleteInput}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add athlete */}
                <button
                  className={styles.addAthleteButton}
                  onClick={() =>
                    setAthletes(prev => [
                      ...prev,
                      { number: prev.length + 1, name: "" }
                    ])
                  }
                >
                  Add athlete
                </button>
              </>
            )}

            {athletes.length === 0 && (
              <button
                className={styles.addAthleteButton}
                onClick={() =>
                  setAthletes([{ number: 1, name: "" }])
                }
              >
                Add athlete manually
              </button>
            )}
          </div>
        );

      case "experts":
        return (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label>Experts (WIP)</label>
              <textarea
                className={styles.textarea}
                placeholder="Not sure what to do here. (WIP)"
                value={draft.expertNotes}
                onChange={e =>
                  setDraft(d => d && { ...d, expertNotes: e.target.value })
                }
              />
            </div>
          </div>
        );
    }
  }

  /* ------------------------------------------------------------
     PAGE SHELL
  ------------------------------------------------------------ */
  return (
    <PageContainer kind="solid" maxWidth={900}>
      <BackButton to="/dashboard">Back</BackButton>

      <h1 className={styles.title}>{draft.eventName || "Edit Event"}</h1>

      <Card padding={20}>
        <div className={styles.tabs}>
          <button
            className={activeTab === "general" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={activeTab === "scoring" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("scoring")}
          >
            Scoring
          </button>
          <button
            className={activeTab === "athletes" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("athletes")}
          >
            Athletes
          </button>
          <button
            className={activeTab === "experts" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("experts")}
          >
            Experts
          </button>
        </div>

        {renderTab()}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </Card>
    </PageContainer>
  );
}
