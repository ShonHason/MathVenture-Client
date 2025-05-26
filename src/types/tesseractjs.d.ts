// src/types/tesseractjs.d.ts

// Module augmentation for tesseract.js to allow custom CLI flags on WorkerOptions
import "tesseract.js"

declare module "tesseract.js" {
  interface WorkerOptions {
    /** List of CLI flags or key=value settings */
    config?: string[]
    /** Whitelist of characters for tessedit_char_whitelist */
    tessedit_char_whitelist?: string
    /** Page segmentation mode number for tessedit_pageseg_mode */
    tessedit_pageseg_mode?: number
    /** Alias for single-line psm */
    psm?: number
  }
}
