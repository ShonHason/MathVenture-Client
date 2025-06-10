import React, { useRef, useEffect, useState } from "react";
import "./SpeakingIndicator.css"; // Reuse the same CSS

interface SimpleSpeakingIndicatorProps {
  isSpeaking: boolean;
}

const SimpleSpeakingIndicator: React.FC<SimpleSpeakingIndicatorProps> = ({ isSpeaking }) => {
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>(Array(10).fill(0));

  // Constants for bar appearance
  const STATIC_DOT_HEIGHT_SCALE = 1;
  const STATIC_DOT_OPACITY = 0.7;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Handle speaking state changes
  useEffect(() => {
    if (!isSpeaking) {
      // Stop animation when not speaking
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      
      // Stop height updates
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Reset bars to dots
      barRefs.current.forEach(bar => {
        if (bar) {
          bar.style.transform = `scaleY(${STATIC_DOT_HEIGHT_SCALE})`;
          bar.style.opacity = `${STATIC_DOT_OPACITY}`;
        }
      });
      
      return;
    }
    
    // Start generating random heights for bars
    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        // Generate random heights for a nice wave-like effect
        const newHeights = Array(10).fill(0).map(() => 
          Math.floor(50 + Math.random() * 150)
        );
        setBarHeights(newHeights);
      }, 150);
    }
    
    // Animate the bars
    const animateBars = () => {
      if (!isSpeaking) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        return;
      }
      
      barHeights.forEach((height, index) => {
        const bar = barRefs.current[index];
        if (bar) {
          // Convert height to a scale factor
          const normalizedHeight = height / 255;
          const boostedHeight = Math.pow(normalizedHeight, 0.3) * 255;
          
          // Calculate visual scale
          const scaleFactor = 1 + (boostedHeight / 255) * 7; // Scale between 1x and 8x
          
          // Apply the transform
          bar.style.transform = `scaleY(${scaleFactor})`;
          bar.style.opacity = `${Math.max(0.7, 0.7 + (boostedHeight / 255) * 0.3)}`;
        }
      });
      
      animationFrameIdRef.current = requestAnimationFrame(animateBars);
    };
    
    // Start the animation
    if (!animationFrameIdRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(animateBars);
    }
    
    // Clean up
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isSpeaking, barHeights]);
  
  return (
    <div className="equalizer-bars-container">
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

export default SimpleSpeakingIndicator;
