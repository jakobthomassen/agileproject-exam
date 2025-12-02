import type { ReactNode, CSSProperties } from "react";
import { Card } from "./Card";

export function Section({
  children,
  style,
  padding = 24
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: number;
}) {
  return (
    <Card padding={padding} style={{ marginBottom: 32, ...style }}>
      {children}
    </Card>
  );
}
