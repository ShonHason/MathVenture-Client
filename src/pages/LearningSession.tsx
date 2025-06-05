"use client";

import React, { use, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DrawingPanel from "../components/drawing-panel";
import KeyboardPanel from "../components/keyboard-panel";
import Avatar from "../components/Avatar";
import TranscriptModel from "../components/transcript-model";
import ControlPanel from "../components/control-panel";
import ToggleControlButton from "../components/ ToggleControlButton";
import RealTimeRecorder from "../components/RealTimeRecorder";
import SpeakingIndicator from "../components/SpeakingIndicator"; // Import SpeakingIndicator
import { useUser } from "../context/UserContext";
import { scanMathFromCanvas } from "../services/tesseractOcrService";
import { l } from "framer-motion/dist/types.d-CtuPurYT";
import { finishLessonFunction } from "../services/lessons_api";
const socketServerUrl =
  process.env.SERVER_API_URL || "http://localhost:4000";

type LocationState = {
  state: {
    topic: { subject: string; question: string };
    lessonId?: string;
  };
};

interface AIResponse {
  text: string;
  mathexpression?: string; 
  counter?: number;       
}
interface Analytics {
  totalQuestions: number;
  correctAnswers: number;
  accuracyPct: number;
  avgResponseTimeMs: number;
  logs: Array<{
    question: string;
    questionTime: string; // ISO string from the server
    answer: string;
    answerTime: string; // ISO string from the server
    isCorrect: boolean;
    responseTimeMs: number;
  }>;
}

export default function LearningSession() {
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
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
  const [botSpeech, setBotSpeech] = useState("");
  const [botStatus, setBotStatus] = useState("עצור");
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // This prop controls the indicator
  const [controlsOpen, setControlsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"draw" | "keyboard">("draw");
  const [botVolume, setBotVolume] = useState(100);
  const [speechSpeed, setSpeechSpeed] = useState(1);

  const [resetKey, setResetKey] = useState(0);

  const [oldExp, setoldExp] = useState("");
  const [newExp, setnewExp] = useState("");
  const [questionCounter, setQuestionCounter] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  

  // Yellow area: last user input
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [currentAudioElement, setCurrentAudioElement] =
    useState<HTMLAudioElement | null>(null); // NEW: State for the current audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef("");
  const lastSentRef = useRef("");

  // Prevent overlapping requests
  const [isProcessing, setIsProcessing] = useState(false);

  const currentQuestion = topic.question || "";

  const checkIfOver = async () => {
    
    console.log("Checking if lesson is over for lessonId:",lessonId);    
    try {
      
     const { data } = await axios.get(
  `${socketServerUrl}/lessons/isOver/${lessonId}`,
  {
    headers: { Authorization: `JWT ${user?.accessToken}` },
  }
);
      setQuestionCounter(data.size)
      console.log("checkIfOver response:", data);
      console.log("isfinished:", isLessonComplete);
      if (data.isOver) {
        setIsLessonComplete(true);
      }
    } catch (err) {
      console.error("Error checking isOver:", err);
    }
  };
  useEffect(() => {
    checkIfOver();
  }, []);

  useEffect(() => {
    // הפונקציה הזו תופעל רק ברגע ש־isLessonComplete יהפוך ל־true
    if (isLessonComplete) {
      if (lessonId && user) {
        finishLessonFunction(lessonId, user);
      }
    }
  }, [isLessonComplete]);

  // --- Cleanup & Back-Button Handling ---
  useEffect(() => {
    const stopAll = () => {
      // stop speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      setListening(false);
      // stop recorder
      recorderRef.current?.stopListening?.();
    };
    // handle browser back
    window.addEventListener("popstate", stopAll);
    return () => {
      window.removeEventListener("popstate", stopAll);
      stopAll();
    };
  }, []);

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
    if (
      messagesLoaded &&
      user?.username &&
      topic.subject &&
      !hasSpokenIntro
    ) {
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
    if (hasSpokenIntro && !lessonId && user?._id) {
      axios
        .post(
          `${socketServerUrl}/lessons/start`,
          { userId: user._id, subject: topic.subject },
          { headers: { Authorization: `Bearer ${user?.accessToken}` } }
        )
        .then((r) => setLessonId(r.data.lessonId))
        .catch(console.error);
    }
  }, [hasSpokenIntro, lessonId, user, topic]);

  useEffect(() => {
    if (!isLessonComplete) return;

    axios
      .get<Analytics>(`${socketServerUrl}/lessons/${lessonId}/analytics`)
      .then((response) => {
        // 3) Put the server’s data into your state
        setAnalytics(response.data);
      })
      .catch(console.error);
  }, [isLessonComplete, lessonId]);

  // TTS with speed control
  const speak = async (text: string) => {
    // always stop anything first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    recorderRef.current?.stopListening?.();
    setListening(false);
    setIsSpeaking(true);
    setBotStatus("...מדבר");

    try {
      console.log("🔊 speak(): requesting TTS for text:", text);
      const res = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text, lang: "he-IL", speed: speechSpeed },
        { responseType: "arraybuffer" }
      );
      console.log("🔊 speak(): received audio, constructing blob");
      const blob = new Blob([res.data], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = botVolume / 100;
      audio.playbackRate = speechSpeed; // Set playback speed
      audioRef.current = audio;
      console.log("🔊 speak(): playing audio");
      setCurrentAudioElement(audio); // NEW: Set the audio element in state

      await audio.play();
      audio.onended = () => {
        setIsSpeaking(false); // Set speaking to false when audio ends
        setListening(true);
        setBotStatus("..מקשיב");
        setCurrentAudioElement(null); // NEW: Clear the audio element from state
      };
    } catch (err) {
      console.error("❌ speak() error:", err);
      setIsSpeaking(false);
      setListening(false);
      setBotStatus("עצור");
      setCurrentAudioElement(null); // NEW: Clear the audio element from state
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      setIsSpeaking(false); // Set speaking to false when stopped
      setListening(true);
      setBotStatus("עצור");
      setCurrentAudioElement(null); // NEW: Clear the audio element from state
    }
  }; // <--- תוספת הסוגר החסרה כאן

  const handleReturnToMain = () => {
    stopTTS();
    if (recorderRef.current) {
      console.log("Calling stopListening...");
      recorderRef.current.stopListening();
    }
    navigate("/home");
  };

  const handleTranscript = (t: string) => {
    if (!listening || isSpeaking || isProcessing) return;
    lastTranscriptRef.current = t;
    clearTimeout(silenceTimerRef.current!);
    silenceTimerRef.current = window.setTimeout(() => {
      const final = lastTranscriptRef.current.trim();
      if (final) sendTranscript(final);
      lastTranscriptRef.current = "";
    }, 2000);
  };





  const digitPattern = /\d/; 
  const operatorPattern = /[+\-*/^%]/; // סימני חיבור, חיסור, כפל, חילוק, חזקה, אחוז
const numberWordsPattern = /\b(אפס|אחד|שתיים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר|עשרים|שלושים|ארבעים|חמישים|שישים|שבעים|שמונים|תשעים|מאה|אלף|מיליון)\b/;
const fractionWordsPattern = /\b(חצי|רבע|שליש|שמינית|חמישית|עשירית)\b/;
const mathOpWordsPattern = /\b(כפול|חלק|חילק|חיבור|חיסור|חזקת|שורש|גדול מ|קטן מ|שווה ל)\b/;
const questionWordsPattern = /\b(כמה|מה התשובה|פתור|חשב)\b/;
const slashFractionPattern = /\d+\s*\/\s*\d+/; // צורה “3/4” או “  12/ 5 ”

// הפונקציה עצמה
 function isMathRelated(text: string): boolean {
  // ננטרל קידוד אותיות מיוחדות ונמיר לרישיות לצורך בדיקות insensitive
  const t = text.normalize("NFC");

  // 1) ספרה מכל כתב (Unicode digit)
  if (digitPattern.test(t)) return true;

  // 2) סימני פעולה חשבונית
  if (operatorPattern.test(t)) return true;


  // 4) תבנית “X/Y”
  if (slashFractionPattern.test(t)) return true;

  // 5) מילות מספר במילים
  if (numberWordsPattern.test(t)) return true;

  // 6) מילות שבר
  if (fractionWordsPattern.test(t)) return true;

  // 7) מילות פעולה חישובית
  if (mathOpWordsPattern.test(t)) return true;

  // 8) מילות שאלה מתמטית
  if (questionWordsPattern.test(t)) return true;

  return false;
}


  const sendTranscript = async (input: string) => {
    if (input === lastSentRef.current) return;
    lastSentRef.current = input;
  
    // 1) Append the user’s message
    setMessages((m) => [...m, { sender: "user", text: input }]);
    setLastUserMessage(input);
  console.log("addQuestionLog is called");
  console.log("isMathRelated: ", isMathRelated(input), "\nnewExp: ", newExp , "\noldExp: ", oldExp);

    if (newExp && isMathRelated(input) && oldExp != newExp) {
      setQuestionCounter((prev) => prev + 1);
      console.log("addQustionLog is working!!!!!!!");
      const response = await axios.put(
        `${socketServerUrl}/lessons/addQustionLog`,
        { lessonId :lessonId, mathExp: newExp, text :input },
      
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );
    }
    console.log("addAnswer is called");
    console.log("oldExp: ", oldExp , "\nneed to be equal newExp: ", newExp , "\nisMathRelated: ", (isMathRelated(input) || /נכונה|נכון|לא נכון|לא נכונה/.test(input)) );
   
    if (oldExp === newExp && (isMathRelated(input) || /נכונה|נכון|לא נכון|לא נכונה/.test(input)) && oldExp !== "") {
      console.log("addAnswer is working!!!!!!!!!");
      setQuestionCounter((prev) => prev);
      const response = await axios.put(
        `${socketServerUrl}/lessons/addAnswer`,
        { lessonId :lessonId,mathExp: newExp, text: input },
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );
    }
    try {
      const resp = await axios.post(
        `${socketServerUrl}/lessons/${lessonId}/chat`,
        { question: input },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );
   
      
      // 2) Extract fields from server response
      const aiRaw: string = resp.data.answer;                  // full AI response (may include Markdown fences + undefined fields)
      const isCorrectFromServer: boolean = resp.data.isCorrect;
      console.log("AI raw response:", aiRaw);
      console.log("isCorrectFromServer:", isCorrectFromServer);
  
      // 3) Find the JSON braces
      const firstBrace = aiRaw.indexOf("{");
      const lastBrace = aiRaw.lastIndexOf("}");
      let onlyText: string;
      let mathExpression: string | undefined;
      let counter: number | undefined;
  
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // 4) Extract exactly from “{” to “}”
        let jsonOnly = aiRaw.slice(firstBrace, lastBrace + 1);
  
        // 5) Remove any Markdown fences (```json … ```)
        //    If it starts with “```”, drop that line.
        if (jsonOnly.startsWith("```")) {
          const firstLineEnd = jsonOnly.indexOf("\n");
          if (firstLineEnd !== -1) {
            jsonOnly = jsonOnly.slice(firstLineEnd + 1);
          }
        }
        //    If it ends with “```” at the very end, strip it too.
        if (jsonOnly.endsWith("```")) {
          jsonOnly = jsonOnly.slice(0, -3).trim();
        }
  
        // 6) Remove any `"mathexpression": undefined` or `"counter": undefined`, plus dangling commas
        jsonOnly = jsonOnly
          // remove `"mathexpression": undefined` (and optional comma)
          .replace(/"mathexpression"\s*:\s*undefined\s*,?/, "")
          // remove `"counter": undefined` (and optional comma)
          .replace(/"counter"\s*:\s*undefined\s*,?/, "")
          // remove any trailing comma before closing brace: `{ "text": "...", }` → `{ "text": "..." }`
          .replace(/,\s*}/, "}");
  
        // 7) Now attempt to parse the cleaned JSON
        try {
          const parsed = JSON.parse(jsonOnly) as AIResponse;
          console.log("Parsed AI response:", parsed);
  
          onlyText = parsed.text;
          mathExpression = parsed.mathexpression;
          counter = parsed.counter;
          console.log("addBotResponse is called");
          console.log("newExp: ",newExp , "\nisMathRelated(onlyText): ", isMathRelated(onlyText));
          if(newExp && isMathRelated(onlyText)) {
            console.log("addBotResponse is working!!!!!!!!!");
            const response = await axios.put(
              `${socketServerUrl}/lessons/addBotResponse`,
              { lessonId :lessonId,mathExp: newExp, botResponse: onlyText },
              { headers: { Authorization: `JWT ${user?.accessToken}` } }
            ) }

          if(mathExpression) {
            setoldExp(newExp);
            setnewExp(mathExpression);
            console.log("set new mathExpression:", mathExpression);
            console.log("set new counter:", counter);
          }
         
          

        } catch (e) {
          console.error("Failed to parse cleaned JSON substring:", e);
          // fallback: treat entire aiRaw as plain Hebrew feedback
          onlyText = aiRaw;
        }
      } else {
        // No valid “{…}” found → treat entire aiRaw as plain text
        onlyText = aiRaw;
      }
  
      // 8) Strip stray “*” so TTS won’t read “כוכבית”
      const aiClean = onlyText.replace(/\*/g, "");
      
  
      // 9) Push the bot’s cleaned text into messages (so it appears in chat)
      setMessages((m) => [...m, { sender: "bot", text: aiClean }]);
      setBotSpeech(aiClean);
  
      //check if the lesson is over
     checkIfOver();
  
      // 11) Finally, speak only the cleaned “text” field.
      //     (If you want to append “ מוכן לשאלה הזו?”, do it here.)
      speak(aiClean);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDrawingScan = async (canvas: HTMLCanvasElement) => {
    if (isSpeaking || isProcessing) return;
    setIsProcessing(true);
    try {
      const mathText = await scanMathFromCanvas(canvas);
      if (mathText) {
        setLastUserMessage(mathText);
        await sendTranscript(mathText);
      } else {
        console.warn("Tesseract: לא זוהה טקסט מתמטי");
      }
    } catch (err) {
      console.error("Math OCR failed:", err);
    } finally {
      setResetKey((k) => k + 1);
      setIsProcessing(false);
    }
  };

  const handleKeyboardScan = async (displayedText: string) => {
    if (!displayedText || isSpeaking || isProcessing) return;
    setIsProcessing(true);
    setLastUserMessage(displayedText);
    await sendTranscript(displayedText);
    setResetKey((k) => k + 1);
    setIsProcessing(false);
  };

  // --- ControlPanel Handlers (play/pause, mute, volume, speed, repeat) ---

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (isSpeaking && audio) {
      audio.pause();
      setIsSpeaking(false);
      setBotStatus("עצור");
      setCurrentAudioElement(null); // NEW: Clear on pause
      return;
    }

    if (
      !isSpeaking &&
      audio &&
      audio.currentTime > 0 &&
      audio.currentTime < audio.duration
    ) {
      audio.play();
      setIsSpeaking(true);
      setBotStatus("...מדבר");
      setListening(false);
      setCurrentAudioElement(audio); // NEW: Set on play
      return;
    }
    setListening((l) => {
      const next = !l;
      setBotStatus(next ? "..מקשיב" : "עצור");
      return next;
    });
  };

  const handleMute = () => {
    setListening((l) => !l);
    setBotStatus(listening ? "עצור" : "..מקשיב");
  };

  const handleAdjustVolume = () => {
    const next =
      botVolume === 100
        ? 60
        : botVolume === 60
        ? 30
        : botVolume === 30
        ? 0
        : 100;
    setBotVolume(next);
    if (audioRef.current) audioRef.current.volume = next / 100;
  };

  const handleAdjustSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(speechSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setSpeechSpeed(nextSpeed);

    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleRepeat = () => {
    if (isSpeaking) return;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speechSpeed;
      audioRef.current.play();
      setIsSpeaking(true);
      setListening(false);
      setBotStatus("...מדבר");
      setCurrentAudioElement(audioRef.current); // NEW: Set on repeat
    } else {
      speak(botSpeech);
    }
  };

  const progressPercentage = (correctAnswersCount / 15) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-purple-100 p-4 flex flex-col items-center justify-center">
      {/* Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <ToggleControlButton
          isOpen={controlsOpen}
          onClick={() => setControlsOpen((o) => !o)}
        />
      </div>

      {/* Control Panel */}
      {controlsOpen && (
        <div className="w-full max-w-3xl mb-4">
          <ControlPanel
            progress={progressPercentage}
            currentQuestion={questionCounter}
            correctAnswers={questionCounter}
            isLessonComplete={isLessonComplete}
            isVisible
            isPlaying={isSpeaking}
            isMuted={!listening}
            botVolume={botVolume}
            speechSpeed={speechSpeed}
            onTogglePlayPause={handlePlayPause}
            onToggleMute={handleMute}
            onAdjustVolume={handleAdjustVolume}
            onAdjustSpeed={handleAdjustSpeed}
            onReturnToMain={handleReturnToMain}
            onRepeatMessage={handleRepeat}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-3xl flex gap-6 flex-col md:flex-row mb-4">
        {/* Left Panel */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full px-8 py-3 mb-6 font-bold text-xl w-full text-white relative flex items-center">
            <SpeakingIndicator
              isSpeaking={isSpeaking}
              audioElement={currentAudioElement}
            />{" "}
            {/* Pass audioElement */}
            <span className="flex-grow text-right">{botStatus}</span>
          </div>
          <Avatar />
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-right w-full border-2 border-blue-100">
            {botSpeech}
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 mb-6 text-right w-full border-2 border-yellow-200">
            {lastUserMessage}
          </div>
          <button
            onClick={() => setIsTranscriptOpen(true)}
            className="w-full bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-md"
          >
            הצג תמלול שיחה
          </button>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg flex flex-col">
          <div className="flex mb-4">
            <button
              className={`flex-1 py-3 px-6 rounded-l-full font-bold ${
                activeTab === "draw"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              onClick={() => setActiveTab("draw")}
            >
              ציור
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-r-full font-bold ${
                activeTab === "keyboard"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              onClick={() => setActiveTab("keyboard")}
            >
              מחשבון
            </button>
          </div>
          {activeTab === "draw" ? (
            <DrawingPanel key={resetKey} onScan={handleDrawingScan} />
          ) : (
            <KeyboardPanel key={resetKey} onScan={handleKeyboardScan} />
          )}
        </div>
      </div>

      {/* Recorder & Transcript Modal */}
      <RealTimeRecorder
        ref={recorderRef}
        micMuted={!listening}
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
