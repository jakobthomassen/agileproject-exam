import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo
} from "react";

export type ScoringMode = "judges" | "audience" | "mixed" | null;

export type EventData = {
  eventName: string | null;
  eventType: string | null;
  participants: number | null;

  scoringMode: ScoringMode;
  scoringAudience: number | null;
  scoringJudge: number | null;

  venue: string | null;
  startDateTime: string | null;
  endDateTime: string | null;

  sponsor: string | null;
  rules: string | null;
  audienceLimit: number | null;

  image: string | null; // for later backend images
};

export const defaultEventData: EventData = {
  eventName: null,
  eventType: null,
  participants: null,
  scoringMode: null,
  scoringAudience: null,
  scoringJudge: null,
  venue: null,
  startDateTime: null,
  endDateTime: null,
  sponsor: null,
  rules: null,
  audienceLimit: null,
  image: null
};

type EventSetupContextValue = {
  eventData: EventData;
  setEventData: (patch: Partial<EventData>) => void;
  replaceEventData: (data: EventData) => void;
  resetEventData: () => void;
};

const EventSetupContext = createContext<EventSetupContextValue | undefined>(
  undefined
);

export function EventSetupProvider({ children }: { children: ReactNode }) {
  const [eventData, setEventDataState] = useState<EventData>(defaultEventData);

  const setEventData = (patch: Partial<EventData>) => {
    setEventDataState(prev => ({
      ...prev,
      ...patch
    }));
  };

  const replaceEventData = (data: EventData) => {
    setEventDataState(data);
  };

  const resetEventData = () => {
    setEventDataState(defaultEventData);
  };

  const value = useMemo(
    () => ({
      eventData,
      setEventData,
      replaceEventData,
      resetEventData
    }),
    [eventData]
  );

  return (
    <EventSetupContext.Provider value={value}>
      {children}
    </EventSetupContext.Provider>
  );
}

export function useEventSetup(): EventSetupContextValue {
  const ctx = useContext(EventSetupContext);
  if (!ctx) {
    throw new Error("useEventSetup must be used inside EventSetupProvider");
  }
  return ctx;
}
