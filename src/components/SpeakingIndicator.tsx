import React, { useRef, useEffect, useState } from "react";
import "./SpeakingIndicator.css"; // Import the CSS for the indicator

interface SpeakingIndicatorProps {
  isSpeaking: boolean;
  audioElement: HTMLAudioElement | null; // Changed from audioRef to audioElement
}

const SpeakingIndicator: React.FC<SpeakingIndicatorProps> = ({
  isSpeaking,
  audioElement,
}) => {
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Constants for bar appearance
  const STATIC_DOT_HEIGHT_SCALE = 1; // Corresponds to 3px initial height
  const STATIC_DOT_OPACITY = 0.7;
  const MAX_BAR_HEIGHT_PX = 25; // Max height for animated bar
  const MIN_BAR_HEIGHT_PX = 3; // Base height for animated bar (same as static dot)
  const ACTIVE_BASE_HEIGHT_PX = 5; // Minimum height a bar will reach when speaking

  useEffect(() => {
    // Cleanup function for when component unmounts
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
    };
  }, []); // Run only once on mount/unmount

  useEffect(() => {
    // This effect handles starting/stopping the animation and connecting/disconnecting audio nodes
    if (!isSpeaking) {
      // Stop animation and reset bars to static dots
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      barRefs.current.forEach((bar) => {
        if (bar) {
          bar.style.transform = `scaleY(${STATIC_DOT_HEIGHT_SCALE})`;
          bar.style.opacity = `${STATIC_DOT_OPACITY}`;
        }
      });
      // Disconnect Web Audio API nodes when not speaking
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      return; // Exit if not speaking
    }

    // If speaking, proceed with Web Audio API setup
    if (!audioElement) {
      console.warn(
        "Audio element not available for SpeakingIndicator when speaking."
      );
      return;
    }

    // Initialize AudioContext if not already
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;

    // Resume AudioContext if suspended (e.g., after user interaction)
    if (audioContext.state === "suspended") {
      audioContext
        .resume()
        .catch((e) => console.error("Failed to resume AudioContext:", e));
    }

    // Create MediaElementAudioSourceNode. Recreate only if the actual audio element changes.
    if (
      !sourceNodeRef.current ||
      sourceNodeRef.current.mediaElement !== audioElement
    ) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect(); // Disconnect old source if exists
      }
      sourceNodeRef.current =
        audioContext.createMediaElementSource(audioElement);
    }
    const sourceNode = sourceNodeRef.current;

    // Create AnalyserNode
    if (!analyserRef.current) {
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256; // Smaller FFT size for quicker response
      analyserRef.current.minDecibels = -90; // Increase sensitivity to quieter sounds
      analyserRef.current.maxDecibels = -10; // Adjust top range for more dynamic movement
      analyserRef.current.smoothingTimeConstant = 0.7; // Less smoothing for more responsiveness
    }
    const analyser = analyserRef.current;

    // Connect nodes: source -> analyser -> destination
    // Ensure connections are only made once or re-made correctly
    if (sourceNode.numberOfOutputs > 0) {
      sourceNode.disconnect();
    }
    if (analyser.numberOfOutputs > 0) {
      analyser.disconnect();
    }
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination); // Connect analyser to speakers

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animateBars = () => {
      // Only continue animation if still speaking and analyser is connected
      if (
        !isSpeaking ||
        !analyser ||
        !barRefs.current.length ||
        audioElement.paused ||
        audioElement.ended
      ) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        // Ensure bars reset if audio stops mid-animation
        barRefs.current.forEach((bar) => {
          if (bar) {
            bar.style.transform = `scaleY(${STATIC_DOT_HEIGHT_SCALE})`;
            bar.style.opacity = `${STATIC_DOT_OPACITY}`;
          }
        });
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      // console.log(dataArray); // Uncomment this line to inspect the raw frequency data

      const numBars = barRefs.current.length;

      for (let i = 0; i < numBars; i++) {
        const bar = barRefs.current[i];
        if (bar) {
          // NEW: Logarithmic frequency mapping
          // Map bar index (0 to numBars-1) to a logarithmic frequency bin index
          // This allocates more bins to lower frequencies and fewer to higher frequencies,
          // which is more perceptually accurate for human hearing and helps activate higher bars.
          const minLog = Math.log(1); // Log of 1 (or a small number > 0)
          const maxLog = Math.log(bufferLength); // Log of max bin index
          const scale = (maxLog - minLog) / numBars;
          const logIndex = minLog + i * scale;
          const dataIndex = Math.floor(Math.exp(logIndex));

          // Ensure dataIndex is within bounds
          const clampedDataIndex = Math.min(dataIndex, bufferLength - 1);
          let amplitude = dataArray[clampedDataIndex];

          // Aggressive non-linear scaling:
          // Boosts lower values significantly. Experiment with the exponent (e.g., 0.2 to 0.5)
          let normalizedAmplitude = amplitude / 255;
          let boostedAmplitude = Math.pow(normalizedAmplitude, 0.2) * 255; // Smaller exponent = more boost for low values

          // Calculate dynamic range for scaling on top of the base height
          const dynamicRange = MAX_BAR_HEIGHT_PX - ACTIVE_BASE_HEIGHT_PX;

          // Calculate scaled height: start from ACTIVE_BASE_HEIGHT_PX and add dynamic portion
          let scaledHeight =
            ACTIVE_BASE_HEIGHT_PX + (boostedAmplitude / 255) * dynamicRange;

          // Ensure height is within min/max bounds
          scaledHeight = Math.min(
            MAX_BAR_HEIGHT_PX,
            Math.max(MIN_BAR_HEIGHT_PX, scaledHeight)
          );

          // Calculate scale factor relative to the MIN_BAR_HEIGHT_PX (static dot height)
          const scaleY = scaledHeight / MIN_BAR_HEIGHT_PX;

          bar.style.transform = `scaleY(${scaleY})`;
          // Vary opacity slightly based on amplitude, ensuring a minimum opacity
          bar.style.opacity = `${Math.max(
            STATIC_DOT_OPACITY,
            0.7 + (boostedAmplitude / 255) * 0.3
          )}`;
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(animateBars);
    };

    // Start animation loop
    animationFrameIdRef.current = requestAnimationFrame(animateBars);

    // Cleanup function for this specific effect run
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      // Only disconnect source/analyser if they are still connected to this specific audioElement
      if (
        sourceNodeRef.current &&
        sourceNodeRef.current.mediaElement === audioElement
      ) {
        sourceNodeRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [isSpeaking, audioElement]); // Re-run effect if isSpeaking or audioElement changes

  return (
    <div className={`equalizer-bars-container`}>
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="bar"
          ref={(el) => {
            barRefs.current[index] = el;
          }}
        ></div>
      ))}
    </div>
  );
};

export default SpeakingIndicator;
