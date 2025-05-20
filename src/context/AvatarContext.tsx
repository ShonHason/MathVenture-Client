import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";

interface AvatarContextType {
  isSpeaking: boolean;
  setIsSpeaking: (val: boolean) => void;
  speech: string;
  setSpeech: (val: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
  toggleMute: () => void;
  isPaused: boolean;
  togglePause: () => void;
  replayAudio: () => void;
  speechRate: number;
  setSpeechRate: (val: number) => void;
  micMuted: boolean;
  toggleMicMute: () => void;
  listening: boolean;
  setListening: (val: boolean) => void;
  status: string;
  setStatus: (val: string) => void;

  avatarComponent: React.ReactNode | null;
  setAvatarComponent: (val: React.ReactNode | null) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatar must be used within AvatarProvider");
  }
  return context;
};

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speech, setSpeech] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [micMuted, setMicMuted] = useState(true);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("לחץ 'התחל שיחה' כדי להתחיל");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ NEW STATE
  const [avatarComponent, setAvatarComponent] =
    useState<React.ReactNode | null>(null);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (audioRef.current) audioRef.current.muted = !isMuted;
  };

  const togglePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPaused(false);
    } else {
      audio.pause();
      setIsPaused(true);
    }
  };

  const replayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setIsPaused(false);
    setIsSpeaking(true);
  };

  const toggleMicMute = () => {
    setMicMuted((prev) => !prev);
  };

  useEffect(() => {
    if (!micMuted && !isSpeaking) {
      setListening(true);
    } else {
      setListening(false);
    }
  }, [micMuted, isSpeaking]);

  return (
    <AvatarContext.Provider
      value={{
        isSpeaking,
        setIsSpeaking,
        speech,
        setSpeech,
        audioRef,
        isMuted,
        toggleMute,
        isPaused,
        togglePause,
        replayAudio,
        speechRate,
        setSpeechRate,
        micMuted,
        toggleMicMute,
        listening,
        setListening,
        status,
        setStatus,
        avatarComponent, // ✅ ADD TO CONTEXT
        setAvatarComponent, // ✅ ADD TO CONTEXT
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};
