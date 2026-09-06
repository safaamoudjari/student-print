import { useRef, useState, DragEvent } from 'react';
import { FileText, Image as ImageIcon, UploadCloud, X } from 'lucide-react';

const ACCEPTED = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(file: File) {
  return file.type.startsWith('image/') ? ImageIcon : FileText;
}

export function FileDropzone({
  files,
  onChange,
  maxFileSizeMb,
  maxFiles,
  error,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  maxFileSizeMb: number;
  maxFiles: number;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files, ...Array.from(incoming)].slice(0, maxFiles);
    onChange(next);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver ? 'border-rose-400 bg-blush-50' : 'border-blush-200 bg-white'
        }`}
      >
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blush-100 text-rose-500">
          <UploadCloud size={26} />
        </span>
        <p className="font-display text-base font-semibold text-ink-700">
          Tap to upload or drag files here
        </p>
        <p className="mt-1 text-sm font-semibold text-ink-400">
          PDF, DOC, DOCX, JPG or PNG — up to {maxFileSizeMb} MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-sm font-bold text-coral-500">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {files.map((file, i) => {
            const Icon = iconFor(file);
            return (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 rounded-2xl border border-blush-100 bg-white px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lavender-100 text-lavender-500">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-700">{file.name}</p>
                  <p className="text-xs font-semibold text-ink-400">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                  className="rounded-full p-1.5 text-ink-400 hover:bg-coral-100 hover:text-coral-500"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
