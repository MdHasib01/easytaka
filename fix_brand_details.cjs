const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/tabs/BrandDetailsTab.tsx', 'utf8');

code = code.replace(/Percentage/g, 'Percent');

fs.writeFileSync('src/pages/admin/tabs/BrandDetailsTab.tsx', code);
