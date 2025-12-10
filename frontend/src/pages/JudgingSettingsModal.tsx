import React from "react";
import { TextInput } from "../components/ui/TextInput";
import { muted } from "../components/ui/Text";
import styles from "./SetupManual.module.css";

type TemplateType = "rating" | "judge_audience" | "blank";
type ExpertVoteFormat = "single" | "multiple";

type Props = {
  template: TemplateType | null;
  onClose: () => void;

  scoreMin: number;
  setScoreMin: (v: number) => void;
  scoreMax: number;
  setScoreMax: (v: number) => void;

  judgingDuration: number;
  setJudgingDuration: (v: number) => void;

  spectatorsMax: number | "";
  setSpectatorsMax: (v: number | "") => void;

  liveLeaderboard: boolean;
  setLiveLeaderboard: (v: boolean) => void;

  allowGuestSpectators: boolean;
  setAllowGuestSpectators: (v: boolean) => void;

  voteAfterEachRound: boolean;
  setVoteAfterEachRound: (v: boolean) => void;

  audienceEnabled: boolean;
  setAudienceEnabled: (v: boolean) => void;
  expertEnabled: boolean;
  setExpertEnabled: (v: boolean) => void;
  athleteEnabled: boolean;
  setAthleteEnabled: (v: boolean) => void;

  audienceGroupWeight: number;
  setAudienceGroupWeight: (v: number) => void;
  expertGroupWeight: number;
  setExpertGroupWeight: (v: number) => void;
  athleteGroupWeight: number;
  setAthleteGroupWeight: (v: number) => void;

  expertVoteFormat: ExpertVoteFormat;
  setExpertVoteFormat: (v: ExpertVoteFormat) => void;

  expertCount: number | "";
  setExpertCount: (v: number | "") => void;
};

export function JudgingSettingsModal(props: Props) {
  const {
    template,
    onClose
  } = props;

  const title =
    template === "judge_audience"
      ? "Judging settings (Battle)"
      : template === "rating"
      ? "Judging settings (Ranking)"
      : template === "blank"
      ? "Judging settings (Poll)"
      : "Judging settings";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 style={{ fontSize: 16, margin: 0 }}>{title}</h3>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {template === "judge_audience" ? (
          <BattleSettings {...props} />
        ) : (
          <RankingSettings {...props} />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Battle settings (Battle / judge_audience template)                         */
/* -------------------------------------------------------------------------- */

function BattleSettings(p: Props) {
  return (
    <>
      <SettingsGrid columns="minmax(0, 1.5fr) minmax(0, 1fr)">
        <SettingsSection title="Battle timing & access">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, ...muted }}>Voting duration (seconds)</div>
            <TextInput
              type="number"
              min={5}
              value={p.judgingDuration}
              onChange={e =>
                p.setJudgingDuration(
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              style={{ maxWidth: 140 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, ...muted }}>Spectators judging (max)</div>
            <TextInput
              type="number"
              min={0}
              value={p.spectatorsMax}
              onChange={e =>
                p.setSpectatorsMax(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              style={{ maxWidth: 140 }}
            />
          </div>

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
              checked={p.allowGuestSpectators}
              onChange={e => p.setAllowGuestSpectators(e.target.checked)}
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
              checked={p.voteAfterEachRound}
              onChange={e => p.setVoteAfterEachRound(e.target.checked)}
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
        </SettingsSection>

        <SettingsCard>
          <SettingsSection title="Voting groups">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 8
              }}
            >
              <TogglePill
                label="Audience"
                active={p.audienceEnabled}
                onClick={() => p.setAudienceEnabled(!p.audienceEnabled)}
              />
              <TogglePill
                label="Athletes"
                active={p.athleteEnabled}
                onClick={() => p.setAthleteEnabled(!p.athleteEnabled)}
              />
              <TogglePill
                label="Expert panel"
                active={p.expertEnabled}
                onClick={() => p.setExpertEnabled(!p.expertEnabled)}
              />
            </div>
          </SettingsSection>
        </SettingsCard>
      </SettingsGrid>

      <SettingsGrid columns="repeat(3, minmax(0, 1fr))">
        <SettingsCard>
          <SettingsSection title="Audience">
            <div
              style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
            >
              <input
                type="checkbox"
                checked={p.audienceEnabled}
                onChange={e => p.setAudienceEnabled(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Audience</span>
            </div>
          </SettingsSection>
        </SettingsCard>

        <SettingsCard>
          <SettingsSection title="Expert panel">
            <div
              style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
            >
              <input
                type="checkbox"
                checked={p.expertEnabled}
                onChange={e => p.setExpertEnabled(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Expert panel</span>
            </div>

            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Expert vote format</div>
              <select
                value={p.expertVoteFormat}
                onChange={e =>
                  p.setExpertVoteFormat(e.target.value as ExpertVoteFormat)
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
              <div style={{ fontSize: 11, ...muted }}>Number of experts</div>
              <TextInput
                type="number"
                min={1}
                value={p.expertCount}
                onChange={e =>
                  p.setExpertCount(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                style={{ maxWidth: 120, fontSize: 12 }}
              />
            </div>
          </SettingsSection>
        </SettingsCard>

        <SettingsCard>
          <SettingsSection title="Athletes">
            <div
              style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
            >
              <input
                type="checkbox"
                checked={p.athleteEnabled}
                onChange={e => p.setAthleteEnabled(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Athletes</span>
            </div>
          </SettingsSection>
        </SettingsCard>
      </SettingsGrid>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Ranking / Poll settings                                                    */
/* -------------------------------------------------------------------------- */

function RankingSettings(p: Props) {
  return (
    <>
      <SettingsSection title="Score & timing">
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, ...muted }}>Score range</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TextInput
              type="number"
              value={p.scoreMin}
              onChange={e => p.setScoreMin(Number(e.target.value))}
              style={{ maxWidth: 80 }}
            />
            <span style={{ fontSize: 12, ...muted }}>to</span>
            <TextInput
              type="number"
              value={p.scoreMax}
              onChange={e => p.setScoreMax(Number(e.target.value))}
              style={{ maxWidth: 80 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, ...muted }}>Judging duration (seconds)</div>
          <TextInput
            type="number"
            min={0}
            value={p.judgingDuration}
            onChange={e =>
              p.setJudgingDuration(
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
            style={{ maxWidth: 120 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, ...muted }}>Max spectators judging</div>
          <TextInput
            type="number"
            min={1}
            value={p.spectatorsMax}
            onChange={e =>
              p.setSpectatorsMax(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            style={{ maxWidth: 120 }}
          />
        </div>

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
            checked={p.liveLeaderboard}
            onChange={e => p.setLiveLeaderboard(e.target.checked)}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: 13, color: "#e5e7eb" }}>
            Enable live leaderboard
          </span>
        </div>
      </SettingsSection>

      <SettingsGrid columns="repeat(3, minmax(0, 1fr))">
        <SettingsCard>
          <SettingsSection title="Audience">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={p.audienceEnabled}
                onChange={e => p.setAudienceEnabled(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Audience</span>
            </div>
            <div style={{ marginTop: 6, marginBottom: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.audienceGroupWeight}
                onChange={e => p.setAudienceGroupWeight(Number(e.target.value))}
                style={{ fontSize: 12 }}
              />
            </div>
            <div style={{ fontSize: 11, ...muted }}>Judging criteria</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Overall</div>
          </SettingsSection>
        </SettingsCard>

        <SettingsCard>
          <SettingsSection title="Expert panel">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={p.expertEnabled}
                onChange={e => p.setExpertEnabled(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Expert panel</span>
            </div>
            <div style={{ marginTop: 6, marginBottom: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.expertGroupWeight}
                onChange={e => p.setExpertGroupWeight(Number(e.target.value))}
                style={{ fontSize: 12 }}
              />
            </div>
            <div style={{ fontSize: 11, ...muted }}>Judging criteria</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              Creativity · Difficulty · Execution
            </div>
          </SettingsSection>
        </SettingsCard>

        <SettingsCard>
          <SettingsSection title="Athletes">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={p.athleteEnabled}
                onChange={e => p.setAthleteEnabled(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Athletes</span>
            </div>
            <div style={{ marginTop: 6, marginBottom: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.athleteGroupWeight}
                onChange={e => p.setAthleteGroupWeight(Number(e.target.value))}
                style={{ fontSize: 12 }}
              />
            </div>
            <div style={{ fontSize: 11, ...muted }}>Judging criteria</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              Creativity · Difficulty · Execution
            </div>
          </SettingsSection>
        </SettingsCard>
      </SettingsGrid>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI helpers                                                           */
/* -------------------------------------------------------------------------- */

function TogglePill({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 8px",
        borderRadius: 9999,
        border: active
          ? "1px solid rgba(96,165,250,1)"
          : "1px solid rgba(148,163,184,0.6)",
        background: active ? "rgba(37,99,235,0.3)" : "transparent",
        fontSize: 12,
        color: "#e5e7eb",
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}

function SettingsSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: 13,
          marginBottom: 8,
          color: "#e5e7eb"
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(148,163,184,0.6)",
        padding: 10,
        background: "rgba(15,23,42,0.9)",
        fontSize: 12
      }}
    >
      {children}
    </div>
  );
}

function SettingsGrid({
  columns,
  children
}: {
  columns: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: 12
      }}
    >
      {children}
    </div>
  );
}
