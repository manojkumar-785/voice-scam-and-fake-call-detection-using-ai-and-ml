import React, {
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  setResult: (result: any) => void;
};

// ==========================================================
// LIVE RECORDING SETTINGS
// ==========================================================



// Maximum recording duration = 10 seconds.
const MAX_RECORDING_TIME = 10000;

// Continuous silence required to stop recording = 1 second.
const SILENCE_TIME = 1000;

// Voice must remain detected before recording starts.
const SPEECH_CONFIRM_TIME = 250;

// Measure background noise before listening.
const CALIBRATION_TIME = 1000;

// Minimum microphone RMS considered as possible voice.
const ABSOLUTE_MIN_VOLUME = 0.0015;

// Adaptive noise threshold.
const NOISE_MULTIPLIER = 1.5;

// Additional threshold above background noise.
const NOISE_MARGIN = 0.001;

// Maximum allowed threshold.
const MAX_ALLOWED_THRESHOLD = 0.015;


const LiveRecorder: React.FC<Props> = ({
  setResult,
}) => {

  // ========================================================
  // STATE
  // ========================================================

  const [status, setStatus] =
    useState("Ready");

  const [microphoneVolume, setMicrophoneVolume] =
    useState(0);

  const [recordingTime, setRecordingTime] =
    useState(0);

  const [isListening, setIsListening] =
    useState(false);

  const [isRecording, setIsRecording] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [silenceProgress, setSilenceProgress] =
    useState(0);

  const [noiseLevel, setNoiseLevel] =
    useState(0);

  const [waveform, setWaveform] =
    useState<number[]>(
      new Array(40).fill(4)
    );

  // ========================================================
  // REFS
  // ========================================================

  const streamRef =
    useRef<MediaStream | null>(null);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const analyserRef =
    useRef<AnalyserNode | null>(null);

  const recorderRef =
    useRef<MediaRecorder | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const isListeningRef =
    useRef(false);

  const isRecordingRef =
    useRef(false);

  const processingRef =
    useRef(false);

  const stoppingRef =
    useRef(false);

  const manuallyStoppedRef =
    useRef(false);

  const recordingStartedAtRef =
    useRef(0);

  const lastSpeechTimeRef =
    useRef(0);

  const speechStartedAtRef =
    useRef<number | null>(null);

  const calibrationStartedAtRef =
    useRef(0);

  const calibrationValuesRef =
    useRef<number[]>([]);

  const noiseFloorRef =
    useRef(0);

  const thresholdRef =
    useRef(ABSOLUTE_MIN_VOLUME);

  // ========================================================
  // CLEANUP
  // ========================================================

  useEffect(() => {

    return () => {

      cleanupAudio();

    };

  }, []);

  // ========================================================
  // CALCULATE RMS
  // ========================================================

  const getRMS = (
    analyser: AnalyserNode
  ): number => {

    const buffer =
      new Float32Array(
        analyser.fftSize
      );

    analyser.getFloatTimeDomainData(
      buffer
    );

    let sum = 0;

    for (
      let i = 0;
      i < buffer.length;
      i++
    ) {

      sum +=
        buffer[i] *
        buffer[i];

    }

    return Math.sqrt(
      sum / buffer.length
    );
  };

  // ========================================================
  // UPDATE WAVEFORM
  // ========================================================

  const updateWaveform = (
    analyser: AnalyserNode
  ) => {

    const buffer =
      new Uint8Array(
        analyser.fftSize
      );

    analyser.getByteTimeDomainData(
      buffer
    );

    const bars: number[] = [];

    const step =
      Math.max(
        1,
        Math.floor(
          buffer.length / 40
        )
      );

    for (
      let i = 0;
      i < 40;
      i++
    ) {

      const index =
        Math.min(
          buffer.length - 1,
          i * step
        );

      const difference =
        Math.abs(
          buffer[index] - 128
        );

      const height =
        Math.max(
          4,
          Math.min(
            50,
            difference * 2.5
          )
        );

      bars.push(height);

    }

    setWaveform(bars);
  };

  // ========================================================
  // START LIVE DETECTION
  // ========================================================

  const startLiveDetection =
    async () => {

      if (
        isListeningRef.current ||
        processingRef.current
      ) {

        return;

      }

      console.log(
        "========================================"
      );

      console.log(
        "🎙 STARTING LIVE VOICE DETECTION"
      );

      console.log(
        "========================================"
      );

      manuallyStoppedRef.current =
        false;

      stoppingRef.current =
        false;

      chunksRef.current =
        [];

      speechStartedAtRef.current =
        null;

      lastSpeechTimeRef.current =
        0;

      calibrationValuesRef.current =
        [];

      noiseFloorRef.current =
        0;

      thresholdRef.current =
        ABSOLUTE_MIN_VOLUME;

      setResult(null);

      setRecordingTime(0);

      setSilenceProgress(0);

      setMicrophoneVolume(0);

      setNoiseLevel(0);

      setWaveform(
        new Array(40).fill(4)
      );

      setStatus(
        "Connecting microphone..."
      );

      try {

        // ==================================================
        // GET MICROPHONE
        // ==================================================

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            }
          );

        streamRef.current =
          stream;

        console.log(
          "🎤 Microphone connected"
        );

        // ==================================================
        // AUDIO CONTEXT
        // ==================================================

        const AudioContextClass =
          window.AudioContext ||
          (window as any).webkitAudioContext;

        if (!AudioContextClass) {

          throw new Error(
            "Web Audio API is not supported by this browser."
          );

        }

        const audioContext =
          new AudioContextClass();

        audioContextRef.current =
          audioContext;

        if (
          audioContext.state ===
          "suspended"
        ) {

          await audioContext.resume();

        }

        // ==================================================
        // MICROPHONE SOURCE
        // ==================================================

        const source =
          audioContext.createMediaStreamSource(
            stream
          );

        // ==================================================
        // HIGH PASS FILTER
        // ==================================================

        const highPass =
          audioContext.createBiquadFilter();

        highPass.type =
          "highpass";

        highPass.frequency.value =
          80;

        highPass.Q.value =
          0.7;

        // ==================================================
        // LOW PASS FILTER
        // ==================================================

        const lowPass =
          audioContext.createBiquadFilter();

        lowPass.type =
          "lowpass";

        lowPass.frequency.value =
          3500;

        lowPass.Q.value =
          0.7;

        // ==================================================
        // ANALYSER
        // ==================================================

        const analyser =
          audioContext.createAnalyser();

        analyser.fftSize =
          2048;

        analyser.smoothingTimeConstant =
          0.65;

        analyser.minDecibels =
          -90;

        analyser.maxDecibels =
          -10;

        // ==================================================
        // CONNECT AUDIO PIPELINE
        // ==================================================

        source.connect(
          highPass
        );

        highPass.connect(
          lowPass
        );

        lowPass.connect(
          analyser
        );

        analyserRef.current =
          analyser;

        // ==================================================
        // START LISTENING
        // ==================================================

        isListeningRef.current =
          true;

        setIsListening(true);

        isRecordingRef.current =
          false;

        setIsRecording(false);

        calibrationStartedAtRef.current =
          performance.now();

        setStatus(
          "Calibrating background noise..."
        );

        animationFrameRef.current =
          requestAnimationFrame(
            analyseMicrophone
          );

      }
      catch (error) {

        console.error(
          "❌ MICROPHONE ERROR:",
          error
        );

        cleanupAudio();

        setStatus(
          "Microphone unavailable"
        );

        alert(
          "Please allow microphone access and try again."
        );

      }

    };

  // ========================================================
  // MICROPHONE ANALYSIS LOOP
  // ========================================================

  const analyseMicrophone =
    () => {

      if (
        !isListeningRef.current ||
        manuallyStoppedRef.current
      ) {

        return;

      }

      const analyser =
        analyserRef.current;

      if (!analyser) {

        return;

      }

      const now =
        performance.now();

      const rms =
        getRMS(analyser);

      updateWaveform(
        analyser
      );

      // ==================================================
      // MICROPHONE LEVEL
      // ==================================================

      const visualVolume =
        Math.min(
          100,
          Math.round(
            rms * 1800
          )
        );

      setMicrophoneVolume(
        visualVolume
      );

      // ==================================================
      // CALIBRATION
      // ==================================================

      const calibrationElapsed =
        now -
        calibrationStartedAtRef.current;

      if (
        calibrationElapsed <
        CALIBRATION_TIME
      ) {

        calibrationValuesRef.current.push(
          rms
        );

        setStatus(
          "Calibrating background noise..."
        );

        animationFrameRef.current =
          requestAnimationFrame(
            analyseMicrophone
          );

        return;

      }

      // ==================================================
      // CALCULATE BACKGROUND NOISE
      // ==================================================

      if (
        noiseFloorRef.current === 0
      ) {

        const values =
          calibrationValuesRef.current
            .filter(
              (value) =>
                Number.isFinite(value)
            );

        if (
          values.length > 0
        ) {

          const sorted =
            [...values].sort(
              (a, b) =>
                a - b
            );

          const index =
            Math.floor(
              sorted.length * 0.4
            );

          noiseFloorRef.current =
            sorted[
              Math.min(
                index,
                sorted.length - 1
              )
            ];

        }
        else {

          noiseFloorRef.current =
            0.001;

        }

        const calculatedThreshold =
          Math.max(
            ABSOLUTE_MIN_VOLUME,
            noiseFloorRef.current *
              NOISE_MULTIPLIER,
            noiseFloorRef.current +
              NOISE_MARGIN
          );

        thresholdRef.current =
          Math.min(
            calculatedThreshold,
            MAX_ALLOWED_THRESHOLD
          );

        setNoiseLevel(
          Math.min(
            100,
            Math.round(
              noiseFloorRef.current *
              1800
            )
          )
        );

        console.log(
          "🎚 Background noise:",
          noiseFloorRef.current
        );

        console.log(
          "🎚 Voice threshold:",
          thresholdRef.current
        );

        setStatus(
          "Listening for your voice..."
        );

      }

      // ==================================================
      // DON'T DETECT WHILE ANALYZING
      // ==================================================

      if (
        processingRef.current
      ) {

        animationFrameRef.current =
          requestAnimationFrame(
            analyseMicrophone
          );

        return;

      }

      // ==================================================
      // VOICE DETECTION
      // ==================================================

      const voiceDetected =
        rms >
        thresholdRef.current;

      // ==================================================
      // WAITING FOR VOICE
      // ==================================================

      if (
        !isRecordingRef.current
      ) {

        if (
          voiceDetected
        ) {

          if (
            speechStartedAtRef.current ===
            null
          ) {

            speechStartedAtRef.current =
              now;

            setStatus(
              "Voice detected — confirming..."
            );

          }

          const voiceDuration =
            now -
            speechStartedAtRef.current;

          if (
            voiceDuration >=
            SPEECH_CONFIRM_TIME
          ) {

            console.log(
              "🗣️ HUMAN VOICE CONFIRMED"
            );

            speechStartedAtRef.current =
              null;

            startRecording();

          }

        }
        else {

          speechStartedAtRef.current =
            null;

          setStatus(
            "Listening for your voice..."
          );

        }

      }

      // ==================================================
      // RECORDING
      // ==================================================

      if (
        isRecordingRef.current
      ) {

        const elapsed =
          now -
          recordingStartedAtRef.current;

        setRecordingTime(
          elapsed / 1000
        );

        // ==================================================
        // VOICE IS PRESENT
        // ==================================================

        if (
          voiceDetected
        ) {

          lastSpeechTimeRef.current =
            now;

          setSilenceProgress(
            0
          );

          setStatus(
            "Recording — voice detected"
          );

        }

        // ==================================================
        // SILENCE
        // ==================================================

        else {

          const silenceDuration =
            now -
            lastSpeechTimeRef.current;

          const progress =
            Math.min(
              100,
              (
                silenceDuration /
                SILENCE_TIME
              ) * 100
            );

          setSilenceProgress(
            progress
          );

          setStatus(
            `Recording — silence ${(
              silenceDuration / 1000
            ).toFixed(1)}s`
          );

          // ==================================================
          // 1 SECOND SILENCE → STOP
          // ==================================================

          if (
            silenceDuration >=
            SILENCE_TIME
          ) {

            console.log(
              "🔇 1 SECOND CONTINUOUS SILENCE"
            );

            stopRecording();

            return;

          }

        }

        // ==================================================
        // 10 SECOND MAXIMUM
        // ==================================================

        if (
          elapsed >=
          MAX_RECORDING_TIME
        ) {

          console.log(
            "⏰ 10 SECOND MAXIMUM REACHED"
          );

          stopRecording();

          return;

        }

      }

      animationFrameRef.current =
        requestAnimationFrame(
          analyseMicrophone
        );

    };

  // ========================================================
  // START MEDIA RECORDER
  // ========================================================

  const startRecording =
    () => {

      if (
        processingRef.current
      ) {

        return;

      }

      const stream =
        streamRef.current;

      if (!stream) {

        return;

      }

      const currentRecorder =
        recorderRef.current;

      if (
        currentRecorder &&
        currentRecorder.state !==
          "inactive"
      ) {

        return;

      }

      chunksRef.current =
        [];

      stoppingRef.current =
        false;

      let mimeType =
        "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {

        mimeType =
          "audio/webm;codecs=opus";

      }
      else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {

        mimeType =
          "audio/webm";

      }

      let recorder: MediaRecorder;

      try {

        recorder =
          mimeType
            ? new MediaRecorder(
                stream,
                {
                  mimeType,
                }
              )
            : new MediaRecorder(
                stream
              );

      }
      catch (error) {

        console.error(
          "❌ MediaRecorder error:",
          error
        );

        setStatus(
          "Recording unavailable"
        );

        return;

      }

      recorderRef.current =
        recorder;

      // ==================================================
      // AUDIO DATA
      // ==================================================

      recorder.ondataavailable =
        (event) => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            chunksRef.current.push(
              event.data
            );

          }

        };

      // ==================================================
      // ERROR
      // ==================================================

      recorder.onerror =
        (event) => {

          console.error(
            "❌ MediaRecorder error:",
            event
          );

        };

      // ==================================================
      // STOP
      // ==================================================

      recorder.onstop =
        async () => {

          console.log(
            "🛑 Recording stopped"
          );

          recorderRef.current =
            null;

          const blobType =
            recorder.mimeType ||
            "audio/webm";

          const audioBlob =
            new Blob(
              chunksRef.current,
              {
                type:
                  blobType,
              }
            );

          console.log(
            "🎧 Recorded audio size:",
            audioBlob.size,
            "bytes"
          );

          if (
            audioBlob.size <
            1000
          ) {

            setStatus(
              "Recording was too short"
            );

            stoppingRef.current =
              false;

            return;

          }

          await sendRecording(
            audioBlob
          );

        };

      // ==================================================
      // START
      // ==================================================

      recorder.start(
        250
      );

      recordingStartedAtRef.current =
        performance.now();

      lastSpeechTimeRef.current =
        performance.now();

      isRecordingRef.current =
        true;

      setIsRecording(true);

      setRecordingTime(0);

      setSilenceProgress(0);

      setStatus(
        "Recording — voice detected"
      );

      console.log(
        "🔴 RECORDING STARTED"
      );

    };

  // ========================================================
  // STOP MEDIA RECORDER
  // ========================================================

  const stopRecording =
    () => {

      if (
        stoppingRef.current
      ) {

        return;

      }

      const recorder =
        recorderRef.current;

      if (
        !recorder ||
        recorder.state ===
          "inactive"
      ) {

        return;

      }

      stoppingRef.current =
        true;

      isRecordingRef.current =
        false;

      setIsRecording(false);

      setSilenceProgress(0);

      setStatus(
        "Finishing recording..."
      );

      try {

        recorder.stop();

      }
      catch (error) {

        console.error(
          "❌ Could not stop recorder:",
          error
        );

        stoppingRef.current =
          false;

      }

    };

  // ========================================================
  // SEND AUDIO TO BACKEND
  // ========================================================

  const sendRecording =
    async (
      audioBlob: Blob
    ) => {

      if (
        processingRef.current
      ) {

        return;

      }

      processingRef.current =
        true;

      setProcessing(true);

      setStatus(
        "🤖 Analyzing your recording..."
      );

      try {

        const extension =
          audioBlob.type.includes(
            "webm"
          )
            ? "webm"
            : "wav";

        const file =
          new File(
            [audioBlob],
            `live_recording_${Date.now()}.${extension}`,
            {
              type:
                audioBlob.type ||
                "audio/webm",
            }
          );

        const formData =
          new FormData();

        formData.append(
          "audio",
          file
        );

        // Tell Flask this is a live recording.
        formData.append(
          "source",
          "Live Recording"
        );

        console.log(
  "📤 Sending live recording to local Flask /detect..."
);
        const response =
          await fetch(
            "http://127.0.0.1:5000/detect",
            {
              method: "POST",
              body: formData,
            }
          );

        console.log(
          "Backend response:",
          response.status
        );

        let data: any;

        try {

          data =
            await response.json();

        }
        catch {

          data = {
            success: false,
            message:
              "Backend returned an invalid response.",
          };

        }

        console.log(
          "🤖 LIVE AI RESULT:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {

          setStatus(
            data.message ||
              "Analysis failed."
          );

          return;

        }

        // ==================================================
        // SEND RESULT TO DASHBOARD
        // ==================================================

        setResult(
          data
        );

        // This supports your popup event listener.
        window.dispatchEvent(
          new CustomEvent(
            "voiceScamResult",
            {
              detail: data,
            }
          )
        );

        // ==================================================
        // FINAL STATUS
        // ==================================================

        const prediction =
          String(
            data.prediction ||
              ""
          )
            .trim()
            .toLowerCase();
            
const isScam = prediction.includes("scam");

const title = isScam
  ? "🚨 SCAM DETECTED!"
  : prediction.includes("genuine")
  ? "🛡️ NO SCAM INDICATORS DETECTED"
  : "⚠️ Analysis completed";

const message = isScam
  ? "Warning! A potential scam has been detected. Do not share OTPs, passwords, or banking details. Do not transfer money. Verify the caller independently."
  : prediction.includes("genuine")
  ? "No scam indicators were detected. Continue to stay cautious and never share sensitive information with an unverified caller."
  : "The result is uncertain. Please review the analysis.";

if ("speechSynthesis" in window) {
  window.speechSynthesis.cancel();

  const announcement = new SpeechSynthesisUtterance(
    isScam
      ? "Warning! A potential scam has been detected. Do not share your OTP or banking details. Do not transfer money. Verify the caller."
      : prediction.includes("genuine")
      ? "No scam indicators were detected. Please continue to stay cautious."
      : "The analysis is uncertain. Please review the result."
  );

  announcement.lang = "en-IN";
  announcement.rate = 0.95;

  window.speechSynthesis.speak(announcement);
}

// Temporary browser popup.
// Replace this with your styled dashboard modal if one exists.
window.alert(`${title}\n\n${message}`);


        if (
          prediction ===
          "scam"
        ) {

          setStatus(
            "🚨 Scam call detected"
          );

        }
        else if (
          prediction ===
          "genuine"
        ) {

          setStatus(
            "🛡️ Genuine call detected"
          );

        }
        else {

          setStatus(
            "✅ Analysis completed"
          );

        }

      }
      catch (error) {

        console.error(
          "❌ LIVE ANALYSIS ERROR:",
          error
        );

        setStatus(
          "Unable to connect to backend."
        );

      }
      finally {

        processingRef.current =
          false;

        setProcessing(false);

        stoppingRef.current =
          false;

        // Continue listening for another sentence.
        if (
          isListeningRef.current &&
          !manuallyStoppedRef.current
        ) {

          setRecordingTime(0);

          setSilenceProgress(0);

          setStatus(
            "Listening for your next sentence..."
          );

        }

      }

    };

  // ========================================================
  // CLEANUP AUDIO
  // ========================================================

  const cleanupAudio =
    () => {

      manuallyStoppedRef.current =
        true;

      isListeningRef.current =
        false;

      isRecordingRef.current =
        false;

      if (
        animationFrameRef.current !==
        null
      ) {

        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;

      }

      const recorder =
        recorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {

        try {

          recorder.stop();

        }
        catch {}

      }

      recorderRef.current =
        null;

      const stream =
        streamRef.current;

      if (stream) {

        stream
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );

      }

      streamRef.current =
        null;

      const audioContext =
        audioContextRef.current;

      if (audioContext) {

        audioContext
          .close()
          .catch(() => {});

      }

      audioContextRef.current =
        null;

      analyserRef.current =
        null;

      setIsListening(false);

      setIsRecording(false);

      setMicrophoneVolume(0);

      setRecordingTime(0);

      setSilenceProgress(0);

      setWaveform(
        new Array(40).fill(4)
      );

    };

  // ========================================================
  // MANUAL STOP
  // ========================================================

  const handleStop =
    () => {

      console.log(
        "🛑 LIVE DETECTION MANUALLY STOPPED"
      );

      cleanupAudio();

      setStatus(
        "Stopped"
      );

    };

  // ========================================================
  // UI
  // ========================================================

  const recordingProgress =
    Math.min(
      100,
      (recordingTime / 10) * 100
    );

  return (

    <div
      style={{
        marginTop: "30px",
        marginBottom: "30px",
      }}
    >

      <div
        style={{
          background:
            "linear-gradient(135deg,#ffffff,#f8fbff)",
          border:
            "1px solid #dbeafe",
          borderRadius:
            "24px",
          padding:
            "30px",
          boxShadow:
            "0 15px 40px rgba(15,23,42,.08)",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap:
              "15px",
            flexWrap:
              "wrap",
            marginBottom:
              "25px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "12px",
            }}
          >

            <div
              style={{
                width:
                  "52px",
                height:
                  "52px",
                borderRadius:
                  "15px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "linear-gradient(135deg,#2563eb,#06b6d4)",
                fontSize:
                  "26px",
              }}
            >
              🎙️
            </div>

            <div>

              <h2
                style={{
                  margin:
                    0,
                  color:
                    "#0f172a",
                  fontSize:
                    "25px",
                }}
              >
                Live Voice Detection
              </h2>

              <p
                style={{
                  margin:
                    "4px 0 0",
                  color:
                    "#64748b",
                  fontSize:
                    "14px",
                }}
              >
                Real-time AI-powered voice analysis
              </p>

            </div>

          </div>

          <div
            style={{
              padding:
                "9px 16px",
              borderRadius:
                "999px",
              background:
                processing
                  ? "#ede9fe"
                  : isRecording
                  ? "#fee2e2"
                  : isListening
                  ? "#dbeafe"
                  : "#f1f5f9",
              color:
                processing
                  ? "#7c3aed"
                  : isRecording
                  ? "#dc2626"
                  : isListening
                  ? "#2563eb"
                  : "#64748b",
              fontWeight:
                700,
              fontSize:
                "13px",
            }}
          >
            {processing
              ? "● ANALYZING"
              : isRecording
              ? "● RECORDING"
              : isListening
              ? "● LISTENING"
              : "● READY"}
          </div>

        </div>

        {/* STATUS */}

        <div
          style={{
            textAlign:
              "center",
            padding:
              "25px 15px",
            borderRadius:
              "20px",
            background:
              "#f8fafc",
            border:
              "1px solid #e2e8f0",
          }}
        >

          <div
            style={{
              width:
                "82px",
              height:
                "82px",
              margin:
                "0 auto 15px",
              borderRadius:
                "50%",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              background:
                isRecording
                  ? "linear-gradient(135deg,#ef4444,#f97316)"
                  : processing
                  ? "linear-gradient(135deg,#8b5cf6,#6366f1)"
                  : "linear-gradient(135deg,#2563eb,#06b6d4)",
              boxShadow:
                isRecording
                  ? "0 0 0 10px rgba(239,68,68,.10),0 10px 25px rgba(239,68,68,.25)"
                  : "0 10px 25px rgba(37,99,235,.20)",
              fontSize:
                "36px",
            }}
          >
            {processing
              ? "🤖"
              : isRecording
              ? "🔴"
              : "🎧"}
          </div>

          <h3
            style={{
              margin:
                "0 0 7px",
              color:
                isRecording
                  ? "#dc2626"
                  : processing
                  ? "#7c3aed"
                  : "#1e40af",
              fontSize:
                "21px",
            }}
          >
            {status}
          </h3>

          <p
            style={{
              margin:
                0,
              color:
                "#64748b",
              fontSize:
                "14px",
            }}
          >
            {processing
              ? "Your recording is being analyzed by the AI."
              : isRecording
              ? "Speak naturally. Short pauses are allowed."
              : isListening
              ? "Waiting for clear human speech..."
              : "Click Start Live Detection and speak normally."}
          </p>

        </div>

        {/* WAVEFORM */}

        <div
          style={{
            marginTop:
              "22px",
            height:
              "82px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            gap:
              "4px",
            padding:
              "12px",
            borderRadius:
              "17px",
            background:
              "#0f172a",
            overflow:
              "hidden",
          }}
        >

          {waveform.map(
            (
              height,
              index
            ) => (

              <div
                key={index}
                style={{
                  width:
                    "5px",
                  height:
                    `${height}px`,
                  minHeight:
                    "4px",
                  borderRadius:
                    "999px",
                  background:
                    isRecording
                      ? "#ef4444"
                      : "#38bdf8",
                  opacity:
                    isListening
                      ? 0.95
                      : 0.3,
                  transition:
                    "height .08s linear",
                }}
              />

            )
          )}

        </div>

        {/* MICROPHONE LEVEL */}

        <div
          style={{
            marginTop:
              "22px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >

            <span>
              Microphone Level
            </span>

            <span>
              {microphoneVolume}%
            </span>

          </div>

          <div
            style={{
              height:
                "9px",
              background:
                "#e2e8f0",
              borderRadius:
                "999px",
              overflow:
                "hidden",
            }}
          >

            <div
              style={{
                width:
                  `${microphoneVolume}%`,
                height:
                  "100%",
                borderRadius:
                  "999px",
                background:
                  isRecording
                    ? "linear-gradient(90deg,#ef4444,#f97316)"
                    : "linear-gradient(90deg,#2563eb,#06b6d4)",
                transition:
                  "width .08s linear",
              }}
            />

          </div>

        </div>

        {/* INFO CARDS */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap:
              "14px",
            marginTop:
              "20px",
          }}
        >

          <div
            style={{
              padding:
                "17px",
              borderRadius:
                "16px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Recording Time
            </div>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
                fontSize:
                  "25px",
                color:
                  "#0f172a",
              }}
            >
              {recordingTime.toFixed(1)}

              <span
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#64748b",
                  marginLeft:
                    "5px",
                }}
              >
                / 10 sec
              </span>

            </strong>

          </div>

          <div
            style={{
              padding:
                "17px",
              borderRadius:
                "16px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Background Noise
            </div>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
                fontSize:
                  "20px",
                color:
                  "#0f172a",
              }}
            >
              {noiseLevel}%
            </strong>

          </div>

          <div
            style={{
              padding:
                "17px",
              borderRadius:
                "16px",
              background:
                silenceProgress > 0
                  ? "#fff7ed"
                  : "#f0fdf4",
              border:
                silenceProgress > 0
                  ? "1px solid #fed7aa"
                  : "1px solid #bbf7d0",
            }}
          >

            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Silence Detector
            </div>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
                fontSize:
                  "16px",
                color:
                  silenceProgress > 0
                    ? "#c2410c"
                    : "#15803d",
              }}
            >
              {silenceProgress > 0
                ? `${silenceProgress.toFixed(0)}%`
                : "Voice Active"}
            </strong>

          </div>

        </div>

        {/* 10 SECOND PROGRESS */}

        {isRecording && (

          <div
            style={{
              marginTop:
                "20px",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                fontSize:
                  "12px",
                color:
                  "#64748b",
                marginBottom:
                  "6px",
              }}
            >

              <span>
                Maximum recording duration
              </span>

              <span>
                {Math.min(
                  10,
                  recordingTime
                ).toFixed(1)}
                s
              </span>

            </div>

            <div
              style={{
                height:
                  "7px",
                background:
                  "#e2e8f0",
                borderRadius:
                  "999px",
                overflow:
                  "hidden",
              }}
            >

              <div
                style={{
                  width:
                    `${recordingProgress}%`,
                  height:
                    "100%",
                  background:
                    "linear-gradient(90deg,#ef4444,#f97316)",
                  borderRadius:
                    "999px",
                }}
              />

            </div>

          </div>

        )}

        {/* SILENCE PROGRESS */}

        {isRecording &&
          silenceProgress > 0 && (

            <div
              style={{
                marginTop:
                  "15px",
                padding:
                  "13px 16px",
                borderRadius:
                  "13px",
                background:
                  "#fff7ed",
                border:
                  "1px solid #fed7aa",
                color:
                  "#c2410c",
                fontSize:
                  "13px",
                fontWeight:
                  600,
              }}
            >

              🔇 Silence detected — waiting before stopping.

              <div
                style={{
                  marginTop:
                    "8px",
                  height:
                    "5px",
                  background:
                    "#fed7aa",
                  borderRadius:
                    "999px",
                  overflow:
                    "hidden",
                }}
              >

                <div
                  style={{
                    width:
                      `${silenceProgress}%`,
                    height:
                      "100%",
                    background:
                      "#f97316",
                  }}
                />

              </div>

            </div>

          )}

        {/* BUTTONS */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "center",
            gap:
              "12px",
            marginTop:
              "25px",
            flexWrap:
              "wrap",
          }}
        >

          <button
            onClick={
              startLiveDetection
            }
            disabled={
              isListening ||
              processing
            }
            style={{
              border:
                "none",
              borderRadius:
                "12px",
              padding:
                "14px 25px",
              fontSize:
                "15px",
              fontWeight:
                700,
              color:
                "white",
              background:
                isListening ||
                processing
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#2563eb,#06b6d4)",
              cursor:
                isListening ||
                processing
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            🎙️ Start Live Detection
          </button>

          <button
            onClick={
              handleStop
            }
            disabled={
              !isListening
            }
            style={{
              border:
                "none",
              borderRadius:
                "12px",
              padding:
                "14px 25px",
              fontSize:
                "15px",
              fontWeight:
                700,
              color:
                "white",
              background:
                !isListening
                  ? "#cbd5e1"
                  : "#ef4444",
              cursor:
                !isListening
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            ⏹ Stop
          </button>

        </div>

        {/* FEATURES */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(190px,1fr))",
            gap:
              "12px",
            marginTop:
              "28px",
          }}
        >

          <div
            style={{
              padding:
                "15px",
              borderRadius:
                "14px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <strong>
              🎚️ Noise Calibration
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Background noise is measured before
              voice detection begins.
            </p>

          </div>

          <div
            style={{
              padding:
                "15px",
              borderRadius:
                "14px",
                background:
                  "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <strong>
              🗣️ Human Voice Detection
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              The system waits for sustained voice
              instead of a tiny noise spike.
            </p>

          </div>

          <div
            style={{
              padding:
                "15px",
              borderRadius:
                "14px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <strong>
              🔇 Smart Silence
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              A short pause is tolerated. One second
              of continuous silence stops recording.
            </p>

          </div>

          <div
            style={{
              padding:
                "15px",
              borderRadius:
                "14px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >

            <strong>
              ⏱️ 10 Second Maximum
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Continuous speech is automatically
              stopped and analyzed at 10 seconds.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
};

export default LiveRecorder;