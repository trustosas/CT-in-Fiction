import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: '16/9' | '1/1' | 'auto';
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  aspectRatio = '16/9',
  placeholder = 'Drop image, paste from clipboard, or click to browse...'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(value && value.startsWith('http') ? 'url' : 'upload');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              dataBase64: base64Data
            })
          });

          if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
          }

          const result = await response.json();
          if (result.url) {
            onChange(result.url);
          } else {
            throw new Error('No URL returned from upload server');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to upload image');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read local file');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Upload error');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleFileUpload(e.clipboardData.files[0]);
    }
  };

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">
          {label}
        </label>
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'upload'
                ? 'bg-charcoal text-beige font-medium'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'url'
                ? 'bg-charcoal text-beige font-medium'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm bg-card border border-charcoal/20 rounded focus:outline-none focus:border-charcoal pr-8"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {value && (
            <div className="relative aspect-[16/9] w-full max-w-xs rounded overflow-hidden border border-charcoal/10 bg-charcoal/5">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            <div className="relative group aspect-[16/9] w-full rounded overflow-hidden border border-charcoal/15 bg-charcoal/5">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-beige text-charcoal rounded text-xs font-semibold shadow hover:bg-white transition-colors"
                >
                  Replace Image
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-charcoal bg-charcoal/5 scale-[0.99]'
                  : 'border-charcoal/20 hover:border-charcoal/40 hover:bg-charcoal/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-charcoal/60" />
                    <p className="text-xs text-charcoal/70">Uploading to R2 storage...</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-charcoal/5 rounded-full text-charcoal/70">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-charcoal/80">{placeholder}</p>
                    <p className="text-[11px] text-charcoal/50">
                      PNG, JPG, WEBP (Supports Ctrl+V clipboard paste)
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
};
