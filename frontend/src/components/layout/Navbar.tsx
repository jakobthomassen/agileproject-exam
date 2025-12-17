import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  function notImplemented(label: string) {
    window.alert(`${label} page is not implemented yet.`);
  }

  return (
    <div className={styles.navbar}>
      <div
        className={styles.logo}
        onClick={() => navigate("/")}
      >
        PEERS
      </div>


      <div className={styles.navButtons}>
        <button onClick={() => {
          if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" }), 100);
          } else {
            document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" });
          }
        }}>
          About us
        </button>
        <button onClick={() => window.open("https://www.peers.live/contact", "_blank")}>
          Contact
        </button>
        <button onClick={() => navigate("/setup")}>
          Create event
        </button>
        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
      </div>
    </div>
  );
}
