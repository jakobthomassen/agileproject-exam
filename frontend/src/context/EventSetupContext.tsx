import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect
} from "react";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Judging domain model                                                        */
/* -------------------------------------------------------------------------- */

export type JudgeGroupType = "audience" | "expert" | "athlete";

export interface JudgeGroupConfig {
  enabled: boolean;
  weight: number;
  criteria: string[];
}

export interface JudgingSettings {
  scoreMin: number;
  scoreMax: number;
  judgingDurationSec: number;
  spectatorLimit: number | null;
  allowAnonymousSpectators: boolean;
  liveLeaderboard: boolean;
  groups: Record<JudgeGroupType, JudgeGroupConfig>;
}

/*
  Context owns the canonical DEFAULTS,
  but not all flows must immediately commit them.
*/
export const defaultJudgingSettings: JudgingSettings = {
  scoreMin: 0,
  scoreMax: 10,
  judgingDurationSec: 60,
  spectatorLimit: 100,
  allowAnonymousSpectators: false,
  liveLeaderboard: true,
  groups: {
    audience: {
      enabled: true,
      weight: 33,
      criteria: ["Overall"]
    },
    expert: {
      enabled: true,
      weight: 34,
      criteria: ["Creativity", "Difficulty", "Execution"]
    },
    athlete: {
      enabled: true,
      weight: 33,
      criteria: ["Creativity", "Difficulty", "Execution"]
    }
  }
};

/* -------------------------------------------------------------------------- */
/* Event model                                                                 */
/* -------------------------------------------------------------------------- */

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

  image: string | null;

  /*
    Judging settings are context-owned but optional.
    Early setup steps may leave this null or partially defined.
  */
  judgingSettings: JudgingSettings | null;
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

  image: null,
  judgingSettings: null
};

/* -------------------------------------------------------------------------- */
/* Saved events                                                                */
/* -------------------------------------------------------------------------- */

export type SavedEvent = EventData & {
  id: string;
  sport: string | null;
  format: string | null;
  status: "DRAFT" | "OPEN" | "FINISHED";
  startDate: string | null;
  athletes: number;
  eventCode: string | null;
};

/* -------------------------------------------------------------------------- */
/* Context API                                                                 */
/* -------------------------------------------------------------------------- */

type EventSetupContextValue = {
  eventData: EventData;

  setEventData: (patch: Partial<EventData>) => void;
  replaceEventData: (data: EventData) => void;
  resetEventData: () => void;

  /*
    Explicit helper for judging settings.
    Allows future pages to partially update without full ownership.
  */
  setJudgingSettings: (patch: Partial<JudgingSettings>) => void;
  resetJudgingSettings: () => void;

  savedEvents: SavedEvent[];
  addSavedEvent: (ev: SavedEvent) => void;
  deleteSavedEvent: (id: string) => void;
  updateSavedEvent: (id: string, patch: Partial<SavedEvent>) => void;
};

const EventSetupContext = createContext<EventSetupContextValue | undefined>(
  undefined
);

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */

export function EventSetupProvider({ children }: { children: ReactNode }) {
  const [eventData, setEventDataState] =
    useState<EventData>(defaultEventData);

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

  const setJudgingSettings = (patch: Partial<JudgingSettings>) => {
    setEventDataState(prev => ({
      ...prev,
      judgingSettings: {
        ...(prev.judgingSettings ?? defaultJudgingSettings),
        ...patch
      }
    }));
  };

  const resetJudgingSettings = () => {
    setEventDataState(prev => ({
      ...prev,
      judgingSettings: null
    }));
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
    } catch {}
  }, [savedEvents]);

  const value = useMemo(
    () => ({
      eventData,
      setEventData,
      replaceEventData,
      resetEventData,

      setJudgingSettings,
      resetJudgingSettings,

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

/* -------------------------------------------------------------------------- */
/* Hook                                                                        */
/* -------------------------------------------------------------------------- */

export function useEventSetup(): EventSetupContextValue {
  const ctx = useContext(EventSetupContext);
  if (!ctx) {
    throw new Error("useEventSetup must be used inside EventSetupProvider");
  }
  return ctx;
}
