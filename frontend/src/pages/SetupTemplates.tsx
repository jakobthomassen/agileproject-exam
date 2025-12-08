import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SetupTemplates.module.css";

type TemplateType = "rating" | "judge_audience" | "blank";

type CardData = {
  key: TemplateType;
  title: string;
  desc: string;
};

function TemplateCard({
  data,
  selected,
  setSelected,
  setInfoOpen,
}: {
  data: CardData;
  selected: TemplateType | null;
  setSelected: (t: TemplateType) => void;
  setInfoOpen: (t: TemplateType) => void;
}) {
  const isActive = selected === data.key;

  const cardClasses = [
    styles.card,
    isActive ? styles.cardActive : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cardClasses}
      onClick={() => setSelected(data.key)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setInfoOpen(data.key);
        }}
        onMouseEnter={(e) => e.stopPropagation()}
        className={styles.infoButton}
        aria-label={`More information about ${data.title}`}
      >
        ?
      </button>

      <h3 className={styles.cardTitle}>{data.title}</h3>
      <p className={styles.cardDescription}>{data.desc}</p>
    </div>
  );
}

export default function SetupTemplates() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<TemplateType | null>(null);
  const [infoOpen, setInfoOpen] = useState<TemplateType | null>(null);

  function handleContinue() {
    if (!selected) return;
    sessionStorage.setItem("selectedTemplate", selected);
    navigate("/setup/method");
  }

  function handleDecideLater() {
    sessionStorage.removeItem("selectedTemplate");
    navigate("/setup/method");
  }

  const infoText: Record<TemplateType, string> = {
    rating:
      "Users score or order athletes from best to worst. Ideal when you want participants to provide a full, ordered list of preferences.",
    judge_audience:
      "Athletes are shown in head-to-head matchups, and the audience chooses the winner each time. Perfect for quick comparisons and generating an overall winner through pairwise votes.",
    blank:
      "Audiences vote on a single Athlete or choose from multiple predefined athlete options. Best for simple, fast feedback without detailed comparisons.",
};

  const cards: CardData[] = [
    { key: "rating", title: "Ranking", desc: "Order all athletes from best to worst in one list."},
    { key: "judge_audience", title: "Battle", desc: "Head-to-head matchups where the crowd picks the winner."},
    { key: "blank", title: "Poll", desc: "Quick single-choice voting on one athlete or option."},
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Choose a scoring template</h1>

        <p className={styles.description}>
          Start from a predefined scoring setup, or go with a blank slate. You can adjust details later.
        </p>

        <div className={styles.cardsContainer}>
          {cards.map((card) => (
            <TemplateCard
              key={card.key}
              data={card}
              selected={selected}
              setSelected={setSelected}
              setInfoOpen={setInfoOpen}
            />
          ))}
        </div>

        <div className={styles.buttonsContainer}>
          <button
            onClick={handleDecideLater}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Decide Later
          </button>

          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Continue
          </button>
        </div>
      </div>

      {infoOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setInfoOpen(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setInfoOpen(null)}
              className={styles.closeButton}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className={styles.modalTitle}>
              {cards.find((c) => c.key === infoOpen)?.title} Template
            </h3>
            <p>{infoText[infoOpen]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
