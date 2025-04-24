
// src/components/RealTimeRecorder.tsx
import React, { useEffect, useRef } from 'react';

interface RealTimeRecorderProps {
  /**
   * Callback invoked when speech is recognized.
   * By default, only final transcripts are passed.
   */
  onTranscript: (transcript: string) => void;
  /**
   * Whether to automatically restart recognition on end (default: true)
   */
  continuous?: boolean;
  /**
   * Whether interim (partial) results should be reported (default: false)
   */
  interim?: boolean;
}

const RealTimeRecorder: React.FC<RealTimeRecorderProps> = ({
  onTranscript,
  continuous = true,
  interim = false,
}) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = interim;
    recognition.lang = 'he-IL';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // include only final results by default, or interim if enabled
        if (result.isFinal || interim) {
          transcript += result[0].transcript;
        }
      }
      transcript = transcript.trim();
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // auto-restart if desired
      if (continuous) {
        recognition.start();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        // prevent recursion
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, continuous, interim]);

  return null;
};

export default RealTimeRecorder;

