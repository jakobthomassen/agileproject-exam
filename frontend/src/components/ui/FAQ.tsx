import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "What kind of events can I host?",
    answer:
      "Peers can support structured events like hackathons, pitch competitions, case competitions, talent shows and similar formats.",
  },
  {
    question: "How long does it take to set up an event?",
    answer: "Most organizers can create a basic event in 5–10 minutes. If you have many athletes or heats, expect a bit more time for importing and double-checking details.",
  },
  {
    question: "Do I need to finish everything before the event starts?",
    answer: "You should complete the core setup (athletes, rounds, and scoring format) before the event. You can still tweak labels, weights, and some settings while the event is live.",
  },
  {
    question: "Which voting format should I choose?",
    answer:
      "Use Poll for quick single-choice votes, Battle for head-to-head matchups where the crowd picks the winner, and Ranking when you want a full ordered list of athletes from best to worst.",
  },
  {
    question: "How does judge vs audience scoring work?",
    answer:
      "You can combine judge and audience votes by giving each group a weight. Judges might count for 70 percent and the audience for 30 percent.",
  },
  {
    question: "What is a ranking template?",
    answer:
      "A ranking template is a predefined set of scoring criteria such as originality, impact and presentation.",
  },
];

export default function FAQWidget() {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #00ff99, #00cc77)",
          color: "#05060a",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 0 18px rgba(0,255,120,0.5)",
          zIndex: 900,
        }}
      >
        ?
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "transparent",
            zIndex: 949,
          }}
        >
          {/* Widget card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: "90px",
              right: "20px",
              width: "320px",
              maxHeight: "60vh",
              background: "rgba(10,10,15,0.97)",
              backdropFilter: "blur(14px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "14px",
              fontSize: "13px",
              zIndex: 950,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>
              Need help getting started?
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {FAQS.map((faq, index) => {
                const openItem = selectedIndex === index;

                return (
                  <div
                    key={faq.question}
                    style={{
                      borderRadius: "10px",
                      border: "1px solid rgba(148,163,184,0.6)",
                      background: openItem
                        ? "rgba(15,23,42,0.9)"
                        : "transparent",
                    }}
                  >
                    <button
                      onClick={() => setSelectedIndex(openItem ? null : index)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 10px",
                        border: "none",
                        background: "transparent",
                        color: "#e5e7eb",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "12px",
                      }}
                    >
                      <span>{faq.question}</span>
                      <span
                        style={{
                          fontSize: "14px",
                          transform: openItem
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.15s ease",
                        }}
                      >
                        &gt;
                      </span>
                    </button>

                    {openItem && (
                      <div
                        style={{
                          borderTop: "1px solid rgba(51,65,85,0.9)",
                          padding: "6px 10px 8px 10px",
                          fontSize: "12px",
                          color: "#cbd5f5",
                          background: "rgba(15,23,42,0.95)",
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
