import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquare } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { cn } from '../../lib/utils';
import { ChatThread } from './ChatThread';
import { NewChatPanel, NewGroupPanel } from './ContactPanels';
import { ConversationList } from './ConversationList';

/**
 * Floating Messages button plus the chat drawer: slides in from the right on desktop and
 * takes the full screen on mobile. `launcherClassName` positions the button per layout.
 */
export function ChatWidget({ launcherClassName }: { launcherClassName?: string }) {
  const { enabled, isOpen, view, totalUnread, open, close } = useChat();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  if (!enabled) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-launcher"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            onClick={() => open()}
            aria-label={totalUnread ? `Open messages, ${totalUnread} unread` : 'Open messages'}
            title="Messages"
            className={cn(
              'fixed z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.45)] transition-colors',
              launcherClassName,
            )}
          >
            <MessageSquare className="w-6 h-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-[11px] font-bold flex items-center justify-center border-2 border-[#0B0F19]">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="hidden sm:block fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              key="chat-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Messages"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed inset-0 sm:left-auto sm:w-[420px] z-[131] flex flex-col bg-[#0B0F19] sm:border-l border-white/10 shadow-2xl text-slate-200 font-sans"
            >
              {view === 'list' && <ConversationList />}
              {view === 'thread' && <ChatThread />}
              {view === 'new' && <NewChatPanel />}
              {view === 'group' && <NewGroupPanel />}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
