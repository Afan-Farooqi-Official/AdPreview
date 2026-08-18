import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE_MB, MAX_UPLOAD_SIZE_BYTES } from '../../types';
import { clsx } from 'clsx';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  currentImageUrl?: string | null;
}

export function UploadDropzone({ onFileSelected, currentImageUrl }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validate = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are supported.';
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return `File size must be under ${MAX_UPLOAD_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError('');
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-widest mb-3">
        Your Ad
      </p>

      <label
        id="upload-dropzone"
        htmlFor="ad-file-input"
        className={clsx(
          'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed cursor-pointer transition-colors p-6 text-center',
          isDragging
            ? 'border-[hsl(var(--color-brand))] bg-[hsl(var(--color-brand-light))]'
            : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-brand))]/50 hover:bg-[hsl(var(--color-surface-alt))]'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {currentImageUrl ? (
          <div className="w-full">
            <img
              src={currentImageUrl}
              alt="Uploaded advertisement"
              className="w-full h-24 object-contain rounded-md mb-2"
            />
            <span className="text-xs text-[hsl(var(--color-brand))] font-medium">
              Click to replace
            </span>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-surface-alt2))] flex items-center justify-center">
              {isDragging ? (
                <ImageIcon size={20} className="text-[hsl(var(--color-brand))]" />
              ) : (
                <Upload size={20} className="text-[hsl(var(--color-text-muted))]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text))]">
                Drop your ad here
              </p>
              <p className="text-xs text-[hsl(var(--color-text-subtle))] mt-0.5">
                or click to browse — JPG, PNG, WebP up to {MAX_UPLOAD_SIZE_MB}MB
              </p>
            </div>
          </>
        )}
        <input
          id="ad-file-input"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="sr-only"
          onChange={handleInput}
        />
      </label>

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[hsl(var(--color-error))]">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  );
}
