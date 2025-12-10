import type { InputHTMLAttributes } from "react";
import styles from "./TextInput.module.css";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: TextInputProps) {
  return <input {...props} className={styles.root} />;
}
