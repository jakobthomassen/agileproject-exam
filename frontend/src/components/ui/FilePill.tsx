import type { CSSProperties } from "react";

const pill: CSSProperties = {
  padding: "10px 14px",
  marginBottom: 8,
  borderRadius: 8,
  background: "rgba(0,255,153,0.1)",
  border: "1px solid rgba(0,255,153,0.2)",
  color: "#00ff99",
  fontSize: 14
};

export function FilePill({ name }: { name: string }) {
  return <div style={pill}>📄 {name}</div>;
}
