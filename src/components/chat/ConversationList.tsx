import { useMemo, useState } from 'react';
import { Loader2, MessageSquare, MessageSquarePlus, Search, Users } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { cn } from '../../lib/utils';
import { ChatAvatar, PanelHeader, RoleBadge, conversationTitle, formatListTime, otherParticipant } from './chatUi';

type Filter = 'all' | 'direct' | 'groups';

export function ConversationList() {
  const chat = useChat();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const meId = chat.me?.id;

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return chat.conversations.filter((c) => {
      if (filter === 'direct' && c.isGroup) return false;
      if (filter === 'groups' && !c.isGroup) return false;
      if (!needle) return true;
      return (
        conversationTitle(c, meId).toLowerCase().includes(needle) ||
        c.participants.some((p) => p.name.toLowerCase().includes(needle))
      );
    });
  }, [chat.conversations, q, filter, meId]);

  return (
    <>
      <PanelHeader
        title="Messages"
        subtitle={
          <span className="flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', chat.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse')} />
            {chat.connected ? 'Live' : 'Connecting…'}
          </span>
        }
      />

      <div className="p-3 space-y-3 border-b border-white/5 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => chat.setView('new')}
            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" /> New chat
          </button>
          <button
            onClick={() => chat.setView('group')}
            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4" /> New group
          </button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'direct', 'groups'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors',
                filter === f
                  ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40'
                  : 'text-slate-400 border-white/10 hover:text-slate-200',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chat.loadingList && !chat.conversations.length ? (
          <div className="flex justify-center py-12 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : chat.listError && !chat.conversations.length ? (
          <div className="p-6 text-center text-sm text-slate-400">
            <p className="text-rose-300 mb-3">{chat.listError}</p>
            <button onClick={chat.reloadConversations} className="text-indigo-300 hover:text-indigo-200 font-medium">
              Try again
            </button>
          </div>
        ) : !visible.length ? (
          <div className="flex flex-col items-center text-center px-8 py-14 text-slate-500">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">
              {chat.conversations.length ? 'No conversations match.' : 'No conversations yet. Start a chat or create a group.'}
            </p>
          </div>
        ) : (
          visible.map((c) => {
            const other = otherParticipant(c, meId);
            const fromMe = c.lastMessage?.sender === meId;
            const senderName = c.participants.find((p) => p.id === c.lastMessage?.sender)?.name.split(' ')[0];
            const unread = c.unreadCount > 0;
            return (
              <button
                key={c.id}
                onClick={() => chat.openConversation(c.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 transition-colors',
                  chat.activeId === c.id ? 'bg-slate-800/60 border-indigo-500' : 'border-transparent hover:bg-white/[0.03]',
                )}
              >
                <ChatAvatar user={other} group={c.isGroup} online={!c.isGroup && chat.online.has(other?.id)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm truncate', unread ? 'font-bold text-white' : 'font-semibold text-slate-200')}>
                      {conversationTitle(c, meId)}
                    </span>
                    {c.isGroup ? (
                      <span className="text-[10px] text-slate-500 shrink-0">{c.participants.length} members</span>
                    ) : (
                      other && <RoleBadge role={other.role} />
                    )}
                    <span className="ml-auto text-[11px] text-slate-500 shrink-0">
                      {formatListTime(c.lastMessage?.at ?? c.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={cn('text-xs truncate flex-1', unread ? 'text-slate-200' : 'text-slate-500')}>
                      {c.lastMessage
                        ? `${fromMe ? 'You: ' : c.isGroup && senderName ? `${senderName}: ` : ''}${c.lastMessage.content}`
                        : c.isGroup
                          ? 'Group created'
                          : 'No messages yet'}
                    </p>
                    {unread && (
                      <span className="min-w-5 h-5 px-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
