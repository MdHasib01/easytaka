import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Users, X } from 'lucide-react';
import { useChat, type ChatConversation, type ChatUser } from '../../contexts/ChatContext';
import { errorMessage } from '../../lib/api';
import { ROLE_LABELS } from '../../lib/auth';
import { cn } from '../../lib/utils';
import type { Role } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

// ---- Formatting -----------------------------------------------------------------------

export const otherParticipant = (c: ChatConversation, meId?: string) =>
  c.participants.find((p) => p.id !== meId) ?? c.participants[0];

export function conversationTitle(c: ChatConversation, meId?: string) {
  if (c.isGroup) return c.name || 'Untitled group';
  return otherParticipant(c, meId)?.name ?? 'Conversation';
}

export const brandName = (u: ChatUser) => (u.brand && typeof u.brand === 'object' ? u.brand.name : undefined);

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const yesterday = () => new Date(Date.now() - 86_400_000);

export const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

/** Short timestamp for the conversation list. */
export function formatListTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isSameDay(d, new Date())) return formatClock(iso);
  if (isSameDay(d, yesterday())) return 'Yesterday';
  if (Date.now() - d.getTime() < 6 * 86_400_000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export function dayLabel(iso: string) {
  const d = new Date(iso);
  if (isSameDay(d, new Date())) return 'Today';
  if (isSameDay(d, yesterday())) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
}

// ---- Roles ----------------------------------------------------------------------------

/** Roles a user can message: SMMs only reach staff, staff reach everyone. */
export const rolesFor = (role?: Role): Role[] =>
  role === 'SMM' ? ['MANAGER', 'REVIEWER', 'ADMIN'] : ['SMM', 'REVIEWER', 'MANAGER', 'ADMIN'];

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  MANAGER: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  REVIEWER: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  SMM: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0', ROLE_COLORS[role])}>
      {ROLE_LABELS[role]}
    </span>
  );
}

export function RolePills({
  roles,
  value,
  onChange,
}: {
  roles: Role[];
  value: Role | null;
  onChange: (role: Role | null) => void;
}) {
  const options: (Role | null)[] = [null, ...roles];
  return (
    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
      {options.map((r) => (
        <button
          key={r ?? 'all'}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
            value === r
              ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40'
              : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-slate-200',
          )}
        >
          {r ? ROLE_LABELS[r] : 'All'}
        </button>
      ))}
    </div>
  );
}

// ---- Avatars --------------------------------------------------------------------------

export function ChatAvatar({
  user,
  group,
  online,
  size = 'md',
}: {
  user?: ChatUser;
  group?: boolean;
  online?: boolean;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="relative shrink-0">
      {group || !user ? (
        <div
          className={cn(
            'rounded-full flex items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-500 text-white ring-2 ring-white/10',
            size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
          )}
        >
          <Users className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        </div>
      ) : (
        <UserAvatar src={user.avatar} name={user.name} size={size} />
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0F19]" />
      )}
    </div>
  );
}

// ---- Layout ---------------------------------------------------------------------------

export function PanelHeader({
  title,
  subtitle,
  leading,
  actions,
  onBack,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
}) {
  const { close } = useChat();
  return (
    <header className="h-16 shrink-0 px-3 flex items-center gap-2 border-b border-white/10 bg-[#0B0F19]/95 backdrop-blur-xl pt-[env(safe-area-inset-top)] box-content">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      {leading}
      <div className="min-w-0 flex-1 px-1">
        <h2 className="text-sm font-bold text-white truncate">{title}</h2>
        {subtitle && <div className="text-xs text-slate-400 truncate">{subtitle}</div>}
      </div>
      {actions}
      <button
        onClick={close}
        aria-label="Close messages"
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </header>
  );
}

// ---- Contacts -------------------------------------------------------------------------

/** Debounced contact search against the API. */
export function useContactSearch(q: string, role: Role | null) {
  const { fetchContacts } = useChat();
  const [items, setItems] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchContacts(q, role)
        .then((res) => !cancelled && (setItems(res), setError(null)))
        .catch((err) => !cancelled && setError(errorMessage(err)))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, role, fetchContacts]);

  return { items, loading, error };
}
