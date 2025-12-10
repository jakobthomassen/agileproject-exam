import { CSSProperties, HTMLAttributes } from "react";

const base: CSSProperties = {
  background: "rgba(15,15,22,0.95)",
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.6)",
  padding: 18,
  minHeight: 140,
  cursor: "pointer",
  textAlign: "left"
};

type Props = HTMLAttributes<HTMLButtonElement>;

export function ClickableCard({ style, ...rest }: Props) {
  return (
    <button
      type="button"
      style={{ ...base, ...style }}
      {...rest}
    />
  );
}
