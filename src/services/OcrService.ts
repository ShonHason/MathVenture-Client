import axios from 'axios';

const baseUrl = process.env.SERVER_API_URL || 'http://localhost:4000';

export async function scanMathServer(
  canvas: HTMLCanvasElement
): Promise<string> {
  // 1) תעביר ל-base64 בלי הפריפיקס
  const dataURL = canvas.toDataURL('image/png');
  const base64 = dataURL.split(',')[1];

  try {
    // 2) שלח POST עם body נכון
    const resp = await axios.post<{ text: string }>(
      `${baseUrl}/api/scanMath`,
      { image: base64 },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    console.log('OCR response:', resp.data);
    return resp.data.text;
  } catch (err: any) {
    // נהל שגיאות של axios
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.error || err.message;
      throw new Error(`OCR server error: ${msg}`);
    }
    throw err;
  }
}
