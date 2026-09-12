const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');
code = code.replace(
  `import { Plus, Search, Filter, ShieldCheck, Facebook, Instagram, Lock, Unlock, X, Clock, AlertTriangle, CheckCircle2, ChevronRight, User, Image as ImageIcon, MessageSquare, Briefcase, FileText, Activity, Key, Star } from 'lucide-react';`,
  `import { Plus, Search, Filter, ShieldCheck, Facebook, Instagram, Lock, Unlock, X, Clock, AlertTriangle, CheckCircle2, XCircle, ChevronRight, User, Image as ImageIcon, MessageSquare, Briefcase, FileText, Activity, Key, Star } from 'lucide-react';`
);
fs.writeFileSync('src/pages/smm/Hub.tsx', code);
