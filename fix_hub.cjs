const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

const startStr = `{activeTab === 'Enrichment' && (`;
const endStr = `{activeTab === 'Notes' && (`;

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + `{activeTab === 'Enrichment' && <EnrichmentTab account={account} onSubmitStage={onSubmitStage} />}\n\n           ` + code.substring(endIdx);
  fs.writeFileSync('src/pages/smm/Hub.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Could not find boundaries');
}
