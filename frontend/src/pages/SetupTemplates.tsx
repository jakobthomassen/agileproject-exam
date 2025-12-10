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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur quis mattis urna. Phasellus aliquam eros vel augue faucibus tempor.",
    judge_audience:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere libero sed semper fermentum. Cras ac ultrices nulla.",
    blank:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vel pharetra tortor. Suspendisse potenti. Integer lacinia nisi at nunc mattis varius.",
  };

  const cards: CardData[] = [
    { key: "rating", title: "Ranking", desc: "Lorem ipsum dolor sit amet." },
    { key: "judge_audience", title: "Battle", desc: "Donec sit amet turpis nulla." },
    { key: "blank", title: "Poll", desc: "Pellentesque a mi quam." },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Choose a ranking template</h1>

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
