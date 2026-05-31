import { createWorker } from 'tesseract.js';

export async function readSlipImage(file: File): Promise<string> {
  const worker = await createWorker('eng');
  let text: string;

  try {
    const result = await worker.recognize(file);
    text = result.data.text;
  } catch (error) {
    try {
      await worker.terminate();
    } catch {
      // Preserve the primary recognition error when cleanup also fails.
    }

    throw error;
  }

  await worker.terminate();
  return text;
}
