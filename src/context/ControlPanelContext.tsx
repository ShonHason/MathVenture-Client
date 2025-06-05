// src/context/ControlPanelContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";

const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000";

interface ControlPanelContextType {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  isLessonComplete: boolean;
  setIsLessonComplete: (val: boolean) => void;
  progress: number;
  setProgress: (val: number) => void;
  currentQuestion: number;
  setCurrentQuestion: (val: number) => void;
  correctAnswers: number;
  setCorrectAnswers: (val: number) => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  botVolume: number;
  setBotVolume: (val: number) => void;
  speechSpeed: number;
  setSpeechSpeed: (val: number) => void;
  botSpeech: string;
  setBotSpeech: (text: string) => void;
  botStatus: string;
  setBotStatus: (status: string) => void;
  speak: (text: string) => Promise<void>;
  stopTTS: () => void;
  onRepeatMessage: () => void;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onReturnToMain: () => void;
  onAdjustVolume: () => void;
  onAdjustSpeed: () => void;
  // onReturnToMain is now expected to be provided as a prop to the Provider
}

const ControlPanelContext = createContext<ControlPanelContextType | undefined>(
  undefined
);

export const ControlPanelProvider: React.FC<{
  children: React.ReactNode;
  onReturnToMain: () => void; // This prop is explicitly for the Provider
}> = ({ children, onReturnToMain }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [botVolume, setBotVolume] = useState(50);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [botSpeech, setBotSpeech] = useState("");
  const [botStatus, setBotStatus] = useState("עצור");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string) => {
      if (isPlaying || !text.trim()) {
        console.warn(
          "Attempted to speak while already speaking or with empty text."
        );
        return;
      }
      stopTTS();
      try {
        setIsPlaying(true);
        setIsMuted(true);
        setBotStatus("...מדבר");
        const res = await axios.post(
          `${socketServerUrl}/api/tts`,
          { text, lang: "he-IL", speed: speechSpeed },
          { responseType: "arraybuffer" }
        );
        const blob = new Blob([res.data], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.src = url;
        } else {
          audioRef.current = new Audio(url);
        }

        audioRef.current.volume = botVolume / 100;
        audioRef.current.playbackRate = speechSpeed;

        await audioRef.current.play();

        audioRef.current.onended = () => {
          setIsPlaying(false);
          setIsMuted(false);
          setBotStatus("..מקשיב");
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error during TTS:", error);
        setIsPlaying(false);
        setIsMuted(false);
        setBotStatus("עצור");
      }
    },
    [isPlaying, botVolume, speechSpeed, setIsPlaying, setIsMuted, setBotStatus]
  );

  const stopTTS = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsMuted(false);
      setBotStatus("עצור");
      console.log("TTS stopped manually.");
    }
  }, [setIsPlaying, setIsMuted, setBotStatus]);

  const onTogglePlayPause = useCallback(() => {
    if (isPlaying && audioRef.current) {
      stopTTS();
    } else if (botSpeech) {
      speak(botSpeech);
    } else {
      setIsMuted((prev) => {
        const next = !prev;
        setBotStatus(next ? "..מקשיב" : "עצור");
        return next;
      });
    }
  }, [isPlaying, botSpeech, speak, setIsMuted, setBotStatus, stopTTS]);

  const onToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setBotStatus(next ? "..מקשיב" : "עצור");
      return next;
    });
  }, [setIsMuted, setBotStatus]);

  const onAdjustVolume = useCallback(() => {
    setBotVolume((prev) => {
      const next = prev === 100 ? 60 : prev === 60 ? 30 : prev === 30 ? 0 : 100;
      if (audioRef.current) audioRef.current.volume = next / 100;
      return next;
    });
  }, [setBotVolume]);

  const onAdjustSpeed = useCallback(() => {
    setSpeechSpeed((prev) => {
      const speeds = [0.5, 1, 1.25, 1.5, 2];
      const currentIndex = speeds.indexOf(prev);
      const nextIndex = (currentIndex + 1) % speeds.length;
      const nextSpeed = speeds[nextIndex];
      if (audioRef.current) {
        audioRef.current.playbackRate = nextSpeed;
      }
      return nextSpeed;
    });
  }, [setSpeechSpeed]);

  const onRepeatMessage = useCallback(() => {
    if (isPlaying) {
      console.warn("Cannot repeat, bot is currently speaking.");
      return;
    }
    if (
      audioRef.current &&
      audioRef.current.src &&
      audioRef.current.buffered.length > 0
    ) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speechSpeed;
      audioRef.current.play();
      setIsPlaying(true);
      setIsMuted(true);
      setBotStatus("...מדבר");
    } else if (botSpeech) {
      speak(botSpeech);
    } else {
      console.warn(
        "Nothing to repeat. botSpeech is empty or no audio is loaded."
      );
    }
  }, [
    isPlaying,
    botSpeech,
    speak,
    speechSpeed,
    setIsPlaying,
    setIsMuted,
    setBotStatus,
  ]);

  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  return (
    <ControlPanelContext.Provider
      value={{
        isVisible,
        setIsVisible,
        isLessonComplete,
        setIsLessonComplete,
        progress,
        setProgress,
        currentQuestion,
        setCurrentQuestion,
        correctAnswers,
        setCorrectAnswers,
        isPlaying,
        setIsPlaying,
        isMuted,
        setIsMuted,
        botVolume,
        setBotVolume,
        speechSpeed,
        setSpeechSpeed,
        botSpeech,
        setBotSpeech,
        botStatus,
        setBotStatus,
        speak,
        stopTTS,
        onRepeatMessage,
        onTogglePlayPause,
        onToggleMute,
        onReturnToMain,
        onAdjustVolume,
        onAdjustSpeed,
      }}
    >
      {children}
    </ControlPanelContext.Provider>
  );
};

export const useControlPanel = () => {
  const context = useContext(ControlPanelContext);
  if (!context) {
    throw new Error(
      "useControlPanel must be used within a ControlPanelProvider"
    );
  }
  return context;
};
