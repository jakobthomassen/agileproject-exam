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
  onChange,
}: {
  label: string;
  value: any;
  type: string;
  onChange: (newValue: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const icon = ICON_MAP[type] || <HelpCircle size={16} />;

  return (
    <div className={styles.checkRow}>
      <div className={styles.checkRowLeft}>
        {icon}
        <span className={styles.checkRowLabel}>{label}</span>
      </div>
      <div className={styles.checkRowRight}>
        {isEditing ? (
          <>
            <input
              type={type === "number" ? "number" : type === "date" ? "date" : type === "time" ? "time" : "text"}
              value={editValue || ""}
              onChange={(e) => setEditValue(e.target.value)}
              className={styles.checkRowInput}
            />
            <button onClick={handleSave} className={styles.iconButton}>
              <Check size={16} />
            </button>
            <button onClick={handleCancel} className={styles.iconButton}>
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <span className={styles.checkRowValue}>{value || "—"}</span>
            <button onClick={() => setIsEditing(true)} className={styles.iconButton}>
              <Pencil size={16} />
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

