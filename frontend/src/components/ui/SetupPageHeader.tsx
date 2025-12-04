import type { ReactNode } from "react";
import styles from "./SetupPageHeader.module.css";
import { leadText } from "./Text";

interface SetupPageHeaderProps {
  title: string;
  description?: ReactNode;
}

export function SetupPageHeader({ title, description }: SetupPageHeaderProps) {
  return (
    <header className={styles.wrapper}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description} style={leadText}>{description}</p>}
    </header>
  );
}
