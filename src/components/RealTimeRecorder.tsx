// RealTimeRecorder.tsx
import React, { useEffect, useRef } from "react";

interface RealTimeRecorderProps {
  onTranscript: (transcript: string) => void;
  micMuted: boolean;
}

const RealTimeRecorder: React.FC<RealTimeRecorderProps> = ({
  onTranscript,
  micMuted,
}) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "he-IL"; // Hebrew language

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;

    if (!micMuted) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [micMuted, onTranscript]);

  return null; // This component does not render any visible elements.
};

export default RealTimeRecorder;
