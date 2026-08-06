import React, { useRef, useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/endpoints';
import { ShieldCheck, Camera, Eye, Loader2 } from 'lucide-react';

export const SMMProfilePage: React.FC = () => {
  const { user, showToast, refresh: refreshApp } = useApp();
  const { setUser, refresh: refreshAuth } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasPhoto = Boolean(user.avatar && user.avatar.trim());

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    if (hasPhoto) {
      setIsModalOpen(true);
    } else {
      handleUploadClick();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP)', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'warning');
      return;
    }

    setUploading(true);

    try {
      const res = await usersApi.uploadAvatar(file, user.id);

      if (res.user) {
        setUser(res.user);
      } else if (res.url) {
        setUser(prev => prev ? { ...prev, avatar: res.url } : null);
        await usersApi.update(user.id, { avatar: res.url });
      }
      await refreshApp();
      await refreshAuth();
      showToast('Profile photo updated successfully!', 'success');
      // Automatically open view & adjust modal for user to tune crop if desired
      setIsModalOpen(true);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      showToast(err?.message || 'Failed to update profile photo', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveAdjustedPhoto = async (base64Image: string) => {
    setUploading(true);
    try {
      const res = await usersApi.uploadAvatar(base64Image, user.id);
      if (res.user) {
        setUser(res.user);
      } else if (res.url) {
        setUser(prev => prev ? { ...prev, avatar: res.url } : null);
        await usersApi.update(user.id, { avatar: res.url });
      }
      await refreshApp();
      await refreshAuth();
      showToast('Profile photo position saved successfully!', 'success');
    } catch (err: any) {
      console.error('Save position failed:', err);
      showToast(err?.message || 'Failed to save photo position', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user.avatar) return;
    setUploading(true);
    try {
      const updatedUser = await usersApi.update(user.id, { avatar: '' });
      setUser(updatedUser);
      await refreshApp();
      await refreshAuth();
      showToast('Profile photo removed.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove profile photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard glow="purple" className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with dynamic hover (View Photo / Upload Photo) */}
          <div className="relative group shrink-0">
            <UserAvatar
              src={user.avatar}
              name={user.name}
              size="2xl"
              className="border-4 border-indigo-500/40 shadow-2xl rounded-3xl"
            />

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Quick upload camera icon button on avatar corner */}
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              title={hasPhoto ? 'Change Photo' : 'Upload Photo'}
              className="absolute -bottom-1 -right-1 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border-2 border-slate-950 shadow-lg transition-transform hover:scale-110 cursor-pointer disabled:cursor-not-allowed z-10"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Main Avatar Hover Overlay: "View Photo" if photo exists, "Upload Photo" if not */}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              title={hasPhoto ? 'View & Adjust Photo' : 'Upload Photo'}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              ) : hasPhoto ? (
                <>
                  <Eye className="w-6 h-6 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">View Photo</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Upload Photo</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              {user.name}
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            </h1>
            <p className="text-sm font-bold text-indigo-300">{user.title} • {user.brand}</p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-3 mt-1">
              <span>📍 {user.district} District</span>
              <span>•</span>
              <span>📞 {user.phone}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Level</div>
            <div className="text-lg font-black text-amber-400">Lvl {user.level}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Quality Score</div>
            <div className="text-lg font-black text-purple-300">{user.qualityScore}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Trust Score</div>
            <div className="text-lg font-black text-cyan-300">{user.trustScore}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Missions Done</div>
            <div className="text-lg font-black text-emerald-400">{user.totalCompletedMissions}</div>
          </div>
        </div>
      </GlassCard>

      {/* Interactive View & Adjust Photo Modal */}
      {hasPhoto && (
        <ProfilePhotoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={user.avatar}
          name={user.name}
          onSaveAdjusted={handleSaveAdjustedPhoto}
          onRemovePhoto={handleRemovePhoto}
          onChangePhoto={handleUploadClick}
        />
      )}
    </div>
  );
};
