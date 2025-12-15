import { type CSSProperties, type HTMLAttributes } from "react";

export const cardBaseStyle: CSSProperties = {
  background: "rgba(15,15,22,0.95)",
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.6)"
};

type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: number;
};

export function Card({ padding = 20, style, ...rest }: Props) {
  return (
    <div style={{ ...cardBaseStyle, padding, ...style }} {...rest} />
  );
}
