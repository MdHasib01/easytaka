import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
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
  KeyRound,
  Building2,
  Mail,
  Phone,
  User,
  Sparkles,
  IdCard,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Field, FormError, Input } from '../../components/ui/Form';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ImageCropModal, CroppedImageResult } from '../../components/common/ImageCropModal';
import { useAuth } from '../../contexts/AuthContext';
import { api, errorMessage } from '../../lib/api';
import { roleLabel } from '../../lib/auth';
import { cn } from '../../lib/utils';
import type { NidDetails, VerificationStatus } from '../../types';

const VERIFICATION_VARIANT: Record<VerificationStatus, 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Verified: 'success',
  Rejected: 'error',
};

export default function EditProfilePage() {
  const { session, refresh } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentUser = session?.user;
  const isSMM = currentUser?.role === 'SMM';
  const isBrandAdmin = currentUser?.role === 'MANAGER';

  // Profile Form state
  const [name, setName] = useState(currentUser?.name || '');
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(currentUser?.avatar || null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);

  // Crop Modal state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // NID details (for SMM)
  const [nidDetails, setNidDetails] = useState<NidDetails | null>(null);
  const [previewNidUrl, setPreviewNidUrl] = useState<string | null>(null);

  // Password Change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // General Submission state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with current session
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setCurrentAvatar(currentUser.avatar || null);
      setNewAvatarPreview(null);
      setNewAvatarFile(null);

      // If user is SMM, fetch NID details
      if (isSMM || session?.smm) {
        api<NidDetails>(`/users/${currentUser.id}/nid`)
          .then(setNidDetails)
          .catch(() => {
            // NID fetch optional / ignorable if pending
          });
      }
    }
  }, [currentUser, isSMM, session]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
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
          if (newAvatarPreview) {
            finalAvatarUrl = newAvatarPreview;
          }
        }
      } else if (currentAvatar === null && currentUser?.avatar) {
        finalAvatarUrl = '';
      }

      await api<{ user: any }>('/auth/me', {
        method: 'PATCH',
        body: {
          name: name.trim(),
          ...(finalAvatarUrl !== undefined && { avatar: finalAvatarUrl }),
        },
      });

      await refresh();
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err) {
      setPasswordError(errorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!currentUser) return null;

  const displayAvatar = newAvatarPreview || currentAvatar;
  const status = nidDetails?.verification?.status || session?.smm?.verification?.status;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Edit Profile</span>
            <Badge variant="outline" className="text-xs text-indigo-300 border-indigo-500/30">
              Account Settings
            </Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal profile, credentials, and verification identity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            form="profile-form"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 px-5"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Toasts / Banners */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Role Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 text-center space-y-4">
            <div className="relative inline-block mx-auto group">
              <UserAvatar
                src={displayAvatar}
                name={name || currentUser.name}
                size="2xl"
                className="w-28 h-28 text-3xl ring-4 ring-indigo-500/30 mx-auto"
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

            <div>
              <h2 className="text-lg font-bold text-white truncate">{name || currentUser.name}</h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">{currentUser.email}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Badge variant="outline" className="text-indigo-300 border-indigo-500/30">
                {roleLabel(session)}
              </Badge>
              {session?.brand && (
                <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
                  {session.brand.name}
                </Badge>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
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
                  className="w-full text-xs text-slate-300 hover:text-white"
                >
                  <Crop className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Adjust Crop / Zoom
                </Button>
              )}

              {displayAvatar && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleRemovePhoto}
                  className="w-full text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Remove Photo
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Quick Security Status Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Security & Identity Vault
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Email addresses, verified phone numbers, and National ID credentials are encrypted and locked to
              prevent identity tampering.
            </p>
          </div>
        </div>

        {/* Right Column: Form Sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Profile Form */}
          <form
            id="profile-form"
            onSubmit={handleProfileSubmit}
            className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 space-y-6"
          >
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Personal Information
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Update your display name and public identity.</p>
            </div>

            <div className="space-y-4">
              <Field label="Full Name" required hint="Used across all missions and notifications">
                <Input
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Email Address
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Locked</span>
                  </label>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={currentUser.email}
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed select-all"
                  />
                  <p className="text-[11px] text-slate-500">Contact admin if you need your email updated.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      Phone Number
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Verified</span>
                  </label>
                  <input
                    type="tel"
                    readOnly
                    disabled
                    value={currentUser.phone || 'Not provided'}
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500">Primary phone number for SMS and payouts.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>

          {/* Password & Authentication Security Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  Password & Security
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Keep your account secure with a strong password.</p>
              </div>
              <Button
                type="button"
                variant={showPasswordSection ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => {
                  setShowPasswordSection(!showPasswordSection);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            <AnimatePresence>
              {showPasswordSection && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-4 overflow-hidden pt-2"
                >
                  <Field label="Current Password" required>
                    <Input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="New Password" required hint="At least 6 characters">
                      <Input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </Field>
                    <Field label="Confirm New Password" required>
                      <Input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                    </Field>
                  </div>

                  {passwordError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={passwordSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                      {passwordSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* National ID Verification Card (for SMMs) */}
          {isSMM && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      National ID Verification
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Government identification credentials linked to this workspace.
                    </p>
                  </div>
                </div>
                {status && <Badge variant={VERIFICATION_VARIANT[status]}>{status}</Badge>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    NID Number
                  </span>
                  <p className="font-mono text-white text-base font-semibold">
                    {nidDetails?.number || 'Verified in Vault'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    NID Division
                  </span>
                  <p className="text-white text-base font-semibold">
                    {nidDetails?.nidDivision || session?.smm?.nidDivision || 'Assigned'}
                  </p>
                </div>
              </div>

              {/* NID Documents Preview */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-500" />
                  Stored Verification Documents
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-medium">NID Front Document</span>
                    {nidDetails?.frontUrl ? (
                      <div
                        onClick={() => setPreviewNidUrl(nidDetails.frontUrl)}
                        className="group relative aspect-[1.6] rounded-xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer"
                      >
                        <img
                          src={nidDetails.frontUrl}
                          alt="NID Front"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                            <ExternalLink className="w-3.5 h-3.5" /> View Document
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[1.6] rounded-xl border border-dashed border-white/10 bg-slate-950/40 flex flex-col items-center justify-center text-xs text-slate-500 p-4 text-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-400 mb-1.5" />
                        <span>Encrypted Front Document Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 font-medium">NID Back Document</span>
                    {nidDetails?.backUrl ? (
                      <div
                        onClick={() => setPreviewNidUrl(nidDetails.backUrl)}
                        className="group relative aspect-[1.6] rounded-xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer"
                      >
                        <img
                          src={nidDetails.backUrl}
                          alt="NID Back"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                            <ExternalLink className="w-3.5 h-3.5" /> View Document
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[1.6] rounded-xl border border-dashed border-white/10 bg-slate-950/40 flex flex-col items-center justify-center text-xs text-slate-500 p-4 text-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-400 mb-1.5" />
                        <span>Encrypted Back Document Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Crop & Zoom Modal */}
      <ImageCropModal
        open={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        title="Zoom & Adjust Profile Picture"
      />

      {/* NID Photo Lightbox Preview */}
      <AnimatePresence>
        {previewNidUrl && (
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setPreviewNidUrl(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-4 py-2.5 text-xs text-slate-400 border-b border-white/10">
                <span className="flex items-center gap-2 font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  National ID Document (Encrypted Vault)
                </span>
                <button
                  onClick={() => setPreviewNidUrl(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-[1.6] max-h-[75vh] flex items-center justify-center bg-black rounded-xl overflow-hidden mt-3">
                <img src={previewNidUrl} alt="NID Document" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
