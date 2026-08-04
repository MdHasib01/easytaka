import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AppRole,
  DetailedRole,
  SMMUser,
  Brand,
  Mission,
  RapidMission,
  BadgeItem,
  AppNotification
} from '../types';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/client';
import {
  badgesApi,
  brandsApi,
  missionsApi,
  notificationsApi,
  rapidApi,
  usersApi,
  walletApi
} from '../api/endpoints';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface AppContextType {
  role: AppRole;
  detailedRole: DetailedRole;
  user: SMMUser;
  brands: Brand[];
  workforce: SMMUser[];
  missions: Mission[];
  rapidMissions: RapidMission[];
  badges: BadgeItem[];
  notifications: AppNotification[];
  loading: boolean;
  refresh: () => Promise<void>;
  toast: { message: string; type: ToastType } | null;
  showToast: (message: string, type?: ToastType) => void;
  levelUpModalOpen: boolean;
  setLevelUpModalOpen: (open: boolean) => void;
  triggerConfetti: () => void;
  claimRapidMission: (rapidId: string) => Promise<void>;
  submitMissionProof: (missionId: string, proofUrl: string, note?: string) => Promise<void>;
  reviewMission: (
    missionId: string,
    status: 'Approved' | 'Revision Required' | 'Rejected',
    feedback?: string
  ) => Promise<void>;
  addBrand: (brand: Omit<Brand, 'id' | 'spentBudget' | 'activeMissions' | 'totalSMMs'>) => Promise<void>;
  addMission: (mission: Omit<Mission, 'id' | 'progress' | 'status'>) => Promise<void>;
  addRapidMission: (
    rapid: Omit<RapidMission, 'id' | 'claimedSlots' | 'status'> & { durationSeconds?: number }
  ) => Promise<void>;
  addSMMUser: (smm: Partial<SMMUser>) => Promise<void>;
  updateBadgeList: (badges: BadgeItem[]) => Promise<void>;
  requestWithdrawal: (amount: number, method: string) => Promise<void>;
  startMission: (missionId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Placeholder used only before /auth/me resolves, so pages never read undefined. */
const EMPTY_USER: SMMUser = {
  id: '',
  name: '',
  avatar: '',
  title: '',
  district: '',
  brand: '',
  level: 1,
  xp: 0,
  maxXp: 500,
  streak: 0,
  qualityScore: 0,
  trustScore: 0,
  estimatedSalary: 0,
  rapidEarnings: 0,
  activeBadges: [],
  status: 'Active',
  totalCompletedMissions: 0,
  joinDate: '',
  phone: '',
  email: '',
  walletBalance: 0
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, setUser: setAuthUser, token } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [workforce, setWorkforce] = useState<SMMUser[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rapidMissions, setRapidMissions] = useState<RapidMission[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);

  const user = authUser ?? EMPTY_USER;
  const role: AppRole = (authUser?.role as AppRole) ?? 'smm';
  const detailedRole: DetailedRole = (authUser?.detailedRole as DetailedRole) ?? 'SMM Executive';

  // --- pure UI state, unchanged from the prototype -------------------------
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const triggerConfetti = useCallback(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);

  /** Every mutation funnels its failures through here. */
  const fail = useCallback(
    (err: unknown, fallback: string) => {
      showToast(err instanceof ApiError ? err.message : fallback, 'error');
      throw err;
    },
    [showToast]
  );

  const celebrate = useCallback(() => {
    setLevelUpModalOpen(true);
    triggerConfetti();
  }, [triggerConfetti]);

  // --- bootstrap -----------------------------------------------------------
  const refresh = useCallback(async () => {
    if (!token || !authUser) return;
    setLoading(true);
    try {
      const isAdmin = authUser.role === 'admin';
      const [brandRows, missionPage, rapidRows, badgeRows, notificationRows, workforceRows] =
        await Promise.all([
          brandsApi.list(),
          missionsApi.list({ pageSize: 100 }),
          rapidApi.list(),
          badgesApi.list(),
          notificationsApi.list(),
          isAdmin ? usersApi.list({ role: 'smm' }) : Promise.resolve<SMMUser[]>([])
        ]);

      setBrands(brandRows);
      setMissions(missionPage.items);
      setRapidMissions(rapidRows);
      setBadges(badgeRows);
      setNotifications(notificationRows);
      setWorkforce(workforceRows);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) {
        showToast(err instanceof ApiError ? err.message : 'Could not load platform data', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [token, authUser, showToast]);

  useEffect(() => {
    void refresh();
    // Re-bootstrap on sign-in / sign-out, not on every user field change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authUser?.id]);

  // --- mutations -----------------------------------------------------------
  const claimRapidMission = useCallback(
    async (rapidId: string) => {
      try {
        const result = await rapidApi.claim(rapidId);
        setRapidMissions((prev) => prev.map((r) => (r.id === rapidId ? result.rapid : r)));
        setAuthUser(result.user);
        if (result.leveledUp) celebrate();
        showToast(
          `🔥 Rapid Mission Claimed! +৳${result.claim.rewardPaid} & +${result.claim.xpAwarded} XP`,
          'success'
        );
        void notificationsApi.list().then(setNotifications).catch(() => {});
      } catch (err) {
        fail(err, 'Could not claim this blitz');
      }
    },
    [setAuthUser, celebrate, showToast, fail]
  );

  const submitMissionProof = useCallback(
    async (missionId: string, proofUrl: string, note?: string) => {
      try {
        const mission = await missionsApi.submitProof(missionId, { url: proofUrl, note });
        setMissions((prev) => prev.map((m) => (m.id === missionId ? mission : m)));
        showToast('🚀 Proof Submitted Successfully! Pending Admin Review.', 'info');
      } catch (err) {
        fail(err, 'Could not submit proof');
      }
    },
    [showToast, fail]
  );

  const reviewMission = useCallback(
    async (missionId: string, status: 'Approved' | 'Revision Required' | 'Rejected', feedback?: string) => {
      try {
        const result = await missionsApi.review(missionId, status, feedback);
        setMissions((prev) => prev.map((m) => (m.id === missionId ? result.mission : m)));

        // The credited user is the ASSIGNEE. Only patch the local session when
        // the reviewer happens to be that same person.
        setWorkforce((prev) => prev.map((w) => (w.id === result.user.id ? result.user : w)));
        if (authUser && result.user.id === authUser.id) setAuthUser(result.user);

        if (status === 'Approved') {
          showToast(`✅ Mission Approved — ৳${result.mission.monetaryReward} credited to ${result.user.name}`, 'success');
        } else {
          showToast(`⚠️ Mission status updated to: ${status}`, 'warning');
        }
      } catch (err) {
        fail(err, 'Could not submit this review');
      }
    },
    [authUser, setAuthUser, showToast, fail]
  );

  const addBrand = useCallback(
    async (brandData: Omit<Brand, 'id' | 'spentBudget' | 'activeMissions' | 'totalSMMs'>) => {
      try {
        const brand = await brandsApi.create(brandData);
        setBrands((prev) => [brand, ...prev]);
        showToast(`🏢 New Brand "${brand.name}" Created Successfully!`, 'success');
      } catch (err) {
        fail(err, 'Could not create brand');
      }
    },
    [showToast, fail]
  );

  const addMission = useCallback(
    async (missionData: Omit<Mission, 'id' | 'progress' | 'status'>) => {
      try {
        const mission = await missionsApi.create({
          title: missionData.title,
          brandId: missionData.brandId,
          platform: missionData.platform,
          priority: missionData.priority,
          category: missionData.category,
          deadline: missionData.deadline,
          xpReward: missionData.xpReward,
          monetaryReward: missionData.monetaryReward,
          proofRequirement: missionData.proofRequirement,
          description: missionData.description,
          targetAudience: missionData.targetAudience
        });
        setMissions((prev) => [mission, ...prev]);
        showToast(`📋 Mission "${mission.title}" Launched!`, 'success');
      } catch (err) {
        fail(err, 'Could not launch mission');
      }
    },
    [showToast, fail]
  );

  const addRapidMission = useCallback(
    async (rapidData: Omit<RapidMission, 'id' | 'claimedSlots' | 'status'> & { durationSeconds?: number }) => {
      try {
        const rapid = await rapidApi.create({
          title: rapidData.title,
          brandName: rapidData.brandName,
          brandId: rapidData.brandId ?? undefined,
          platform: rapidData.platform,
          reward: rapidData.reward,
          xpReward: rapidData.xpReward,
          requiredLevel: rapidData.requiredLevel,
          requiredBadgeName: rapidData.requiredBadge ?? null,
          totalSlots: rapidData.totalSlots,
          durationSeconds: rapidData.durationSeconds ?? rapidData.timeRemainingSeconds ?? 1800,
          urgencyLevel: rapidData.urgencyLevel,
          instructions: rapidData.instructions
        });
        setRapidMissions((prev) => [rapid, ...prev]);
        showToast(`⚡ Rapid Emergency Blitz "${rapid.title}" Deployed!`, 'warning');
      } catch (err) {
        fail(err, 'Could not deploy this blitz');
      }
    },
    [showToast, fail]
  );

  const addSMMUser = useCallback(
    async (smmData: Partial<SMMUser>) => {
      try {
        const { user: created, tempPassword } = await usersApi.create({
          name: smmData.name ?? 'New SMM Specialist',
          email: smmData.email ?? `smm-${Date.now()}@easytaka.com`,
          phone: smmData.phone,
          district: smmData.district,
          title: smmData.title,
          brand: smmData.brand,
          level: smmData.level,
          baseSalary: smmData.estimatedSalary
        });
        setWorkforce((prev) => [created, ...prev]);
        showToast(`👤 "${created.name}" onboarded — temporary password: ${tempPassword}`, 'success');
      } catch (err) {
        fail(err, 'Could not onboard this specialist');
      }
    },
    [showToast, fail]
  );

  const updateBadgeList = useCallback(
    async (newBadges: BadgeItem[]) => {
      // The UI hands back the whole array with the new badge prepended; the API
      // takes one badge at a time, so create whatever is not persisted yet.
      try {
        const known = new Set(badges.map((b) => b.id));
        const created = newBadges.filter((b) => !known.has(b.id));
        for (const badge of created) {
          await badgesApi.create({
            name: badge.name,
            iconName: badge.iconName,
            category: badge.category,
            tier: badge.tier,
            description: badge.description,
            requirementText: badge.requirementText,
            salaryBoost: badge.salaryBoost
          });
        }
        setBadges(await badgesApi.list());
        showToast('🏆 Gamification Badges & Levels Updated!', 'info');
      } catch (err) {
        fail(err, 'Could not update badges');
      }
    },
    [badges, showToast, fail]
  );

  const requestWithdrawal = useCallback(
    async (amount: number, method: string) => {
      try {
        const result = await walletApi.withdraw(amount, method);
        setAuthUser(result.user);
        showToast(`💸 Withdrawal of ৳${amount} via ${method} initiated!`, 'success');
        triggerConfetti();
      } catch (err) {
        fail(err, 'Could not process this withdrawal');
      }
    },
    [setAuthUser, showToast, triggerConfetti, fail]
  );

  const startMission = useCallback(
    async (missionId: string) => {
      try {
        const mission = await missionsApi.start(missionId);
        setMissions((prev) => prev.map((m) => (m.id === missionId ? mission : m)));
        showToast('🚀 Mission Started! You can now execute and submit proof.', 'info');
      } catch (err) {
        fail(err, 'Could not start this mission');
      }
    },
    [showToast, fail]
  );

  return (
    <AppContext.Provider
      value={{
        role,
        detailedRole,
        user,
        brands,
        workforce,
        missions,
        rapidMissions,
        badges,
        notifications,
        loading,
        refresh,
        toast,
        showToast,
        levelUpModalOpen,
        setLevelUpModalOpen,
        triggerConfetti,
        claimRapidMission,
        submitMissionProof,
        reviewMission,
        addBrand,
        addMission,
        addRapidMission,
        addSMMUser,
        updateBadgeList,
        requestWithdrawal,
        startMission
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
