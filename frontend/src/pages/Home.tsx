import { useNavigate } from "react-router-dom";
import landscape1 from "../assets/landscape1.jpg";
import landscape2 from "../assets/landscape2.jpg";
import FAQWidget from "../components/ui/FAQ";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg-body)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
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
            flexDirection: "column",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 40px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "26px",
                letterSpacing: "0.08em",
              }}
            >
              PEERS
            </div>
            <nav
              style={{
                display: "flex",
                gap: "24px",
                fontSize: "14px",
                opacity: 0.9,
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
              maxWidth: "720px",
            }}
          >
            <h1
              style={{
                fontSize: "42px",
                marginBottom: "16px",
              }}
            >
              Events under a night sky.
            </h1>
            <p
              style={{
                maxWidth: "540px",
                color: "#c5c5c5",
                marginBottom: "24px",
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
                fontSize: "16px",
              }}
            >
              Get started
            </button>
          </div>
        </section>

        {/* Sections */}
        <section
          style={{
            minHeight: "60vh",
            backgroundImage: `linear-gradient(180deg, rgba(5,6,10,0.95), rgba(5,6,10,0.98)), url(${landscape2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "60px 40px",
            display: "flex",
            gap: "40px",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "24px",
              borderRadius: "18px",
              background: "rgba(10,10,15,0.7)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.08)",
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
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>Audience and judges.</h2>
            <p style={{ color: "#d1d1d1" }}>
              Phasellus ullamcorper, lectus ut gravida laoreet, lacus odio
              fringilla mi, a malesuada eros ante at nisl.
            </p>
          </div>
        </section>
      </div>
      <FAQWidget />
    </>
  );
}
