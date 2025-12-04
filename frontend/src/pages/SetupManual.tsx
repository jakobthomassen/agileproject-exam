import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "../components/layout/PageContainer";
import FAQWidget from "../components/ui/FAQ";

import { Card } from "../components/ui/Card";
import { TwoColumn } from "../components/ui/Grid";
import { muted } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { BackButton } from "../components/ui/BackButton";
import { SetupPageHeader } from "../components/ui/SetupPageHeader";
import { TextInput } from "../components/ui/TextInput";
import { FieldRow } from "../components/ui/FieldRow";

import { useEventSetup } from "../context/EventSetupContext";

type TemplateType = "rating" | "judge_audience" | "blank";
type ScoringFormat = "score-voting" | "scream-voting";
type ExpertVoteFormat = "single" | "multiple";


function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function SetupManual() {
  const navigate = useNavigate();
  const { setEventData } = useEventSetup();

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [participants, setParticipants] = useState<number | "">("");
  const [audienceWeight, setAudienceWeight] = useState(50);
  const [venue, setVenue] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [rules, setRules] = useState("");
  const [audienceLimit, setAudienceLimit] = useState<number | "">("");

  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(10);
  const [judgingDuration, setJudgingDuration] = useState(60); // seconds
  const [spectatorsMax, setSpectatorsMax] = useState<number | "">(100);
  
  const [allowGuestSpectators, setAllowGuestSpectators] = useState(false);
  const [voteAfterEachRound, setVoteAfterEachRound] = useState(false);
  const [expertVoteFormat, setExpertVoteFormat] =
    useState<ExpertVoteFormat>("multiple");
  const [expertCount, setExpertCount] = useState<number | "">(3);


  const [audienceEnabled, setAudienceEnabled] = useState(true);
  const [expertEnabled, setExpertEnabled] = useState(true);
  const [athleteEnabled, setAthleteEnabled] = useState(true);

  const [audienceGroupWeight, setAudienceGroupWeight] = useState(33);
  const [expertGroupWeight, setExpertGroupWeight] = useState(34);
  const [athleteGroupWeight, setAthleteGroupWeight] = useState(33);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    null
  );
  const [scoringFormat, setScoringFormat] =
    useState<ScoringFormat>("score-voting");

  const [liveLeaderboard, setLiveLeaderboard] = useState(false);

  const judgesWeight = 100 - audienceWeight;

    // Judging settings popup
  const [showJudgingSettings, setShowJudgingSettings] = useState(false);


    // Scoring-format options depend on template
  const scoringOptions =
    selectedTemplate === "rating"
      ? [
          // Ranking template
          { value: "score-voting" as ScoringFormat, label: "Score voting (ranking)" },
          { value: "scream-voting" as ScoringFormat, label: "Scream voting (ranking)" }
        ]
      : selectedTemplate === "judge_audience"
      ? [
          // Battle template
          { value: "score-voting" as ScoringFormat, label: "Score voting (battle)" },
          { value: "scream-voting" as ScoringFormat, label: "Scream voting (battle)" }
        ]
      : selectedTemplate === "blank"
      ? [
          // Poll template
          { value: "score-voting" as ScoringFormat, label: "Score voting (poll)" }
        ]
      : [
          // Fallback if template is not loaded yet
          { value: "score-voting" as ScoringFormat, label: "Score voting" }
        ];


  function applyTemplateDefaults(tpl: TemplateType) {
    switch (tpl) {
      case "rating":
        setScoringFormat("score-voting");
        setScoreMin(0);
        setScoreMax(10);
        setJudgingDuration(60);
        setSpectatorsMax(100);
        setLiveLeaderboard(true);

        setAudienceEnabled(true);
        setExpertEnabled(true);
        setAthleteEnabled(true);

        setAudienceGroupWeight(33);
        setExpertGroupWeight(34);
        setAthleteGroupWeight(33);
        break;

      case "judge_audience":
        setScoringFormat("score-voting");
        setScoreMin(0);
        setScoreMax(10);
        setJudgingDuration(45);
        setSpectatorsMax(50);
        setLiveLeaderboard(true);

        setAudienceEnabled(true);
        setExpertEnabled(true);
        setAthleteEnabled(false);

        setAudienceGroupWeight(50);
        setExpertGroupWeight(50);
        setAthleteGroupWeight(0);
        setAllowGuestSpectators(true);
        setVoteAfterEachRound(false);
        setExpertVoteFormat("multiple");
        setExpertCount(3);
        break;
        

      case "blank":
        setScoringFormat("score-voting");
        setScoreMin(0);
        setScoreMax(1); 
        setJudgingDuration(0); 
        setSpectatorsMax("");
        setLiveLeaderboard(false);

        setAudienceEnabled(true);
        setExpertEnabled(false);
        setAthleteEnabled(false);

        setAudienceGroupWeight(100);
        setExpertGroupWeight(0);
        setAthleteGroupWeight(0);
        break;
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedTemplate");
    if (
      raw === "rating" ||
      raw === "judge_audience" ||
      raw === "blank"
    ) {
      const tpl = raw as TemplateType;
      setSelectedTemplate(tpl);
      applyTemplateDefaults(tpl);
    }
  }, []);

    function getJudgingSummary() {
    if (selectedTemplate === "judge_audience") {
      const groups: string[] = [];
      if (audienceEnabled) groups.push("Audience");
      if (expertEnabled) groups.push("Expert panel");
      if (athleteEnabled) groups.push("Athletes");

      const groupsPart =
        groups.length > 0 ? groups.join(" · ") : "No voting groups enabled";

      const durationPart = `${judgingDuration}s`;
      const spectatorsPart =
        spectatorsMax === "" ? "Spectators: unlimited" : `Spectators: ${spectatorsMax}`;
      const roundPart = voteAfterEachRound
        ? "Vote after each round"
        : "Vote only at end";

      return `Battle voting · ${durationPart} · ${spectatorsPart} · ${groupsPart} · ${roundPart}`;
    }

    const scoringLabel =
      scoringOptions.find(opt => opt.value === scoringFormat)?.label ??
      "Score voting";

    const rangePart = `${scoreMin}-${scoreMax}`;

    const groups: string[] = [];
    if (audienceEnabled) {
      groups.push(`Audience ${audienceGroupWeight}%`);
    }
    if (expertEnabled) {
      groups.push(`Expert ${expertGroupWeight}%`);
    }
    if (athleteEnabled) {
      groups.push(`Athlete ${athleteGroupWeight}%`);
    }

    const groupsPart =
      groups.length > 0 ? groups.join(" · ") : "No judging groups enabled";

    return `${scoringLabel} ${rangePart} | ${groupsPart}`;
  }

  function canContinue() {
    return (
      eventName.trim().length > 0 &&
      eventType.trim().length > 0 &&
      participants !== ""
    );
  }

  function handleContinue() {
    if (!canContinue()) return;

    setEventData({
      eventName: eventName || null,
      eventType: eventType || null,
      participants: participants === "" ? null : Number(participants),
      scoringMode: "mixed",
      scoringAudience: audienceWeight,
      scoringJudge: judgesWeight,
      venue: venue || null,
      startDateTime: startDateTime || null,
      endDateTime: endDateTime || null,
      sponsor: sponsor || null,
      rules: rules || null,
      audienceLimit: audienceLimit === "" ? null : Number(audienceLimit),
      image: null
      // Later you can also store scoringFormat + judgingSettings here
    });

    navigate("/setup/summary");
  }

  return (
    <PageContainer kind="solid">
      <div style={{ width: "100%" }}>
        <BackButton to="/setup/method">Back</BackButton>

        <SetupPageHeader
          title="Manual setup"
          description="Fill out your event details. Required fields must be completed before continuing."
        />

        <TwoColumn>
          {/* LEFT: Form */}
          <Card padding={20}>
            <Field label="Event name" required>
              <TextInput
                value={eventName}
                onChange={e => setEventName(e.target.value)}
              />
            </Field>

            <Field label="Event type" required>
              <TextInput
                value={eventType}
                onChange={e => setEventType(e.target.value)}
              />
            </Field>

            <Field label="Number of contestants" required>
              <TextInput
                type="number"
                min={1}
                value={participants}
                onChange={e =>
                  setParticipants(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </Field>

            <Field label="Venue">
              <TextInput
                value={venue}
                onChange={e => setVenue(e.target.value)}
              />
            </Field>

            <Field label="Event date and time range">
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, ...muted }}>Start</span>
                  <TextInput
                    type="datetime-local"
                    value={startDateTime}
                    onChange={e => setStartDateTime(e.target.value)}
                  />
                </div>

                <div style={{ paddingTop: 20, ...muted }}>→</div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, ...muted }}>End</span>
                  <TextInput
                    type="datetime-local"
                    value={endDateTime}
                    min={startDateTime || undefined}
                    onChange={e => setEndDateTime(e.target.value)}
                  />
                </div>
              </div>
            </Field>

            {/* Scoring format selection */}
            <Field label="Scoring format">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <select
                  value={scoringFormat}
                  onChange={e =>
                    setScoringFormat(e.target.value as ScoringFormat)
                  }
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#e5e7eb",
                    fontSize: 14,
                    marginTop: 4
                  }}
                >
                  {scoringOptions.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <p
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#9ca3af"
                }}
              >
                {selectedTemplate === "rating"
                  ? "The average score from all rounds will determine the ranking."
                  : selectedTemplate === "judge_audience"
                  ? "Battle events use the same scores but compare athletes head-to-head."
                  : "Poll events treat scores as simple votes to rank options."}
              </p>
            </Field>

            <div
              style={{
                marginTop: 24,
                paddingTop: 12,
                borderTop: "1px solid rgba(148,163,184,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, margin: 0 }}>
                  {selectedTemplate === "judge_audience"
                    ? "Judging settings (Battle)"
                    : selectedTemplate === "rating"
                    ? "Judging settings (Ranking)"
                    : selectedTemplate === "blank"
                    ? "Judging settings (Poll)"
                    : "Judging settings"}
                </h3>

                <p style={{ fontSize: 12, ...muted }}>
                  Configure score range, timers and judge groups in a separate
                  dialog.
                </p>
              </div>
              <Button
                onClick={() => setShowJudgingSettings(true)}
                style={{ whiteSpace: "nowrap" }}
              >
                Open judging settings
              </Button>
            </div>


            <Field label="Sponsor (optional)">
              <TextInput
                value={sponsor}
                onChange={e => setSponsor(e.target.value)}
              />
            </Field>

            <Field label="Rules (optional)">
              <textarea
                value={rules}
                onChange={e => setRules(e.target.value)}
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
                  resize: "vertical",
                  minHeight: 80
                }}
              />
            </Field>

            <Field label="Audience limit (optional)">
              <TextInput
                type="number"
                min={1}
                value={audienceLimit}
                onChange={e =>
                  setAudienceLimit(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </Field>

            <Button
              fullWidth
              onClick={handleContinue}
              disabled={!canContinue()}
              style={{ marginTop: 16 }}
            >
              Continue
            </Button>
          </Card>

          {/* RIGHT: Live preview */}
          <Card padding={20}>
            <h3 style={{ marginBottom: 12 }}>Live preview</h3>

            <FieldRow label="Name" value={eventName} />
            <FieldRow label="Type" value={eventType} />
            <FieldRow
              label="Contestants"
              value={participants !== "" ? participants : ""}
            />
            <FieldRow
              label="Scoring"
              value={getJudgingSummary()}
            />
            <FieldRow label="Venue" value={venue} />
            <FieldRow
              label="Date and time"
              value={
                startDateTime || endDateTime
                  ? `${formatDateTime(startDateTime) ?? "?"} to ${
                      formatDateTime(endDateTime) ?? "?"
                    }`
                  : ""
              }
            />
            <FieldRow label="Sponsor" value={sponsor} />
            <FieldRow
              label="Audience limit"
              value={audienceLimit !== "" ? audienceLimit : ""}
            />
            <FieldRow label="Rules">
              {rules ? (
                <div style={{ whiteSpace: "pre-wrap" }}>{rules}</div>
              ) : null}
            </FieldRow>
          </Card>
        </TwoColumn>
      </div>
      <FAQWidget />
                  {showJudgingSettings && (
        <div
          onClick={() => setShowJudgingSettings(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.65)",
            zIndex: 950,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "80vh",
              overflowY: "auto",
              background: "#020617",
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.5)",
              padding: 20,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12
              }}
            >
              <h3 style={{ fontSize: 16, margin: 0 }}>
                {selectedTemplate === "judge_audience"
                  ? "Judging settings (Battle)"
                  : selectedTemplate === "rating"
                  ? "Judging settings (Ranking)"
                  : selectedTemplate === "blank"
                  ? "Judging settings (Poll)"
                  : "Judging settings"}
              </h3>
              <button
                type="button"
                onClick={() => setShowJudgingSettings(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#9ca3af",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1
                }}
                aria-label="Close judging settings"
              >
                ×
              </button>
            </div>

            {selectedTemplate === "judge_audience" ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
                    gap: 16,
                    marginBottom: 16
                  }}
                >
                  <div>
                    <Field label="Voting duration (seconds)">
                      <TextInput
                        type="number"
                        min={5}
                        value={judgingDuration}
                        onChange={e =>
                          setJudgingDuration(
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                        style={{ maxWidth: 140 }}
                      />
                    </Field>

                    <Field label="Spectators judging (max)">
                      <TextInput
                        type="number"
                        min={0}
                        value={spectatorsMax}
                        onChange={e =>
                          setSpectatorsMax(
                            e.target.value === ""
                              ? ""
                              : Number(e.target.value)
                          )
                        }
                        style={{ maxWidth: 140 }}
                      />
                    </Field>

                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allowGuestSpectators}
                        onChange={e => setAllowGuestSpectators(e.target.checked)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: 13, color: "#e5e7eb" }}>
                        Allow spectators to judge as anonymous guest users
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={voteAfterEachRound}
                        onChange={e => setVoteAfterEachRound(e.target.checked)}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <div style={{ fontSize: 13, color: "#e5e7eb" }}>
                          Vote after each round
                        </div>
                        <div style={{ fontSize: 11, ...muted }}>
                          Instead of just once at the end of each battle
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: 12,
                      background: "rgba(15,23,42,0.9)",
                      fontSize: 12
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        fontSize: 13
                      }}
                    >
                      Voting groups
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 8
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setAudienceEnabled(prev => !prev)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 9999,
                          border: audienceEnabled
                            ? "1px solid rgba(96,165,250,1)"
                            : "1px solid rgba(148,163,184,0.6)",
                          background: audienceEnabled
                            ? "rgba(37,99,235,0.3)"
                            : "transparent",
                          fontSize: 12,
                          color: "#e5e7eb",
                          cursor: "pointer"
                        }}
                      >
                        Audience
                      </button>

                      <button
                        type="button"
                        onClick={() => setAthleteEnabled(prev => !prev)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 9999,
                          border: athleteEnabled
                            ? "1px solid rgba(96,165,250,1)"
                            : "1px solid rgba(148,163,184,0.6)",
                          background: athleteEnabled
                            ? "rgba(37,99,235,0.3)"
                            : "transparent",
                          fontSize: 12,
                          color: "#e5e7eb",
                          cursor: "pointer"
                        }}
                      >
                        Athletes
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpertEnabled(prev => !prev)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 9999,
                          border: expertEnabled
                            ? "1px solid rgba(96,165,250,1)"
                            : "1px solid rgba(148,163,184,0.6)",
                          background: expertEnabled
                            ? "rgba(37,99,235,0.3)"
                            : "transparent",
                          fontSize: 12,
                          color: "#e5e7eb",
                          cursor: "pointer"
                        }}
                      >
                        Expert panel
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 12
                  }}
                >
                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: 10,
                      background: "rgba(15,23,42,0.9)",
                      fontSize: 12
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={audienceEnabled}
                        onChange={e => setAudienceEnabled(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Audience</span>
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: 10,
                      background: "rgba(15,23,42,0.9)",
                      fontSize: 12
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={expertEnabled}
                        onChange={e => setExpertEnabled(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Expert panel</span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 11, ...muted }}>
                        Expert vote format
                      </div>
                      <select
                        value={expertVoteFormat}
                        onChange={e =>
                          setExpertVoteFormat(
                            e.target.value as ExpertVoteFormat
                          )
                        }
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "4px 8px",
                          borderRadius: 8,
                          border: "1px solid rgba(148,163,184,0.6)",
                          background: "rgba(15,23,42,0.9)",
                          fontSize: 12,
                          color: "#e5e7eb"
                        }}
                      >
                        <option value="single">Single</option>
                        <option value="multiple">Multiple</option>
                      </select>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, ...muted }}>
                        Number of experts
                      </div>
                      <TextInput
                        type="number"
                        min={1}
                        value={expertCount}
                        onChange={e =>
                          setExpertCount(
                            e.target.value === ""
                              ? ""
                              : Number(e.target.value)
                          )
                        }
                        style={{ maxWidth: 120, fontSize: 12 }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: 10,
                      background: "rgba(15,23,42,0.9)",
                      fontSize: 12
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={athleteEnabled}
                        onChange={e => setAthleteEnabled(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Athletes</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Field label="Score range">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <TextInput
                      type="number"
                      value={scoreMin}
                      onChange={e => setScoreMin(Number(e.target.value))}
                      style={{ maxWidth: 80 }}
                    />
                    <span style={{ fontSize: 12, ...muted }}>to</span>
                    <TextInput
                      type="number"
                      value={scoreMax}
                      onChange={e => setScoreMax(Number(e.target.value))}
                      style={{ maxWidth: 80 }}
                    />
                  </div>
                </Field>

                <Field label="Judging duration (seconds)">
                  <TextInput
                    type="number"
                    min={0}
                    value={judgingDuration}
                    onChange={e =>
                      setJudgingDuration(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    style={{ maxWidth: 120 }}
                  />
                </Field>

                <Field label="Max spectators judging">
                  <TextInput
                    type="number"
                    min={1}
                    value={spectatorsMax}
                    onChange={e =>
                      setSpectatorsMax(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    style={{ maxWidth: 120 }}
                  />
                </Field>

                <div
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <input
                    type="checkbox"
                    checked={liveLeaderboard}
                    onChange={e => setLiveLeaderboard(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "#e5e7eb" }}>
                    Enable live leaderboard
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 8
                  }}
                >
                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: 10,
                      background: "rgba(15,23,42,0.9)",
                      fontSize: 12
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={audienceEnabled}
                        onChange={e => setAudienceEnabled(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Audience</span>
                    </div>
                    <div style={{ marginTop: 6, marginBottom: 6 }}>
                      <div style={{ fontSize: 11, ...muted }}>Weight</div>
                      <TextInput
                        type="number"
                        min={0}
                        max={100}
                        value={audienceGroupWeight}
                        onChange={e =>
                          setAudienceGroupWeight(Number(e.target.value))
                        }
                        style={{ fontSize: 12 }}
                      />
                    </div>
                    <div style={{ fontSize: 11, ...muted }}>Judging criteria</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>Overall</div>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: 10,
                      background: "rgba(15,23,42,0.9)",
                      fontSize: 12
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={expertEnabled}
                        onChange={e => setExpertEnabled(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Expert panel</span>
                    </div>
                    <div style={{ marginTop: 6, marginBottom: 6 }}>
                      <div style={{ fontSize: 11, ...muted }}>Weight</div>
                      <TextInput
                        type="number"
                        min={0}
                        max={100}
                        value={expertGroupWeight}
                        onChange={e =>
                          setExpertGroupWeight(Number(e.target.value))
                        }
                        style={{ fontSize: 12 }}
                      />
                    </div>
                    <div style={{ fontSize: 11, ...muted }}>Judging criteria</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      Creativity · Difficulty · Execution
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: 10,
                      background: "rgba(15,23,42,0.9)",
                      fontSize: 12
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        checked={athleteEnabled}
                        onChange={e => setAthleteEnabled(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Athlete</span>
                    </div>
                    <div style={{ marginTop: 6, marginBottom: 6 }}>
                      <div style={{ fontSize: 11, ...muted }}>Weight</div>
                      <TextInput
                        type="number"
                        min={0}
                        max={100}
                        value={athleteGroupWeight}
                        onChange={e =>
                          setAthleteGroupWeight(Number(e.target.value))
                        }
                        style={{ fontSize: 12 }}
                      />
                    </div>
                    <div style={{ fontSize: 11, ...muted }}>Judging criteria</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      Creativity · Difficulty · Execution
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}


    </PageContainer>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#e5e7eb",
          fontSize: 13
        }}
      >
        <span>{label}</span>
        {required && (
          <span style={{ color: "#f97316", fontSize: 11 }}>Required</span>
        )}
      </div>
      {children}
    </div>
  );
}
