import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Camera,
  Lock,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Crop,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UserAvatar } from './UserAvatar';
import { ImageCropModal, CroppedImageResult } from './ImageCropModal';
import { useAuth } from '../../contexts/AuthContext';
import { api, errorMessage } from '../../lib/api';
import type { ManagedUser, NidDetails, VerificationStatus } from '../../types';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role?: string;
    brand?: { id?: string; name: string; logo?: string } | null;
    smm?: {
      id?: string;
      nidDivision?: string;
      assignedWorkingDivision?: string;
      verification?: { status: VerificationStatus; note?: string };
      hasNid?: boolean;
    } | null;
  };
  isSelf?: boolean;
  onSaved?: (updatedUser: any) => void;
}

const VERIFICATION_VARIANT: Record<VerificationStatus, 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Verified: 'success',
  Rejected: 'error',
};

export function EditProfileModal({
  open,
  onClose,
  user,
  isSelf = false,
  onSaved,
}: EditProfileModalProps) {
  const { refresh } = useAuth();

  // Form state
  const [name, setName] = useState(user.name || '');
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(user.avatar || null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  // Crop modal state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // NID details (read-only)
  const [nidDetails, setNidDetails] = useState<NidDetails | null>(null);
  const [previewNidUrl, setPreviewNidUrl] = useState<string | null>(null);

  // Submission state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with user prop on open
  useEffect(() => {
    if (open) {
      setName(user.name || '');
      setCurrentAvatar(user.avatar || null);
      setNewAvatarPreview(null);
      setNewAvatarFile(null);
      setError(null);
      setSuccessMsg(null);

      // If user is SMM, load NID details for display
      if (user.smm?.hasNid || user.role === 'SMM') {
        api<NidDetails>(`/users/${user.id}/nid`)
          .then(setNidDetails)
          .catch(() => {
            // If NID endpoint fails (e.g. not platform admin or no NID yet), ignore
          });
      } else {
        setNidDetails(null);
      }
    }
  }, [open, user]);

  // File selection -> opens Crop Modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so re-selecting same file triggers onChange
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image file is too large (maximum 15MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCropModalOpen(true);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (result: CroppedImageResult) => {
    setNewAvatarPreview(result.dataUrl);
    setNewAvatarFile(result.file);
  };

  const handleRemovePhoto = () => {
    setCurrentAvatar(null);
    setNewAvatarPreview(null);
    setNewAvatarFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let finalAvatarUrl: string | undefined = currentAvatar || undefined;

      // 1. If user adjusted a new photo, upload it or fallback to data URL
      if (newAvatarFile) {
        try {
          const formData = new FormData();
          formData.append('files', newAvatarFile);
          const uploadRes = await api<Array<{ url: string }>>('/uploads?folder=avatars', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes?.[0]?.url) {
            finalAvatarUrl = uploadRes[0].url;
          } else if (newAvatarPreview) {
            finalAvatarUrl = newAvatarPreview;
          }
        } catch {
          // Cloudinary upload failed or not configured: fallback to compressed data URL
          if (newAvatarPreview) {
            finalAvatarUrl = newAvatarPreview;
          }
        }
      } else if (currentAvatar === null && user.avatar) {
        // Explicitly removed photo
        finalAvatarUrl = '';
      }

      // 2. Save profile (name and avatar only; email, phone and NID are protected)
      let updatedResult: any = null;

      if (isSelf) {
        // Current logged-in user editing self
        const res = await api<{ user: any }>('/auth/me', {
          method: 'PATCH',
          body: {
            name: name.trim(),
            ...(finalAvatarUrl !== undefined && { avatar: finalAvatarUrl }),
          },
        });
        updatedResult = res.user;
        await refresh();
      } else {
        // Admin editing another user
        const res = await api<ManagedUser>(`/users/${user.id}`, {
          method: 'PATCH',
          body: {
            name: name.trim(),
            ...(finalAvatarUrl !== undefined && { avatar: finalAvatarUrl }),
          },
        });
        updatedResult = res;
      }

      setSuccessMsg('Profile updated successfully!');
      if (onSaved) onSaved(updatedResult);

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const displayAvatar = newAvatarPreview || currentAvatar;
  const status = nidDetails?.verification?.status || user.smm?.verification?.status;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {isSelf ? 'Edit Your Profile' : `Edit Profile: ${user.name}`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update profile picture and name. Contact details and NID are security-locked.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form id="edit-profile-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <div className="relative group">
                  <UserAvatar
                    src={displayAvatar}
                    name={name || user.name}
                    size="2xl"
                    className="w-24 h-24 text-2xl ring-4 ring-indigo-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Photo"
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span>Change</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
                  <p className="text-xs text-slate-400">
                    Upload a high-resolution photo. You can zoom in and drag to position.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5" />
                      {displayAvatar ? 'Change Photo' : 'Upload Photo'}
                    </Button>

                    {rawImageSrc && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setCropModalOpen(true)}
                        className="text-xs text-slate-300 hover:text-white"
                        title="Re-adjust zoom and position"
                      >
                        <Crop className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                        Re-adjust Zoom
                      </Button>
                    )}

                    {displayAvatar && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleRemovePhoto}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Editable Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-[11px] font-normal text-indigo-400 lowercase">editable</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner"
                />
              </div>

              {/* Read-only / Locked Fields Section */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    Security & Verification Locked Fields
                  </h4>
                  <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10">
                    Read-only
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <span>Email Address</span>
                      <Lock className="w-3 h-3 text-slate-500" />
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        readOnly
                        disabled
                        value={user.email}
                        className="w-full bg-slate-950/70 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed select-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Email address cannot be modified for account security.
                    </p>
                  </div>

                  {/* Phone (Read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <span>Phone Number</span>
                      <Lock className="w-3 h-3 text-slate-500" />
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        readOnly
                        disabled
                        value={user.phone || 'Not provided'}
                        className="w-full bg-slate-950/70 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Phone number is verified and locked to this identity.
                    </p>
                  </div>
                </div>
              </div>

              {/* NID Information & Photos (Read-only) */}
              {(nidDetails || user.smm) && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        National ID Documents (Locked)
                      </h4>
                    </div>
                    {status && <Badge variant={VERIFICATION_VARIANT[status]}>{status}</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-slate-500">NID Number:</span>
                      <p className="font-mono text-slate-200 mt-0.5">
                        {nidDetails?.number || 'Verified in Vault'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">NID Division:</span>
                      <p className="text-slate-200 mt-0.5">
                        {nidDetails?.nidDivision || user.smm?.nidDivision || 'Assigned'}
                      </p>
                    </div>
                  </div>

                  {/* NID Photos Display (Front & Back) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <span>NID Front</span>
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                      </span>
                      {nidDetails?.frontUrl ? (
                        <div
                          onClick={() => setPreviewNidUrl(nidDetails.frontUrl)}
                          className="group relative aspect-[1.6] rounded-xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer"
                        >
                          <img
                            src={nidDetails.frontUrl}
                            alt="NID Front"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-1 rounded-full bg-slate-900/80 text-white text-xs flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> View
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[1.6] rounded-xl border border-dashed border-white/10 bg-slate-950/40 flex flex-col items-center justify-center text-[11px] text-slate-500 p-2 text-center">
                          <Lock className="w-4 h-4 text-slate-600 mb-1" />
                          <span>Encrypted Front Document</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <span>NID Back</span>
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                      </span>
                      {nidDetails?.backUrl ? (
                        <div
                          onClick={() => setPreviewNidUrl(nidDetails.backUrl)}
                          className="group relative aspect-[1.6] rounded-xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer"
                        >
                          <img
                            src={nidDetails.backUrl}
                            alt="NID Back"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-1 rounded-full bg-slate-900/80 text-white text-xs flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> View
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[1.6] rounded-xl border border-dashed border-white/10 bg-slate-950/40 flex flex-col items-center justify-center text-[11px] text-slate-500 p-2 text-center">
                          <Lock className="w-4 h-4 text-slate-600 mb-1" />
                          <span>Encrypted Back Document</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    NID photos cannot be modified after initial registration for compliance and anti-fraud verification.
                  </p>
                </div>
              )}

              {/* Feedback messages */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {user.role && <span className="uppercase tracking-wider font-semibold">{user.role}</span>}
                {user.brand && ` · ${user.brand.name}`}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-profile-form"
                  size="sm"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Interactive Crop & Zoom Modal */}
      <ImageCropModal
        open={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        title="Zoom & Adjust Profile Picture"
      />

      {/* NID Photo Fullsize Lightbox Preview */}
      <AnimatePresence>
        {previewNidUrl && (
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setPreviewNidUrl(null)}
          >
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-2">
              <div className="flex justify-between items-center px-4 py-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  National ID Verification Document (Read-only)
                </span>
                <button
                  onClick={() => setPreviewNidUrl(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-[1.6] max-h-[70vh] flex items-center justify-center bg-black rounded-xl overflow-hidden">
                <img src={previewNidUrl} alt="NID Document" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
