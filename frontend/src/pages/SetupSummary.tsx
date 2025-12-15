import { useNavigate, useParams } from "react-router-dom";
import { useEventSetup } from "../context/EventSetupContext";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { BackButton } from "../components/ui/BackButton";
import { SetupPageHeader } from "../components/ui/SetupPageHeader";
import { EventSummary } from "../components/event/EventSummary";
import styles from "./SetupSummary.module.css";
import { Loader2, Upload, FileText, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { API_URL } from "../config";

export default function SetupSummary() {
  const navigate = useNavigate();

  // 1. Get the Event ID from the URL (e.g. "24")
  const { eventId } = useParams();

  // 2. Get Data & Actions from Context
  const { eventData, isLoading, addSavedEvent, resetEventData, setEventData } = useEventSetup();

  // 3. Participant CSV Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // 4. Image Upload
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventImage, setEventImage] = useState<string | null>(null);

  // 5. Fetch event data from DB if eventId exists (to get accurate participant count)
  const [dbEventData, setDbEventData] = useState<any>(null);

  useEffect(() => {
    async function fetchEventData() {
      const currentId = eventId ? parseInt(eventId) : (eventData.id ? Number(eventData.id) : null);
      if (currentId && !Number.isNaN(currentId)) {
        try {
          const res = await axios.get(`${API_URL}/api/events/${currentId}/context`);
          if (res.data) {
            setDbEventData(res.data);
            setEventData({
              ...eventData,
              participants: res.data.participants || 0,
              athletes: res.data.participants || 0,
              image: res.data.image || null
            });

            // Set image if available
            if (res.data.image) {
              setEventImage(res.data.image);
            }
          }
        } catch (error) {
          console.error("Failed to fetch event data:", error);
        }
      }
    }

    fetchEventData();
  }, [eventId, eventData.id]);

  // 3. Determine Back Link
  // If editing an existing event (ID exists), go back to its specific AI page.
  // Otherwise, go to the generic AI setup.
  const backLink = eventId
    ? `/event/${eventId}/setup/ai`
    : "/setup/ai";

  async function handleFinish() {
    try {
      // If event already exists (has ID), it was created by AI flow - just redirect
      if (eventData.id) {
        resetEventData();
        navigate("/dashboard");
        return;
      }

      // Generate event code
      const finalCode = eventData.eventCode || Math.random().toString(36).substring(2, 8).toUpperCase();

      // Prepare payload for backend
      const payload = {
        eventName: eventData.eventName || null,
        venue: eventData.venue || null,
        startDateTime: eventData.startDateTime || null,
        endDateTime: eventData.endDateTime || null,
        rules: eventData.rules || null,
        scoringMode: eventData.scoringMode || null,
        eventCode: finalCode
      };

      // Create event in database
      const response = await axios.post(`${API_URL}/api/events`, payload);

      if (response.data && response.data.event_id) {
        // Success - redirect to dashboard
        resetEventData();
        navigate("/dashboard");
      } else {
        alert("Failed to create event. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert("Only CSV files are allowed.");
      return;
    }

    // Get event ID
    const currentId = eventId ? parseInt(eventId) : (eventData.id ? Number(eventData.id) : null);

    if (!currentId || Number.isNaN(currentId)) {
      alert("Please save the event first before uploading participants.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/api/events/${currentId}/participants/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.created > 0) {
        alert(`Successfully uploaded ${response.data.created} participant(s)!`);

        try {
          const res = await axios.get(`${API_URL}/api/events/${currentId}/context`);
          if (res.data) {
            setDbEventData(res.data);
            setEventData({
              ...eventData,
              participants: res.data.participants || 0,
              athletes: res.data.participants || 0
            });
          }
        } catch (error) {
          console.error("Failed to refresh event data:", error);
        }
      } else {
        alert("No participants were uploaded. Please check your CSV format.");
      }

      if (response.data.errors && response.data.errors.length > 0) {
        console.warn("Upload errors:", response.data.errors);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Failed to upload participants:", error);
      alert(error.response?.data?.detail || "Failed to upload participants. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function triggerFileDialog() {
    fileInputRef.current?.click();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed.");
      return;
    }

    // Get event ID
    const currentId = eventId ? parseInt(eventId) : (eventData.id ? Number(eventData.id) : null);

    if (!currentId || Number.isNaN(currentId)) {
      alert("Please save the event first before uploading an image.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(
        `${API_URL}/api/events/${currentId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Refresh image display
      const imageRes = await axios.get(`${API_URL}/api/events/${currentId}/image`);
      if (imageRes.data && imageRes.data.image) {
        setEventImage(imageRes.data.image);
        setEventData({
          ...eventData,
          image: imageRes.data.image
        });
      }

      alert("Image uploaded successfully!");

      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      alert(error.response?.data?.detail || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  function triggerImageDialog() {
    imageInputRef.current?.click();
  }

  // 8. Loading State
  // Prevents rendering "Untitled Event" while fetching from Python
  if (isLoading) {
    return (
      <PageContainer kind="solid">
        <div className="flex h-[50vh] w-full items-center justify-center gap-2 text-gray-400">
          <Loader2 className="animate-spin" />
          <span>Loading event data...</span>
        </div>
      </PageContainer>
    );
  }

  // 9. Render Summary
  return (
    <PageContainer kind="solid">
      <div className={styles.pageInner}>
        {/* Dynamic Back Button */}
        <BackButton to={backLink}>Back</BackButton>

        <SetupPageHeader
          title="Event summary"
          description="Review the event configuration before saving it."
        />

        {/* The Card Component */}
        <EventSummary
          event={{
            ...eventData,
            // Use DB participant count if available, otherwise fall back to context
            participants: dbEventData?.participants ?? eventData.participants,
            athletes: dbEventData?.participants ?? eventData.athletes,
            // Use uploaded image if available
            image: eventImage || eventData.image
          }}
          showHero
          showRules
        />

        {/* Image Upload Section */}
        {(eventId || eventData.id) && (
          <div className={styles.uploadSection}>
            <div className={styles.uploadHeader}>
              <ImageIcon size={18} />
              <span>Event Image</span>
            </div>
            <p className={styles.uploadDescription}>
              Upload an image to display as the event poster.
            </p>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <Button
              onClick={triggerImageDialog}
              disabled={uploadingImage}
              variant="outline"
              style={{ width: "100%" }}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="animate-spin" size={16} style={{ marginRight: "8px" }} />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon size={16} style={{ marginRight: "8px" }} />
                  {eventImage ? "Change Image" : "Upload Image"}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Participant Upload Section */}
        {(eventId || eventData.id) && (
          <div className={styles.uploadSection}>
            <div className={styles.uploadHeader}>
              <FileText size={18} />
              <span>Upload Participants</span>
            </div>
            <p className={styles.uploadDescription}>
              Upload a CSV file with participant names and emails. Format: name,email
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <Button
              onClick={triggerFileDialog}
              disabled={uploading}
              variant="outline"
              style={{ width: "100%" }}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} style={{ marginRight: "8px" }} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} style={{ marginRight: "8px" }} />
                  Choose CSV File
                </>
              )}
            </Button>
          </div>
        )}

        {/* Bottom Buttons */}
        <div className={styles.buttonsRow}>
          <Button
            variant="ghost"
            onClick={() => navigate(backLink)}
          >
            Back
          </Button>

          <Button onClick={handleFinish}>
            Confirm & save
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}