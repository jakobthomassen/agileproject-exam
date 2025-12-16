
import landscape1 from "../assets/landscape1.jpg";
import FAQWidget from "../components/ui/FAQ";
import styles from "./Home.module.css";

export default function Home() {


  return (
    <>
      <div className={styles.homeRoot}>
        {/* HERO / TOP SECTION */}
        <section className={styles.heroSection}>
          {/* Background image + gradient overlay */}
          <div
            className={styles.heroBackground}
            style={{ backgroundImage: `url(${landscape1})` }}
          />
          <div className={styles.heroOverlay} />

          {/* HERO CONTENT: PEERS logo + Join button */}
          <div className={styles.heroContent}>
            <div className={styles.logoText}>PEERS</div>

            <div className={styles.heroCtaRow}>
              <button
                type="button"
                className={styles.heroPrimaryButton}
                onClick={() => {
                  const label = "Join Event";
                  window.alert(`${label} page is not implemented yet.`);
                }}
              >
                Join Event
              </button>
            </div>
          </div>
        </section>

        {/* TAGLINE / ABOUT SECTION */}
        <section id="about-section" className={styles.aboutSection}>
          <div className={styles.aboutInner}>
            <h2 className={styles.tagline}>
              Turn your audience into active participants.
            </h2>

            <p className={styles.aboutText}>
              Peers is a real time voting and scoring platform that turns any
              event into an interactive experience. It fits sports competitions,
              food festivals, film screenings and conferences and lets the crowd
              take part while the event is happening.
            </p>

            <p className={styles.aboutText}>
              Guests join in the browser without installing an app. Organizers
              control formats, weights and how the results are presented on
              screen.
            </p>
          </div>
        </section>

        {/* SYSTEM OVERVIEW IMAGE */}
        <section className={styles.systemSection}>
          <div className={styles.systemImageWrapper}>
            <img
              className={styles.systemImage}
              src="https://www.peers.live/_next/image?url=%2FhomepageImg%2Fpeerssystem.png&w=1080&q=75"
              alt="Peers system overview"
            />
          </div>
        </section>

        {/* WHY PEERS SECTION */}
        <section className={styles.whySection}>
          <div className={styles.whyInner}>
            <h2 className={styles.whyTitle}>Why Peers?</h2>

            <div className={styles.whyGrid}>
              <div className={styles.whyCard}>
                <h3>Real time engagement</h3>
                <p>
                  Simple web based voting makes it easy for the audience to
                  participate. No app download, just a link or QR code.
                </p>
              </div>

              <div className={styles.whyCard}>
                <h3>Fair and dynamic scoring</h3>
                <p>
                  Combine expert judges and audience input in one model so the
                  results feel both professional and democratic.
                </p>
              </div>

              <div className={styles.whyCard}>
                <h3>Sponsor visibility that works</h3>
                <p>
                  Place sponsor branding inside the voting flow where attention
                  is already high instead of pushing separate ads.
                </p>
              </div>

              <div className={styles.whyCard}>
                <h3>Fully customizable</h3>
                <p>
                  Adjust design, scoring and event format so the same platform
                  works for small venues and arena sized events.
                </p>
              </div>
            </div>

            <div className={styles.whyBottom}>
              <h3>Simple for users. Powerful for organizers.</h3>
              <p>
                Participants join in seconds and interact live. Organizers get a
                controlled scoring setup, live results and data they can reuse
                after the event.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT + FOOTER */}
        <section className={styles.contactSection}>
          <p>
            Contact us for any questions or feedback:{" "}
            <a href="mailto:lars@peers.live">lars@peers.live</a>.
          </p>
        </section>

        <footer className={styles.footer}>
          <span className={styles.footerLogo}>PEERS</span>
          <div className={styles.footerLinks}>
            <a
              href="https://www.peers.live/contact"
              target="_blank"
              rel="noreferrer"
            >
              Contact
            </a>
            <a
              href="https://www.peers.live/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>

      {/* Global FAQ bot */}
      <FAQWidget />
    </>
  );
}
