import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Import Axios
import { PageContainer } from "../components/layout/PageContainer";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/TextInput";
import { Button } from "../components/ui/Button";
import { BackButton } from "../components/ui/BackButton";
import { Loader2, Image as ImageIcon } from "lucide-react";
import styles from "./DashboardEdit.module.css";
import { API_URL } from "../config";
import { ParticipantList } from "../components/event/ParticipantList";

// Backend URL
const API_BASE_URL = API_URL;

interface EventDraft {
  eventName: string;
  venue: string;
  sport: string;
  startDate: string;
  endDate: string;
  athletes: number;
  rules: string;
  description: string;
  scoringMode: string;
  audienceWeight: number | null;
  expertWeight: number | null;
  athleteWeight: number | null;
  expertNotes: string;
}

export default function DashboardEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --------------------------------------------------------
  // STATE
  // --------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Data
  const [draft, setDraft] = useState<EventDraft>({
    eventName: "",
    venue: "",
    sport: "",
    startDate: "",
    endDate: "",
    athletes: 0,
    rules: "",
    description: "",
    scoringMode: "",
    audienceWeight: null,
    expertWeight: null,
    athleteWeight: null,
    expertNotes: ""
  });

  const [activeTab, setActiveTab] = useState<"general" | "scoring" | "athletes" | "participants" | "experts">("general");

  // Athlete List State
  const [athleteList, setAthleteList] = useState<{ number: number; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importInfoOpen, setImportInfoOpen] = useState(false);

  // Image Upload State
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventImage, setEventImage] = useState<string | null>(null);

  // --------------------------------------------------------
  // 1. FETCH DATA FROM DB (ON LOAD)
  // --------------------------------------------------------
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        // Reuse the context endpoint which formats data nicely
        const res = await axios.get(`${API_BASE_URL}/api/events/${id}/context`);
        const data = res.data;

        // Parse startDateTime and endDateTime
        let startDate = "";
        let endDate = "";
        if (data.startDateTime) {
          startDate = data.startDateTime.includes("T") ? data.startDateTime : `${data.startDateTime}T00:00`;
        }
        if (data.endDateTime) {
          endDate = data.endDateTime.includes("T") ? data.endDateTime : `${data.endDateTime}T00:00`;
        }

        setDraft({
          eventName: data.eventName || "",
          venue: data.venue || "",
          sport: data.eventName || "", // Fallback if no specific sport column
          startDate: startDate,
          endDate: endDate,
          athletes: data.athletes || 0,
          rules: data.rules || "",
          description: data.description || data.rules || "", // Use description or fallback to rules
          scoringMode: data.scoringMode || "",
          audienceWeight: data.audienceWeight ?? null,
          expertWeight: data.expertWeight ?? null,
          athleteWeight: data.athleteWeight ?? null,
          expertNotes: ""
        });

        // Initialize placeholder athlete list
        // Only if ATHLETES count is > 0 (not participants)
        if (data.athletes > 0) {
          const placeholders = Array.from({ length: data.athletes }, (_, i) => ({
            number: i + 1,
            name: `Athlete ${i + 1}`
          }));
          setAthleteList(placeholders);
        }

        // Fetch event image
        try {
          const imageRes = await axios.get(`${API_BASE_URL}/api/events/${id}/image`);
          if (imageRes.data && imageRes.data.image) {
            setEventImage(imageRes.data.image);
          }
        } catch (error: any) {
          // 404 is expected if no image exists
          if (error.response?.status !== 404) {
            console.error("Failed to fetch event image:", error);
          }
        }
      } catch (err) {
        console.error("Failed to load event", err);
        alert("Could not load event data.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  // --------------------------------------------------------
  // 2. SAVE DATA TO DB
  // --------------------------------------------------------
  async function handleSave() {
    setSaving(true);
    try {
      // Prepare payload for Backend
      const payload: any = {
        eventName: draft.eventName,
        venue: draft.venue,
        scoringMode: draft.scoringMode,
        rules: draft.rules,
        description: draft.description,
        startDate: draft.startDate,
        endDateTime: draft.endDate || null,
        audienceWeight: draft.audienceWeight,
        expertWeight: draft.expertWeight,
        athleteWeight: draft.athleteWeight,
        // Sync athlete count with list length if list exists
        athletes: athleteList.length > 0 ? athleteList.length : draft.athletes
      };

      await axios.put(`${API_BASE_URL}/api/events/${id}`, payload);

      // Redirect to Dashboard on success
      navigate("/dashboard");

    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function triggerFileDialog() {
    fileInputRef.current?.click();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed.");
      return;
    }

    if (!id) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(
        `${API_BASE_URL}/api/events/${id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Refresh image display
      const imageRes = await axios.get(`${API_BASE_URL}/api/events/${id}/image`);
      if (imageRes.data && imageRes.data.image) {
        setEventImage(imageRes.data.image);
      }

      alert("Image uploaded successfully!");

      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      alert(error.response?.data?.detail || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  function triggerImageDialog() {
    imageInputRef.current?.click();
  }

  function handleParseAthletes(file: File) {
    alert(`Simulating import from ${file.name}`);
    // Mock import logic
    const testAthletes = [
      { number: athleteList.length + 1, name: "Imported Runner A" },
      { number: athleteList.length + 2, name: "Imported Jumper B" },
      { number: athleteList.length + 3, name: "Imported Thrower C" },
      { number: athleteList.length + 4, name: "Imported Sprinter D" },
      { number: athleteList.length + 5, name: "Imported Swimmer E" }
    ];
    setAthleteList(prev => [...prev, ...testAthletes]);
    setDraft(d => ({ ...d, athletes: athleteList.length + testAthletes.length }));
  }

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------

  if (loading) {
    return (
      <PageContainer kind="solid">
        <div className="flex h-[50vh] items-center justify-center gap-2 text-gray-400">
          <Loader2 className="animate-spin" /> Loading event...
        </div>
      </PageContainer>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case "general":
        return (
          <div className={styles.tabContent}>
            {/* Image Upload Section */}
            <div className={styles.field}>
              <label>Event Image</label>
              <div style={{ marginBottom: "16px" }}>
                {eventImage && (
                  <img
                    src={eventImage}
                    alt="Event"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      height: "auto",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      objectFit: "cover"
                    }}
                  />
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <Button
                  variant="secondary"
                  onClick={triggerImageDialog}
                  disabled={uploadingImage}
                  style={{ width: "100%", maxWidth: "400px" }}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="animate-spin" size={16} style={{ marginRight: "8px" }} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} style={{ marginRight: "8px" }} />
                      {eventImage ? "Change Image" : "Upload Image"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className={styles.field}>
              <label>Event name</label>
              <TextInput
                value={draft.eventName}
                onChange={e => setDraft({ ...draft, eventName: e.target.value })}
              />
            </div>

            {/* Added Venue Field */}
            <div className={styles.field}>
              <label>Venue / Location</label>
              <TextInput
                value={draft.venue}
                onChange={e => setDraft({ ...draft, venue: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label>Sport</label>
              <TextInput
                value={draft.sport}
                onChange={e => setDraft({ ...draft, sport: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label>Start date & time</label>
              <TextInput
                type="datetime-local"
                value={draft.startDate}
                onChange={e => setDraft({ ...draft, startDate: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label>End date & time</label>
              <TextInput
                type="datetime-local"
                value={draft.endDate}
                onChange={e => setDraft({ ...draft, endDate: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label>Athletes (Count)</label>
              <TextInput
                type="number"
                min={0}
                value={draft.athletes}
                onChange={e => setDraft({ ...draft, athletes: Number(e.target.value) })}
              />
            </div>

          </div>
        );

      case "scoring":
        return (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label>Scoring Mode</label>
              <select
                value={draft.scoringMode}
                onChange={e => setDraft({ ...draft, scoringMode: e.target.value })}
                className={styles.select}
              >
                <option value="">Select scoring mode</option>
                <option value="mixed">Mixed</option>
                <option value="ranking">Ranking</option>
                <option value="battle">Battle</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Description</label>
              <textarea
                className={styles.textarea}
                placeholder="Event description..."
                value={draft.description}
                onChange={e => setDraft({ ...draft, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className={styles.field}>
              <label>Rules</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe scoring rules..."
                value={draft.rules}
                onChange={e => setDraft({ ...draft, rules: e.target.value })}
                rows={6}
              />
            </div>

            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}>Judging Weights</h3>

            <div className={styles.field}>
              <label>Audience Weight</label>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={draft.audienceWeight ?? ""}
                onChange={e => setDraft({ ...draft, audienceWeight: e.target.value ? Number(e.target.value) : null })}
                placeholder="0-100"
              />
            </div>

            <div className={styles.field}>
              <label>Expert Weight</label>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={draft.expertWeight ?? ""}
                onChange={e => setDraft({ ...draft, expertWeight: e.target.value ? Number(e.target.value) : null })}
                placeholder="0-100"
              />
            </div>

            <div className={styles.field}>
              <label>Athlete Weight</label>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={draft.athleteWeight ?? ""}
                onChange={e => setDraft({ ...draft, athleteWeight: e.target.value ? Number(e.target.value) : null })}
                placeholder="0-100"
              />
            </div>
          </div>
        );

      case "athletes":
        return (
          <div className={styles.tabContent}>
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

            <div className={styles.importRow}>
              <button className={styles.importButton} onClick={triggerFileDialog}>
                Import Athletes
              </button>
              <div className={styles.infoButtonSmall} onClick={() => setImportInfoOpen(true)}>
                ?
              </div>
            </div>

            {importInfoOpen && (
              <div className={styles.modalOverlay} onClick={() => setImportInfoOpen(false)}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <button className={styles.closeButton} onClick={() => setImportInfoOpen(false)}>×</button>
                  <h3 className={styles.modalTitle}>Import Athletes</h3>
                  <p>Upload a CSV or Excel file to add athletes automatically.</p>
                </div>
              </div>
            )}

            {athleteList.length > 0 ? (
              <>
                <table className={styles.athleteTable}>
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athleteList.map((a, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="number"
                            value={a.number}
                            onChange={e => {
                              const updated = [...athleteList];
                              updated[idx].number = Number(e.target.value);
                              setAthleteList(updated);
                            }}
                            className={styles.athleteInput}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={a.name}
                            onChange={e => {
                              const updated = [...athleteList];
                              updated[idx].name = e.target.value;
                              setAthleteList(updated);
                            }}
                            className={styles.athleteInput}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className={styles.addAthleteButton}
                  onClick={() => {
                    setAthleteList(prev => [...prev, { number: prev.length + 1, name: "" }]);
                    setDraft(d => ({ ...d, athletes: d.athletes + 1 }));
                  }}
                >
                  Add athlete
                </button>
              </>
            ) : (
              <button
                className={styles.addAthleteButton}
                onClick={() => {
                  setAthleteList([{ number: 1, name: "" }]);
                  setDraft(d => ({ ...d, athletes: 1 }));
                }}
              >
                Add athlete manually
              </button>
            )}
          </div>
        );

      case "participants":
        return (
          <div className={styles.tabContent}>
            {/* We reuse the container but ParticipantList handles its own layout */}
            <div>
              <ParticipantList eventId={Number(id)} />
            </div>
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
                onChange={e => setDraft({ ...draft, expertNotes: e.target.value })}
              />
            </div>
          </div>
        );
    }
  }

  return (
    <PageContainer kind="solid" maxWidth={900}>
      <BackButton to="/dashboard">Back</BackButton>

      <h1 className={styles.title}>{draft.eventName || "Edit Event"}</h1>

      <Card padding={20}>
        <div className={styles.tabs}>
          <button className={activeTab === "general" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("general")}>General</button>
          <button className={activeTab === "scoring" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("scoring")}>Scoring</button>
          <button className={activeTab === "athletes" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("athletes")}>Athletes</button>
          <button className={activeTab === "participants" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("participants")}>Participants</button>
          <button className={activeTab === "experts" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("experts")}>Experts</button>
        </div>

        {renderTab()}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}