import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect
} from "react";
import type { ReactNode } from "react";

export type JudgeGroupType = "audience" | "expert" | "athlete";

export interface JudgeGroupConfig {
  enabled: boolean;
  weight: number;         // % contribution
  criteria: string[];     // e.g. ["Overall"], ["Creativity","Difficulty"]
}

export interface JudgingSettings {
  scoreMin: number;        // e.g. 0
  scoreMax: number;        // e.g. 10
  judgingDurationSec: number;
  spectatorLimit: number | null;
  allowAnonymousSpectators: boolean;
  liveLeaderboard: boolean;
  groups: Record<JudgeGroupType, JudgeGroupConfig>;
}



export type ScoringMode = "judges" | "audience" | "mixed" | null;

export type EventData = {
  eventName: string | null;
  eventType: string | null;
  participants: number | null;

  scoringMode: ScoringMode;
  scoringAudience: number;
  scoringJudge: number;
  venue: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  sponsor: string | null;
  rules: string | null;
  audienceLimit: number | null;
  image: string | null;

  judgingSettings: JudgingSettings | null;
};

const defaultEventData: EventData = {
  eventName: null,
  eventType: null,
  participants: null,
  scoringMode: null,
  scoringAudience: 50,
  scoringJudge: 50,
  venue: null,
  startDateTime: null,
  endDateTime: null,
  sponsor: null,
  rules: null,
  audienceLimit: null,
  image: null,
  judgingSettings: {
    scoreMin: 0,
    scoreMax: 10,
    judgingDurationSec: 60,
    spectatorLimit: 100,
    allowAnonymousSpectators: false,
    liveLeaderboard: true,
    groups: {
      audience: { enabled: true,  weight: 33, criteria: ["Overall"] },
      expert:   { enabled: true,  weight: 34, criteria: ["Creativity","Difficulty","Execution"] },
      athlete:  { enabled: true,  weight: 33, criteria: ["Creativity","Difficulty","Execution"] }
    }
  }
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
  updateSavedEvent: (id: string, patch: Partial<SavedEvent>) => void;
};


const EventSetupContext = createContext<EventSetupContextValue | undefined>(
  undefined
);

export function EventSetupProvider({ children }: { children: ReactNode }) {
  const [eventData, setEventDataState] = useState<EventData>(defaultEventData);

  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>(() => {
    try {
      const raw = sessionStorage.getItem("savedEvents");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as SavedEvent[];
    } catch {
      return [];
    }
  });

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

  const updateSavedEvent = (id: string, patch: Partial<SavedEvent>) => {
    setSavedEvents(prev =>
      prev.map(ev => (ev.id === id ? { ...ev, ...patch } : ev))
    );
  };

  useEffect(() => {
    try {
      sessionStorage.setItem("savedEvents", JSON.stringify(savedEvents));
    } catch {
      
    }
  }, [savedEvents]);

  const value = useMemo(
    () => ({
      eventData,
      setEventData,
      replaceEventData,
      resetEventData,

      savedEvents,
      addSavedEvent,
      deleteSavedEvent,
      updateSavedEvent
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
