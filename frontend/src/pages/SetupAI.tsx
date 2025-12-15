import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";
import ReactMarkdown from "react-markdown";
import { 
  MapPin, Calendar, Clock, Type, Hash, HelpCircle, 
  Loader2, Paperclip, Pencil
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
type ChecklistItem = { label: string; value: any; type: string };

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
  const { eventData, setEventData } = useEventSetup();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "assistant", text: "Hi! Describe your event" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

const chatContainerRef = useRef<HTMLDivElement | null>(null);
const previewContainerRef = useRef<HTMLDivElement | null>(null);
const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
const [checklistData, setChecklistData] = useState<ChecklistItem[]>(
  eventData?.ui_payload || []
);
const prevLengthRef = useRef<number>(checklistData.length);
const [lastUpdatedIndex, setLastUpdatedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (eventData?.ui_payload) {
      setChecklistData(eventData.ui_payload);
    }
  }, [eventData]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  // Only auto-scroll to bottom when NEW items are added by the AI
  // Auto-scroll checklist to the "newest" field:
  // - If a specific field was just edited, scroll to that field (up or down)
  // - Otherwise, when new items are added by the AI, scroll to the bottom
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const prevLen = prevLengthRef.current;
    const newLen = checklistData.length;

    if (lastUpdatedIndex !== null && itemRefs.current[lastUpdatedIndex]) {
      // Scroll to the last edited field
      itemRefs.current[lastUpdatedIndex]!.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else if (newLen > prevLen) {
      // No specific field marked, but new items were added by AI -> scroll to bottom
      container.scrollTop = container.scrollHeight;
    }

    prevLengthRef.current = newLen;
  }, [checklistData, lastUpdatedIndex]);


  // --- 1. HANDLE FILE SELECT (Triggers Auto-Send) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (thinking) {
    e.target.value = "";
    return;
  }
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        alert("Only CSV files are allowed.");
        return;
      }
      sendMessage(file);
      e.target.value = "";
    }
  };

  // --- 2. SEND MESSAGE (Accepts optional file) ---
  async function sendMessage(fileToUpload?: File) {
    if (thinking) return;

  const text = input.trim();
  if (!text && !fileToUpload) return;

  let userMessageText = text;
  if (fileToUpload) {
    userMessageText = `📄 Uploaded file: **${fileToUpload.name}**`;
  }

  const newMessages: ChatMessage[] = [
    ...messages,
    { sender: "user", text: userMessageText }
  ];

  setMessages(newMessages);
  setInput("");
  setThinking(true);

  try {
    const formData = new FormData();
    formData.append(
      "messages_json",
      JSON.stringify(newMessages.map(m => ({ role: m.sender, content: m.text })))
    );
    formData.append("known_fields_json", JSON.stringify(eventData || {}));

    if (fileToUpload) {
      formData.append("file", fileToUpload);
    }

    const res = await axios.post("http://localhost:8000/ai/extract", formData);
    const data = res.data;

    setEventData({ ...(eventData || {}), ...data });

        if (data.ui_payload && Array.isArray(data.ui_payload)) {
      setChecklistData(data.ui_payload);
      
      setLastUpdatedIndex(
        data.ui_payload.length ? data.ui_payload.length - 1 : null
      );
    }


    if (data.message) {
      setMessages(prev => [...prev, { sender: "assistant", text: data.message }]);
    }
  } catch (error) {
    console.error("AI Request Failed:", error);
    setMessages(prev => [
      ...prev,
      { sender: "assistant", text: "Error: Could not process request." }
    ]);
  } finally {
    setThinking(false);
  }
}

const handleChecklistChange = (index: number, newValue: any) => {
  const updated = checklistData.map((item, i) =>
    i === index ? { ...item, value: newValue } : item
  );

  setChecklistData(updated);

  // Keep eventData in sync so other pages can read updated ui_payload
  setEventData({
    ...(eventData || {}),
    ui_payload: updated
  });

  // Mark this as the "newest" edited field so we scroll to it
  setLastUpdatedIndex(index);
};

  return (
    <PageContainer kind='solid' maxWidth={1200}>
      <div className={styles.pageInner}>
        <BackButton to='/setup/method'>Back</BackButton>
        <SetupPageHeader
          title='AI Assisted Setup'
          description='Chat with the agent to configure your event.'
        />

        <TwoColumn>
          {/* Chat Panel */}
          <Card padding={16}>
            <div className={styles.chatPanel}>
              <div className={styles.chatMessages} ref={chatContainerRef}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.chatRow} ${
                      m.sender === "user"
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
                      className='animate-spin text-green-400'
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
                <input
                  type='file'
                  ref={fileInputRef}
                  accept='.csv,text/csv'
                  className='hidden'
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />

                {/* --- UPLOAD BUTTON: NOW USES <Button> --- */}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={thinking}
                  title='Upload CSV'
                  // Overriding styles to keep it square and icon-centered
                  style={{
                    padding: 0,
                    width: "42px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Paperclip size={20} />
                </Button>

                <TextInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!thinking) {
                        sendMessage();
                      }
                    }
                  }}
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
                      key={idx}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                    >
                      <EditableField
                        label={item.label}
                        value={item.value}
                        type={item.type}
                        onChange={(newVal) => handleChecklistChange(idx, newVal)}
                      />
                    </div>
                  ))
                )}
              </div>

              <Button
                fullWidth
                onClick={() => navigate("/setup/summary")}
                className={styles.checklistContinueButton}
              >
                Continue
              </Button>
            </div>
          </Card>
        </TwoColumn>
  </div>
</PageContainer>
  );
}

