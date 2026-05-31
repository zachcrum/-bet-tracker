import { createWorker } from 'tesseract.js';
import { readSlipImage } from './ocr';

vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(),
}));

const mockedCreateWorker = vi.mocked(createWorker);

function mockWorker({
  recognize = vi.fn().mockResolvedValue({ data: { text: 'Slip text' } }),
  terminate = vi.fn().mockResolvedValue(undefined),
} = {}) {
  const worker = { recognize, terminate };
  mockedCreateWorker.mockResolvedValue(worker as unknown as Awaited<ReturnType<typeof createWorker>>);
  return worker;
}

describe('readSlipImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns recognized text and terminates the worker', async () => {
    const worker = mockWorker();
    const file = new File(['image'], 'slip.png', { type: 'image/png' });

    await expect(readSlipImage(file)).resolves.toBe('Slip text');

    expect(mockedCreateWorker).toHaveBeenCalledWith('eng');
    expect(worker.recognize).toHaveBeenCalledWith(file);
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('terminates the worker when recognition fails', async () => {
    const recognitionError = new Error('recognition failed');
    const worker = mockWorker({
      recognize: vi.fn().mockRejectedValue(recognitionError),
    });
    const file = new File(['image'], 'slip.png', { type: 'image/png' });

    await expect(readSlipImage(file)).rejects.toThrow(recognitionError);

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('preserves the recognition error when termination also fails', async () => {
    const recognitionError = new Error('recognition failed');
    const worker = mockWorker({
      recognize: vi.fn().mockRejectedValue(recognitionError),
      terminate: vi.fn().mockRejectedValue(new Error('terminate failed')),
    });
    const file = new File(['image'], 'slip.png', { type: 'image/png' });

    await expect(readSlipImage(file)).rejects.toThrow(recognitionError);

    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });
});
