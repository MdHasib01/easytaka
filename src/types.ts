export type Role = 'ADMIN' | 'SMM' | 'REVIEWER' | 'MANAGER';

// ---- Auth & administration (real API) ----------------------------------------------

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface Verification {
  status: VerificationStatus;
  note?: string;
  reviewedAt?: string;
  reviewedBy?: { id: string; name: string } | string;
}

export interface BrandSummary {
  id: string;
  name: string;
  logo: string;
  status: 'Active' | 'Inactive';
  industry?: string;
  primaryPlatform?: string;
}

export interface AdminBrand extends BrandSummary {
  emailGuideline?: string;
  smmCount: number;
  staffCount: number;
  pendingVerifications: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  brand: string | null;
  avatar?: string;
  status: 'Active' | 'Suspended';
}

export interface AuthSmmProfile {
  id: string;
  nidDivision: string;
  assignedWorkingDivision?: string;
  designation?: string;
  verification?: Verification;
}

export interface AuthSession {
  user: AuthUser;
  smm: AuthSmmProfile | null;
  /** The user's brand, or the brand a platform admin is logged in as. */
  brand: BrandSummary | null;
  impersonating: boolean;
}

export interface ManagedUser extends Omit<AuthUser, 'brand'> {
  brand: { id: string; name: string; logo: string } | null;
  createdAt: string;
  lastLoginAt?: string;
  smm: {
    id: string;
    nidDivision: string;
    assignedWorkingDivision?: string;
    verification?: Verification;
    hasNid: boolean;
  } | null;
}

export interface NidDetails {
  user: { id: string; name: string; email: string; phone?: string };
  brand: { id: string; name: string; logo: string } | null;
  number: string | null;
  nidDivision: string;
  assignedWorkingDivision?: string;
  frontUrl: string | null;
  backUrl: string | null;
  verification?: Verification;
}

export interface Persona {
  avatar: string;
  coverPhoto: string;
  fullName: string;
  username: string;
  displayName: string;
  ageRange: string;
  gender: string;
  location: string;
  occupation: string;
  education: string;
  relationshipContext: string;
  interests: string;
  hobbies: string;
  lifestyle: string;
  personalityTraits: string;
  writingStyle: string;
  toneOfVoice: string;
  commonVocabulary: string;
  preferredLanguage: string;
  languageMix: string;
  emojiStyle: string;
  postingStyle: string;
  commentStyle: string;
  likedTopics: string;
  avoidedTopics: string;
  brandRelevance: string;
  specialNotes: string;
  completeness: number;
}

export interface Note {
  id: string;
  type: string;
  title: string;
  content: string;
  product: string;
  relatedMission?: string;
  date: string;
  tags: string[];
  isImportant: boolean;
  isPinned: boolean;
  commentContext?: {
    originalComment: string;
    context: string;
    tone: string;
  };
}

export interface SocialAccount {
  id: string;
  smmId: string;
  name: string; // fallback if persona not present
  platform: string;
  email: string;
  status: 'New' | 'Enrichment Started' | 'Under Review' | 'Revision Required' | 'Approved' | 'Eligible' | 'Locked';
  enrichmentPercent: number;
  stages: EnrichmentStage[];
  approvalStatus: 'Approved' | 'Under Review' | 'Revision Required' | null;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  todayCompletionPercent: number;
  assignedProductCount: number;
  lastActivity: string;
  persona?: Persona;
  notes?: Note[];
  contentEntries?: ContentEntry[];
  history?: EnrichmentHistoryEvent[];
  fullEnrichmentRewardGranted?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  topic: string;
  relatedAccountId?: string;
  relatedMissionId?: string;
  messages: Message[];
  unreadCount: number;
  lastUpdated: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  status: 'Active' | 'Inactive';
  industry: string;
  primaryPlatform: string;
}

export interface Product {
  id: string;
  brandId: string;
  name: string;
  sku: string;
  type: string;
  shortDescription: string;
  status: 'Active' | 'Inactive';
  assignedSmmCount: number;
}

export interface SMM {
  id: string;
  name: string;
  avatar: string;
  role: string;
  brandId: string;
  nidDivision: string;
  assignedWorkingDivision: string;
  managedIds: number;
  approvedEnrichedIds: number;
  level: number;
  lifetimeXp: number;
  redeemableXp: number;
  currentStreak: number;
  qualityScore: number;
  weeklyEarnings: number;
  assignedProductIds: string[];
  status: 'Active' | 'Suspended';
  jobHolderUnlocked?: boolean;
  jobHolderBonusClaimed?: boolean;
}

export interface EnrichmentStage {
  id: string;
  name: string;
  weight: number; // Percentage contribution (e.g., 10, 15)
  status: 'Locked' | 'Available' | 'Ready to Submit' | 'Under Review' | 'Approved' | 'Revision Required' | 'Rejected';
  xpReward: number;
  checklist: { id: string; label: string; checked: boolean }[];
  submission?: {
    screenshotUrl?: string;
    screenshots?: string[];
    profileUrl?: string;
    notes?: string;
    checklistConfirmed?: boolean;
    relatedProduct?: string;
    date?: string;
    status: 'Pending' | 'Submitted' | 'Revision' | 'Approved';
    reviewerNote?: string;
  };
}

export interface Mission {
  id: string;
  name: string;
  brandId: string;
  platform: string;
  category: string;
  frequency: string;
  deadline: string;
  xpReward: number;
  cashReward?: number;
  status: 'Available' | 'Assigned' | 'In Progress' | 'Submitted' | 'Revision Required' | 'Completed';
  progress?: number; // percentage
  isRapid: boolean;
}


export interface ContentEntry {
  id: string;
  type: string;
  title: string;
  date: string;
  url?: string;
  screenshot?: string;
  note?: string;
  relatedProduct?: string;
}

export interface EnrichmentHistoryEvent {
  id: string;
  date: string;
  stageName: string;
  status: 'Approved' | 'Revision Required' | 'Rejected' | 'Submitted';
  reviewer: string;
  note?: string;
  xpAwarded?: number;
  progressBefore: number;
  progressAfter: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
