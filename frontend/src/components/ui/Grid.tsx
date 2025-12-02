import type { CSSProperties, ReactNode } from "react";

export const gridTwoColumn: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "3fr 2fr",
  gap: 24,
  alignItems: "flex-start"
};

export function TwoColumn({ children }: { children: ReactNode }) {
  return <div style={gridTwoColumn}>{children}</div>;
}
