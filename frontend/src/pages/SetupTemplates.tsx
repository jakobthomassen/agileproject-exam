import { useState } from "react";
import { useNavigate } from "react-router-dom";

type TemplateType = "rating" | "judge_audience" | "blank";

const infoBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  fontSize: "14px",
  color: "#d1d5db",
  background: "rgba(255,255,255,0.05)"
};

type CardData = {
  key: TemplateType;
  title: string;
  desc: string;
};

function TemplateCard({
  data,
  selected,
  hovered,
  setSelected,
  setHovered,
  setInfoOpen,
  cardStyle
}: {
  data: CardData;
  selected: TemplateType | null;
  hovered: TemplateType | null;
  setSelected: (t: TemplateType) => void;
  setHovered: (t: TemplateType | null) => void;
  setInfoOpen: (t: TemplateType) => void;
  cardStyle: (active: boolean, isHover: boolean) => React.CSSProperties;
}) {
  return (
    <div
      style={cardStyle(selected === data.key, hovered === data.key)}
      onClick={() => setSelected(data.key)}
      onMouseEnter={() => setHovered(data.key)}
      onMouseLeave={() => setHovered(null)}
    >
      <div
        onClick={e => {
          e.stopPropagation();
          setInfoOpen(data.key);
        }}
        style={infoBtnStyle}
      >
        ?
      </div>

      <h3>{data.title}</h3>
      <p style={{ color: "#9ca3af" }}>{data.desc}</p>
    </div>
  );
}

export default function SetupTemplates() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<TemplateType | null>(null);
  const [infoOpen, setInfoOpen] = useState<TemplateType | null>(null);
  const [hovered, setHovered] = useState<TemplateType | null>(null);

  function handleContinue() {
    if (!selected) return;
    sessionStorage.setItem("selectedTemplate", selected);
    navigate("/setup/method");
  }

  function handleDecideLater() {
    sessionStorage.removeItem("selectedTemplate");
    navigate("/setup/method");
  }

  function cardStyle(active: boolean, isHover: boolean): React.CSSProperties {
    return {
      position: "relative",
      flex: 1,
      minWidth: "220px",
      minHeight: "140px",
      padding: "18px",
      borderRadius: "16px",
      border: active
        ? "1px solid #00ff99"
        : "1px solid rgba(255,255,255,0.15)",
      background: "rgba(15,15,22,0.95)",
      cursor: "pointer",
      transition: "box-shadow 0.25s ease, border-color 0.25s ease",
      boxShadow: active
        ? "0 0 16px rgba(0,255,120,0.25)"
        : isHover
        ? "0 0 12px rgba(0,255,120,0.12)"
        : "none"
    };
  }

  const infoText: Record<TemplateType, string> = {
    rating:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur quis mattis urna. Phasellus aliquam eros vel augue faucibus tempor.",
    judge_audience:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere libero sed semper fermentum. Cras ac ultrices nulla.",
    blank:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vel pharetra tortor. Suspendisse potenti. Integer lacinia nisi at nunc mattis varius."
  };

  const cards: CardData[] = [
    { key: "rating", title: "Ranking", desc: "Lorem ipsum dolor sit amet." },
    { key: "judge_audience", title: "Battle", desc: "Donec sit amet turpis nulla." },
    { key: "blank", title: "Poll", desc: "Pellentesque a mi quam." }
  ];
  
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-page)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "60px 16px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "960px" }}>
        <h1 style={{ marginBottom: "10px" }}>Choose a ranking template</h1>

        <p
          style={{
            maxWidth: "520px",
            color: "#d1d5db",
            marginBottom: "24px"
          }}
        >
          Start from a predefined scoring setup, or go with a blank slate. You can adjust details later.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >
          {cards.map(c => (
            <TemplateCard
              key={c.key}
              data={c}
              selected={selected}
              hovered={hovered}
              setSelected={setSelected}
              setHovered={setHovered}
              setInfoOpen={setInfoOpen}
              cardStyle={cardStyle}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={handleDecideLater}
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #767978ff, #bdbcbcff)",
              color: "#020617",
              fontWeight: 600
            }}
          >
            Decide Later
          </button>

          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              border: "none",
              background: selected
                ? "linear-gradient(135deg, #00ff99, #00cc77)"
                : "rgba(75,85,99,0.8)",
              color: selected ? "#020617" : "#9ca3af",
              fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed"
            }}
          >
            Continue
          </button>
        </div>

        {infoOpen && (
          <div
            onClick={() => setInfoOpen(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: "90%",
                maxWidth: "420px",
                padding: "24px",
                borderRadius: "16px",
                background: "rgba(15,15,22,1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white"
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>
                {infoOpen === "rating"
                  ? "Ranking template"
                  : infoOpen === "judge_audience"
                  ? "Battle template"
                  : "Poll template"}
              </h3>

              <p
                style={{
                  color: "#d1d5db",
                  marginBottom: "24px"
                }}
              >
                {infoText[infoOpen]}
              </p>

              <button
                onClick={() => setInfoOpen(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
