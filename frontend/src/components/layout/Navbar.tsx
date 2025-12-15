import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <div className={styles.navbar}>
      <div
        className={styles.logo}
        onClick={() => navigate("/")}
      >
        PEERS
      </div>


      <div className={styles.navButtons}>
        <button onClick={() => navigate("https://www.peers.live/about")}>
          About us
        </button>
        <button onClick={() => navigate("https://www.peers.live/contact")}>
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
