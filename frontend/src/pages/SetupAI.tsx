import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";
import ReactMarkdown from "react-markdown";
import { 
  MapPin, Calendar, Clock, Type, Hash, HelpCircle, 
  Loader2, Paperclip,
  Pencil, Check, X          
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
  text: <Type size={16} />,
  number: <Hash size={16} />,
  date: <Calendar size={16} />,
  time: <Clock size={16} />,
  location: <MapPin size={16} />,
};

function DynamicCheckRow({
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
  const Icon = ICON_MAP[type] || <HelpCircle size={16} />;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>("");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  // display value nicely
  let displayValue: any = value;
  if (type === "date" && value) {
    try {
      displayValue = new Date(value).toLocaleDateString();
    } catch {
      displayValue = value;
    }
  }

  const inputType =
    type === "number" ? "number" : type === "date" ? "date" : "text";

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

  return (
    <div className="flex justify-between items-baseline py-2 text-sm">
      {/* left: icon + label */}
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-gray-500">{Icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* right: value + tiny "(edit)" */}
      <div className="flex items-baseline gap-2 max-w-[60%] justify-end">
        {!isEditing ? (
          <>
            <span className="text-white break-words">
              {displayValue ? (
                String(displayValue)
              ) : (
                <span className="text-gray-600 text-xs italic">(MISSING)</span>
              )}
            </span>
            {onChange && (
              <button
                type="button"
                className="text-[11px] text-gray-400 hover:text-green-400 underline"
                onClick={() => setIsEditing(true)}
              >
                edit
              </button>
            )}
          </>
        ) : (
          <>
            <input
              type={inputType}
              className="bg-transparent border-b border-gray-500 text-xs text-white px-1 py-0.5 max-w-[140px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
            />
            <button
              type="button"
              className="text-[11px] text-green-300 hover:text-green-400"
              onClick={handleSave}
            >
              save
            </button>
            <button
              type="button"
              className="text-[11px] text-gray-400 hover:text-gray-300"
              onClick={handleCancel}
            >
              cancel
            </button>
          </>
        )}
      </div>
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
  
  // NOTE: If you haven't updated EventData interface yet, this might still show red.
  // Update src/context/EventSetupContext.tsx to include 'ui_payload' to fix it completely.
  const [checklistData, setChecklistData] = useState<ChecklistItem[]>(
    eventData?.ui_payload || []
  );

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

  // --- 1. HANDLE FILE SELECT (Triggers Auto-Send) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const text = input.trim();
    if (!text && !fileToUpload) return;

    let userMessageText = text;
    if (fileToUpload) {
      userMessageText = `📄 Uploaded file: **${fileToUpload.name}**`;
    }

    const newMessages: ChatMessage[] = [
      ...messages,
      { sender: "user", text: userMessageText },
    ];
    setMessages(newMessages);

    setInput("");
    setThinking(true);

    try {
      const formData = new FormData();
      formData.append(
        "messages_json",
        JSON.stringify(
          newMessages.map((m) => ({ role: m.sender, content: m.text }))
        )
      );
      formData.append("known_fields_json", JSON.stringify(eventData || {}));

      if (fileToUpload) {
        formData.append("file", fileToUpload);
      }

      const res = await axios.post(
        "http://localhost:8000/ai/extract",
        formData
      );
      const data = res.data;

      // --- FIX: Spread object directly instead of using a function ---
      setEventData({ ...eventData, ...data });

      if (data.ui_payload && Array.isArray(data.ui_payload)) {
        setChecklistData(data.ui_payload);
      }

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: data.message },
        ]);
      }
    } catch (error: any) {
      console.error("AI Request Failed:", error);

      let message = "Error: Could not process request.";

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;

        if (status === 503 && typeof detail === "string") {
          message = detail;
        }
      }

      setMessages((prev) => [...prev, { sender: "assistant", text: message }]);
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
            <div className={styles.checklistCardInner}>
              <h3 className={styles.checklistHeading}>Event Details</h3>

              <div className='space-y-0 mb-4'>
                {!checklistData || checklistData.length === 0 ? (
                  <div className='text-gray-500 italic text-sm py-4 text-center'>
                    Details will appear here...
                  </div>
  ) : (
    checklistData.map((item, idx) => (
      <DynamicCheckRow
        key={idx}
        label={item.label}
        value={item.value}
        type={item.type}
        onChange={(newVal) => handleChecklistChange(idx, newVal)}
      />
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

