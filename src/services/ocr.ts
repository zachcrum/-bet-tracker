export async function readSlipImage(file: File): Promise<string> {
  const { createWorker } = await loadTesseract();
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

async function loadTesseract(): Promise<typeof import('tesseract.js')> {
  if (import.meta.env.PROD) {
    const productionOcrUrl = 'https://esm.sh/tesseract.js@5.1.1';
    return import(/* @vite-ignore */ productionOcrUrl) as Promise<typeof import('tesseract.js')>;
  }

  return import('tesseract.js');
}
