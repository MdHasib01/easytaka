import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Clock, Info, Loader2, MessageSquare, Send, WifiOff } from 'lucide-react';
import { useChat, type ChatMessage } from '../../contexts/ChatContext';
import { ROLE_LABELS } from '../../lib/auth';
import { cn } from '../../lib/utils';
import {
  ChatAvatar,
  PanelHeader,
  RoleBadge,
  brandName,
  conversationTitle,
  dayLabel,
  formatClock,
  otherParticipant,
} from './chatUi';

const GROUPING_WINDOW_MS = 5 * 60_000;

export function ChatThread() {
  const chat = useChat();
  const meId = chat.me?.id;
  const conversation = chat.conversations.find((c) => c.id === chat.activeId) ?? null;
  const thread = chat.threadFor(chat.activeId);
  const typers = chat.typingIn(chat.activeId);
  const [showMembers, setShowMembers] = useState(false);
  const [text, setText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const prevHeight = useRef<number | null>(null);

  const isGroup = Boolean(conversation?.isGroup);
  const other = conversation ? otherParticipant(conversation, meId) : chat.draftWith ?? undefined;
  const title = conversation ? conversationTitle(conversation, meId) : chat.draftWith?.name ?? 'Conversation';
  const onlineCount = conversation?.participants.filter((p) => p.id !== meId && chat.online.has(p.id)).length ?? 0;

  useEffect(() => {
    stickToBottom.current = true;
    setShowMembers(false);
    setText('');
    inputRef.current?.focus();
  }, [chat.activeId, chat.draftWith?.id]);

  // Keep the view pinned to the newest message, or anchored when older ones are prepended.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prevHeight.current !== null) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
      prevHeight.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [thread.items, typers.length]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = () => {
    if (!chat.activeId || !scrollRef.current) return;
    prevHeight.current = scrollRef.current.scrollHeight;
    chat.loadOlder(chat.activeId);
  };

  const submit = () => {
    if (!text.trim()) return;
    stickToBottom.current = true;
    chat.send(text);
    setText('');
    if (inputRef.current) inputRef.current.style.height = '';
  };

  const subtitle = isGroup ? (
    `${conversation!.participants.length} members${onlineCount ? ` · ${onlineCount} online` : ''}`
  ) : other ? (
    <span className="flex items-center gap-1.5">
      {chat.online.has(other.id) ? <span className="text-emerald-400">Online</span> : <span>Offline</span>}
      <span className="text-slate-600">·</span>
      {ROLE_LABELS[other.role]}
      {brandName(other) && <span className="text-slate-500 truncate">· {brandName(other)}</span>}
    </span>
  ) : null;

  return (
    <>
      <PanelHeader
        onBack={() => chat.setView('list')}
        leading={<ChatAvatar user={other} group={isGroup} online={!isGroup && !!other && chat.online.has(other.id)} />}
        title={title}
        subtitle={subtitle}
        actions={
          isGroup && (
            <button
              onClick={() => setShowMembers((v) => !v)}
              aria-label="Group members"
              className={cn(
                'p-2 rounded-lg transition-colors',
                showMembers ? 'text-indigo-300 bg-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Info className="w-5 h-5" />
            </button>
          )
        }
      />

      {!chat.connected && (
        <div className="px-4 py-1.5 text-[11px] text-amber-200 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-1.5 shrink-0">
          <WifiOff className="w-3.5 h-3.5" /> Reconnecting… new messages will appear when back online.
        </div>
      )}

      {showMembers && conversation && (
        <div className="max-h-64 overflow-y-auto border-b border-white/10 bg-slate-900/60 shrink-0">
          <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Members ({conversation.participants.length})
          </p>
          {conversation.participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2">
              <ChatAvatar user={p} size="sm" online={p.id !== meId && chat.online.has(p.id)} />
              <span className="text-sm text-slate-200 truncate flex-1">
                {p.name}
                {p.id === meId && <span className="text-slate-500"> (you)</span>}
              </span>
              <RoleBadge role={p.role} />
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-3 py-4">
        {thread.hasMore && (
          <div className="flex justify-center mb-3">
            <button
              onClick={loadOlder}
              disabled={thread.loading}
              className="text-xs text-indigo-300 hover:text-indigo-200 px-3 py-1 rounded-full bg-slate-900 border border-white/10 disabled:opacity-60"
            >
              {thread.loading ? 'Loading…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {!thread.loaded && thread.loading ? (
          <div className="flex justify-center py-12 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !thread.items.length ? (
          <div className="flex flex-col items-center text-center px-6 py-16 text-slate-500">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">{isGroup ? 'No messages yet. Say hi to the group!' : `Say hello to ${title}.`}</p>
          </div>
        ) : (
          thread.items.map((m, i) => (
            <MessageRow
              key={m.id}
              message={m}
              prev={thread.items[i - 1]}
              mine={m.sender.id === meId}
              showSender={isGroup}
              onRetry={() => chat.retry(m)}
            />
          ))
        )}

        {typers.length > 0 && (
          <div className="flex items-center gap-2 mt-2 ml-1 text-xs text-slate-400">
            <span className="flex gap-0.5">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
            {typers.length === 1
              ? `${typers[0]} is typing…`
              : typers.length === 2
                ? `${typers[0]} and ${typers[1]} are typing…`
                : 'Several people are typing…'}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="shrink-0 border-t border-white/10 bg-slate-900/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-end gap-2"
      >
        <textarea
          ref={inputRef}
          value={text}
          rows={1}
          maxLength={4000}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = '';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            if (e.target.value.trim()) chat.notifyTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message…"
          className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send message"
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </>
  );
}

function MessageRow({
  message: m,
  prev,
  mine,
  showSender,
  onRetry,
}: {
  key?: string | number;
  message: ChatMessage;
  prev?: ChatMessage;
  mine: boolean;
  showSender: boolean;
  onRetry: () => void;
}) {
  const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
  const continued =
    !newDay &&
    prev!.sender.id === m.sender.id &&
    new Date(m.createdAt).getTime() - new Date(prev!.createdAt).getTime() < GROUPING_WINDOW_MS;

  return (
    <Fragment>
      {newDay && (
        <div className="flex justify-center my-3">
          <span className="text-[10px] text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/5">
            {dayLabel(m.createdAt)}
          </span>
        </div>
      )}
      <div className={cn('flex gap-2', mine ? 'justify-end' : 'justify-start', continued ? 'mt-0.5' : 'mt-3')}>
        {!mine && showSender && (
          <div className="w-8 shrink-0">{!continued && <ChatAvatar user={m.sender} size="sm" />}</div>
        )}
        <div className={cn('flex flex-col max-w-[78%]', mine ? 'items-end' : 'items-start')}>
          {!mine && showSender && !continued && (
            <span className="text-[11px] text-slate-400 mb-0.5 ml-1">{m.sender.name}</span>
          )}
          <div
            className={cn(
              'px-3.5 py-2 text-sm whitespace-pre-wrap break-words rounded-2xl',
              mine
                ? 'bg-indigo-600 text-white rounded-br-md shadow-[0_0_10px_rgba(79,70,229,0.2)]'
                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-md',
              m.pending && 'opacity-70',
              m.failed && 'bg-rose-900/60 border border-rose-500/40',
            )}
          >
            {m.content}
          </div>
          {m.failed ? (
            <button onClick={onRetry} className="mt-0.5 flex items-center gap-1 text-[10px] text-rose-300 hover:text-rose-200">
              <AlertCircle className="w-3 h-3" /> Not sent · Tap to retry
            </button>
          ) : (
            !continued || mine ? (
              <span className="mt-0.5 mx-1 flex items-center gap-1 text-[10px] text-slate-500">
                {formatClock(m.createdAt)}
                {mine &&
                  (m.pending ? <Clock className="w-3 h-3" /> : <Check className="w-3 h-3 text-indigo-400" />)}
              </span>
            ) : null
          )}
        </div>
      </div>
    </Fragment>
  );
}
