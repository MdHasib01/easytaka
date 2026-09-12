const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

// find index of "})()}"
const idx = code.indexOf('})()}');
if (idx !== -1) {
  // look at the next few lines
  const substr = code.substring(idx, idx + 100);
  console.log('Found:', substr);
  
  code = code.replace(`})()}

                         )}`, `})()}`);
}

fs.writeFileSync('src/pages/smm/Hub.tsx', code);
