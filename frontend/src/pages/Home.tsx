import { useState } from "react";
import { useNavigate } from "react-router-dom";
import landscape1 from "../assets/landscape1.jpg";
import landscape2 from "../assets/landscape2.jpg";
import landscape3 from "../assets/landscape3.jpg";
import LandingFaqBot from "../components/ui/FAQ";


export default function Home() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);  
    const faqs = [
    {
      question: "What kind of events can I host?",
      answer:
        "Peers can support structured events like hackathons, pitch competitions, case competitions, talent shows and similar formats.",
    },
    {
      question: "How does judge vs audience scoring work?",
      answer:
        "You can combine judge and audience votes by giving each group a weight. For example, judges might count for 70% of the final score and the audience for 30%.",
    },
    {
      question: "What is a ranking template?",
      answer:
        "A ranking template is a predefined set of criteria and scoring scales, such as originality, impact and presentation, that you can reuse across events.",
    },
  ];

  const [selectedFaqIndex, setSelectedFaqIndex] = useState<number | null>(null);


  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#05060a",
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif"
        }}
      >
        {/* Hero */}
        <section
          style={{
            height: "100vh",
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.6), rgba(5,6,10,0.95)), url(${landscape1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 40px"
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "26px",
                letterSpacing: "0.08em"
              }}
            >
              PEERS
            </div>
            <nav
              style={{
                display: "flex",
                gap: "24px",
                fontSize: "14px",
                opacity: 0.9
              }}
            >
              <span>Overview</span>
              <span>Features</span>
              <span>Contact</span>
            </nav>
          </header>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 40px",
              maxWidth: "720px"
            }}
          >
            <h1
              style={{
                fontSize: "42px",
                marginBottom: "16px"
              }}
            >
              Events under a night sky.
            </h1>
            <p
              style={{
                maxWidth: "540px",
                color: "#c5c5c5",
                marginBottom: "24px"
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
              elementum lacus vel justo interdum, a pellentesque metus
              imperdiet.
            </p>
            <button
              onClick={() => navigate("/setup")}
              style={{
                padding: "14px 30px",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(135deg, #00ff99, #00cc77)",
                color: "#05060a",
                fontWeight: 600,
                cursor: "pointer",
                width: "fit-content",
                fontSize: "16px"
              }}
            >
              Get started
            </button>
          </div>
        </section>

        {/* Simple other sections */}
        <section
          style={{
            minHeight: "60vh",
            backgroundImage: `linear-gradient(180deg, rgba(5,6,10,0.95), rgba(5,6,10,0.98)), url(${landscape2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "60px 40px",
            display: "flex",
            gap: "40px"
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "24px",
              borderRadius: "18px",
              background: "rgba(10,10,15,0.7)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>Realtime scoring.</h2>
            <p style={{ color: "#d1d1d1" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec
              quam vitae lectus iaculis bibendum. Pellentesque nec facilisis
              enim.
            </p>
          </div>
          <div
            style={{
              flex: 1,
              padding: "24px",
              borderRadius: "18px",
              background: "rgba(10,10,15,0.7)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>Audience and judges.</h2>
            <p style={{ color: "#d1d1d1" }}>
              Phasellus ullamcorper, lectus ut gravida laoreet, lacus odio
              fringilla mi, a malesuada eros ante at nisl.
            </p>
          </div>
        </section>

        <section
          style={{
            minHeight: "60vh",
            backgroundImage: `linear-gradient(180deg, rgba(5,6,10,0.98), rgba(5,6,10,1)), url(${landscape3})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "60px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              padding: "24px",
              borderRadius: "18px",
              background: "rgba(10,10,15,0.8)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <h2>Host under the moonlight.</h2>
            <p style={{ color: "#d1d1d1" }}>
              Aliquam ut dui a dui volutpat hendrerit. Vivamus finibus ipsum
              sed ultricies euismod.
            </p>
          </div>
        </section>
      </div>

      {/* Help chatbot button */}
      <button
        onClick={() => setShowHelp(true)}
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
          zIndex: 900
        }}
      >
        ?
      </button>

      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "transparent",
            zIndex: 949
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
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
              flexDirection: "column"
            }}
          >
                <div style={{ fontWeight: 600, marginBottom: "6px" }}>
        Need help getting started?
      </div>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginBottom: "6px",
        }}
      >
        {faqs.map((faq, index) => {
          const isOpen = selectedFaqIndex === index;

          return (
            <div
              key={faq.question}
              style={{
                borderRadius: "10px",
                border: "1px solid rgba(148,163,184,0.6)",
                background: isOpen ? "rgba(15,23,42,0.9)" : "transparent",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() =>
                  setSelectedFaqIndex(isOpen ? null : index)
                }
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
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  &gt;
                </span>
              </button>

              {isOpen && (
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

      <p style={{ color: "#888", marginTop: "4px" }}>
        To create an event, click <b>Get started</b>.
      </p>
          </div>
        </div>
      )}
      <LandingFaqBot />
    </>
  );
}
