import React from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? styles.primary
      : variant === "secondary"
        ? styles.secondary
        : styles.ghost;

  const combined = [
    styles.base,
    variantClass,
    fullWidth ? styles.fullWidth : "",
    disabled ? styles.disabled : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={combined} disabled={disabled} {...rest} />;
}
