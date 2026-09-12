import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { TOKEN_KEY, api, errorMessage, tokenStore, wsUrl } from '../lib/api';
import { areaFor } from '../lib/auth';
import type { Role } from '../types';
import { useAuth } from './AuthContext';

export interface ChatUser {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  /** An id, or `{ id, name }` where the API populated it (contacts). */
  brand?: string | { id: string; name: string } | null;
}

export interface ChatMessage {
  id: string;
  conversation: string;
  sender: ChatUser;
  content: string;
  createdAt: string;
  /** Client-only: sent optimistically and awaiting the server. */
  pending?: boolean;
  failed?: boolean;
}

export interface ChatConversation {
  id: string;
  isGroup?: boolean;
  name?: string;
  topic?: string;
  createdBy?: string;
  participants: ChatUser[];
  relatedAccount?: { id: string; name: string } | null;
  lastMessage?: { content: string; sender: string; at: string };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Thread {
  items: ChatMessage[];
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
}

export type ChatView = 'list' | 'thread' | 'new' | 'group';

export interface NewGroupInput {
  name: string;
  participantIds: string[];
  roles: Role[];
}

interface ChatValue {
  /** False outside the signed-in app areas (login, NID verification). */
  enabled: boolean;
  connected: boolean;
  me: ChatUser | null;
  isOpen: boolean;
  view: ChatView;
  activeId: string | null;
  /** Person picked for a new 1:1 chat that has no conversation yet. */
  draftWith: ChatUser | null;
  /** Role pre-selected when the "new chat" view was opened from elsewhere. */
  initialRole: Role | null;
  conversations: ChatConversation[];
  loadingList: boolean;
  listError: string | null;
  totalUnread: number;
  online: Set<string>;
  threadFor(id: string | null): Thread;
  typingIn(id: string | null): string[];
  open(opts?: { view?: ChatView; role?: Role }): void;
  close(): void;
  setView(view: ChatView): void;
  reloadConversations(): void;
  openConversation(id: string): void;
  startDirect(user: ChatUser): void;
  loadOlder(id: string): void;
  send(content: string): void;
  retry(message: ChatMessage): void;
  notifyTyping(): void;
  createGroup(input: NewGroupInput): Promise<ChatConversation>;
  fetchContacts(q: string, role: Role | null): Promise<ChatUser[]>;
}

const TYPING_TTL_MS = 4000;
const TYPING_THROTTLE_MS = 2500;
const DRAFT_KEY = 'draft';

const EMPTY_THREAD: Thread = { items: [], hasMore: false, loaded: false, loading: false };

/** Adds a server message, swapping it in for our own matching optimistic copy. */
function upsertMessage(items: ChatMessage[], message: ChatMessage, meId: string | null): ChatMessage[] {
  if (items.some((m) => m.id === message.id)) return items;
  if (message.sender.id === meId) {
    const i = items.findIndex((m) => m.pending && m.content === message.content);
    if (i >= 0) return items.map((m, j) => (j === i ? message : m));
  }
  return [...items, message];
}

const byTime = (a: ChatMessage, b: ChatMessage) => a.createdAt.localeCompare(b.createdAt);

const ChatContext = createContext<ChatValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const enabled = session ? areaFor(session) !== 'verification' : false;
  const sessionKey = session ? `${session.user.id}:${session.brand?.id ?? ''}:${session.impersonating}` : '';
  const me = useMemo<ChatUser | null>(
    () =>
      session
        ? { id: session.user.id, name: session.user.name, role: session.user.role, avatar: session.user.avatar }
        : null,
    [session],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>('list');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftWith, setDraftWith] = useState<ChatUser | null>(null);
  const [initialRole, setInitialRole] = useState<Role | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [typing, setTyping] = useState<Record<string, Record<string, string>>>({});
  const [online, setOnline] = useState<Set<string>>(() => new Set());
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  // Latest state for socket handlers and async callbacks, which outlive a render.
  const live = useRef({ isOpen, view, activeId, draftWith, conversations, threads, me });
  live.current = { isOpen, view, activeId, draftWith, conversations, threads, me };
  const typingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const readTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const lastTypingSent = useRef(0);

  const patchThread = useCallback((id: string, fn: (t: Thread) => Thread) => {
    setThreads((prev) => ({ ...prev, [id]: fn(prev[id] ?? EMPTY_THREAD) }));
  }, []);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      setConversations(await api<ChatConversation[]>('/conversations'));
      setListError(null);
    } catch (err) {
      setListError(errorMessage(err));
    } finally {
      setLoadingList(false);
    }
  }, []);

  const markRead = useCallback((id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id && c.unreadCount ? { ...c, unreadCount: 0 } : c)));
    api(`/conversations/${id}/read`, { method: 'POST' }).catch(() => {});
  }, []);

  const scheduleRead = useCallback(
    (id: string) => {
      clearTimeout(readTimers.current.get(id));
      readTimers.current.set(id, setTimeout(() => markRead(id), 400));
    },
    [markRead],
  );

  /** Fetches the latest page (which also marks it read), keeping anything newer we already have. */
  const loadThread = useCallback(
    async (id: string) => {
      patchThread(id, (t) => ({ ...t, loading: true }));
      try {
        const res = await api<{ items: ChatMessage[]; hasMore: boolean }>(`/conversations/${id}/messages?limit=50`);
        const ids = new Set(res.items.map((m) => m.id));
        patchThread(id, (t) => ({
          items: [...res.items, ...t.items.filter((m) => !ids.has(m.id))].sort(byTime),
          hasMore: res.hasMore,
          loaded: true,
          loading: false,
        }));
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
      } catch {
        patchThread(id, (t) => ({ ...t, loading: false }));
      }
    },
    [patchThread],
  );

  const loadOlder = useCallback(
    async (id: string) => {
      const t = live.current.threads[id];
      const oldest = t?.items.find((m) => !m.pending && !m.failed);
      if (!t || t.loading || !t.hasMore || !oldest) return;
      patchThread(id, (x) => ({ ...x, loading: true }));
      try {
        const res = await api<{ items: ChatMessage[]; hasMore: boolean }>(
          `/conversations/${id}/messages?limit=50&before=${encodeURIComponent(oldest.createdAt)}`,
        );
        patchThread(id, (x) => {
          const ids = new Set(x.items.map((m) => m.id));
          return { ...x, items: [...res.items.filter((m) => !ids.has(m.id)), ...x.items], hasMore: res.hasMore, loading: false };
        });
      } catch {
        patchThread(id, (x) => ({ ...x, loading: false }));
      }
    },
    [patchThread],
  );

  const sendSocket = useCallback((payload: object) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }, []);

  const queryPresence = useCallback(
    (userIds: string[]) => userIds.length && sendSocket({ type: 'presence:query', userIds }),
    [sendSocket],
  );

  const clearTyping = useCallback((cid: string, uid: string) => {
    const key = `${cid}:${uid}`;
    clearTimeout(typingTimers.current.get(key));
    typingTimers.current.delete(key);
    setTyping((prev) => {
      if (!prev[cid]?.[uid]) return prev;
      const { [uid]: _gone, ...rest } = prev[cid];
      return { ...prev, [cid]: rest };
    });
  }, []);

  const handleEvent = (msg: any) => {
    const state = live.current;
    switch (msg.type) {
      case 'ready':
        setOnline(new Set(msg.online));
        setConnected(true);
        break;
      case 'presence':
        setOnline((prev) => {
          const next = new Set(prev);
          if (msg.online) next.add(msg.userId);
          else next.delete(msg.userId);
          return next;
        });
        break;
      case 'presence:state':
        setOnline((prev) => {
          const next = new Set(prev);
          for (const u of msg.users) {
            if (u.online) next.add(u.userId);
            else next.delete(u.userId);
          }
          return next;
        });
        break;
      case 'typing': {
        if (msg.userId === state.me?.id) break;
        setTyping((prev) => ({ ...prev, [msg.conversationId]: { ...prev[msg.conversationId], [msg.userId]: msg.name } }));
        const key = `${msg.conversationId}:${msg.userId}`;
        clearTimeout(typingTimers.current.get(key));
        typingTimers.current.set(key, setTimeout(() => clearTyping(msg.conversationId, msg.userId), TYPING_TTL_MS));
        break;
      }
      case 'conversation:new': {
        const conversation: ChatConversation = msg.conversation;
        setConversations((prev) => (prev.some((c) => c.id === conversation.id) ? prev : [conversation, ...prev]));
        queryPresence(conversation.participants.map((p) => p.id));
        break;
      }
      case 'message:new': {
        const cid: string = msg.conversationId;
        const message: ChatMessage = msg.message;
        const mine = message.sender.id === state.me?.id;
        clearTyping(cid, message.sender.id);
        if (state.threads[cid]) patchThread(cid, (t) => ({ ...t, items: upsertMessage(t.items, message, state.me?.id ?? null) }));

        if (!state.conversations.some((c) => c.id === cid)) {
          loadConversations();
          break;
        }
        const viewing =
          state.isOpen && state.view === 'thread' && state.activeId === cid && document.visibilityState === 'visible';
        setConversations((prev) => {
          const c = prev.find((x) => x.id === cid);
          if (!c) return prev;
          const updated: ChatConversation = {
            ...c,
            lastMessage: { content: message.content, sender: message.sender.id, at: message.createdAt },
            updatedAt: message.createdAt,
            // The server marks a thread read for its sender.
            unreadCount: mine || viewing ? 0 : c.unreadCount + 1,
          };
          return [updated, ...prev.filter((x) => x.id !== cid)];
        });
        if (viewing && !mine) scheduleRead(cid);
        break;
      }
    }
  };
  const handlerRef = useRef(handleEvent);
  handlerRef.current = handleEvent;

  /** After a reconnect: refetch what may have been missed while offline. */
  const resync = () => {
    loadConversations();
    const { activeId: current } = live.current;
    setThreads((prev) => (current && prev[current] ? { [current]: prev[current] } : {}));
    if (current) loadThread(current);
  };
  const resyncRef = useRef(resync);
  resyncRef.current = resync;

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let attempt = 0;
    let hasConnected = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      const ws = new WebSocket(wsUrl('/ws'));
      wsRef.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token: tokenStore.get(TOKEN_KEY) }));
      ws.onmessage = (e) => {
        let msg: any;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg.type === 'ready') {
          attempt = 0;
          if (hasConnected) resyncRef.current();
          hasConnected = true;
        }
        handlerRef.current(msg);
      };
      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
        setConnected(false);
        if (!stopped) timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempt++));
      };
    };

    connect();
    loadConversations();
    return () => {
      stopped = true;
      clearTimeout(timer);
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      setConversations([]);
      setThreads({});
      setTyping({});
      setOnline(new Set());
      setIsOpen(false);
      setView('list');
      setActiveId(null);
      setDraftWith(null);
    };
  }, [enabled, sessionKey, loadConversations]);

  // Coming back to the tab with the thread open counts as reading it.
  useEffect(() => {
    const onVisible = () => {
      const s = live.current;
      if (document.visibilityState !== 'visible' || !s.isOpen || s.view !== 'thread' || !s.activeId) return;
      if (s.conversations.find((c) => c.id === s.activeId)?.unreadCount) markRead(s.activeId);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [markRead]);

  const openConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      setDraftWith(null);
      setView('thread');
      setIsOpen(true);
      const { threads: ts, conversations: cs } = live.current;
      const conversation = cs.find((c) => c.id === id);
      if (!ts[id]?.loaded && !ts[id]?.loading) loadThread(id);
      else if (conversation?.unreadCount) markRead(id);
      if (conversation) queryPresence(conversation.participants.map((p) => p.id));
    },
    [loadThread, markRead, queryPresence],
  );

  const startDirect = useCallback(
    (user: ChatUser) => {
      const existing = live.current.conversations.find(
        (c) =>
          !c.isGroup && !c.relatedAccount && c.participants.length === 2 && c.participants.some((p) => p.id === user.id),
      );
      if (existing) return openConversation(existing.id);
      setDraftWith(user);
      setActiveId(null);
      setView('thread');
      setIsOpen(true);
      setThreads((prev) => ({ ...prev, [DRAFT_KEY]: { ...EMPTY_THREAD, loaded: true } }));
    },
    [openConversation],
  );

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      const { activeId: cid, draftWith: draft, me: sender } = live.current;
      if (!text || !sender || (!cid && !draft)) return;
      const key = cid ?? DRAFT_KEY;
      const tmp: ChatMessage = {
        id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        conversation: key,
        sender,
        content: text,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      patchThread(key, (t) => ({ ...t, items: [...t.items, tmp] }));

      try {
        if (cid) {
          const saved = await api<ChatMessage>(`/conversations/${cid}/messages`, { method: 'POST', body: { content: text } });
          patchThread(cid, (t) => ({
            ...t,
            items: t.items.some((m) => m.id === saved.id)
              ? t.items.filter((m) => m.id !== tmp.id)
              : t.items.map((m) => (m.id === tmp.id ? saved : m)),
          }));
        } else if (draft) {
          const res = await api<{ conversation: ChatConversation }>('/conversations', {
            method: 'POST',
            body: { participantId: draft.id, message: text },
          });
          const conversation = { ...res.conversation, unreadCount: 0 };
          setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
          setThreads(({ [DRAFT_KEY]: _draft, ...rest }) => rest);
          live.current.conversations = [conversation, ...live.current.conversations];
          openConversation(conversation.id);
        }
      } catch {
        patchThread(key, (t) => ({
          ...t,
          items: t.items.map((m) => (m.id === tmp.id ? { ...m, pending: false, failed: true } : m)),
        }));
      }
    },
    [patchThread, openConversation],
  );

  const retry = useCallback(
    (message: ChatMessage) => {
      patchThread(message.conversation, (t) => ({ ...t, items: t.items.filter((m) => m.id !== message.id) }));
      send(message.content);
    },
    [patchThread, send],
  );

  const notifyTyping = useCallback(() => {
    const cid = live.current.activeId;
    const now = Date.now();
    if (!cid || now - lastTypingSent.current < TYPING_THROTTLE_MS) return;
    lastTypingSent.current = now;
    sendSocket({ type: 'typing', conversationId: cid });
  }, [sendSocket]);

  const createGroup = useCallback(
    async (input: NewGroupInput) => {
      const res = await api<{ conversation: ChatConversation }>('/conversations/groups', { method: 'POST', body: input });
      const conversation = res.conversation;
      setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
      live.current.conversations = [conversation, ...live.current.conversations];
      openConversation(conversation.id);
      return conversation;
    },
    [openConversation],
  );

  const fetchContacts = useCallback((q: string, role: Role | null) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (role) params.set('role', role);
    return api<ChatUser[]>(`/conversations/contacts?${params}`);
  }, []);

  const open = useCallback(
    (opts?: { view?: ChatView; role?: Role }) => {
      setIsOpen(true);
      setInitialRole(opts?.role ?? null);
      if (opts?.view) {
        setView(opts.view);
        return;
      }
      const s = live.current;
      if (s.view === 'thread' && s.activeId && s.conversations.find((c) => c.id === s.activeId)?.unreadCount) {
        markRead(s.activeId);
      }
    },
    [markRead],
  );

  const value: ChatValue = {
    enabled,
    connected,
    me,
    isOpen,
    view,
    activeId,
    draftWith,
    initialRole,
    conversations,
    loadingList,
    listError,
    totalUnread: conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    online,
    threadFor: (id) => threads[id ?? DRAFT_KEY] ?? EMPTY_THREAD,
    typingIn: (id) => (id ? Object.values(typing[id] ?? {}) : []),
    open,
    close: () => setIsOpen(false),
    setView,
    reloadConversations: loadConversations,
    openConversation,
    startDirect,
    loadOlder,
    send,
    retry,
    notifyTyping,
    createGroup,
    fetchContacts,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
