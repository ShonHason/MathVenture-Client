// src/services/tesseractMathOcrService.ts
import Tesseract, { PSM } from "tesseract.js"

const MATH_WHITELIST = "0123456789+-×÷*/=^()[]{}., "

export async function scanMathFromCanvas(
  canvas: HTMLCanvasElement
): Promise<string> {
  const dataURL = canvas.toDataURL("image/png")

  const {
    data: { text: rawText },
  } = await Tesseract.recognize(
    dataURL,
    "eng",
    {
      logger: m => console.log("Tesseract:", m),
      config: [
        `tessedit_char_whitelist=${MATH_WHITELIST}`,
        `--psm ${PSM.SINGLE_LINE}`,
      ],
    }
  )

  // 
  const filtered = Array.from(rawText)
    .filter(c => MATH_WHITELIST.includes(c))
    .join("")
    .trim()

  return filtered
}
