import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";
import ReactMarkdown from "react-markdown";
import {
  MapPin, Calendar, Clock, Type, Hash, HelpCircle,
  Loader2, Pencil
} from 'lucide-react';

// Components
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TwoColumn } from "../components/ui/Grid";
import { BackButton } from "../components/ui/BackButton";
import { SetupPageHeader } from "../components/ui/SetupPageHeader";
import { TextInput } from "../components/ui/TextInput";
import styles from "./SetupAI.module.css";

// Types
type ChatMessage = { sender: "user" | "assistant"; text: string };

type SidebarItem = {
  key: string;
  label: string;
  value: any;
  component: string;
  type?: string; // Support both component and type
};

type APIResponse = {
  message: string;
  ui_payload: SidebarItem[];
  event_id?: number;
  type?: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  text: <Type size={14} />,
  number: <Hash size={14} />,
  date: <Calendar size={14} />,
  time: <Clock size={14} />,
  location: <MapPin size={14} />,
};

// Friendly placeholder text for empty fields
const PLACEHOLDER_MAP: Record<string, string> = {
  event: "Click to add event name",
  date: "Click to set date",
  time: "Click to set time",
  location: "Click to set location",
  description: "Click to add description",
  default: "Click to add value",
};

function getPlaceholder(label: string, type: string): string {
  const key = label.toLowerCase();
  if (PLACEHOLDER_MAP[key]) return PLACEHOLDER_MAP[key];
  if (PLACEHOLDER_MAP[type]) return PLACEHOLDER_MAP[type];
  return PLACEHOLDER_MAP.default;
}

/**
 * EditableField - A clean, modern editable field component
 * Displays a label and value, switches to input on click
 */
function EditableField({
  label,
  value,
  type,
  onChange
}: {
  label: string;
  value: any;
  type: string;
  onChange?: (val: any) => void;
}) {
  const Icon = ICON_MAP[type] || <HelpCircle size={14} />;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value ?? "");
  const [isHovered, setIsHovered] = useState(false);

  // Sync draft with value when value changes externally
  useEffect(() => {
    if (!isEditing) {
      setDraft(value ?? "");
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode AND ensure draft has current value
  useEffect(() => {
    if (isEditing) {
      // Always sync draft to current value when entering edit mode
      setDraft(value ?? "");

      // Focus and select after a small delay to ensure value is set
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          if (type !== "date" && type !== "time") {
            inputRef.current.select();
          }
        }
      }, 10);
    }
  }, [isEditing, value, type]);

  // Format display value nicely
  const formatDisplayValue = (val: any): string => {
    if (!val) return "";
    if (type === "date") {
      try {
        return new Date(val).toLocaleDateString();
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const displayValue = formatDisplayValue(value);
  const hasValue = value !== null && value !== undefined && value !== "";

  // Determine input type
  const getInputType = () => {
    switch (type) {
      case "date": return "date";
      case "time": return "time";
      case "number": return "number";
      default: return "text";
    }
  };

  const handleSave = () => {
    if (onChange) {
      onChange(draft);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(value ?? "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "description") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const isDescription = label.toLowerCase().includes("description");

  return (
    <div
      className="group relative rounded-lg transition-all duration-150 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!isEditing && onChange) {
          setIsEditing(true);
        }
      }}
      style={{
        padding: "14px 16px",
        marginBottom: "10px",
        minHeight: "56px",
        backgroundColor: isEditing
          ? "#252a3a"
          : isHovered
            ? "#353b4d"
            : "#2a2f3f",
        border: isEditing
          ? "1px solid #10b981"
          : isHovered
            ? "1px solid #4b5563"
            : "1px solid transparent",
        boxShadow: isHovered && !isEditing ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
      }}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-400">{Icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </span>

        {/* Pencil icon on hover (only in display mode) */}
        {!isEditing && onChange && (
          <Pencil
            size={14}
            className="ml-auto transition-all duration-150"
            style={{
              opacity: isHovered ? 0.8 : 0,
              color: isHovered ? "#10b981" : "#6b7280",
            }}
          />
        )}
      </div>

      {/* Value / Input */}
      {!isEditing ? (
        <div className="min-h-[28px] flex items-center">
          {hasValue ? (
            <span className="text-base font-medium text-gray-100">{displayValue}</span>
          ) : (
            <span className="text-gray-500 italic text-sm">
              {getPlaceholder(label, type)}
            </span>
          )}
        </div>
      ) : (
        <div onClick={(e) => e.stopPropagation()}>
          {isDescription ? (
            // Textarea for description fields - fixed height, non-resizable, full width
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="
                w-full rounded-md px-4 py-3 text-base
                !text-white !opacity-100 caret-emerald-400
                border border-gray-500
                focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
                placeholder:text-gray-400
              "
              style={{
                backgroundColor: '#2c3140',
                height: '12rem',
                resize: 'none',
                overflow: 'auto',
                color: '#ffffff',
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder(label, type)}
            />
          ) : type === "date" || type === "time" ? (
            // Special styling for date/time inputs
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type={getInputType()}
                  className="
                    w-full rounded-md px-4 py-3 text-base
                    !text-white !opacity-100 caret-emerald-400
                    border border-gray-500
                    focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
                    cursor-pointer
                  "
                  style={{
                    backgroundColor: '#2c3140',
                    minHeight: '48px',
                    colorScheme: 'dark',
                    color: '#ffffff',
                  }}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          ) : (
            // Regular text/number input
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={getInputType()}
              className="
                w-full rounded-md px-3 py-2.5 text-base
                !text-white !opacity-100 caret-emerald-400
                border border-gray-500
                focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
                placeholder:text-gray-400
              "
              style={{
                backgroundColor: '#2c3140',
                color: '#ffffff',
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder(label, type)}
            />
          )}

          {/* Helper text */}
          <div className="flex justify-between items-center mt-2 text-xs">
            {type === "time" ? (
              <span className="text-gray-500">Click the input or type HH:MM</span>
            ) : type === "date" ? (
              <span className="text-gray-500">Click to open date picker</span>
            ) : (
              <span></span>
            )}
            <span className="text-gray-500">
              Enter to save · Esc to cancel
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SetupAI() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { eventData, setEventData, resetEventData } = useEventSetup();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);


  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Refs for auto-scrolling sidebar to changed fields after AI updates
  const prevChecklistDataRef = useRef<SidebarItem[] | null>(null);
  const hasMountedRef = useRef(false);
  const pendingAiScrollRef = useRef(false);

  // --- Restore History OR Fetch Greeting on Mount ---
  // --- Restore History OR Fetch Greeting on Mount ---
  // --- Restore History OR Fetch Greeting on Mount ---
  useEffect(() => {
    async function initChat() {
      if (eventId) {
        // Existing Event: Load History
        try {
          console.log(`Restoring history for Event ${eventId}...`);
          const res = await axios.get(`${API_URL}/api/events/${eventId}/history`);
          const history = res.data;

          if (Array.isArray(history) && history.length > 0) {
            setMessages(history);
          }
        } catch (e) {
          console.error("Failed to load history", e);
        }
      } else {
        // New Event: START FRESH
        // Critical: Clear any lingering context from previous sessions
        resetEventData();
        setMessages([]); // Ensure messages are cleared locally too

        // Setup initial greeting
        try {
          // Only fetch greeting if we don't have messages (which we just cleared, but good for safety)
          setThinking(true);
          const res = await axios.get(`${API_URL}/api/chat/greeting`);
          setMessages([{ sender: "assistant", text: res.data.message }]);
        } catch (e) {
          console.error("Failed to fetch greeting", e);
          setMessages([{ sender: "assistant", text: "Hi! Describe your event to get started." }]);
        } finally {
          setThinking(false);
        }
      }
    }

    initChat();
  }, [eventId]);

  const [checklistData, setChecklistData] = useState<SidebarItem[]>(
    eventData?.ui_payload || []
  );

  useEffect(() => {
    if (eventData?.ui_payload) {
      setChecklistData(eventData.ui_payload);
    }
  }, [eventData]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  // Auto-scroll sidebar to changed fields after AI updates
  useEffect(() => {
    // Skip on initial mount
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevChecklistDataRef.current = checklistData ? [...checklistData] : null;
      return;
    }

    // Only auto-scroll if this update came from the AI (not manual user edits)
    if (!pendingAiScrollRef.current) {
      prevChecklistDataRef.current = checklistData ? [...checklistData] : null;
      return;
    }
    pendingAiScrollRef.current = false;

    // Skip if no current data
    if (!checklistData || checklistData.length === 0) {
      prevChecklistDataRef.current = null;
      return;
    }

    const prevData = prevChecklistDataRef.current;

    // Find indices of fields that changed
    const changedIndices: number[] = [];
    checklistData.forEach((item, idx) => {
      const prevItem = prevData?.[idx];
      // Check if this is a new field or value changed
      if (!prevItem || item.value !== prevItem.value) {
        changedIndices.push(idx);
      }
    });

    // Update ref for next comparison
    prevChecklistDataRef.current = [...checklistData];

    // If no changes detected, don't scroll
    if (changedIndices.length === 0) return;

    // Get the field furthest down in the sidebar (highest index)
    const targetIndex = Math.max(...changedIndices);

    // Use requestAnimationFrame to ensure DOM has updated before scrolling
    requestAnimationFrame(() => {
      const container = previewContainerRef.current;
      const target = itemRefs.current[targetIndex];
      if (!container || !target) return;

      // Center the target field in the visible container (with small upward adjustment)
      const verticalOffset = 15; // pixels to shift view upward for better visual centering
      const targetTop = target.offsetTop - (container.clientHeight / 2) + (target.clientHeight / 2) - verticalOffset;
      // Clamp to valid scroll range
      const maxScroll = container.scrollHeight - container.clientHeight;
      const clampedScrollTop = Math.max(0, Math.min(targetTop, maxScroll));

      container.scrollTo({
        top: clampedScrollTop,
        behavior: "smooth",
      });
    });
  }, [checklistData]);

  // --- SEND MESSAGE ---
  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { sender: "user", text: text },
    ];
    setMessages(newMessages);

    setInput("");
    setThinking(true);

    try {
      // Resolve ID (From URL or Context)
      let currentId = eventId ? parseInt(eventId) : (eventData.id ? Number(eventData.id) : null);
      if (Number.isNaN(currentId)) currentId = null;

      // Regular JSON payload (no file)
      const payload = {
        message: text,
        event_id: currentId
      };

      // Call API
      const res = await axios.post<APIResponse>(`${API_URL}/api/chat`, payload);
      var data = res.data;

      console.log("API Response:", {
        event_id: data.event_id,
        ui_payload_length: data.ui_payload?.length || 0,
        ui_payload: data.ui_payload
      });

      // Handle Response
      if (data.message) {
        setMessages(prev => [...prev, { sender: "assistant", text: data.message }]);
      }

      if (data.event_id) {
        console.log("Updating state with event_id:", data.event_id);
        const updated = {
          ...eventData,
          id: data.event_id,
          ui_payload: data.ui_payload ?? []
        };
        console.log("Updated eventData:", updated);
        setEventData(updated);

        // Update URL without navigation
        if (!eventId) {
          const newUrl = `/event/${data.event_id}/setup/ai`;
          window.history.replaceState(null, "", newUrl);
        }
      }

      if (data.ui_payload && Array.isArray(data.ui_payload)) {
        console.log("Updating ui_payload:", data.ui_payload);
        pendingAiScrollRef.current = true; // Flag to trigger auto-scroll
        setEventData({
          ...eventData,
          ui_payload: data.ui_payload
        });
      }

    } catch (error) {
      console.error("AI Request Failed:", error);
      setMessages(prev => [...prev, { sender: "assistant", text: "Error: Could not process request." }]);
    } finally {
      setThinking(false);
    }
  }

  const handleChecklistChange = async (index: number, newValue: any) => {
    const item = checklistData[index];
    if (!item) return;

    const updated = checklistData.map((item, i) =>
      i === index ? { ...item, value: newValue } : item
    );

    setChecklistData(updated);

    setEventData({
      ...(eventData || {}),
      ui_payload: updated
    });

    // Save to database if event exists
    const currentId = eventId ? parseInt(eventId) : (eventData.id ? Number(eventData.id) : null);
    if (currentId && !Number.isNaN(currentId)) {
      try {
        await axios.patch(
          `${API_URL}/api/events/${currentId}/sidebar-field`,
          {
            field_key: item.key || item.label,
            field_value: newValue
          }
        );
        console.log(`Saved ${item.label} update to database`);
      } catch (error) {
        console.error("Failed to save sidebar edit:", error);
        // Fail silently - local state already updated
      }
    }
  };

  // --- NAVIGATION LOGIC ---
  const handleContinue = () => {
    // 1. Priority: URL Param (Editing existing event)
    if (eventId) {
      navigate(`/event/${eventId}/setup/summary?from=ai`);
      return;
    }

    // 2. Priority: Context ID
    if (eventData.id) {
      navigate(`/event/${eventData.id}/setup/summary?from=ai`);
      return;
    }

    // 3. Priority: Search List
    const list = eventData.ui_payload || [];
    const idItem = list.find(item => item.key === "id" || item.label.toLowerCase() === "id");

    if (idItem?.value) {
      navigate(`/event/${idItem.value}/setup/summary?from=ai`);
      return;
    }

    // 4. Fallback
    console.warn("No ID found, redirecting to generic summary");
    navigate("/setup/summary?from=ai");
  };

  const getFieldType = (item: SidebarItem): string => {
    return item.type || item.component || "text";
  };

  return (
    <PageContainer kind='solid' maxWidth={1200}>
      <div className={styles.pageInner}>
        <BackButton to={eventId ? `/event/${eventId}/setup/method` : "/setup/method"}>
          Back
        </BackButton>

        <SetupPageHeader title="AI Assisted Setup" description="Chat with the agent to configure your event." />

        <TwoColumn>
          {/* Chat Panel */}
          <Card padding={16}>
            <div className={styles.chatPanel}>
              <div className={styles.chatMessages} ref={chatContainerRef}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.chatRow} ${m.sender === "user"
                      ? styles.chatRowUser
                      : styles.chatRowAssistant
                      }`}
                  >
                    <span
                      className={
                        m.sender === "user"
                          ? styles.chatBubbleUser
                          : styles.chatBubbleAssistant
                      }
                    >
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </span>
                  </div>
                ))}
                {thinking && (
                  <div className={styles.thinkingRow}>
                    <Loader2
                      className={`${styles.spin} text-green-400`}
                      size={18}
                    />
                    <span className='ml-2 text-gray-400 text-sm'>
                      Thinking...
                    </span>
                  </div>
                )}
              </div>

              {/* Input Row */}
              <div className={styles.chatInputRow}>
                <TextInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder='Type here...'
                />

                <Button onClick={() => sendMessage()} disabled={thinking}>
                  Send
                </Button>
              </div>
            </div>
          </Card>

          {/* Checklist Panel */}
          <Card padding={16}>
            <div className={styles.checklistPanel}>
              <h3 className={styles.checklistHeading}>Event Details</h3>

              <div
                ref={previewContainerRef}
                className={`${styles.checklistScroll} space-y-1`}
              >
                {!checklistData || checklistData.length === 0 ? (
                  <div className='text-slate-500 italic text-sm py-8 text-center rounded-lg bg-slate-800/20'>
                    Event details will appear here as you chat with the AI...
                  </div>
                ) : (
                  checklistData.map((item, idx) => (
                    <div
                      key={item.key || `${item.label}-${idx}`}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                    >
                      <EditableField
                        label={item.label}
                        value={item.value}
                        type={getFieldType(item)}
                        onChange={(newVal) => handleChecklistChange(idx, newVal)}
                      />
                    </div>
                  ))
                )}
              </div>

              <Button
                fullWidth
                onClick={handleContinue}
                className={styles.checklistContinueButton}
              >
                Continue
              </Button>
            </div>
          </Card>
        </TwoColumn>
      </div>
    </PageContainer >
  );
}
