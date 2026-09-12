import { useState, type ReactNode } from 'react';
import { Check, Loader2, Search, Users, X } from 'lucide-react';
import { useChat, type ChatUser } from '../../contexts/ChatContext';
import { errorMessage } from '../../lib/api';
import { ROLE_LABELS } from '../../lib/auth';
import { cn } from '../../lib/utils';
import type { Role } from '../../types';
import { ChatAvatar, PanelHeader, RoleBadge, RolePills, brandName, rolesFor, useContactSearch } from './chatUi';

function SearchBox({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search people by name…"
        className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function ContactResults({
  q,
  role,
  renderTrailing,
  onPick,
}: {
  q: string;
  role: Role | null;
  renderTrailing?: (u: ChatUser) => ReactNode;
  onPick: (u: ChatUser) => void;
}) {
  const { online } = useChat();
  const { items, loading, error } = useContactSearch(q, role);

  if (loading && !items.length) {
    return (
      <div className="flex justify-center py-10 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (error) return <p className="p-6 text-center text-sm text-rose-300">{error}</p>;
  if (!items.length) return <p className="p-6 text-center text-sm text-slate-500">No people found.</p>;

  return (
    <div className={cn(loading && 'opacity-60')}>
      {items.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => onPick(u)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
        >
          <ChatAvatar user={u} online={online.has(u.id)} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <RoleBadge role={u.role} />
              {brandName(u) && <span className="text-[11px] text-slate-500 truncate">{brandName(u)}</span>}
            </div>
          </div>
          {renderTrailing?.(u)}
        </button>
      ))}
    </div>
  );
}

/** Pick one person to start (or reopen) a 1:1 conversation. */
export function NewChatPanel() {
  const chat = useChat();
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | null>(chat.initialRole);

  return (
    <>
      <PanelHeader title="New message" subtitle="Search by name or filter by role" onBack={() => chat.setView('list')} />
      <div className="p-3 space-y-3 border-b border-white/5 shrink-0">
        <SearchBox value={q} onChange={setQ} autoFocus />
        <RolePills roles={rolesFor(chat.me?.role)} value={role} onChange={setRole} />
      </div>
      <button
        onClick={() => chat.setView('group')}
        className="flex items-center gap-3 px-4 py-3 border-b border-white/5 text-left hover:bg-white/[0.03] transition-colors shrink-0"
      >
        <ChatAvatar group />
        <div>
          <p className="text-sm font-semibold text-indigo-200">Create a group chat</p>
          <p className="text-xs text-slate-500">Add people by role or pick them one by one</p>
        </div>
      </button>
      <div className="flex-1 overflow-y-auto">
        <ContactResults q={q} role={role} onPick={chat.startDirect} />
      </div>
    </>
  );
}

/** Name a group, then add whole roles and/or individual people. */
export function NewGroupPanel() {
  const chat = useChat();
  const available = rolesFor(chat.me?.role);
  const [name, setName] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [selected, setSelected] = useState<ChatUser[]>([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelected = (u: ChatUser) => selected.some((s) => s.id === u.id);
  const toggleUser = (u: ChatUser) =>
    setSelected((prev) => (isSelected(u) ? prev.filter((s) => s.id !== u.id) : [...prev, u]));
  const toggleRole = (r: Role) => setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const canCreate = name.trim().length > 0 && (roles.length > 0 || selected.length > 0) && !saving;

  const create = async () => {
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      await chat.createGroup({ name: name.trim(), participantIds: selected.map((u) => u.id), roles });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  const summary = [
    selected.length ? `${selected.length} ${selected.length === 1 ? 'person' : 'people'}` : null,
    ...roles.map((r) => `all ${ROLE_LABELS[r]}s`),
  ]
    .filter(Boolean)
    .join(' + ');

  return (
    <>
      <PanelHeader title="New group" subtitle="Name it, then add members" onBack={() => chat.setView('list')} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 border-b border-white/5">
          <label className="block">
            <span className="text-xs font-semibold text-slate-400">Group name</span>
            <input
              autoFocus
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milkimom Campaign Team"
              className="mt-1.5 w-full px-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
            />
          </label>

          <div>
            <span className="text-xs font-semibold text-slate-400">Add everyone with a role</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {available.map((r) => {
                const on = roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      on
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40'
                        : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-slate-200',
                    )}
                  >
                    {on ? <Check className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                    All {ROLE_LABELS[r]}s
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">Everyone you can message who has that role is added.</p>
          </div>
        </div>

        <div className="p-4 pb-2 space-y-3">
          <span className="text-xs font-semibold text-slate-400">Or pick people</span>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((u) => (
                <span
                  key={u.id}
                  className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-100"
                >
                  {u.name}
                  <button
                    type="button"
                    onClick={() => toggleUser(u)}
                    aria-label={`Remove ${u.name}`}
                    className="p-0.5 rounded-full hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <SearchBox value={q} onChange={setQ} />
          <RolePills roles={available} value={role} onChange={setRole} />
        </div>

        <ContactResults
          q={q}
          role={role}
          onPick={toggleUser}
          renderTrailing={(u) => (
            <span
              className={cn(
                'w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                isSelected(u) ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/20',
              )}
            >
              {isSelected(u) && <Check className="w-3.5 h-3.5" />}
            </span>
          )}
        />
      </div>

      <div className="shrink-0 border-t border-white/10 bg-slate-900/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2">
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <p className="text-[11px] text-slate-500 truncate">{summary ? `Members: ${summary}` : 'No members selected yet'}</p>
        <button
          onClick={create}
          disabled={!canCreate}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:bg-slate-800 disabled:text-slate-500 transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create group
        </button>
      </div>
    </>
  );
}
