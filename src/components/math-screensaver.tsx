import React, { useEffect, useRef } from "react";
const screensaverLogo = "/MathVentureBot.svg"; // Path to your logo image
// Math symbols and elements to display
const mathElements = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
  "+", "-", "×", "÷", "=", "≠", "≈", "<", ">", "≤", "≥",
  "π", "∑", "√", "∫", "∞", "Δ", "θ", "λ", "Ω", "μ",
  "sin", "cos", "tan", "log", "ln",
  "△", "□", "○", "⬡", "⬢",
];

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

  // Scale factor for the logo size
  const logoScale = 0.05; // Adjust this value (e.g., 0.1 to 0.5) to shrink or enlarge logo

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const imgEl = imageElementRef.current;
      if (imgEl) {
        imgEl.x = Math.min(imgEl.x, canvas.width - imgEl.width);
        imgEl.y = Math.min(imgEl.y, canvas.height - imgEl.height);
      }
    };

    const initElements = () => {
      const count = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 20000));
      const items: MathElement[] = [];
      for (let i = 0; i < count; i++) {
        items.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: (Math.random() - 0.5) * 1.5,
          text: mathElements[Math.floor(Math.random() * mathElements.length)],
          size: 16 + Math.random() * 24,
          opacity: 0.1 + Math.random() * 0.3,
        });
      }
      elementsRef.current = items;
    };

    const initImage = () => {
      const img = new Image();
      img.src = screensaverLogo;
      img.onload = () => {
        imageRef.current = img;
        const scaledWidth = img.width * logoScale;
        const scaledHeight = img.height * logoScale;

        imageElementRef.current = {
          x: Math.random() * (canvas.width - scaledWidth),
          y: Math.random() * (canvas.height - scaledHeight),
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          width: scaledWidth,
          height: scaledHeight,
        };
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw math elements
      elementsRef.current.forEach(el => {
        el.x += el.speedX;
        el.y += el.speedY;
        if (el.x < 0 || el.x > canvas.width) el.speedX = -el.speedX;
        if (el.y < 0 || el.y > canvas.height) el.speedY = -el.speedY;
        ctx.font = `${el.size}px Arial`;
        ctx.fillStyle = `rgba(102, 51, 153, ${el.opacity})`;
        ctx.fillText(el.text, el.x, el.y);
      });
      // Draw moving image
      const imgEl = imageElementRef.current;
      if (imageRef.current && imgEl) {
        imgEl.x += imgEl.speedX;
        imgEl.y += imgEl.speedY;
        if (imgEl.x < 0 || imgEl.x + imgEl.width > canvas.width) {
          imgEl.speedX = -imgEl.speedX;
          imgEl.x = Math.max(0, Math.min(imgEl.x, canvas.width - imgEl.width));
        }
        if (imgEl.y < 0 || imgEl.y + imgEl.height > canvas.height) {
          imgEl.speedY = -imgEl.speedY;
          imgEl.y = Math.max(0, Math.min(imgEl.y, canvas.height - imgEl.height));
        }
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
          imageRef.current,
          imgEl.x,
          imgEl.y,
          imgEl.width,
          imgEl.height
        );
        ctx.globalAlpha = 1;
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    initElements();
    initImage();
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [logoScale]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: "none" }}
    />
  );
};

export default MathScreensaver;
