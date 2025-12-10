import React from "react";
import styles from "./PageContainer.module.css";

type PageContainerProps = {
  children: React.ReactNode;
  kind?: "default" | "solid";
  maxWidth?: number | string; // <— added
};

export function PageContainer({
  children,
  kind = "default",
  maxWidth // <— added
}: PageContainerProps) {
  const pageClass =
    kind === "default" ? styles.pageGradient : styles.pageSolid;

  return (
    <div className={pageClass}>
      <div
        className={styles.inner}
        style={maxWidth ? { maxWidth } : undefined} // <— override here
      >
        {children}
      </div>
    </div>
  );
}
