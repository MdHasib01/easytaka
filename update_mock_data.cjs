const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf8');

const defaultStages = `[
      {
        id: 'stg1', name: 'Account Setup & Security', weight: 10, status: 'Approved', xpReward: 50,
        checklist: [
          { id: 'c1', label: 'Linked email added', checked: true },
          { id: 'c2', label: 'Email verified', checked: true },
          { id: 'c3', label: '2FA enabled', checked: true },
          { id: 'c4', label: 'Recovery method added', checked: true },
          { id: 'c5', label: 'Social profile URL added', checked: true },
          { id: 'c6', label: 'Platform selected', checked: true },
          { id: 'c7', label: 'Account access confirmed', checked: true },
          { id: 'c8', label: 'Setup proof prepared', checked: true }
        ],
        submission: { status: 'Approved' }
      },
      {
        id: 'stg2', name: 'Profile Identity Complete', weight: 15, status: 'Approved', xpReward: 100,
        checklist: [
          { id: 'c1', label: 'Profile photo added', checked: true },
          { id: 'c2', label: 'Cover photo added', checked: true },
          { id: 'c3', label: 'Full name completed', checked: true },
          { id: 'c4', label: 'Username completed', checked: true },
          { id: 'c5', label: 'Bio completed', checked: true },
          { id: 'c6', label: 'Location/profile fields', checked: true },
          { id: 'c7', label: 'Profile URL verified', checked: true }
        ],
        submission: { status: 'Approved' }
      },
      {
        id: 'stg3', name: 'Profile Information Complete', weight: 15, status: 'Approved', xpReward: 100,
        checklist: [],
        submission: { status: 'Approved' }
      },
      {
        id: 'stg4', name: 'Persona Setup Complete', weight: 15, status: 'Approved', xpReward: 150,
        checklist: [],
        submission: { status: 'Approved' }
      },
      {
        id: 'stg5', name: 'Content Foundation', weight: 15, status: 'Under Review', xpReward: 200,
        checklist: [],
        submission: { status: 'Submitted', date: 'Sep 8, 8:42 AM', reviewerNote: '' }
      },
      {
        id: 'stg6', name: 'Account Activity / Readiness', weight: 10, status: 'Locked', xpReward: 100,
        checklist: [
          { id: 'c1', label: 'Account accessible', checked: false },
          { id: 'c2', label: 'No visible restriction/warning', checked: false },
          { id: 'c3', label: 'Recent normal activity exists', checked: false },
          { id: 'c4', label: 'Profile settings checked', checked: false },
          { id: 'c5', label: 'Assigned product info reviewed', checked: false },
          { id: 'c6', label: 'Brand guideline reviewed', checked: false },
          { id: 'c7', label: 'Ready for assigned work', checked: false }
        ]
      },
      {
        id: 'stg7', name: 'Persona Notes & Consistency', weight: 10, status: 'Locked', xpReward: 100,
        checklist: []
      },
      {
        id: 'stg8', name: 'Final Eligibility Review', weight: 10, status: 'Locked', xpReward: 250,
        checklist: [
          { id: 'c1', label: 'Setup approved', checked: false },
          { id: 'c2', label: 'Security complete', checked: false },
          { id: 'c3', label: 'Profile identity complete', checked: false },
          { id: 'c4', label: 'Profile information complete', checked: false },
          { id: 'c5', label: 'Persona approved', checked: false },
          { id: 'c6', label: 'Content foundation approved', checked: false },
          { id: 'c7', label: 'Account readiness approved', checked: false },
          { id: 'c8', label: 'Persona notes sufficient', checked: false },
          { id: 'c9', label: 'No unresolved revisions', checked: false },
          { id: 'c10', label: 'Account active', checked: false },
          { id: 'c11', label: 'Brand guideline compliant', checked: false }
        ]
      }
    ]`;

const regex = /stages:\s*\[[\s\S]*?\](?=,\s*approvalStatus)/g;
code = code.replace(regex, 'stages: ' + defaultStages);

fs.writeFileSync('src/data/mockData.ts', code);
