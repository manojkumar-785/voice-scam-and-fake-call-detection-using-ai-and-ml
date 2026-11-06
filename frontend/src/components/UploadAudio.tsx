
import { useEffect, useState } from "react";

type UploadAudioProps = {
  setResult: (result: any) => void;
};

function UploadAudio({ setResult }: UploadAudioProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create audio preview URL
  useEffect(() => {
    if (!file) {
      setAudioUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0] || null;

    setFile(selectedFile);
    setHasPlayed(false);
    setResult(null);
  };

  // Send the complete original audio file to Flask
  const sendAudioToBackend = async () => {
    if (!file || !hasPlayed || loading) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);

      console.log("Sending complete audio to Flask...");

      const response = await fetch(
        "http://127.0.0.1:5000/detect",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("AI RESULT:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Audio analysis failed.");
        return;
      }

      setResult(data);

      window.dispatchEvent(
        new CustomEvent("voiceScamResult", {
          detail: data,
        })
      );

      alert("Audio analysis completed successfully!");

    } catch (error) {
      console.error("Audio upload error:", error);
      alert("Unable to connect to Flask backend.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <h2>🎧 Voice Scam Detection</h2>

      <div className="upload-box">

        <div style={{ fontSize: "55px" }}>
          🎵
        </div>

        <h3>Upload Recorded Audio</h3>

        <p>
          Select an existing audio recording
          <br />
          MP3 • MPEG • WAV • M4A • AAC • WEBM
        </p>

        <input
          type="file"
          accept=".mp3,.mpeg,.mpga,.wav,.m4a,.aac,.webm,audio/*"
          onChange={handleFileChange}
          disabled={loading}
        />

        {file && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "12px",
              background: "#eff6ff",
              textAlign: "left",
            }}
          >
            <p
              style={{
                color: "#1d4ed8",
                fontWeight: "bold",
                wordBreak: "break-word",
              }}
            >
              🎵 {file.name}
            </p>

            <p style={{ color: "#64748b", fontSize: "13px" }}>
              Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>

            <h4>Play Complete Recording</h4>

            <audio
              key={audioUrl}
              controls
              preload="metadata"
              src={audioUrl}
              style={{
                width: "100%",
                marginTop: "10px",
              }}
              onPlay={() => setHasPlayed(false)}
              onEnded={() => {
                setHasPlayed(true);
                console.log("Complete audio playback finished.");
              }}
            />

            {hasPlayed ? (
              <p style={{ color: "#16a34a", fontWeight: "bold" }}>
                ✅ Complete recording played. Ready for analysis.
              </p>
            ) : (
              <p style={{ color: "#d97706", fontSize: "13px" }}>
                ▶ Play the recording from beginning to end before analysis.
              </p>
            )}
          </div>
        )}

        <button
          className="analyze-btn"
          onClick={sendAudioToBackend}
          disabled={!file || !hasPlayed || loading}
          style={{
            marginTop: "20px",
            opacity: !file || !hasPlayed || loading ? 0.5 : 1,
            cursor: !file || !hasPlayed || loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "⏳ Analyzing Complete Audio..."
            : "🚀 Analyze Complete Audio"}
        </button>

        {loading && (
          <p
            style={{
              marginTop: "15px",
              color: "#2563eb",
              fontWeight: "bold",
            }}
          >
            🤖 Converting the complete recording into text
            and performing AI scam detection...
          </p>
        )}

      </div>
    </div>
  );
}

export default UploadAudio;
