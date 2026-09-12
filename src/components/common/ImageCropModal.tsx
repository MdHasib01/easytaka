import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CroppedImageResult {
  dataUrl: string;
  file: File;
}

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (result: CroppedImageResult) => void;
  title?: string;
  cropShape?: 'circle' | 'square';
}

const CROP_SIZE = 240; // Dimension of crop area in px

function dataUrlToFile(dataUrl: string, filename: string): File {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch {
    return new File([], filename, { type: 'image/jpeg' });
  }
}

export function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  title = 'Adjust Profile Picture',
  cropShape = 'circle',
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [applying, setApplying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Check if image is already loaded or reset on open
  useEffect(() => {
    if (open) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setApplying(false);

      if (imageRef.current && imageRef.current.complete && imageRef.current.naturalWidth > 0) {
        setImageLoaded(true);
      } else {
        setImageLoaded(false);
      }
    }
  }, [open, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(3, Math.max(0.8, Number((prev + delta).toFixed(2)))));
  };

  const resetAdjustment = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Transform-based canvas crop & export
  const handleApply = useCallback(() => {
    const img = imageRef.current;
    if (!img) {
      onClose();
      return;
    }

    setApplying(true);

    try {
      // Dimensions
      const rect = img.getBoundingClientRect();
      const renderedWidth = rect.width || img.clientWidth || img.offsetWidth || CROP_SIZE;
      const renderedHeight = rect.height || img.clientHeight || img.offsetHeight || CROP_SIZE;

      // 400x400 high-res output canvas
      const outputCanvas = document.createElement('canvas');
      const outputSize = 400;
      outputCanvas.width = outputSize;
      outputCanvas.height = outputSize;
      const ctx = outputCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear
      ctx.clearRect(0, 0, outputSize, outputSize);

      ctx.save();
      // Move origin to center of output canvas
      ctx.translate(outputSize / 2, outputSize / 2);

      // Scale factor from the 240px preview cutout to 400px output canvas
      const scaleFactor = outputSize / CROP_SIZE;

      // Apply pan
      ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);

      // Dimensions on the output canvas
      const drawWidth = renderedWidth * zoom * scaleFactor;
      const drawHeight = renderedHeight * zoom * scaleFactor;

      // Draw image centered at the origin
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.92);
      const file = dataUrlToFile(dataUrl, 'avatar.jpg');

      onCropComplete({ dataUrl, file });
      onClose();
    } catch (err) {
      console.error('Image crop failed, using fallback:', err);
      // Fallback: pass original image
      if (imageSrc) {
        const file = dataUrlToFile(imageSrc, 'avatar.jpg');
        onCropComplete({ dataUrl: imageSrc, file });
      }
      onClose();
    } finally {
      setApplying(false);
    }
  }, [zoom, pan, imageSrc, onCropComplete, onClose]);

  if (!open || !imageSrc) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Drag to reposition, adjust zoom level</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Crop Viewport */}
          <div className="p-6 flex flex-col items-center select-none">
            <div
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative w-[300px] h-[300px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Image element */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                crossOrigin="anonymous"
                draggable={false}
                onLoad={handleImageLoad}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                className="select-none pointer-events-none"
              />

              {/* Dimmed Overlay with Cutout */}
              <div className="absolute inset-0 pointer-events-none">
                {/* SVG mask overlay */}
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <mask id="crop-mask">
                      <rect width="100%" height="100%" fill="white" />
                      {cropShape === 'circle' ? (
                        <circle cx="150" cy="150" r={CROP_SIZE / 2} fill="black" />
                      ) : (
                        <rect
                          x={(300 - CROP_SIZE) / 2}
                          y={(300 - CROP_SIZE) / 2}
                          width={CROP_SIZE}
                          height={CROP_SIZE}
                          rx="16"
                          fill="black"
                        />
                      )}
                    </mask>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="rgba(11, 15, 25, 0.75)"
                    mask="url(#crop-mask)"
                  />
                </svg>

                {/* Circular Crop Border & Grid Guidelines */}
                <div
                  style={{
                    width: `${CROP_SIZE}px`,
                    height: `${CROP_SIZE}px`,
                    top: '30px',
                    left: '30px',
                  }}
                  className={`absolute pointer-events-none border-2 border-indigo-400/90 shadow-[0_0_20px_rgba(99,102,241,0.4)] ${
                    cropShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                  }`}
                >
                  {/* Subtle alignment crosshair center dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-400/60 rounded-full" />
                </div>
              </div>

              {/* Drag hint icon */}
              {!isDragging && (
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm border border-white/10 text-slate-300 text-[11px] px-2 py-1 rounded-md flex items-center gap-1.5 pointer-events-none shadow-sm">
                  <Move className="w-3 h-3 text-indigo-400" />
                  <span>Drag to pan</span>
                </div>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="w-full mt-5 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0.8"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400 w-12 text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={resetAdjustment}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                  title="Reset Adjustment"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/60 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={applying}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={applying}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] min-w-[120px]"
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Apply Crop
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
