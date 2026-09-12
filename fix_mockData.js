const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf8');

code = code.replace(
  `todayCompletionPercent: i < 16 ? Math.floor(Math.random() * 100) : 0,
    assignedProductCount: Math.floor(Math.random() * 3) + 1,
    lastActivity: '2 hours ago'`,
  `todayTasksCompleted: i < 16 ? Math.floor(Math.random() * 5) : 0,
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
    ] : []`
);

fs.writeFileSync('src/data/mockData.ts', code);
