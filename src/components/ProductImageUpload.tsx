import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Camera, Image as ImageIcon, Link as LinkIcon, Loader2, Package, Upload, X } from 'lucide-react';
import { Input } from './ui/Form';
import { api, errorMessage } from '../lib/api';
import { cn } from '../lib/utils';

interface ProductImageUploadProps {
  value?: string;
  onChange(val: string): void;
  disabled?: boolean;
}

export function ProductImageUpload({ value, onChange, disabled }: ProductImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

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

      const res = await api<Array<{ url: string }>>('/uploads?folder=products', {
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

  const hasImage = Boolean(value?.trim());

  return (
    <div className="space-y-3">
      {/* Mode Selector and Current Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode('upload')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              mode === 'upload'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode('url')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              mode === 'url'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            <LinkIcon className="w-3.5 h-3.5" /> Image Link
          </button>
        </div>

        {hasImage && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('')}
            className="text-xs text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Remove Image
          </button>
        )}
      </div>

      {/* Image Preview & Upload Container */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center gap-4">
          {/* Logo / Thumbnail Preview Box */}
          <div className="relative group w-20 h-20 rounded-xl bg-slate-800/90 border border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {hasImage ? (
              <img
                src={value}
                alt="Product logo preview"
                className="w-full h-full object-contain"
                onError={() => setError('Unable to load image preview')}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                <Package className="w-7 h-7 text-slate-500" />
                <span className="text-[10px] font-medium tracking-tight">No Image</span>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-xs">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-200">
              {hasImage ? 'Product Logo Image' : 'Add Product Logo / Image'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {mode === 'upload'
                ? 'Upload a PNG, JPG, WebP, or SVG logo for this product. Clean backgrounds display best.'
                : 'Paste a direct public link to an image file.'}
            </p>
            {hasImage && (
              <p className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Image ready for product card
              </p>
            )}
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
              disabled && 'opacity-50 pointer-events-none',
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
                  <span className="text-xs font-medium text-slate-300">Uploading product logo…</span>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-white/5 text-indigo-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    {hasImage ? 'Click or drag to replace image' : 'Click or drag & drop product logo image'}
                  </span>
                  <span className="text-[10px] text-slate-500">PNG, JPG, WebP, SVG up to 5MB</span>
                </>
              )}
            </div>
          </div>
        )}

        {mode === 'url' && (
          <div className="space-y-1.5 pt-1">
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/product-logo.png"
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
