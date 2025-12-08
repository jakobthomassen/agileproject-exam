import { useState, useEffect } from "react";
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
import { JudgingSettingsModal } from "./JudgingSettingsModal";

import styles from "./SetupManual.module.css";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TemplateType = "rating" | "judge_audience" | "blank";
type ScoringFormat = "score-voting" | "scream-voting";
type ExpertVoteFormat = "single" | "multiple";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function SetupManual() {
  const navigate = useNavigate();
  const { setEventData } = useEventSetup();

  /* Core event fields */
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [participants, setParticipants] = useState<number | "">("");
  const [venue, setVenue] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [rules, setRules] = useState("");
  const [audienceLimit, setAudienceLimit] = useState<number | "">("");

  /* Template / scoring */
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType | null>(null);
  const [scoringFormat, setScoringFormat] =
    useState<ScoringFormat>("score-voting");

  /* Judging preview state (local only) */
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(10);
  const [judgingDuration, setJudgingDuration] = useState(60);
  const [spectatorsMax, setSpectatorsMax] = useState<number | "">(100);

  const [audienceEnabled, setAudienceEnabled] = useState(true);
  const [expertEnabled, setExpertEnabled] = useState(true);
  const [athleteEnabled, setAthleteEnabled] = useState(true);

  const [audienceGroupWeight, setAudienceGroupWeight] = useState(33);
  const [expertGroupWeight, setExpertGroupWeight] = useState(34);
  const [athleteGroupWeight, setAthleteGroupWeight] = useState(33);

  const [expertVoteFormat, setExpertVoteFormat] =
    useState<ExpertVoteFormat>("multiple");
  const [expertCount, setExpertCount] = useState<number | "">(3);

  const [allowGuestSpectators, setAllowGuestSpectators] = useState(false);
  const [voteAfterEachRound, setVoteAfterEachRound] = useState(false);
  const [liveLeaderboard, setLiveLeaderboard] = useState(false);

  const [showJudgingSettings, setShowJudgingSettings] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Template defaults                                                       */
  /* ---------------------------------------------------------------------- */

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

        setAudienceEnabled(true);
        setExpertEnabled(false);
        setAthleteEnabled(false);

        setAudienceGroupWeight(100);
        setExpertGroupWeight(0);
        setAthleteGroupWeight(0);
        setLiveLeaderboard(false);
        break;
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedTemplate");
    if (raw === "rating" || raw === "judge_audience" || raw === "blank") {
      setSelectedTemplate(raw);
      applyTemplateDefaults(raw);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Derived preview                                                         */
  /* ---------------------------------------------------------------------- */

  function getJudgingSummary() {
    if (selectedTemplate === "judge_audience") {
      const groups: string[] = [];
      if (audienceEnabled) groups.push("Audience");
      if (expertEnabled) groups.push("Expert panel");
      if (athleteEnabled) groups.push("Athletes");

      const spectators =
        spectatorsMax === "" ? "Unlimited spectators" : `${spectatorsMax} spectators`;

      return `Battle voting · ${judgingDuration}s · ${spectators} · ${groups.join(
        " · "
      )}`;
    }

    const range = `${scoreMin}-${scoreMax}`;
    const groups: string[] = [];
    if (audienceEnabled) groups.push(`Audience ${audienceGroupWeight}%`);
    if (expertEnabled) groups.push(`Expert ${expertGroupWeight}%`);
    if (athleteEnabled) groups.push(`Athlete ${athleteGroupWeight}%`);

    return `Score voting ${range} | ${groups.join(" · ")}`;
  }

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                              */
  /* ---------------------------------------------------------------------- */

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
      scoringAudience: null,
      scoringJudge: null,
      venue: venue || null,
      startDateTime: startDateTime || null,
      endDateTime: endDateTime || null,
      sponsor: sponsor || null,
      rules: rules || null,
      audienceLimit: audienceLimit === "" ? null : Number(audienceLimit),
      image: null
    });

    navigate("/setup/summary");
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <PageContainer kind="solid">
      <div className={styles.pageInner}>
        <BackButton to="/setup/method">Back</BackButton>

        <SetupPageHeader
          title="Manual setup"
          description="Fill out your event details. Required fields must be completed before continuing."
        />

        <TwoColumn>
          {/* LEFT: Form */}
          <Card padding={20}>
            <Field label="Event name" required>
              <TextInput value={eventName} onChange={e => setEventName(e.target.value)} />
            </Field>

            <Field label="Event type" required>
              <TextInput value={eventType} onChange={e => setEventType(e.target.value)} />
            </Field>

            <Field label="Number of contestants" required>
              <TextInput
                type="number"
                min={1}
                value={participants}
                onChange={e =>
                  setParticipants(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </Field>

            <Field label="Venue">
              <TextInput value={venue} onChange={e => setVenue(e.target.value)} />
            </Field>

            <Field label="Event date and time range">
              <div className={styles.dateTimeRow}>
                <div className={styles.dateTimeCol}>
                  <span style={{ fontSize: 12, ...muted }}>Start</span>
                  <TextInput
                    type="datetime-local"
                    value={startDateTime}
                    onChange={e => setStartDateTime(e.target.value)}
                  />
                </div>
                <div className={styles.dateTimeArrow} style={muted}>→</div>
                <div className={styles.dateTimeCol}>
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

            <div className={styles.sectionDivider}>
              <div>
                <h3 style={{ fontSize: 16, margin: 0 }}>Judging settings</h3>
                <p style={{ fontSize: 12, ...muted }}>
                  Configure scoring rules and voting groups
                </p>
              </div>
              <Button onClick={() => setShowJudgingSettings(true)}>
                Open judging settings
              </Button>
            </div>

            <Field label="Sponsor (optional)">
              <TextInput value={sponsor} onChange={e => setSponsor(e.target.value)} />
            </Field>

            <Field label="Rules (optional)">
              <textarea
                value={rules}
                onChange={e => setRules(e.target.value)}
                className={styles.rulesTextarea}
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
              className={styles.continueButton}
            >
              Continue
            </Button>
          </Card>

          {/* RIGHT: Live preview */}
          <Card padding={20}>
            <h3 className={styles.livePreviewTitle}>Live preview</h3>

            <FieldRow label="Name" value={eventName} />
            <FieldRow label="Type" value={eventType} />
            <FieldRow label="Contestants" value={participants || ""} />
            <FieldRow label="Scoring" value={getJudgingSummary()} />
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
          </Card>
        </TwoColumn>
      </div>

      <FAQWidget />

      {showJudgingSettings && (
        <JudgingSettingsModal
          template={selectedTemplate}
          onClose={() => setShowJudgingSettings(false)}

          scoreMin={scoreMin}
          setScoreMin={setScoreMin}
          scoreMax={scoreMax}
          setScoreMax={setScoreMax}

          judgingDuration={judgingDuration}
          setJudgingDuration={setJudgingDuration}

          spectatorsMax={spectatorsMax}
          setSpectatorsMax={setSpectatorsMax}

          liveLeaderboard={liveLeaderboard}
          setLiveLeaderboard={setLiveLeaderboard}

          allowGuestSpectators={allowGuestSpectators}
          setAllowGuestSpectators={setAllowGuestSpectators}

          voteAfterEachRound={voteAfterEachRound}
          setVoteAfterEachRound={setVoteAfterEachRound}

          audienceEnabled={audienceEnabled}
          setAudienceEnabled={setAudienceEnabled}
          expertEnabled={expertEnabled}
          setExpertEnabled={setExpertEnabled}
          athleteEnabled={athleteEnabled}
          setAthleteEnabled={setAthleteEnabled}

          audienceGroupWeight={audienceGroupWeight}
          setAudienceGroupWeight={setAudienceGroupWeight}
          expertGroupWeight={expertGroupWeight}
          setExpertGroupWeight={setExpertGroupWeight}
          athleteGroupWeight={athleteGroupWeight}
          setAthleteGroupWeight={setAthleteGroupWeight}

          expertVoteFormat={expertVoteFormat}
          setExpertVoteFormat={setExpertVoteFormat}
          expertCount={expertCount}
          setExpertCount={setExpertCount}
        />
      )}
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Field helper                                                               */
/* -------------------------------------------------------------------------- */

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
    <div className={styles.fieldRoot}>
      <div className={styles.fieldHeader}>
        <span>{label}</span>
        {required && <span className={styles.requiredBadge}>Required</span>}
      </div>
      {children}
    </div>
  );
}
