const fs = require('fs');
let code = fs.readFileSync('src/components/ProofSubmission.tsx', 'utf8');
code = code.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/components/ProofSubmission.tsx', code);
