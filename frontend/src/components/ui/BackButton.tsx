import { useNavigate } from "react-router-dom";
import { Button } from "./Button";

interface BackButtonProps {
  to: string;
  children?: string;
}

export function BackButton({ to, children }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(to)}
      style={{ marginBottom: 16, padding: "6px 14px", fontSize: 13 }}
    >
      ← {children ?? "Back"}
    </Button>
  );
}
