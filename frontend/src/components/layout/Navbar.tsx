import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

export function Navbar() {
  const navigate = useNavigate();

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
        <button onClick={() => notImplemented("About us")}>
          About us
        </button>
        <button onClick={() => notImplemented("Contact")}>
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
