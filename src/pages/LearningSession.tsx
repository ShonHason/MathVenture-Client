"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DrawingPanel from "../components/drawing-panel";
import KeyboardPanel from "../components/keyboard-panel";
import Avatar from "../components/Avatar";
import TranscriptModel from "../components/transcript-model";
import ControlPanel from "../components/control-panel";
//import ToggleControlButton from "../components/ ToggleControlButton";
import RealTimeRecorder from "../components/RealTimeRecorder";
import SimpleSpeakingIndicator from "../components/SimpleSpeakingIndicator"; // Import SimpleSpeakingIndicator
import { useUser } from "../context/UserContext";
import { scanMathServer } from "../services/OcrService";
import { finishLessonFunction } from "../services/lessons_api";
import "./LearningSession.css"; // Import your CSS styles
import {
  ControlPanelProvider,
  useControlPanel,
} from "../context/ControlPanelContext"; // Import provider and hook
import PushToTalkButton from "../components/PushToTalkButton";

const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000";

type LocationState = {
  state: {
    topic: { subject: string; question: string };
    lessonId?: string;
  };
};

interface AIResponse {
  text: string;
  counter?: number;
}

function LearningSessionContent() {
  const recorderRef = useRef<any>(null);
  const { user } = useUser();
  const {
    state: { topic, lessonId: initialLessonId },
  } = useLocation() as LocationState;
  const navigate = useNavigate();

  // --- State ---
  const [lessonId, setLessonId] = useState<string | null>(
    initialLessonId ?? null
  );
  const [messages, setMessages] = useState<
    { sender: "bot" | "user"; text: string }[]
  >([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"draw" | "keyboard">("draw");
  const [resetKey, setResetKey] = useState(0);
  const [questionCounter, setQuestionCounter] = useState(0);

  // Yellow area: last user input
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [currentAudioElement, setCurrentAudioElement] =
    useState<HTMLAudioElement | null>(null); // NEW: State for the current audio element
  const silenceTimerRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef("");
  const lastSentRef = useRef("");

  const {
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
    isMuted,
    botVolume,
    speechSpeed,
    botSpeech,
    setBotSpeech,
    botStatus,
    setBotStatus,
    speak,
    stopTTS,
    onRepeatMessage,
    onTogglePlayPause,
    onToggleMute,
    onAdjustVolume,
    onAdjustSpeed,
    isPushToTalkMode,
    setPushToTalkMode,
    isTalkingAllowed,
    setIsTalkingAllowed,
  } = useControlPanel();

 

  useEffect(() => {
    if (isLessonComplete && !isPlaying) {
        if (lessonId && user) {
          console.log("Lesson complete, calling finishLessonFunction");
          finishLessonFunction(lessonId, user, topic.subject);
        }
      }
    
  }, [isLessonComplete, isPlaying]);

  // --- Fetch existing conversation ---
  useEffect(() => {
    async function fetchMessages() {
      if (!lessonId) return;
      try {
        const { data } = await axios.get(
          `${socketServerUrl}/lessons/${lessonId}/messages`,
          { headers: { Authorization: `Bearer ${user?.accessToken}` } }
        );
        const raw = data.messages as Array<{
          role: string;
          content: string;
        }>;
        const formatted = raw.slice(1).map((m) => ({
          sender: m.role === "user" ? "user" : "bot",
          text: m.content,
        })) as { sender: "bot" | "user"; text: string }[];
        setMessages(formatted);

        // Count correct answers from chat history
        //axios function to get corrcet count.. questionlog.length
        // Look for bot responses that indicate correct answers
      } catch (err) {
        console.error(err);
      } finally {
        setMessagesLoaded(true);
      }
    }
    fetchMessages();
  }, [lessonId, user?.accessToken]);

  // --- Intro message ---
  useEffect(() => {
    if (messagesLoaded && user?.username && topic.subject && !hasSpokenIntro) {
      const opening =
        messages.length > 0
          ? `שלום ${user.username}, שמח לראות שחזרת אליי! השיעור על ${topic.subject} ממשיך.`
          : `שלום ${user.username}, שמח לראות אותך! היום נלמד על ${topic.subject}.`;
      setMessages([{ sender: "bot", text: opening }]);
      setBotSpeech(opening);
      setHasSpokenIntro(true);
      speak(opening);
    }
  }, [messagesLoaded, user, topic, hasSpokenIntro, messages.length]);

  // --- Start new lesson on server ---
  useEffect(() => {
    if (!user?._id || !topic.subject) {
      console.error(
        "Problem With Lesson: User ID or topic subject not available. Redirecting to home."
      );
      navigate("/home");
      return;
    }
    if (hasSpokenIntro && !lessonId && user?._id) {
      axios
        .post(
          `${socketServerUrl}/lessons/start`,
          { userId: user._id, subject: topic.subject },
          { headers: { Authorization: `JWT ${user?.accessToken}` } }
        )
        .then((r) => setLessonId(r.data.lessonId))
        .catch(console.error);
    }
  }, [lessonId, user, topic]);

  
  // TTS with speed control

  const handleReturnToMainActual = useCallback(() => {
    stopTTS(); // Stop Text-to-Speech (from context)
    if (recorderRef.current) {
      recorderRef.current.stopListening(); // Call stopListening method from RealTimeRecorder
    }
    navigate("/home");
  }, [stopTTS, navigate]);

  const handleTranscript = (t: string) => {
    if (isMuted || isPlaying || (isPushToTalkMode && !isTalkingAllowed)) {
      console.log("Transcript ignored due to PTT/mute state:", {
        isMuted,
        isPlaying,
        isPushToTalkMode,
        isTalkingAllowed,
      });
      return;
    }

    lastTranscriptRef.current = t;
    clearTimeout(silenceTimerRef.current!);
    silenceTimerRef.current = window.setTimeout(() => {
      const final = lastTranscriptRef.current.trim();
      if (final) {
        console.log("Sending transcript:", final);
        sendTranscript(final);
      }
      lastTranscriptRef.current = "";
    }, 2500);
  };
  const handleTalkStart = useCallback(() => {
    console.log("PTT: Button pressed - allowing talk");
    setIsTalkingAllowed(true);
  }, [setIsTalkingAllowed]);

  const handleTalkEnd = useCallback(() => {
    console.log("PTT: Button released - blocking talk");
    setIsTalkingAllowed(false);

    // Force process any pending transcript when button is released
    if (lastTranscriptRef.current.trim()) {
      const final = lastTranscriptRef.current.trim();
      console.log("PTT: Processing final transcript on button release:", final);
      sendTranscript(final);
      lastTranscriptRef.current = "";
      clearTimeout(silenceTimerRef.current!);
    }
  }, [setIsTalkingAllowed]);

  const shouldMuteMic =
    isMuted ||
    isLessonComplete ||
    isPlaying ||
    (isPushToTalkMode && !isTalkingAllowed);


  const sendTranscript = async (input: string) => {

    if (isPushToTalkMode && !isTalkingAllowed) {
      console.warn("Transcript blocked by PTT mode - user not pressing button");
      return;
    }
    console.log("Number Of Questions:", questionCounter);
    if (input === lastSentRef.current || !input.trim()) {
      console.warn(
        "Skipping sendTranscript: empty input, duplicate, or no lessonId.",
        { input, lastSentRef: lastSentRef.current, lessonId }
      );
      return;
    }

    lastSentRef.current = input;

    // 1) Append the user's message
    setMessages((m) => [...m, { sender: "user", text: input }]);
    setBotStatus("חושב...");

    setLastUserMessage(input);

    try {
      console.log("Sending user input to server:", input);
      const resp = await axios.post(
        `${socketServerUrl}/lessons/${lessonId}/chat`,
        { question: input },
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );

      // 2) Extract fields from server response
      const aiRaw: string = resp.data.answer; // full AI response (may include Markdown fences + undefined fields)
      console.log("AI raw response:", aiRaw);

      // 3) Find the JSON braces
      const firstBrace = aiRaw.indexOf("{");
      const lastBrace = aiRaw.lastIndexOf("}");
      let onlyText: string;
      let counter: number | undefined;

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // 4) Extract exactly from "{…}"
        let jsonOnly = aiRaw.slice(firstBrace, lastBrace + 1);

        // 5) Remove any Markdown fences (```json … ```)
        //    If it starts with "```", drop that line.
        if (jsonOnly.startsWith("```")) {
          const firstLineEnd = jsonOnly.indexOf("\n");
          if (firstLineEnd !== -1) {
            jsonOnly = jsonOnly.slice(firstLineEnd + 1);
          }
        }
        //    If it ends with "```" at the very end, strip it too.
        if (jsonOnly.endsWith("```")) {
          jsonOnly = jsonOnly.slice(0, -3).trim();
        }

        // 6) Remove any `"counter": undefined`, plus dangling commas
        jsonOnly = jsonOnly
          // remove `"counter": undefined` (and optional comma)
          .replace(/"counter"\s*:\s*undefined\s*,?/, "")
          // remove any trailing comma before closing brace: `{ "text": "...", }` → `{ "text": "..." }`
          .replace(/,\s*}/, "}");

        // 7) Now attempt to parse the cleaned JSON
        try {
          const parsed = JSON.parse(jsonOnly) as AIResponse;
          console.log("Parsed AI response:", parsed);

          onlyText = parsed.text;
          counter = parsed.counter;
          if (counter !== undefined) {
            setQuestionCounter(counter);
            console.log("Counter updated:", counter);
          }
          
       } catch (e) {
          console.error("Failed to parse cleaned JSON substring:", e);
          // fallback: treat entire aiRaw as plain Hebrew feedback
          onlyText = aiRaw;
        }
      } else {
        // No valid "{…}" found → treat entire aiRaw as plain text
        onlyText = aiRaw;
      }

      // 8) Strip stray "*" so TTS won't read "כוכבית"
      const aiClean = onlyText.replace(/\*/g, "");

      // 9) Push the bot's cleaned text into messages (so it appears in chat)
      setMessages((m) => [...m, { sender: "bot", text: aiClean }]);
      setBotSpeech(aiClean);
      handleAIQuestionNumber(aiClean);
      
      // Normalize text by removing vowel marks (ניקוד) for more reliable matching
      const normalizedText = aiClean.normalize('NFD').replace(/[\u0591-\u05C7]/g, '');
      
      // Check if the lesson is complete using normalized text
      if (
        normalizedText.includes("השיעור נגמר") || 
        normalizedText.includes("נתראה בשיעור הבא") ||
        normalizedText.includes("השעור נגמר") ||
        aiClean.includes("הַשִּׁעוּר נִגְמַר")  // Keep this specific match as backup
      ) {
        setIsLessonComplete(true);
        console.log("Lesson marked as complete");
      }

      // 11) Finally, speak only the cleaned "text" field.
      //     (If you want to append " מוכן לשאלה הזו?", do it here.)
      speak(aiClean);
    } catch (err) {
      console.error(err);
    }
  };

  // Add this new function that bypasses the PTT check
  const sendInputDirectly = async (input: string) => {
    console.log("Number Of Questions:", questionCounter);
    if (input === lastSentRef.current || !input.trim()) {
      console.warn(
        "Skipping input: empty input, duplicate, or no lessonId.",
        { input, lastSentRef: lastSentRef.current, lessonId }
      );
      return;
    }

    lastSentRef.current = input;

    // 1) Append the user's message
    setMessages((m) => [...m, { sender: "user", text: input }]);
    setBotStatus("חושב...");

    setLastUserMessage(input);

    try {
      console.log("Sending user input to server:", input);
      const resp = await axios.post(
        `${socketServerUrl}/lessons/${lessonId}/chat`,
        { question: input },
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );

      // 2) Extract fields from server response
      const aiRaw: string = resp.data.answer;
      console.log("AI raw response:", aiRaw);

      // 3) Find the JSON braces
      const firstBrace = aiRaw.indexOf("{");
      const lastBrace = aiRaw.lastIndexOf("}");
      let onlyText: string;
      let counter: number | undefined;

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // 4) Extract exactly from "{…}"
        let jsonOnly = aiRaw.slice(firstBrace, lastBrace + 1);

        // 5) Remove any Markdown fences (```json … ```)
        //    If it starts with "```", drop that line.
        if (jsonOnly.startsWith("```")) {
          const firstLineEnd = jsonOnly.indexOf("\n");
          if (firstLineEnd !== -1) {
            jsonOnly = jsonOnly.slice(firstLineEnd + 1);
          }
        }
        //    If it ends with "```" at the very end, strip it too.
        if (jsonOnly.endsWith("```")) {
          jsonOnly = jsonOnly.slice(0, -3).trim();
        }

        // 6) Remove any `"counter": undefined`, plus dangling commas
        jsonOnly = jsonOnly
          // remove `"counter": undefined` (and optional comma)
          .replace(/"counter"\s*:\s*undefined\s*,?/, "")
          // remove any trailing comma before closing brace: `{ "text": "...", }` → `{ "text": "..." }`
          .replace(/,\s*}/, "}");

        // 7) Now attempt to parse the cleaned JSON
        try {
          const parsed = JSON.parse(jsonOnly) as AIResponse;
          console.log("Parsed AI response:", parsed);

          onlyText = parsed.text;
          counter = parsed.counter;
          if (counter !== undefined) {
            setQuestionCounter(counter);
            console.log("Counter updated:", counter);
          }
          
       } catch (e) {
          console.error("Failed to parse cleaned JSON substring:", e);
          // fallback: treat entire aiRaw as plain Hebrew feedback
          onlyText = aiRaw;
        }
      } else {
        // No valid "{…}" found → treat entire aiRaw as plain text
        onlyText = aiRaw;
      }

      // 8) Strip stray "*" so TTS won't read "כוכבית"
      const aiClean = onlyText.replace(/\*/g, "");

      // 9) Push the bot's cleaned text into messages (so it appears in chat)
      setMessages((m) => [...m, { sender: "bot", text: aiClean }]);
      setBotSpeech(aiClean);
      handleAIQuestionNumber(aiClean);
      
      // Normalize text by removing vowel marks (ניקוד) for more reliable matching
      const normalizedText = aiClean.normalize('NFD').replace(/[\u0591-\u05C7]/g, '');
      
      // Check if the lesson is complete using normalized text
      if (
        normalizedText.includes("השיעור נגמר") || 
        normalizedText.includes("נתראה בשיעור הבא") ||
        normalizedText.includes("השעור נגמר") ||
        aiClean.includes("הַשִּׁעוּר נִגְמַר")  // Keep this specific match as backup
      ) {
        setIsLessonComplete(true);
        console.log("Lesson marked as complete");
      }

      // 11) Finally, speak only the cleaned "text" field.
      //     (If you want to append " מוכן לשאלה הזו?", do it here.)
      speak(aiClean);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAIQuestionNumber = (text: string) => {
    // Check if this is a numbered question from part 2
    const hebrewQuestionMatch = text.match(/שְׁאֵלָה מִסְפָּר (\d+) מִתּוֹךְ 15/);
    
    if (hebrewQuestionMatch && hebrewQuestionMatch[1]) {
      // We found a Hebrew question number pattern
      const questionNum = parseInt(hebrewQuestionMatch[1]);
      // For part 2, add 15 to the question number
      const newCounter = questionNum + 15;
      console.log(`Detected part 2 question #${questionNum}, setting counter to ${newCounter}`);
      setCurrentQuestion(newCounter);
      
      // Also update in ControlPanelContext
      setQuestionCounter(newCounter);
    }
  };

  const handleDrawingScan = async (canvas: HTMLCanvasElement) => {
    try {
      setBotStatus("סורק את הציור...");
      const mathText = await scanMathServer(canvas);
      console.log("Scanned math text:", mathText);
      if (mathText) {
        // Use sendInputDirectly instead of sendTranscript to bypass PTT check
        sendInputDirectly(mathText);
      } else {
        console.warn("Tesseract: No math text recognized from drawing.");
        setBotStatus("לא זוהה טקסט מתמטי");
      } 
    } catch (err) {
      console.error("Math OCR failed:", err);
      setBotStatus("שגיאה בסריקה");
    } finally {
      setResetKey((k) => k + 1); // Reset drawing panel
    }
  };

  const handleKeyboardScan = async (displayedText: string) => {
    if (!displayedText) return;
    // Use sendInputDirectly instead of sendTranscript to bypass PTT check
    sendInputDirectly(displayedText);
    setResetKey((k) => k + 1); // Reset keyboard panel;
  };

  return (
    <div className="learning-session-container">
      <button
        className="return-home-button"
        onClick={handleReturnToMainActual}
        title="Return to Home"
      >
        <img src="/logo.png" alt="MathVenture Logo" className="logo-image" />
      </button>
      {/* <div className="toggle-button-fixed">
        <ToggleControlButton
          isOpen={isVisible} // From context
          onClick={() => setIsVisible(!isVisible)} // From context
        />
      </div> */}

      {/* Pass all context values as props to ControlPanel */}
      <ControlPanel
        progress={progress}
        currentQuestion={questionCounter}
        correctAnswers={correctAnswers}
        isLessonComplete={isLessonComplete}
        isVisible={isVisible}
        isPlaying={isPlaying}
        isMuted={isMuted}
        botVolume={botVolume}
        speechSpeed={speechSpeed}
        onTogglePlayPause={onTogglePlayPause}
        onAdjustVolume={onAdjustVolume}
        onAdjustSpeed={onAdjustSpeed}
        onToggleMute={onToggleMute}
        onReturnToMain={handleReturnToMainActual} // Pass the actual handler
        isPushToTalkMode={isPushToTalkMode}
        onTogglePushToTalk={setPushToTalkMode}
        onRepeatMessage={function (): void {
          throw new Error("Function not implemented.");
        }}
      />

      <div className="main-content-panels">
        <div className="bot-status-panel">
          <div className="bot-status-display">
            {botStatus}
            <SimpleSpeakingIndicator isSpeaking={isPlaying} />
          </div>{" "}
          {/* From context */}
          <Avatar />
          <div className="bot-speech-display">{botSpeech}</div>{" "}
          {/* From context */}
          <div className="user-message-display">
            <span className="username">
              {user?.username ? `${user.username}:` : "את/ה:"}
            </span>
            "{lastUserMessage}"
          </div>
          <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                console.log("show-transcript clicked");
                setIsTranscriptOpen(true);
              }}
              className="show-transcript-button"
            >
              הצג תמלול שיחה
          </button>
        </div>
        <div className="input-panel">
          <div className="tab-buttons-container">
            <button
              className={`tab-button ${
                activeTab === "draw"
                  ? "tab-button-active"
                  : "tab-button-inactive"
              }`}
              onClick={() => setActiveTab("draw")}
              disabled={isLessonComplete} // From context
            >
              ציור
            </button>
            <button
              className={`tab-button ${
                activeTab === "keyboard"
                  ? "tab-button-active"
                  : "tab-button-inactive"
              }`}
              onClick={() => setActiveTab("keyboard")}
              disabled={isLessonComplete} // From context
            >
              מחשבון
            </button>
          </div>
          {isLessonComplete ? ( // From context
            <div className="lesson-complete-message">
              כל הכבוד! סיימת את השיעור בהצלחה!
            </div>
          ) : activeTab === "draw" ? (
            <DrawingPanel key={resetKey} onScan={handleDrawingScan} />
          ) : (
            <KeyboardPanel key={resetKey} onScan={handleKeyboardScan} />
          )}
        </div>
      </div>
      {isPushToTalkMode && (
        <PushToTalkButton
          onTalkStart={handleTalkStart}
          onTalkEnd={handleTalkEnd}
          isRecording={isTalkingAllowed}
          disabled={isLessonComplete}
        />
      )}
      <RealTimeRecorder
        ref={recorderRef}
        micMuted={shouldMuteMic}
        onTranscript={handleTranscript}
      />
      {isTranscriptOpen && (
        <TranscriptModel
          messages={messages}
          onClose={() => setIsTranscriptOpen(false)}
        />
      )}
    </div>
  );
}
export default function LearningSession() {
  const navigate = useNavigate();
  const recorderRef = useRef<any>(null); // Still need this ref for the recorder

  // This function is passed to the ControlPanelProvider
  const handleReturnToMainForProvider = useCallback(() => {
    // This is the function that the ControlPanel will eventually call via its props.
    // It's passed into the provider, which then makes it available via the context,
    // and finally LearningSessionContent extracts it from context to pass as a prop to ControlPanel.
    if (recorderRef.current) {
      recorderRef.current.stopListening();
    }
    navigate("/home");
  }, [navigate]);

  return (
    <ControlPanelProvider onReturnToMain={handleReturnToMainForProvider}>
      <LearningSessionContent />
    </ControlPanelProvider>
  );
}