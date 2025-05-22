import React, { useEffect, useRef } from "react";

// Math symbols and elements to display
const mathElements = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
  "+", "-", "×", "÷", "=", "≠", "≈", "<", ">", "≤", "≥",
  "π", "∑", "√", "∫", "∞", "Δ", "θ", "λ", "Ω", "μ",
  "sin", "cos", "tan", "log", "ln",
  "△", "□", "○", "⬡", "⬢",
];

// Element properties
interface MathElement {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  text: string;
  size: number;
  opacity: number;
}

interface ImageElement {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  width: number;
  height: number;
}

const MathScreensaver: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<MathElement[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageElementRef = useRef<ImageElement | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reposition image if it's outside the canvas after resize
      if (imageElementRef.current) {
        if (imageElementRef.current.x + imageElementRef.current.width > canvas.width) {
          imageElementRef.current.x = canvas.width - imageElementRef.current.width;
        }
        if (imageElementRef.current.y + imageElementRef.current.height > canvas.height) {
          imageElementRef.current.y = canvas.height - imageElementRef.current.height;
        }
      }
    };

    // Initialize elements
    const initElements = () => {
      const elements: MathElement[] = [];
      const count = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 20000));

      for (let i = 0; i < count; i++) {
        elements.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: (Math.random() - 0.5) * 1.5,
          text: mathElements[Math.floor(Math.random() * mathElements.length)],
          size: 16 + Math.random() * 24,
          opacity: 0.1 + Math.random() * 0.3,
        });
      }

      elementsRef.current = elements;
    };

    // Initialize moving image
    const initImage = () => {
      // Create a new image element
      const img = new Image();
      img.src = "/placeholder.svg?height=80&width=80"; // Placeholder image
      img.crossOrigin = "anonymous"; // Prevent CORS issues

      // Set up image properties once it's loaded
      img.onload = () => {
        imageRef.current = img;

        // Initialize image position and speed
        imageElementRef.current = {
          x: Math.random() * (canvas.width - 80),
          y: Math.random() * (canvas.height - 80),
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          width: 80,
          height: 80,
        };
      };
    };

    // Draw function
    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw elements
      elementsRef.current.forEach((element) => {
        // Move element
        element.x += element.speedX;
        element.y += element.speedY;

        // Bounce off edges
        if (element.x < 0 || element.x > canvas.width) {
          element.speedX = -element.speedX;
        }

        if (element.y < 0 || element.y > canvas.height) {
          element.speedY = -element.speedY;
        }

        // Draw element
        ctx.font = `${element.size}px "Arial", sans-serif`;
        ctx.fillStyle = `rgba(102, 51, 153, ${element.opacity})`;
        ctx.fillText(element.text, element.x, element.y);
      });

      // Draw and move the image if it's loaded
      if (imageRef.current && imageElementRef.current) {
        const imgEl = imageElementRef.current;

        // Move image
        imgEl.x += imgEl.speedX;
        imgEl.y += imgEl.speedY;

        // Bounce off edges
        if (imgEl.x < 0 || imgEl.x + imgEl.width > canvas.width) {
          imgEl.speedX = -imgEl.speedX;
          // Make sure image stays within bounds
          if (imgEl.x < 0) imgEl.x = 0;
          if (imgEl.x + imgEl.width > canvas.width) imgEl.x = canvas.width - imgEl.width;
        }

        if (imgEl.y < 0 || imgEl.y + imgEl.height > canvas.height) {
          imgEl.speedY = -imgEl.speedY;
          // Make sure image stays within bounds
          if (imgEl.y < 0) imgEl.y = 0;
          if (imgEl.y + imgEl.height > canvas.height) imgEl.y = canvas.height - imgEl.height;
        }

        // Draw image with slight transparency
        ctx.globalAlpha = 0.7;
        ctx.drawImage(imageRef.current, imgEl.x, imgEl.y, imgEl.width, imgEl.height);
        ctx.globalAlpha = 1.0;
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(draw);
    };

    // Set up canvas and start animation
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    initElements();
    initImage(); // Initialize the moving image
    animationRef.current = requestAnimationFrame(draw);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ pointerEvents: "none" }} />;
};

export default MathScreensaver;