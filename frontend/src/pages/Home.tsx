import { useNavigate } from "react-router-dom";
import landscape1 from "../assets/landscape1.jpg";
import landscape2 from "../assets/landscape2.jpg";
import FAQWidget from "../components/ui/FAQ";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.homeContainer}>
        {/* Hero Section */}
        <section 
          className={styles.heroSection} 
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.6), rgba(5,6,10,0.95)), url(${landscape1})`
          }}
        >
          <header className={styles.header}>
            <div className={styles.logo}>PEERS</div>
            <nav className={styles.nav}>
              <span>Overview</span>
              <span>Features</span>
              <span>Contact</span>
            </nav>
          </header>

          <div className={styles.heroContent}>
            <h1>Events under a night sky.</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
              elementum lacus vel justo interdum, a pellentesque metus
              imperdiet.
            </p>
            <button 
              onClick={() => navigate("/setup")} 
              className={styles.ctaButton}
            >
              Get started
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section 
          className={styles.featuresSection}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(5,6,10,0.95), rgba(5,6,10,0.98)), url(${landscape2})`
          }}
        >
          <div className={styles.featureCard}>
            <h2>Realtime scoring.</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec
              quam vitae lectus iaculis bibendum. Pellentesque nec facilisis
              enim.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h2>Audience and judges.</h2>
            <p>
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
