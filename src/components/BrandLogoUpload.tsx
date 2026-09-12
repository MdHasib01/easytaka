import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Camera, Image as ImageIcon, Link as LinkIcon, Loader2, RefreshCw, Smile, Upload, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Button } from './ui/Button';
import { Input } from './ui/Form';
import { api, errorMessage } from '../lib/api';
import { cn } from '../lib/utils';

const PRESET_EMOJIS = [
  '🏷️', '🏢', '🍼', '🛍️', '☕', '📱', '👟', '💄', 
  '🚀', '💻', '🍔', '🚗', '🏥', '🛒', '🎨', '⚡', 
  '✨', '🍕', '🍰', '💎', '👗', '🎮', '🎧', '🌿'
];

interface BrandLogoUploadProps {
  value: string;
  onChange(val: string): void;
  disabled?: boolean;
}

export function BrandLogoUpload({ value, onChange, disabled }: BrandLogoUploadProps) {
  const [mode, setMode] = useState<'upload' | 'emoji' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Check size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await api<Array<{ url: string }>>('/uploads?folder=brands', {
        method: 'POST',
        body: formData,
      });

      if (res && res[0]?.url) {
        onChange(res[0].url);
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err) {
      // Fallback: convert to base64 Data URL so user is never blocked
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onChange(result);
            setError(null);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setError(errorMessage(err));
      }
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/50 border border-white/10">
        <div className="relative group shrink-0">
          <BrandLogo logo={value} className="w-24 h-16 text-3xl rounded-2xl ring-2 ring-white/10 shadow-lg p-1.5 bg-slate-900/60" />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-xs">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setMode('upload')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                mode === 'upload'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <Upload className="w-3.5 h-3.5" /> Upload Image
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setMode('emoji')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                mode === 'emoji'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <Smile className="w-3.5 h-3.5" /> Emoji
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setMode('url')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                mode === 'url'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Image URL
            </button>

            {value && value !== '🏷️' && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange('🏷️')}
                className="px-2 py-1 ml-auto text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Reset to default emoji"
              >
                Reset
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-1.5 truncate">
            {mode === 'upload' && 'Upload PNG, JPG, WebP, or SVG logo'}
            {mode === 'emoji' && 'Choose an emoji or type your own'}
            {mode === 'url' && 'Paste a direct image link'}
          </p>
        </div>
      </div>

      {mode === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !uploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all',
            dragOver
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={onFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                <span className="text-xs font-medium text-slate-300">Uploading logo to cloud…</span>
              </>
            ) : (
              <>
                <div className="p-2 rounded-xl bg-white/5 text-indigo-400">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-200">
                  Click or drag and drop logo image
                </span>
                <span className="text-[10px] text-slate-500">PNG, JPG, WebP, SVG up to 5MB</span>
              </>
            )}
          </div>
        </div>
      )}

      {mode === 'emoji' && (
        <div className="p-3 bg-slate-900/40 rounded-xl border border-white/10 space-y-2">
          <div className="grid grid-cols-8 gap-1.5">
            {PRESET_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={disabled}
                onClick={() => onChange(emoji)}
                className={cn(
                  'h-8 rounded-lg text-lg flex items-center justify-center transition-all hover:scale-110',
                  value === emoji ? 'bg-indigo-500/30 border border-indigo-500/40 ring-1 ring-indigo-400' : 'hover:bg-white/10'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Custom emoji:</span>
            <Input
              value={value.startsWith('http') || value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value || '🏷️')}
              placeholder="e.g. 🌟"
              className="h-8 text-center text-base"
              maxLength={4}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {mode === 'url' && (
        <div className="space-y-1.5">
          <Input
            value={value.startsWith('http') || value.startsWith('/') ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/logo.png"
            disabled={disabled}
          />
        </div>
      )}

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
