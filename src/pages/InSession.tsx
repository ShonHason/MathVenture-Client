import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Avatar3D from '../components/Avatar3D';
import Transcript from '../components/Transcript';
import './InSession.css';

const DIRECT_MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";

const InSession: React.FC = () => {
  const [started, setStarted] = useState<boolean>(false);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Idle');

  // This function continuously listens for user speech and processes it.
  const listenLoop = async () => {
    try {
      setStatus('Listening...');
      // Call your STT endpoint to capture the user's speech.
      const sttResponse = await axios.post(`${baseUrl}/api/speak`);
      const userTranscript = sttResponse.data.transcript;
      console.log("User transcript:", userTranscript);

      if (userTranscript && userTranscript.trim().length > 0) {
        setTranscriptText(`You said: ${userTranscript}`);

        // Send the user's transcript to your chat endpoint.
        setStatus('Processing your request...');
        const chatResponse = await axios.post(`${baseUrl}/api/chat`, {
          question: userTranscript,
          context: '', // Optional: pass any context if needed
        });
        const aiText = chatResponse.data.answer;
        console.log("AI answer:", aiText);
        setTranscriptText(aiText);

        // Convert the AI answer to speech via your TTS endpoint.
        setStatus('Converting text to speech...');
        const ttsResponse = await axios.post(`${baseUrl}/api/tts`,
          { text: aiText },
          { responseType: 'arraybuffer' }
        );
        const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        // Animate the avatar while the audio plays.
        setStatus('Speaking...');
        setIsSpeaking(true);
        audio.play().then(() => {
          audio.onended = () => {
            setIsSpeaking(false);
            // After finishing the AI response, restart the listening loop.
            listenLoop();
          };
        }).catch(error => {
          console.error("Audio play failed:", error);
        });
      } else {
        // If no speech was captured, simply loop again.
        listenLoop();
      }
    } catch (error) {
      console.error("Error in listenLoop:", error);
      setStatus('Error occurred');
      // Optionally try again after a delay.
      setTimeout(() => {
        listenLoop();
      }, 2000);
    }
  };

  // Start the conversation only after the user clicks the button.
  const startConversation = async () => {
    setStarted(true);
    try {
      setIsLoading(true);
      setStatus('Greeting...');
      // Define a constant greeting message.
      const greeting = "we love you rani so much";
      console.log("Greeting message:", greeting);

      // Convert the greeting to speech using your TTS endpoint.
      const ttsResponse = await axios.post(
        `${baseUrl}/api/tts`,
        { text: greeting },
        { responseType: 'arraybuffer' }
      );
      const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setStatus('Speaking greeting...');
      setIsSpeaking(true);
      audio.play().then(() => {
        audio.onended = () => {
          setIsSpeaking(false);
          // After greeting, start listening for the user automatically.
          listenLoop();
        };
      }).catch(error => {
        console.error("Audio play failed:", error);
      });
    } catch (error) {
      console.error("Error during greeting:", error);
      setStatus('Error during greeting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="in-session-page">
      {!started ? (
        <div className="start-container">
          <button onClick={startConversation}>
            Start Conversation
          </button>
        </div>
      ) : (
        <div className="session-container">
          <div className="chat-area">
            <Avatar3D
              modelSrc={DIRECT_MODEL_URL}
              isSpeaking={isSpeaking}
              speech={transcriptText}
              fallbackImageSrc="https://via.placeholder.com/300/f0f0f0/333?text=Avatar"
            />
            <Transcript text={transcriptText} isLoading={isLoading} />
          </div>
          {/* Status display for debugging */}
          <div className="status-display">
            <p>Status: {status}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InSession;
