const fs = require('fs');
let code = fs.readFileSync('src/components/layout/SMMLayout.tsx', 'utf8');

const importStr = `import { useSMM } from '../../contexts/SMMContext';\nimport { AnimatePresence } from 'motion/react';`;

if (!code.includes('useSMM')) {
  const lastImport = code.lastIndexOf('import ');
  const nextLine = code.indexOf('\n', lastImport);
  code = code.substring(0, nextLine + 1) + importStr + '\n' + code.substring(nextLine + 1);
}

const hookStr = `export function SMMLayout() {
  const location = useLocation();`;
const hookNew = `export function SMMLayout() {
  const location = useLocation();
  const { notifications } = useSMM();
  const topNotifications = notifications.slice(0, 3);`;
code = code.replace(hookStr, hookNew);

const renderToastStr = `
        <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2 pointer-events-none md:bottom-8">
           <AnimatePresence>
             {topNotifications.map(notif => (
                <motion.div key={notif.id} initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0}} className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-2xl w-72 pointer-events-auto">
                   <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                   <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                </motion.div>
             ))}
           </AnimatePresence>
        </div>
`;

code = code.replace(`<Outlet />\n        </main>`, `<Outlet />\n        </main>\n${renderToastStr}`);

fs.writeFileSync('src/components/layout/SMMLayout.tsx', code);
