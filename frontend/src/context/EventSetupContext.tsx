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
/* Event Model                                                                 */
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

  // Settings
  judgingSettings?: any | null;

  // Added to fix build errors
  scoringAudience?: any | null;
  scoringJudge?: any | null;
  sponsor?: string | null;
  audienceLimit?: number | null;
  image?: string | null;
  endDateTime?: string | null;
  athletes?: number | null;
};

// Default empty state
export const defaultEventData: EventData = {
  eventName: null,
  venue: null,
  scoringMode: null,
  rules: null,
  startDateTime: null,
  participants: null,
  eventType: null,
  eventCode: null,
  ui_payload: []
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
  participants: number;
  athletes: number;
  eventCode: string;
};

/* -------------------------------------------------------------------------- */
/* Context Definition                                                          */
/* -------------------------------------------------------------------------- */

type EventSetupContextValue = {
  eventData: EventData;
  isLoading: boolean;
  savedEvents: SavedEvent[];
  setEventData: (patch: Partial<EventData>) => void;
  resetEventData: () => void;
  addSavedEvent: (ev: any) => void;
  deleteSavedEvent: (id: string | number) => void;
};

const EventSetupContext = createContext<EventSetupContextValue | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */

export function EventSetupProvider({ children }: { children: ReactNode }) {
  const [eventData, setEventDataState] = useState<EventData>(defaultEventData);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  // Fetch event context when event ID changes
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Check for /event/123/setup
      const match = location.pathname.match(/\/event\/(\d+)\/setup/);
      const id = match ? match[1] : null;

      if (!id) {
        if (isMounted) {
          setIsLoading(false);
          // Ensure fresh state if on setup page but not editing
          if (location.pathname.includes('/setup/')) {
          }
        }
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/api/events/${id}/context`);

        if (res.ok) {
          const dbData = await res.json();
          if (isMounted) {
            setEventDataState((prev) => ({ ...prev, ...dbData }));
          }
        }
      } catch (e) {
        console.error("Context fetch failed", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, [location.pathname]);


  // 2. FETCH DASHBOARD LIST (All Events) on Mount
  const fetchDashboardEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events`);
      if (res.ok) {
        const list = await res.json();
        setSavedEvents(list);
      } else {
        console.warn("Dashboard fetch failed:", res.status);
      }
    } catch (e) {
      console.error("Failed to load dashboard events", e);
    }
  };

  useEffect(() => {
    fetchDashboardEvents();
  }, []); // Runs once when app starts


  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const setEventData = (patch: Partial<EventData>) => {
    setEventDataState((prev) => ({ ...prev, ...patch }));
  };

  const resetEventData = () => {
    setEventDataState(defaultEventData);
  };

  const addSavedEvent = (ev: any) => {
    console.log("Adding event locally and refreshing list...");
    setSavedEvents((prev) => [...prev, ev]);
  };

  const deleteSavedEvent = (id: string | number) => {
    setSavedEvents((prev) => prev.filter(e => e.id !== String(id)));
  };

  const value = useMemo(
    () => ({
      eventData,
      isLoading,
      savedEvents,
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