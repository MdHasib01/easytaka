const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/tabs/ReviewCenterTab.tsx', 'utf8');

// I need to extract AnimatePresence from the map block and put it at the end of the return statement.
const mapBlockStart = `      <AnimatePresence>
        {selectedReviewItem && (`;
        
const mapBlockEnd = `        )}
      </AnimatePresence>
`;

// wait, it's easier to just remove it and re-add it at the end.
const anP_start = code.indexOf('<AnimatePresence>');
const anP_end = code.lastIndexOf('</AnimatePresence>') + '</AnimatePresence>'.length;

const anP_content = code.substring(anP_start, anP_end);

code = code.substring(0, anP_start) + code.substring(anP_end);

// now place it before the final </div>)
const finalDivIdx = code.lastIndexOf('</div>');
code = code.substring(0, finalDivIdx) + anP_content + '\n' + code.substring(finalDivIdx);

fs.writeFileSync('src/pages/admin/tabs/ReviewCenterTab.tsx', code);
