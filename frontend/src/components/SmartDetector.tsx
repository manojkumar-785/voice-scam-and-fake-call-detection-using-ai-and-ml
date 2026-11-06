import { useEffect, useRef, useState } from "react";

type Props = {
  setResult: (result: any) => void;
};

function SmartDetector({ setResult }: Props) {

  const [status, setStatus] = useState("Ready");
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [volume, setVolume] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const chunks = useRef<Blob[]>([]);

  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);

  const animationFrame = useRef<number>();

  const silenceTimer = useRef<number | null>(null);
  const threshold = useRef(22);

const backgroundNoise = useRef(0);
const speechFrames = useRef(0);


  const SILENCE_DELAY = 3000;
    const uploadRecording = async (blob: Blob) => {

    try {

      setStatus("📤 Uploading...");

      const formData = new FormData();

      formData.append(
        "audio",
        blob,
        "smart_recording.webm"
      );

      const response = await fetch(
        "http://127.0.0.1:5000/detect",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {

        alert(data.message);

        setStatus("Error");

        return;

      }

      setResult(data);

      setStatus("✅ Analysis Complete");

    }

    catch (err) {

      console.error(err);

      setStatus("Upload Failed");

    }

  };
    const stopRecording = () => {

    if (!mediaRecorder.current) return;

    if (mediaRecorder.current.state !== "inactive") {

      mediaRecorder.current.stop();

    }

    setRecording(false);

    setStatus("🟢 Listening...");

  };
    const startRecording = () => {

    if (!streamRef.current) return;

    chunks.current = [];

    const recorder = new MediaRecorder(streamRef.current);

    mediaRecorder.current = recorder;

    recorder.ondataavailable = (e) => {

      if (e.data.size > 0)

        chunks.current.push(e.data);

    };

    recorder.onstop = () => {

      const blob = new Blob(

        chunks.current,

        {

          type: "audio/webm"

        }

      );

      uploadRecording(blob);

    };

    recorder.start();

    setRecording(true);

    setStatus("🔴 Recording...");

  };
    const monitorAudio = () => {

    if (!analyser.current) return;

    const dataArray = new Uint8Array(
      analyser.current.frequencyBinCount
    );

    const check = () => {

      analyser.current!.getByteFrequencyData(dataArray);

      let sum = 0;

      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }

      const average = sum / dataArray.length;

      setVolume(Math.round(average));

      if (average > threshold.current) {

    speechFrames.current++;

    if (
        speechFrames.current > 15 &&
        !recording
    ) {

        console.log("🎤 Confirmed Speech");

        startRecording();

    }

    if (silenceTimer.current) {

        clearTimeout(silenceTimer.current);

        silenceTimer.current = null;

    }

} else {
  speechFrames.current = 0;

  if (recording && !silenceTimer.current) {

    silenceTimer.current = window.setTimeout(() => {

      console.log("🔇 Silence detected");

      stopRecording();

      silenceTimer.current = null;

    }, SILENCE_DELAY);

  }

}
      animationFrame.current =
        requestAnimationFrame(check);

    };

    check();

  };
    const startListening = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      streamRef.current = stream;

      audioContext.current =
        new AudioContext();

      const source =
        audioContext.current.createMediaStreamSource(stream);

      analyser.current =
        audioContext.current.createAnalyser();

      analyser.current.fftSize = 512;

      source.connect(analyser.current);

      setListening(true);

      setStatus("🟢 Listening...");
      // ------------------------------
// Automatic Background Calibration
// ------------------------------

setStatus("🎧 Calibrating Microphone...");

let totalNoise = 0;
let samples = 0;

const calibrationArray = new Uint8Array(
  analyser.current!.frequencyBinCount
);

const calibration = setInterval(() => {

  analyser.current!.getByteFrequencyData(calibrationArray);

  let sum = 0;

  for (let i = 0; i < calibrationArray.length; i++) {
    sum += calibrationArray[i];
  }

  totalNoise += sum / calibrationArray.length;

  samples++;

}, 100);

setTimeout(() => {

  clearInterval(calibration);

  backgroundNoise.current = totalNoise / samples;

  threshold.current = backgroundNoise.current + 12;

  console.log(
    "Background Noise:",
    backgroundNoise.current
  );

  console.log(
    "Threshold:",
    threshold.current
  );

  setStatus("🟢 Listening...");

  monitorAudio();

}, 2000);

return;


    }

    catch (err) {

      console.error(err);

      alert("Unable to access microphone.");

    }

  };
    const stopListening = () => {

    if (animationFrame.current) {

      cancelAnimationFrame(animationFrame.current);

    }

    if (streamRef.current) {

      streamRef.current.getTracks().forEach(track => track.stop());

    }

    audioContext.current?.close();

    setListening(false);

    setRecording(false);

    setStatus("Ready");

    setVolume(0);

  };
    useEffect(() => {

    return () => {

      stopListening();

    };

  }, []);
    return (

    <div className="upload-card">

      <h2>🤖 Smart AI Detection</h2>

      <div className="upload-box">

        <div
          style={{
            fontSize: "70px",
            marginBottom: "20px"
          }}
        >
          🎧
        </div>

        <h3>{status}</h3>

        <p>
          AI continuously monitors your microphone.
          <br />
          Recording starts automatically when speech is detected.
        </p>

        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#e5e7eb",
            borderRadius: "20px",
            overflow: "hidden",
            marginTop: "25px",
            marginBottom: "25px"
          }}
        >

          <div
            style={{
              width: `${Math.min(volume * 2, 100)}%`,
              height: "100%",
              background:
                recording
                  ? "#ef4444"
                  : "#2563eb",
              transition: "0.1s"
            }}
          />

        </div>

        <h3>

          Volume : {volume}

        </h3>

        <br />

        {

          !listening ?

          (

            <button

              className="analyze-btn"

              onClick={startListening}

            >

              🚀 Start Smart Detection

            </button>

          )

          :

          (

            <button

              className="analyze-btn"

              style={{
                background: "#ef4444"
              }}

              onClick={stopListening}

            >

              ⏹ Stop Listening

            </button>

          )

        }

      </div>

    </div>

  );

}

export default SmartDetector;