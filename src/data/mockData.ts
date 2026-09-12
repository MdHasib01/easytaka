import { Brand, Mission, Product, SMM, SocialAccount } from '../types';

export const mockBrands: Brand[] = [
  {
    id: 'b1',
    name: 'Milkimom',
    logo: '🥛',
    status: 'Active',
    industry: 'FMCG / Baby Care',
    primaryPlatform: 'Facebook',
  }
];

export const mockProducts: Product[] = [
  { id: 'p1', brandId: 'b1', name: 'Milkimom Standard 400g', sku: 'MM-400-STD', type: 'Formula', shortDescription: 'Standard infant formula', status: 'Active', assignedSmmCount: 3 },
  { id: 'p2', brandId: 'b1', name: 'Milkimom Premium 400g', sku: 'MM-400-PRM', type: 'Formula', shortDescription: 'Premium infant formula', status: 'Active', assignedSmmCount: 2 },
  { id: 'p3', brandId: 'b1', name: 'Milkimom Gold 800g', sku: 'MM-800-GLD', type: 'Formula', shortDescription: 'Gold standard formula', status: 'Active', assignedSmmCount: 5 },
  { id: 'p4', brandId: 'b1', name: 'Milkimom Care 400g', sku: 'MM-400-CRE', type: 'Formula', shortDescription: 'Special care formula', status: 'Active', assignedSmmCount: 1 },
];

export const mockSMMs: SMM[] = [
  {
    id: 's1',
    name: 'Rafi Islam',
    avatar: '👨🏽‍💻',
    role: 'SMM Executive',
    brandId: 'b1',
    nidDivision: 'Khulna',
    assignedWorkingDivision: 'Dhaka',
    managedIds: 20,
    approvedEnrichedIds: 16,
    level: 7,
    lifetimeXp: 1280,
    redeemableXp: 640,
    currentStreak: 18,
    qualityScore: 94,
    weeklyEarnings: 980,
    assignedProductIds: ['p1', 'p2', 'p3', 'p4'],
    status: 'Active'
  }
];

const defaultStages = (): any[] => [
  { id: 'st1', name: 'Profile Foundation', status: 'Approved', xpReward: 40 },
  { id: 'st2', name: 'Profile Completeness', status: 'Approved', xpReward: 40 },
  { id: 'st3', name: 'Content Foundation', status: 'Approved', xpReward: 40 },
  { id: 'st4', name: 'Organic Activity', status: 'Approved', xpReward: 40 },
  { id: 'st5', name: 'Final Eligibility Review', status: 'Approved', xpReward: 40 },
];

export const mockSocialAccounts: SocialAccount[] = Array.from({ length: 20 }).map((_, i) => {
  let status: any = 'Eligible';
  let stages = defaultStages();
  let enrichmentPercent = 100;
  let approvalStatus: any = 'Approved';
  
  if (i === 16) {
    status = 'Enrichment Started';
    stages = [
      { id: 'st1', name: 'Profile Foundation', status: 'Approved', xpReward: 40 },
      { id: 'st2', name: 'Profile Completeness', status: 'Under Review', xpReward: 40 },
      { id: 'st3', name: 'Content Foundation', status: 'Locked', xpReward: 40 },
      { id: 'st4', name: 'Organic Activity', status: 'Locked', xpReward: 40 },
      { id: 'st5', name: 'Final Eligibility Review', status: 'Locked', xpReward: 40 },
    ];
    enrichmentPercent = 20;
    approvalStatus = 'Under Review';
  } else if (i === 17) {
    status = 'Revision Required';
    stages = [
      { id: 'st1', name: 'Profile Foundation', status: 'Approved', xpReward: 40 },
      { id: 'st2', name: 'Profile Completeness', status: 'Revision Required', xpReward: 40 },
      { id: 'st3', name: 'Content Foundation', status: 'Locked', xpReward: 40 },
      { id: 'st4', name: 'Organic Activity', status: 'Locked', xpReward: 40 },
      { id: 'st5', name: 'Final Eligibility Review', status: 'Locked', xpReward: 40 },
    ];
    enrichmentPercent = 20;
    approvalStatus = 'Revision Required';
  } else if (i === 18) {
    status = 'Enrichment Started';
    stages = [
      { id: 'st1', name: 'Profile Foundation', status: 'Available', xpReward: 40 },
      { id: 'st2', name: 'Profile Completeness', status: 'Locked', xpReward: 40 },
      { id: 'st3', name: 'Content Foundation', status: 'Locked', xpReward: 40 },
      { id: 'st4', name: 'Organic Activity', status: 'Locked', xpReward: 40 },
      { id: 'st5', name: 'Final Eligibility Review', status: 'Locked', xpReward: 40 },
    ];
    enrichmentPercent = 0;
    approvalStatus = null;
  } else if (i === 19) {
    status = 'New';
    stages = [
      { id: 'st1', name: 'Profile Foundation', status: 'Available', xpReward: 40 },
      { id: 'st2', name: 'Profile Completeness', status: 'Locked', xpReward: 40 },
      { id: 'st3', name: 'Content Foundation', status: 'Locked', xpReward: 40 },
      { id: 'st4', name: 'Organic Activity', status: 'Locked', xpReward: 40 },
      { id: 'st5', name: 'Final Eligibility Review', status: 'Locked', xpReward: 40 },
    ];
    enrichmentPercent = 0;
    approvalStatus = null;
  }
  
  return {
    id: `acc-${i + 1}`,
    smmId: 's1',
    name: `Rafi_${i + 1}`,
    platform: 'Facebook',
    email: `r****${i + 1}@gmail.com`,
    status,
    stages,
    enrichmentPercent,
    approvalStatus,
    todayTasksCompleted: i < 16 ? Math.floor(Math.random() * 5) : 0,
    todayTasksTotal: 5,
    todayCompletionPercent: i < 16 ? Math.floor(Math.random() * 100) : 0,
    assignedProductCount: Math.floor(Math.random() * 3) + 1,
    lastActivity: '2 hours ago',
    persona: i === 0 ? {
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
      coverPhoto: 'https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=600&auto=format&fit=crop',
      fullName: 'Nusrat Jahan',
      username: 'nusrat.jahan24',
      displayName: 'Nusrat Jahan',
      ageRange: '24–28',
      gender: 'Female',
      location: 'Dhaka',
      occupation: 'Working Professional',
      education: 'BBA',
      relationshipContext: 'Married, 1 young child',
      interests: 'Parenting, cooking, home decor, lifestyle',
      hobbies: 'Reading, baking',
      lifestyle: 'Young Working Professional, busy but organized',
      personalityTraits: 'Friendly, warm, practical',
      writingStyle: 'Conversational, helpful, uses emojis naturally',
      toneOfVoice: 'Friendly, casual, slightly expressive',
      commonVocabulary: 'Alhamdulillah, shundor, simple, easy',
      preferredLanguage: 'Bangla',
      languageMix: 'Bangla + light Banglish',
      emojiStyle: 'Moderate (😊, ❤️, ✨)',
      postingStyle: 'Personal lifestyle + daily observations',
      commentStyle: 'Encouraging, shares personal experience',
      likedTopics: 'Baby food, family, home routine, productivity',
      avoidedTopics: 'Politics, controversial news',
      brandRelevance: 'High',
      specialNotes: 'Focuses heavily on time-saving tips for working moms.',
      completeness: 92
    } : i === 1 ? {
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      coverPhoto: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
      fullName: 'Sadia Ahmed',
      username: 'sadia.ahmed99',
      displayName: 'Sadia',
      ageRange: '28–32',
      gender: 'Female',
      location: 'Chattogram',
      occupation: 'Teacher',
      education: 'MA',
      relationshipContext: 'Married, 2 kids',
      interests: 'Education, child development, local events',
      hobbies: 'Gardening, crafts',
      lifestyle: 'Family-centered, structured',
      personalityTraits: 'Patient, knowledgeable, warm',
      writingStyle: 'Structured, polite, informative',
      toneOfVoice: 'Professional + warm',
      commonVocabulary: 'Valo, bacha, somoy, porashona',
      preferredLanguage: 'Bangla',
      languageMix: 'Bangla dominant',
      emojiStyle: 'Minimal (👍, 🌸)',
      postingStyle: 'Educational tips, family outings',
      commentStyle: 'Detailed, offers advice',
      likedTopics: 'School, parenting tips, healthy meals',
      avoidedTopics: 'Gossips, drama',
      brandRelevance: 'Medium',
      specialNotes: 'Likes to compare products based on ingredients.',
      completeness: 85
    } : undefined,
    notes: i === 0 ? [
      {
        id: 'n1',
        type: 'Comment History',
        title: 'Baby food discussion',
        content: 'This persona commented positively about homemade baby food and mentioned using simple ingredients.',
        product: 'Milkimom Standard',
        date: 'Today',
        tags: ['baby-food', 'parenting', 'home-cooking'],
        isImportant: false,
        isPinned: true,
        commentContext: {
          originalComment: "Amar basay ami usually simple food e beshi comfortable.",
          context: "Parenting discussion on local group",
          tone: "Casual"
        }
      },
      {
        id: 'n2',
        type: 'Persona Memory',
        title: 'Lifestyle note',
        content: 'Recently mentioned work-from-home lifestyle.',
        product: 'General',
        date: 'Yesterday',
        tags: ['wfh', 'lifestyle'],
        isImportant: true,
        isPinned: false
      }
    ] : []
  };
});

export const mockMissions: Mission[] = [
  {
    id: 'm1',
    name: 'Daily Timeline Post',
    brandId: 'b1',
    platform: 'Facebook',
    category: 'Posting',
    frequency: 'Daily',
    deadline: '2026-09-07T23:59:59Z',
    xpReward: 15,
    status: 'In Progress',
    progress: 60,
    isRapid: false
  },
  {
    id: 'm2',
    name: 'Target Group Engagement',
    brandId: 'b1',
    platform: 'Facebook',
    category: 'Engagement',
    frequency: 'Daily',
    deadline: '2026-09-07T23:59:59Z',
    xpReward: 20,
    status: 'Available',
    progress: 0,
    isRapid: false
  },
  {
    id: 'r1',
    name: 'Urgent Promo Launch Commenting',
    brandId: 'b1',
    platform: 'Facebook',
    category: 'Rapid Task',
    frequency: 'One-time',
    deadline: '2026-09-07T18:00:00Z',
    xpReward: 25,
    cashReward: 10,
    status: 'Assigned',
    progress: 0,
    isRapid: true
  }
];
