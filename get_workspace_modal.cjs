const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');
const start = code.indexOf('function AccountWorkspaceModal');
const end = code.indexOf('function AddIDWizard');
console.log(code.substring(start, end));
