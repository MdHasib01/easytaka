export type AppRole = 'admin' | 'smm';

export type DetailedRole = 
  | 'Super Admin'
  | 'Brand Admin'
  | 'Operations Manager'
  | 'Team Leader'
  | 'Reviewer'
  | 'Finance Manager'
  | 'Trainer'
  | 'SMM Executive';

export type PlatformType = 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'X/Twitter';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type MissionStatus = 
  | 'Available' 
  | 'In Progress' 
  | 'Submitted' 
  | 'Approved' 
  | 'Revision Required' 
  | 'Rejected';

export interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  activeMissions: number;
  totalSMMs: number;
  monthlyBudget: number;
  spentBudget: number;
  status: 'Active' | 'Paused';
  districtCount: number;
}

export interface SMMUser {
  id: string;
  name: string;
  avatar: string;
  title: string;
  district: string;
  brand: string;
  level: number;
  xp: number;
  maxXp: number;
  streak: number;
  qualityScore: number;
  trustScore: number;
  /** Projected monthly net salary. Does NOT drop on withdrawal — see walletBalance. */
  estimatedSalary: number;
  rapidEarnings: number;
  activeBadges: string[];
  status: 'Active' | 'At-Risk' | 'Inactive' | 'Top Performer';
  totalCompletedMissions: number;
  joinDate: string;
  phone: string;
  email: string;

  // --- server-provided, optional so mock-shaped objects still type-check ---
  role?: AppRole;
  detailedRole?: DetailedRole;
  brandId?: string | null;
  /** Withdrawable cash. This is what a withdrawal reduces. */
  walletBalance?: number;
  baseSalary?: number;
  payoutMethod?: PaymentMethod;
  payoutAccount?: string;
}

export interface ProofSubmission {
  url: string;
  screenshotUrl?: string;
  note?: string;
  submittedAt: string;
  feedback?: string;
}

export interface Mission {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  platform: PlatformType;
  priority: PriorityLevel;
  deadline: string;
  xpReward: number;
  monetaryReward: number;
  progress: number; // 0 - 100
  proofRequirement: string;
  status: MissionStatus;
  description: string;
  targetAudience?: string;
  submissionProof?: ProofSubmission;
  category: 'Engagement' | 'Content Creation' | 'Community Growth' | 'Moderation' | 'Viral Campaign';

  /** The owner. Rewards on approval go here, not to whoever reviewed it. */
  assignedSmmId?: string | null;
  assignedToName?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  deadlineISO?: string | null;
}

export interface RapidMission {
  id: string;
  title: string;
  brandName: string;
  platform: PlatformType;
  reward: number;
  xpReward: number;
  requiredLevel: number;
  requiredBadge?: string;
  totalSlots: number;
  claimedSlots: number;
  timeRemainingSeconds: number;
  urgencyLevel: 'Extreme' | 'High' | 'Medium';
  status: 'Active' | 'Claimed' | 'Expired';
  instructions: string;

  brandId?: string | null;
  /** Absolute expiry, so the countdown survives a reload. */
  expiresAt?: string | null;
  myClaim?: {
    id: string;
    status: 'Claimed' | 'Submitted' | 'Verified' | 'Forfeited';
    rewardPaid: number;
    xpAwarded: number;
    claimedAt: string | null;
  } | null;
}

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface BadgeItem {
  id: string;
  name: string;
  iconName: string;
  category: 'Speed' | 'Quality' | 'Consistency' | 'Loyalty' | 'Specialist';
  tier: BadgeTier;
  description: string;
  salaryBoost: number; // e.g. +৳200/mo
  isUnlocked: boolean;
  unlockedAt?: string;
  requirementText: string;
}

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  costXP: number;
  requiredLevel: number;
  isUnlocked: boolean;
  isAvailable: boolean;
  category: 'Content' | 'Community' | 'Analytics' | 'Viral';
  iconName: string;
}

export interface SalaryBreakdown {
  baseSalary: number;
  rapidEarnings: number;
  badgeAllowance: number;
  performanceBonus: number;
  deductions: number;
  netSalary: number;
  currency: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Bank Transfer' | 'Rocket';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: 'Completed' | 'Processing' | 'Failed';
  reference: string;
  kind?: 'withdrawal' | 'payroll';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: 'Admin' | 'SMM' | 'System';
  action: string;
  target: string;
  ip: string;
  status: 'Success' | 'Warning' | 'Error';
}

export interface DistrictStat {
  district: string;
  activeSMMs: number;
  missionCompletionRate: number;
  totalPayout: number;
  qualityAvg: number;
  topBrand: string;
}

export interface AppNotification {
  id: string;
  type: 'rapid' | 'mission' | 'level' | 'payout' | 'system';
  title: string;
  message: string;
  /** Relative text derived server-side from createdAt on every read. */
  time: string;
  read: boolean;
  actionUrl?: string;
  createdAt?: string | null;
}

/* ------------------------------------------------------------------------- *
 * Consolidated here from mockData.ts and AdminWalletPage.tsx, where they
 * previously lived alongside the fixtures that used them.
 * ------------------------------------------------------------------------- */

export interface LeaveRequest {
  id: string;
  ref?: string;
  smmName: string;
  type: 'Casual Leave' | 'Medical Leave' | 'Emergency Leave';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
  decisionNote?: string;
  userId?: string;
}

export interface LeaveBalance {
  type: LeaveRequest['type'];
  allowance: number;
  used: number;
  remaining: number;
}

export interface AppealItem {
  id: string;
  ref?: string;
  missionTitle: string;
  type: 'Incorrect Rejection' | 'Reward Mismatch' | 'Penalty Dispute' | 'System Glitch';
  explanation: string;
  status: 'Under Review' | 'Resolved' | 'Rejected';
  submittedDate: string;
  decisionNote?: string;
  smmName?: string;
  userId?: string;
}

export interface SupportTicket {
  id: string;
  ref?: string;
  subject: string;
  category: 'Wallet & Payout' | 'Mission Issue' | 'Account & Device' | 'Emergency Help';
  priority: PriorityLevel;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  lastMessage: string;
  smmName?: string;
  userId?: string;
}

export interface TicketMessage {
  id: string;
  authorName: string;
  authorRole: AppRole;
  body: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Present only for admins — the server strips it for SMM requests. */
  correctIndex?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  category: 'Onboarding' | 'Maternal Care Branding' | 'Viral Growth' | 'Compliance & Ethics';
  durationMins: number;
  totalLessons: number;
  completedLessons: number;
  assignedCount: number;
  passRate: number;
  isCompleted: boolean;
  quizQuestions: QuizQuestion[];
  passThresholdPct?: number;
  xpReward?: number;
  isPublished?: boolean;
  bestScorePct?: number;
  attempts?: number;
}

export interface QuizResult {
  scorePct: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  xpAwarded: number;
  leveledUp: boolean;
  user: SMMUser;
}

export type TransactionType =
  | 'Mission Reward'
  | 'Rapid Bonus'
  | 'Badge Allowance'
  | 'Manual Adjustment'
  | 'Withdrawal Payout'
  | 'Payroll Disbursal';

export interface Transaction {
  id: string;
  ref?: string;
  smmName: string;
  type: TransactionType;
  /** Signed: negative for debits. */
  amount: number;
  direction: 'credit' | 'debit';
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  method?: string;
  note?: string;
  userId?: string | null;
  balanceAfter?: number;
}

/* -------------------------------- API-only shapes ------------------------- */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: SMMUser;
}

export interface WalletSummary {
  salaryBreakdown: SalaryBreakdown;
  walletBalance: number;
  payoutMethod: PaymentMethod;
  paymentHistory: PaymentRecord[];
  recentTransactions: Transaction[];
}

export interface WalletKpis {
  creditedThisWeek: number;
  withdrawnThisWeek: number;
  pendingAmount: number;
  pendingCount: number;
  totalHeldBalance: number;
}

export interface AdminWeeklyPoint {
  day: string;
  completed: number;
  rapid: number;
  pending: number;
}

export interface SmmWeeklyPoint {
  day: string;
  xp: number;
  earnings: number;
}

export interface CommandCenterKpis {
  totalBrands: number;
  activeSMMs: number;
  pendingReviews: number;
  activeRapid: number;
  atRiskCount: number;
  payrollForecast: number;
  brandCampaignShare: { name: string; value: number }[];
  fraudAlerts: { suspiciousClusters: number };
}

export interface LevelRule {
  id: string;
  minLevel: number;
  maxLevel: number | null;
  range: string;
  xp: number;
  boost: string;
  salary: number;
  order: number;
}

export interface SystemSettingItem {
  id: string;
  key: string;
  value: string | number | boolean;
  valueType: 'number' | 'boolean' | 'string' | 'json';
  group: string;
  label: string;
  description: string;
}

export interface PayrollRun {
  id: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  status: 'Draft' | 'Locked' | 'Disbursed' | 'Failed';
  filters: { district: string | null; brandName: string | null };
  totals: { gross: number; deductions: number; net: number; smmCount: number };
  gateway: string;
  lockedAt: string | null;
  disbursedAt: string | null;
}

export interface PayrollLine {
  id: string;
  runId: string;
  userId: string;
  userName: string;
  district: string;
  brandName: string;
  baseSalary: number;
  rapidEarnings: number;
  badgeAllowance: number;
  performanceBonus: number;
  customBonus: number;
  deduction: number;
  netPay: number;
  selected: boolean;
  method: PaymentMethod;
  status: 'Pending' | 'Paid' | 'Failed';
}

export interface ReportsSummary {
  districts: DistrictStat[];
  missionsByStatus: { status: MissionStatus; count: number }[];
  topEarners: {
    id: string;
    name: string;
    district: string;
    estimatedSalary: number;
    qualityScore: number;
  }[];
}
