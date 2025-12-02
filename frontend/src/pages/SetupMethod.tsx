import { useState, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

/* Corrected paths */
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

/* UI primitives */
import { ClickableCard } from "../components/ui/ClickableCard";
import { Section } from "../components/ui/Section";
// import { Card } from "../components/ui/Card"; // not in use on this page
import { TwoColumn } from "../components/ui/Grid";
import { FilePill } from "../components/ui/FilePill";
import { leadText, muted } from "../components/ui/Text";

export default function SetupMethod() {
  const navigate = useNavigate();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const template = sessionStorage.getItem("selectedTemplate");

  const templateNameMap: Record<string, string> = {
    rating: "Ranking",
    judge_audience: "Battle",
    blank: "Poll"
  };

  const headerTitle = template
    ? `How do you want to set up your ${templateNameMap[template]} event?`
    : "How do you want to set up?";

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setUploadedFiles(prev => [...prev, fileName]);
      setFileUploaded(true);
    }
  }

  function triggerFileDialog() {
    fileInputRef.current?.click();
  }

  const extractedData = {
    venue: "Grand Convention Center",
    dateTime: "2024-03-15 18:00",
    sponsor: "TechCorp International",
    eventName: "Annual Innovation Summit",
    eventType: "Conference",
    participants: 250
  };

  const extractedEntries = [
    { label: "Venue", value: extractedData.venue },
    { label: "Date & Time", value: extractedData.dateTime },
    { label: "Sponsor", value: extractedData.sponsor },
    { label: "Event Name", value: extractedData.eventName },
    { label: "Event Type", value: extractedData.eventType },
    { label: "Participants", value: extractedData.participants }
  ];

  return (
    <PageContainer kind="solid">
      <div style={{ width: "100%" }}>
        <Button
          variant="ghost"
          onClick={() => navigate("/setup")}
          style={{ marginBottom: 16, fontSize: 13, padding: "6px 14px" }}
        >
          ← Back to templates
        </Button>

        <h1 style={{ marginBottom: 10 }}>{headerTitle}</h1>
        <p style={leadText}>
          You can use a standard form, or answer a few high-level questions and
          let the assistant suggest values.
        </p>

        {fileUploaded && (
          <Section padding={24}>
            <TwoColumn>
              <div>
                <h3 style={{ marginBottom: 16 }}>Uploaded files</h3>

                <div style={{ marginBottom: 20 }}>
                  {uploadedFiles.map((file, index) => (
                    <FilePill key={index} name={file} />
                  ))}
                </div>

                <Button variant="ghost" onClick={triggerFileDialog}>
                  + Add another file
                </Button>
              </div>

              <div>
                <h3 style={{ marginBottom: 16 }}>Extracted data</h3>

                <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                  {extractedEntries.map(entry => (
                    <div key={entry.label} style={{ marginBottom: 12 }}>
                      <span style={muted}>{entry.label}:</span>{" "}
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TwoColumn>
          </Section>
        )}

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 32
          }}
        >
          <ClickableCard
            onClick={() => navigate("/setup/ai")}
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3 style={{ marginBottom: 8 }}>AI assisted setup</h3>
            <p style={muted}>
              Describe your event. The assistant will ask follow-up questions and
              suggest values.
            </p>
          </ClickableCard>

          <ClickableCard
            onClick={() => navigate("/setup/manual")}
            style={{ flex: 1, minWidth: 260 }}
          >
            <h3 style={{ marginBottom: 8 }}>Manual setup</h3>
            <p style={muted}>
              Use a structured form to specify values step by step.
            </p>
          </ClickableCard>
        </div>

        {!fileUploaded && (
          <Section padding={24} style={{ marginTop: 48, marginBottom: 0 }}>
            <h3 style={{ marginBottom: 12 }}>Import from file</h3>
            <p style={{ ...muted, marginBottom: 20 }}>
              Upload a configuration file to set up your event quickly.
            </p>
            <Button variant="ghost" onClick={triggerFileDialog}>
              Choose file
            </Button>
          </Section>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept=".json,.csv,.txt"
        />
      </div>
    </PageContainer>
  );
}
