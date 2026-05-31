import { ImageUp, ScanText } from 'lucide-react';
import { useRef, useState } from 'react';

interface SlipInputProps {
  onSubmitText(text: string): void;
  onUploadImage(file: File): void;
  isReadingImage: boolean;
}

export function SlipInput({ onSubmitText, onUploadImage, isReadingImage }: SlipInputProps) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Slip Input</h2>
        <span className="eyebrow">Paste or upload</span>
      </div>
      <label className="field-label" htmlFor="slip-text">
        Sportsbet slip text
      </label>
      <textarea
        id="slip-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-describedby="slip-text-help"
      />
      <p id="slip-text-help" className="field-help">
        Paste the Sportsbet slip text here.
      </p>
      <div className="button-row">
        <button type="button" className="primary-button" onClick={() => onSubmitText(text)}>
          <ScanText size={18} />
          Analyze Slip
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={isReadingImage}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageUp size={18} />
          {isReadingImage ? 'Reading Image' : 'Upload Screenshot'}
        </button>
        <label className="visually-hidden" htmlFor="slip-screenshot">
          Upload Screenshot
        </label>
        <input
          ref={fileInputRef}
          id="slip-screenshot"
          className="visually-hidden"
          type="file"
          accept="image/*"
          disabled={isReadingImage}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file && !isReadingImage) {
              onUploadImage(file);
            }
          }}
        />
      </div>
    </section>
  );
}
