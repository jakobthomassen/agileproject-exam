import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SetupMethod() {
  const navigate = useNavigate();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const template = sessionStorage.getItem("selectedTemplate");

  const templateNameMap: Record<string, string> = {
    rating: "Ranking",
    judge_audience: "Battle",
    blank: "Poll"
  };

  const headerTitle = template
    ? `How do you want to set up your ${templateNameMap[template]} event?`
    : "How do you want to set up?";

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setUploadedFiles([...uploadedFiles, fileName]);
      setFileUploaded(true);
    }
  }

  const extractedData = {
    venue: "Grand Convention Center",
    dateTime: "2024-03-15 18:00",
    sponsor: "TechCorp International",
    eventName: "Annual Innovation Summit",
    eventType: "Conference",
    participants: 250
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #020617, #020617)",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "60px 16px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "960px" }}>
        <button
          onClick={() => navigate("/setup")}
          style={{
            marginBottom: "16px",
            padding: "6px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.7)",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          ← Back to templates
        </button>

        <h1 style={{ marginBottom: "10px" }}>{headerTitle}</h1>
        <p
          style={{
            maxWidth: "520px",
            color: "#d1d5db",
            marginBottom: "24px"
          }}
        >
          You can use a standard form, or answer a few high-level questions and
          let the assistant suggest values.
        </p>

        {fileUploaded && (
          <div
            style={{
              marginBottom: "32px",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(0,255,153,0.3)",
              background: "rgba(15,15,22,0.95)",
              display: "flex",
              gap: "24px",
              flexWrap: "wrap"
            }}
          >
            <div style={{ flex: 1, minWidth: "260px" }}>
              <h3 style={{ marginBottom: "16px" }}>Uploaded Files</h3>
              <div style={{ marginBottom: "20px" }}>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px 14px",
                      marginBottom: "8px",
                      borderRadius: "8px",
                      background: "rgba(0,255,153,0.1)",
                      border: "1px solid rgba(0,255,153,0.2)",
                      color: "#00ff99",
                      fontSize: "14px"
                    }}
                  >
                    📄 {file}
                  </div>
                ))}
              </div>
              <label
                style={{
                  display: "inline-block",
                  padding: "10px 22px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                + Add Another File
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  accept=".json,.csv,.txt"
                />
              </label>
            </div>

            <div style={{ flex: 1, minWidth: "260px" }}>
              <h3 style={{ marginBottom: "16px" }}>Extracted Data</h3>
              <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "#9ca3af" }}>Venue:</span>{" "}
                  <span style={{ color: "#e5e7eb" }}>{extractedData.venue}</span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "#9ca3af" }}>Date & Time:</span>{" "}
                  <span style={{ color: "#e5e7eb" }}>{extractedData.dateTime}</span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "#9ca3af" }}>Sponsor:</span>{" "}
                  <span style={{ color: "#e5e7eb" }}>{extractedData.sponsor}</span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "#9ca3af" }}>Event Name:</span>{" "}
                  <span style={{ color: "#e5e7eb" }}>{extractedData.eventName}</span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "#9ca3af" }}>Event Type:</span>{" "}
                  <span style={{ color: "#e5e7eb" }}>{extractedData.eventType}</span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "#9ca3af" }}>Participants:</span>{" "}
                  <span style={{ color: "#e5e7eb" }}>{extractedData.participants}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: "260px",
              minHeight: "140px",
              padding: "18px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(15,15,22,0.95)",
              cursor: "pointer"
            }}
            onClick={() => navigate("/setup/ai")}
          >
            <h3>AI assisted setup</h3>
            <p style={{ color: "#9ca3af" }}>
              Describe your event. The assistant will ask follow-up questions and suggest values.
            </p>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: "260px",
              minHeight: "140px",
              padding: "18px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(15,15,22,0.95)",
              cursor: "pointer"
            }}
            onClick={() => navigate("/setup/manual")}
          >
            <h3>Manual setup</h3>
            <p style={{ color: "#9ca3af" }}>
              Use a structured form to specify values step by step.
            </p>
          </div>
        </div>

        {!fileUploaded && (
          <div
            style={{
              marginTop: "48px",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(15,15,22,0.95)"
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>Import from file</h3>
            <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
              Upload a configuration file to set up your event quickly.
            </p>
            <label
              style={{
                display: "inline-block",
                padding: "10px 22px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                background: "transparent",
                color: "#e5e7eb",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Choose File
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                accept=".json,.csv,.txt"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
