import { useNavigate } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { BackButton } from "../components/ui/BackButton";
import { SetupPageHeader } from "../components/ui/SetupPageHeader";
import { EventSummary } from "../components/event/EventSummary";
import styles from "./SetupSummary.module.css";

export default function SetupSummary() {
  const navigate = useNavigate();
  const { eventData, addSavedEvent, resetEventData } = useEventSetup();

  function handleFinish() {
    addSavedEvent({
      ...eventData,
      id: crypto.randomUUID(),
      sport: eventData.eventType,
      format:
        eventData.scoringMode === "mixed" ? "Mixed" : "Ranking",
      status: "DRAFT",
      startDate: eventData.startDateTime,
      athletes: eventData.participants ?? 0,
      eventCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    resetEventData();
    navigate("/dashboard");
  }

  return (
    <PageContainer kind="solid">
      <div className={styles.pageInner}>
        <BackButton to="/setup/method">Back</BackButton>

        <SetupPageHeader
          title="Event summary"
          description="Review the event configuration before saving it."
        />

        <EventSummary
          event={eventData}
          showHero
          showRules
        />

        <div className={styles.buttonsRow}>
          <Button
            variant="ghost"
            onClick={() => navigate("/setup/method")}
          >
            Back
          </Button>

          <Button onClick={handleFinish}>
            Confirm & save
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
