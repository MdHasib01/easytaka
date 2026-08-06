import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ZoomIn, ZoomOut, RotateCcw, Move, Camera, Trash2, Check, Loader2 } from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  name: string;
  onSaveAdjusted: (base64Image: string) => Promise<void>;
  onRemovePhoto: () => Promise<void>;
  onChangePhoto: () => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  name,
  onSaveAdjusted,
  onRemovePhoto,
  onChangePhoto
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Load image on modal open / imageUrl change
  useEffect(() => {
    if (!imageUrl || !isOpen) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageObj(img);
      setZoom(1);
      setPanX(0);
      setPanY(0);
    };
    img.src = imageUrl;
  }, [imageUrl, isOpen]);

  // Draw crop preview on canvas whenever image, zoom, or pan changes
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400; // High resolution crop canvas
    canvas.width = size;
    canvas.height = size;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    // Compute dimensions to fit & scale image
    const scale = Math.max(size / imageObj.width, size / imageObj.height) * zoom;
    const width = imageObj.width * scale;
    const height = imageObj.height * scale;

    const x = (size - width) / 2 + panX;
    const y = (size - height) / 2 + panY;

    ctx.drawImage(imageObj, x, y, width, height);
  }, [imageObj, zoom, panX, panY]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse / Touch drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    try {
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      await onSaveAdjusted(croppedBase64);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemovePhoto();
      onClose();
    } catch (err) {
      console.error('Remove error:', err);
    } finally {
      setRemoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View & Adjust Profile Photo">
      <div className="space-y-6 text-center select-none">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-indigo-400" />
          <span>Drag photo to reposition • Scroll slider to zoom</span>
        </p>

        {/* Circular Avatar Crop Viewport */}
        <div className="relative w-64 h-64 mx-auto group cursor-grab active:cursor-grabbing">
          {/* Canvas container */}
          <div
            className="w-full h-full rounded-full overflow-hidden border-4 border-indigo-500/50 shadow-2xl bg-slate-900 flex items-center justify-center touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <canvas ref={canvasRef} className="w-full h-full object-cover pointer-events-none" />
          </div>

          {/* Grid overlay lines indicator */}
          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none group-hover:border-cyan-400/50 transition-colors" />
        </div>

        {/* Zoom & Adjustment Controls */}
        <div className="space-y-4 max-w-xs mx-auto p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              aria-label="Zoom Level"
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <ZoomIn className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-[10px] font-bold text-indigo-300 w-9 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold flex items-center gap-1.5 transition-colors text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Position
            </button>
          </div>
        </div>

        {/* Action Buttons - Stacked & Grid layout to prevent horizontal scrolling */}
        <div className="pt-2 max-w-sm mx-auto space-y-2.5">
          <Button
            variant="gradient"
            size="md"
            icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            onClick={handleSave}
            disabled={saving || removing}
            className="w-full justify-center shadow-lg shadow-indigo-500/20"
          >
            {saving ? 'Saving Adjustments...' : 'Save Display Position'}
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={<Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              onClick={() => {
                onClose();
                onChangePhoto();
              }}
              disabled={saving || removing}
              className="w-full justify-center text-xs truncate px-2"
            >
              Change Photo
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
              onClick={handleRemove}
              disabled={saving || removing}
              className="w-full justify-center text-xs truncate px-2 hover:border-rose-500/50 hover:text-rose-300"
            >
              {removing ? 'Removing...' : 'Remove Photo'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
