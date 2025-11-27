import { useState } from "react";
import { useNavigate } from "react-router-dom";
import landscape1 from "../assets/landscape1.jpg";
import landscape2 from "../assets/landscape2.jpg";
import landscape3 from "../assets/landscape3.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

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
            <p style={{ color: "#d4d4d4", marginBottom: "6px" }}>
              This chatbot will eventually answer general questions like:
            </p>
            <ul style={{ paddingLeft: "18px", margin: 0 }}>
              <li>What kind of events can I host?</li>
              <li>How does judge vs audience scoring work?</li>
              <li>What is a ranking template?</li>
            </ul>
            <p style={{ color: "#888", marginTop: "8px" }}>
              For now, click <b>Get started</b> in the hero section to create an
              event.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
