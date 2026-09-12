const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/tabs/ReviewCenterTab.tsx', 'utf8');

code = code.replace(
  `import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, PlayCircle, Layers, Zap, MessageSquare, User, FileText, ChevronDown } from 'lucide-react';`,
  `import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, PlayCircle, Layers, Zap, MessageSquare, User, FileText, ChevronDown, Link, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';`
);

fs.writeFileSync('src/pages/admin/tabs/ReviewCenterTab.tsx', code);
