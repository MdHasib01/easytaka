import { api, request } from './client';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import type {
  AdminWeeklyPoint,
  AppNotification,
  AppealItem,
  AuthResponse,
  BadgeItem,
  Brand,
  CommandCenterKpis,
  CourseModule,
  DistrictStat,
  LeaveBalance,
  LeaveRequest,
  LevelRule,
  Mission,
  MissionStatus,
  Paginated,
  PayrollLine,
  PayrollRun,
  QuizResult,
  RapidMission,
  ReportsSummary,
  SMMUser,
  SkillNode,
  SmmWeeklyPoint,
  SupportTicket,
  SystemSettingItem,
  TicketMessage,
  Transaction,
  WalletKpis,
  WalletSummary,
  AuditLog
} from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (body: { name: string; email: string; password: string; phone?: string; district?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),
  me: () => api.get<SMMUser>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<void>('/auth/password', { currentPassword, newPassword })
};

export const usersApi = {
  list: (query?: { role?: string; district?: string; brand?: string; status?: string; q?: string }) =>
    api.get<SMMUser[]>('/users', query),
  create: (body: Partial<SMMUser> & { name: string; email: string }) =>
    api.post<{ user: SMMUser; tempPassword: string }>('/users', body),
  get: (id: string) => api.get<SMMUser>(`/users/${id}`),
  update: (id: string, body: Partial<SMMUser>) => api.patch<SMMUser>(`/users/${id}`, body),
  setStatus: (id: string, status: SMMUser['status']) => api.patch<SMMUser>(`/users/${id}/status`, { status }),
  resetPassword: (id: string) => api.post<{ tempPassword: string }>(`/users/${id}/reset-password`),
  badges: (id: string) => api.get<BadgeItem[]>(`/users/${id}/badges`),
  uploadAvatar: async (image: File | string, userId?: string) => {
    try {
      // Direct Cloudinary upload (works seamlessly on live & local backend)
      const cloudinaryUrl = await uploadImageToCloudinary(image);
      if (userId) {
        const updatedUser = await api.patch<SMMUser>(`/users/${userId}`, { avatar: cloudinaryUrl });
        return { url: cloudinaryUrl, user: updatedUser };
      }
      return { url: cloudinaryUrl };
    } catch (cloudinaryErr) {
      console.warn('Direct Cloudinary upload failed, trying server endpoint:', cloudinaryErr);
      // Fallback to server endpoint if server supports /users/avatar
      const imgStr = typeof image === 'string' ? image : await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });
      return api.post<{ url: string; user?: SMMUser }>('/users/avatar', { image: imgStr });
    }
  }
};

export const brandsApi = {
  list: () => api.get<Brand[]>('/brands'),
  create: (body: Omit<Brand, 'id' | 'spentBudget' | 'activeMissions' | 'totalSMMs'>) =>
    api.post<Brand>('/brands', body),
  update: (id: string, body: Partial<Brand>) => api.patch<Brand>(`/brands/${id}`, body),
  remove: (id: string) => api.del<Brand>(`/brands/${id}`)
};

export const missionsApi = {
  list: (query?: { status?: string; brandId?: string; assigned?: string; q?: string; page?: number; pageSize?: number }) =>
    api.get<Paginated<Mission>>('/missions', query),
  reviewQueue: () => api.get<Mission[]>('/missions/review-queue'),
  get: (id: string) => api.get<Mission>(`/missions/${id}`),
  create: (body: {
    title: string;
    brandId: string;
    platform: string;
    priority?: string;
    category?: string;
    deadline: string;
    xpReward: number;
    monetaryReward: number;
    proofRequirement: string;
    description: string;
    targetAudience?: string;
  }) => api.post<Mission>('/missions', body),
  update: (id: string, body: Partial<Mission>) => api.patch<Mission>(`/missions/${id}`, body),
  start: (id: string) => api.post<Mission>(`/missions/${id}/start`),
  submitProof: (id: string, body: { url: string; screenshotUrl?: string; note?: string }) =>
    api.post<Mission>(`/missions/${id}/proof`, body),
  review: (id: string, status: Extract<MissionStatus, 'Approved' | 'Revision Required' | 'Rejected'>, feedback?: string) =>
    api.post<{ mission: Mission; user: SMMUser; leveledUp: boolean }>(`/missions/${id}/review`, { status, feedback })
};

export const rapidApi = {
  list: () => api.get<RapidMission[]>('/rapid'),
  get: (id: string) => api.get<RapidMission>(`/rapid/${id}`),
  create: (body: {
    title: string;
    brandName: string;
    brandId?: string;
    platform: string;
    reward: number;
    xpReward: number;
    requiredLevel?: number;
    requiredBadgeName?: string | null;
    totalSlots: number;
    durationSeconds: number;
    urgencyLevel?: string;
    instructions: string;
  }) => api.post<RapidMission>('/rapid', body),
  claim: (id: string) =>
    api.post<{
      rapid: RapidMission;
      claim: { id: string; rewardPaid: number; xpAwarded: number };
      user: SMMUser;
      leveledUp: boolean;
    }>(`/rapid/${id}/claim`),
  cancel: (id: string) => api.patch<RapidMission>(`/rapid/${id}/cancel`)
};

export const badgesApi = {
  list: () => api.get<BadgeItem[]>('/badges'),
  create: (body: Partial<BadgeItem> & { name: string }) => api.post<BadgeItem>('/badges', body),
  update: (id: string, body: Partial<BadgeItem>) => api.patch<BadgeItem>(`/badges/${id}`, body),
  remove: (id: string) => api.del<void>(`/badges/${id}`),
  grant: (id: string, userId: string) => api.post<SMMUser>(`/badges/${id}/grant`, { userId })
};

export const skillsApi = {
  list: () => api.get<SkillNode[]>('/skills'),
  create: (body: Partial<SkillNode> & { title: string; costXP: number }) => api.post<SkillNode>('/skills', body),
  unlock: (id: string) => api.post<{ skill: SkillNode; user: SMMUser }>(`/skills/${id}/unlock`)
};

export const levelRulesApi = {
  list: () => api.get<LevelRule[]>('/level-rules'),
  reorder: (ids: string[]) => api.patch<LevelRule[]>('/level-rules/reorder', { ids }),
  update: (id: string, body: Partial<LevelRule>) => api.patch<LevelRule>(`/level-rules/${id}`, body)
};

export const coursesApi = {
  list: () => api.get<CourseModule[]>('/courses'),
  get: (id: string) => api.get<CourseModule>(`/courses/${id}`),
  create: (body: { title: string; category: string; durationMins: number; totalLessons?: number }) =>
    api.post<CourseModule>('/courses', body),
  addQuestion: (id: string, body: { question: string; options: string[]; correctIndex: number }) =>
    api.post<CourseModule>(`/courses/${id}/questions`, body),
  removeQuestion: (id: string, index: number) => api.del<CourseModule>(`/courses/${id}/questions/${index}`),
  setProgress: (id: string, completedLessons: number) =>
    api.post<CourseModule>(`/courses/${id}/progress`, { completedLessons }),
  submitQuiz: (id: string, answers: number[]) => api.post<QuizResult>(`/courses/${id}/quiz/submit`, { answers })
};

export const walletApi = {
  transactions: (query?: { userId?: string; type?: string; q?: string; page?: number; pageSize?: number }) =>
    api.get<Paginated<Transaction>>('/wallet/transactions', query),
  kpis: () => api.get<WalletKpis>('/wallet/kpis'),
  myTransactions: (query?: { page?: number; pageSize?: number }) =>
    api.get<Paginated<Transaction>>('/wallet/me/transactions', query),
  mySummary: () => api.get<WalletSummary>('/wallet/me/summary'),
  adjust: (body: { userId: string; amount: number; direction: 'credit' | 'debit'; note?: string }) =>
    api.post<Transaction>('/wallet/adjustments', body),
  withdraw: (amount: number, method?: string) =>
    api.post<{ transaction: Transaction; payment: unknown; user: SMMUser }>('/wallet/withdrawals', {
      amount,
      method
    })
};

export const payrollApi = {
  runs: () => api.get<PayrollRun[]>('/payroll/runs'),
  createRun: (body: { period?: string; district?: string | null; brandName?: string | null }) =>
    api.post<{ run: PayrollRun; lines: PayrollLine[] }>('/payroll/runs', body),
  getRun: (id: string) => api.get<{ run: PayrollRun; lines: PayrollLine[] }>(`/payroll/runs/${id}`),
  setSelection: (id: string, userIds: string[]) =>
    api.patch<{ totals: PayrollRun['totals']; lines: PayrollLine[] }>(`/payroll/runs/${id}/selection`, { userIds }),
  updateLine: (id: string, body: { customBonus?: number; deduction?: number; selected?: boolean }) =>
    api.patch<PayrollLine>(`/payroll/lines/${id}`, body),
  lock: (id: string) => api.post<PayrollRun>(`/payroll/runs/${id}/lock`),
  disburse: (id: string) =>
    api.post<{ run: PayrollRun; lines: PayrollLine[]; disbursed: number }>(`/payroll/runs/${id}/disburse`),
  disburseLine: (id: string) => api.post<PayrollLine>(`/payroll/lines/${id}/disburse`)
};

export const leaveApi = {
  list: (query?: { status?: string }) => api.get<LeaveRequest[]>('/leave', query),
  balances: () => api.get<LeaveBalance[]>('/leave/balances'),
  create: (body: { type: string; startDate: string; endDate: string; reason: string }) =>
    api.post<LeaveRequest>('/leave', body),
  decide: (id: string, status: LeaveRequest['status'], decisionNote?: string) =>
    api.patch<LeaveRequest>(`/leave/${id}/decision`, { status, decisionNote })
};

export const appealsApi = {
  list: () => api.get<AppealItem[]>('/appeals'),
  create: (body: { missionId?: string; missionTitle: string; type: string; explanation: string }) =>
    api.post<AppealItem>('/appeals', body),
  decide: (id: string, status: AppealItem['status'], decisionNote?: string) =>
    api.patch<AppealItem>(`/appeals/${id}/decision`, { status, decisionNote })
};

export const ticketsApi = {
  list: (query?: { status?: string }) => api.get<SupportTicket[]>('/tickets', query),
  get: (id: string) => api.get<{ ticket: SupportTicket; messages: TicketMessage[] }>(`/tickets/${id}`),
  create: (body: { subject: string; category: string; priority?: string; message: string }) =>
    api.post<SupportTicket>('/tickets', body),
  reply: (id: string, body: string) => api.post<TicketMessage>(`/tickets/${id}/messages`, { body }),
  setStatus: (id: string, status: SupportTicket['status']) =>
    api.patch<SupportTicket>(`/tickets/${id}/status`, { status })
};

export const notificationsApi = {
  list: () => api.get<AppNotification[]>('/notifications'),
  markRead: (id: string) => api.patch<AppNotification>(`/notifications/${id}/read`),
  markAllRead: () => api.post<{ updated: number }>('/notifications/read-all')
};

export const auditApi = {
  list: (query?: { role?: string; status?: string; q?: string; page?: number; pageSize?: number }) =>
    api.get<Paginated<AuditLog>>('/audit-logs', query),
  recent: (limit = 3) => api.get<AuditLog[]>('/audit-logs/recent', { limit })
};

export const settingsApi = {
  list: () => api.get<SystemSettingItem[]>('/settings'),
  update: (key: string, value: string | number | boolean) =>
    api.patch<SystemSettingItem>(`/settings/${key}`, { value })
};

export const statsApi = {
  commandCenter: () => api.get<CommandCenterKpis>('/stats/command-center'),
  districts: (live = false) => api.get<DistrictStat[]>('/stats/districts', { live }),
  recomputeDistricts: () => api.post<DistrictStat[]>('/stats/districts/recompute'),
  adminWeekly: () => api.get<AdminWeeklyPoint[]>('/stats/charts/admin-weekly'),
  smmWeekly: (userId?: string) => api.get<SmmWeeklyPoint[]>('/stats/charts/smm-weekly', { userId }),
  reports: () => api.get<ReportsSummary>('/stats/reports/summary')
};
