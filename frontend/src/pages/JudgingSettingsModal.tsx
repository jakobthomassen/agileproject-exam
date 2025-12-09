import React from "react";
import { TextInput } from "../components/ui/TextInput";
import { muted } from "../components/ui/Text";
import styles from "./SetupManual.module.css";

type TemplateType = "rating" | "judge_audience" | "blank";
type ScoringFormat = "score-voting" | "scream-voting" | "like-voting";
type ExpertVoteFormat = "single" | "multiple";

const CRITERIA_OPTIONS = [
  "Amplitude",
  "Artistic",
  "Battle Performance",
  "Choreography",
  "Confidence",
  "Creativity",
  "Difficulty",
  "Efficiency",
  "Entertainment",
  "Execution",
  "Flight",
  "Flow",
  "Innovation",
  "Interpretive",
  "Landing"
];

type Props = {
  template: TemplateType | null;
  onClose: () => void;

  scoringFormat: ScoringFormat;
  setScoringFormat: (v: ScoringFormat) => void;

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

  audienceCriteria: string[];
  setAudienceCriteria: (v: string[]) => void;
  expertCriteria: string[];
  setExpertCriteria: (v: string[]) => void;
  athleteCriteria: string[];
  setAthleteCriteria: (v: string[]) => void;

  expertVoteFormat: ExpertVoteFormat;
  setExpertVoteFormat: (v: ExpertVoteFormat) => void;

  expertCount: number | "";
  setExpertCount: (v: number | "") => void;

  stageBracket: string;
  setStageBracket: (value: string) => void;
};

export function JudgingSettingsModal(props: Props) {
  const { template, onClose } = props;

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

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, ...muted }}>Stage bracket</div>
          <select
            value={p.stageBracket}
            onChange={e => p.setStageBracket(e.target.value)}
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
            <option value="">None</option>
            <option value="Round of 64">Round of 64</option>
            <option value="Round of 32">Round of 32</option>
            <option value="Round of 16">Round of 16</option>
            <option value="Quarter final">Quarter final</option>
            <option value="Semi final">Semi final</option>
            <option value="Final">Final</option>
          </select>
        </div>
      </SettingsSection>

      <SettingsGrid columns="repeat(3, minmax(0, 1fr))">
        {/* Audience */}
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

            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.audienceGroupWeight}
                onChange={e =>
                  p.setAudienceGroupWeight(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                style={{ fontSize: 12 }}
              />
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Expert panel */}
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

            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.expertGroupWeight}
                onChange={e =>
                  p.setExpertGroupWeight(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                style={{ fontSize: 12 }}
              />
            </div>

            <div style={{ marginTop: 8 }}>
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

        {/* Athletes */}
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

            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.athleteGroupWeight}
                onChange={e =>
                  p.setAthleteGroupWeight(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                style={{ fontSize: 12 }}
              />
            </div>
          </SettingsSection>
        </SettingsCard>
      </SettingsGrid>
    </>
  );
}


/* -------------------------------------------------------------------------- */
/* Ranking / Poll settings (rating + blank templates)                         */
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

        {/* Score format (Ranking & Poll) */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, ...muted }}>Score format</div>
          <select
            value={p.scoringFormat}
            onChange={e =>
              p.setScoringFormat(e.target.value as ScoringFormat)
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
            {p.template === "blank" ? (
              <>
                {/* Poll: Like voting / Score voting */}
                <option value="like-voting">Like voting</option>
                <option value="score-voting">Score voting</option>
              </>
            ) : (
              <>
                {/* Ranking: Score voting / Scream voting */}
                <option value="score-voting">Score voting</option>
                <option value="scream-voting">Scream voting</option>
              </>
            )}
          </select>
          <div style={{ fontSize: 11, ...muted, marginTop: 4 }}>
            {p.template === "blank"
              ? "Like voting: participants tap to like athletes. Score voting: give numeric scores."
              : "Score voting: numeric scores. Scream voting: score based on crowd noise level."}
          </div>
        </div>

        {/* Stage bracket for ranking only */}
        {p.template === "rating" && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, ...muted }}>Stage bracket</div>
            <select
              value={p.stageBracket}
              disabled
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
              <option value="Final">Final</option>
            </select>
          </div>
        )}
      </SettingsSection>

      {/* Same criteria popup for Ranking and Poll */}
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
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.audienceGroupWeight}
                onChange={e =>
                  p.setAudienceGroupWeight(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                style={{ fontSize: 12 }}
              />
            </div>

            <CriteriaSelector
              label="Judging criteria"
              selected={p.audienceCriteria}
              onChange={p.setAudienceCriteria}
            />
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
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.expertGroupWeight}
                onChange={e =>
                  p.setExpertGroupWeight(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                style={{ fontSize: 12 }}
              />
            </div>

            <CriteriaSelector
              label="Judging criteria"
              selected={p.expertCriteria}
              onChange={p.setExpertCriteria}
            />
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
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, ...muted }}>Weight</div>
              <TextInput
                type="number"
                min={0}
                max={100}
                value={p.athleteGroupWeight}
                onChange={e =>
                  p.setAthleteGroupWeight(
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                style={{ fontSize: 12 }}
              />
            </div>

            <CriteriaSelector
              label="Judging criteria"
              selected={p.athleteCriteria}
              onChange={p.setAthleteCriteria}
            />
          </SettingsSection>
        </SettingsCard>
      </SettingsGrid>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI helpers                                                           */
/* -------------------------------------------------------------------------- */

function CriteriaSelector({
  label,
  selected,
  onChange
}: {
  label: string;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);

  function toggleCriterion(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 11, ...muted }}>{label}</div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          marginTop: 4,
          width: "100%",
          padding: "6px 8px",
          borderRadius: 8,
          border: "1px solid rgba(148,163,184,0.6)",
          background: "rgba(15,23,42,0.9)",
          fontSize: 12,
          color: "#e5e7eb",
          textAlign: "left",
          cursor: "pointer"
        }}
      >
        {selected.length === 0
          ? "Select criteria"
          : `${selected.length} criteria selected`}
      </button>

      <div style={{ fontSize: 11, marginTop: 4, ...muted }}>
        {selected.length === 0 ? "No criteria selected" : selected.join(" · ")}
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 960,
            background: "rgba(15,23,42,0.6)",
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
              maxWidth: 480,
              maxHeight: "70vh",
              overflowY: "auto",
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.6)",
              background: "#020617",
              padding: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>
                {label}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#9ca3af",
                  fontSize: 18,
                  cursor: "pointer",
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 4
              }}
            >
              {CRITERIA_OPTIONS.map(option => {
                const active = selected.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleCriterion(option)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 9999,
                      border: active
                        ? "1px solid rgba(96,165,250,1)"
                        : "1px solid rgba(148,163,184,0.6)",
                      background: active
                        ? "rgba(37,99,235,0.35)"
                        : "transparent",
                      fontSize: 12,
                      color: "#e5e7eb",
                      cursor: "pointer"
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 9999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "transparent",
                  fontSize: 12,
                  color: "#e5e7eb",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 9999,
                  border: "none",
                  background: "rgba(37,99,235,0.9)",
                  fontSize: 12,
                  color: "#e5e7eb",
                  cursor: "pointer"
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
