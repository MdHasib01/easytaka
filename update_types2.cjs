const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code + `
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
`;

code = code.replace(
  `  contentEntries?: ContentEntry[];
}`,
  `  contentEntries?: ContentEntry[];
  history?: EnrichmentHistoryEvent[];
  fullEnrichmentRewardGranted?: boolean;
}`
);

fs.writeFileSync('src/types.ts', code);
