import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect
} from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../config";

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

export type EventData = {
  // Identity
  id?: string | number;
  eventCode?: string | null;

  // Main Info (Mapped from DB)
  eventName: string | null;
  venue: string | null;
  scoringMode: string | null;
  rules: string | null;
  startDateTime: string | null;

  // Nullable fields
  participants: number | null;
  eventType: string | null;

  ui_payload?: {
    key: string;
    label: string;
    value: any;
    component: string;
  }[];

  /*
    Judging settings are context-owned but optional.
    Early setup steps may leave this null or partially defined.
  */
  judgingSettings: JudgingSettings | null;
  ui_payload?: { label: string; value: any; type: string }[];
};

// Default empty state
export const defaultEventData: EventData = {
  eventName: null,
  venue: null,
  scoringMode: null,
  rules: null,
  startDateTime: null,
  endDateTime: null,

  sponsor: null,
  rules: null,
  audienceLimit: null,

  image: null,
  judgingSettings: null
};

/* -------------------------------------------------------------------------- */
/* Saved Events (Dashboard)                                                    */
/* -------------------------------------------------------------------------- */

export type SavedEvent = {
  id: string;
  eventName: string;
  sport: string;
  format: string;
  status: string;
  venue: string;
  startDate: string;
  athletes: number;
  eventCode: string;
};

/* -------------------------------------------------------------------------- */
/* Context Definition                                                          */
/* -------------------------------------------------------------------------- */

type EventSetupContextValue = {
  eventData: EventData;
  isLoading: boolean;
  savedEvents: SavedEvent[]; // <--- NEW: List for Dashboard
  setEventData: (patch: Partial<EventData>) => void;
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

const EventSetupContext = createContext<EventSetupContextValue | undefined>(undefined);

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
    setEventDataState((prev) => ({ ...prev, ...patch }));
  };

  const resetEventData = () => {
    setEventDataState(defaultEventData);
  };

  const addSavedEvent = (ev: any) => {
    console.log("Adding event locally and refreshing list...");
    setSavedEvents((prev) => [...prev, ev]);
    // Optionally trigger a refresh from DB
    // fetchDashboardEvents(); 
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
      isLoading,
      savedEvents, // <--- Exposed to Dashboard
      setEventData,
      resetEventData,
      addSavedEvent,
      deleteSavedEvent
    }),
    [eventData, isLoading, savedEvents]
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

export function useEventSetup() {
  const ctx = useContext(EventSetupContext);
  if (!ctx) {
    throw new Error("useEventSetup must be used inside EventSetupProvider");
  }
  return ctx;
}

