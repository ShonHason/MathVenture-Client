import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Avatar3D from '../components/Avatar3D';
import Transcript from '../components/Transcript';
import DrawableMathNotebook from '../components/DrawableMathNotebook';
import LessonButtons from '../components/LessonButtons';
import RealTimeRecorder from '../components/RealTimeRecorder';
import AudioUnlocker from '../components/AudioUnlocker';
import './InSession.css';

const DIRECT_MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000";

const InSession: React.FC = () => {
  const location = useLocation();
  const { topic } = location.state || {};

  // Separate states for user input and AI output.
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [aiTranscript, setAiTranscript] = useState<string>('');

  // Other states.
  const [processing, setProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('לחץ "התחל שיחה" כדי לפתוח את השיחה');
  const [listening, setListening] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Reference for the silence timer (only monitoring userTranscript).
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Whenever userTranscript updates (and if conversation has started & we're not processing), reset the silence timer.
  useEffect(() => {
    if (!hasStarted) return;
    if (processing) return;
    if (!userTranscript.trim()) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    silenceTimerRef.current = setTimeout(() => {
      setListening(false);
      processTranscript(userTranscript);
    }, 2500);

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [userTranscript, processing, hasStarted]);

  // Process the userTranscript: send to chat endpoint, generate TTS audio, then play it.
  const processTranscript = async (input: string) => {
    try {
      setProcessing(true);
      setStatus('מעבד את הבקשה שלך...');
      // Clear user input so that it won't trigger further processing.
      setUserTranscript('');

      // Send the user input to your chat endpoint.
      const chatResponse = await axios.post(`${socketServerUrl}/api/chat`, {
        question: input,
        context: topic || {},
      });
      const aiText: string = chatResponse.data.answer;
      setAiTranscript(aiText); // Display the AI answer.

      setStatus('ממיר טקסט לדיבור...');
      const ttsResponse = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text: aiText, lang: "he-IL" },
        { responseType: 'arraybuffer' }
      );
      const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setStatus('מדבר...');
      setIsSpeaking(true);
      // This play() call should now succeed because the user already clicked "Start Conversation".
      audio.play().then(() => {
        audio.onended = () => {
          setIsSpeaking(false);
          setStatus('מקשיב...');
          setListening(true);
          setProcessing(false);
        };
      }).catch(error => {
        console.error("Audio play failed:", error);
        setProcessing(false);
      });
    } catch (error) {
      console.error("Error processing transcript:", error);
      setStatus('שגיאה בעיבוד הטקסט');
      setProcessing(false);
    }
  };

  // Handle the first user interaction that starts the conversation.
  const handleStartConversation = () => {
    // Unlock the audio context.
    if (window.AudioContext) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
    setHasStarted(true);
    setListening(true);
    setStatus('מקשיב...');
  };

  // Reset conversation state.
  const resetConversation = () => {
    setUserTranscript('');
    setAiTranscript('');
    setIsSpeaking(false);
    setStatus('מוכן');
    setListening(true);
    setProcessing(false);
  };

  // If conversation hasn't started yet, show a Start Conversation button.
  if (!hasStarted) {
    return (
      <div className="in-session-page">
        <AudioUnlocker />
        <div className="session-container">
          <div className="start-container">
            <button onClick={handleStartConversation} className="start-button">
              התחל שיחה
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Once started, render the full conversation interface.
  return (
    <div className="in-session-page">
      <AudioUnlocker />
      <div className="session-container">
        <div className="chat-area">
          <Avatar3D
            modelSrc={DIRECT_MODEL_URL}
            isSpeaking={isSpeaking}
            // Display either the AI answer or the user input.
            speech={aiTranscript || userTranscript}
            fallbackImageSrc="https://via.placeholder.com/300/f0f0f0/333?text=Avatar"
          />
          <Transcript text={aiTranscript || userTranscript} isLoading={isLoading} />
          {listening && <RealTimeRecorder onTranscript={setUserTranscript} />}
        </div>
        <div className="lesson-buttons-area">
          <LessonButtons />
        </div>
        <div className="status-display">
          <p>סטטוס: {status}</p>
        </div>
        <div className="helper-buttons">
          <button onClick={resetConversation} className="reset-button">
            אתחל שיחה
          </button>
        </div>
        <DrawableMathNotebook question={'שאלה לדוגמה'} />
      </div>
    </div>
  );
};

export default InSession;
