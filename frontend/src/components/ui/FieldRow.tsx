import type { ReactNode } from "react";
import styles from "./FieldRow.module.css";

interface FieldRowProps {
  label: string;
  value?: string | number | null;
  children?: ReactNode;
  placeholder?: string;
}

export function FieldRow({ label, value, children, placeholder = "Not set" }: FieldRowProps) {
  const hasValue = value !== "" && value !== null && value !== undefined;

  return (
    <div className={styles.row}>
      <strong className={styles.label}>{label}:</strong>
      {children ? (
        <span className={styles.value}>{children}</span>
      ) : hasValue ? (
        <span className={styles.value}>{value}</span>
      ) : (
        <span className={styles.placeholder}>{placeholder}</span>
      )}
    </div>
  );
}
