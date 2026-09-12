const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  `export interface EnrichmentStage {
  id: string;
  name: string;
  status: 'Locked' | 'Available' | 'Under Review' | 'Approved' | 'Revision Required';
  xpReward: number;
}`,
  `export interface EnrichmentStage {
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
}`
);

// We need to add Content Foundation types
code = code + `

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
`;

// Add ContentEntry array to SocialAccount
code = code.replace(
  `  notes?: Note[];
}`,
  `  notes?: Note[];
  contentEntries?: ContentEntry[];
}`
);


fs.writeFileSync('src/types.ts', code);
