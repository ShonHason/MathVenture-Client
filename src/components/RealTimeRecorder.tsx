import React, { useEffect, useRef, useImperativeHandle } from "react";

interface RealTimeRecorderProps {
  onTranscript: (transcript: string) => void;
  onNoSpeech?: () => void;
  micMuted: boolean;
}

interface RealTimeRecorderInstance {
  stopListening: () => void;
}

const RealTimeRecorder = React.forwardRef<
  RealTimeRecorderInstance,
  RealTimeRecorderProps
>(({ onTranscript, onNoSpeech, micMuted }, ref) => {
  const recognitionRef = useRef<any>(null);
  const noSpeechTimerRef = useRef<number | null>(null);

  // Expose `stopListening` to parent
  useImperativeHandle(ref, () => ({
    stopListening: () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (noSpeechTimerRef.current) {
        clearTimeout(noSpeechTimerRef.current);
      }
    },
  }));

  // Function to reset the "no-speech" timer
  const resetNoSpeechTimer = () => {
    if (noSpeechTimerRef.current) {
      clearTimeout(noSpeechTimerRef.current);
    }
    noSpeechTimerRef.current = window.setTimeout(() => {
      console.log("No speech detected for 60s — firing onNoSpeech()");
      if (onNoSpeech) onNoSpeech();
    }, 60_000); // Trigger after 60 seconds of inactivity
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "he-IL";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      console.log("Recognized transcript:", transcript);
      onTranscript(transcript);
      resetNoSpeechTimer(); // Reset the timer on each speech input
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        resetNoSpeechTimer(); // Reset timer when no speech is detected
      }
      if (event.error === "audio-capture") {
        // Handle microphone issues
        console.error("Microphone access error.");
      }
    };

    recognitionRef.current = recognition;

    if (!micMuted) {
      recognition.start();
      resetNoSpeechTimer(); // Start the no-speech timer
    } else {
      recognition.stop(); // Stop if mic is muted
      if (noSpeechTimerRef.current) {
        clearTimeout(noSpeechTimerRef.current);
      }
    }

    // Cleanup when the component is unmounted or micMuted changes
    return () => {
      recognition.stop();
      if (noSpeechTimerRef.current) {
        clearTimeout(noSpeechTimerRef.current);
      }
    };
  }, [micMuted, onTranscript, onNoSpeech]);

  return null;

});

export default RealTimeRecorder;
