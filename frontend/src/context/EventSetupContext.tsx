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

export type SavedEvent = EventData & {
  id: string;
  sport: string | null;
  format: string | null;
  status: "DRAFT" | "OPEN" | "FINISHED";
  startDate: string | null;
  athletes: number;
  eventCode: string | null;
};


type EventSetupContextValue = {
  eventData: EventData;
  setEventData: (patch: Partial<EventData>) => void;
  replaceEventData: (data: EventData) => void;
  resetEventData: () => void;

  savedEvents: SavedEvent[];
  addSavedEvent: (ev: SavedEvent) => void;
  deleteSavedEvent: (id: string) => void;
};


const EventSetupContext = createContext<EventSetupContextValue | undefined>(
  undefined
);

export function EventSetupProvider({ children }: { children: ReactNode }) {
  const [eventData, setEventDataState] = useState<EventData>(defaultEventData);

  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);

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

  const addSavedEvent = (ev: SavedEvent) => {
    setSavedEvents(prev => [...prev, ev]);
  };

  const deleteSavedEvent = (id: string) => {
    setSavedEvents(prev => prev.filter(e => e.id !== id));
  };

  const value = useMemo(
    () => ({
      eventData,
      setEventData,
      replaceEventData,
      resetEventData,

      savedEvents,
      addSavedEvent,
      deleteSavedEvent
    }),
    [eventData, savedEvents]
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
