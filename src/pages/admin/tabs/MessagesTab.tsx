import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { MessageSquare, Search, Send, User, CheckCircle2 } from 'lucide-react';

export function MessagesTab() {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState('');

  const conversations = [
    { id: 1, name: 'Rafi Islam', role: 'SMM', brand: 'Milkimom', lastMsg: 'I have completed the targeted engagement.', time: '2m', unread: 2 },
    { id: 2, name: 'Nusrat Jahan', role: 'Reviewer', brand: 'Milkimom', lastMsg: 'Need clarification on Mission #MS-104 guidelines.', time: '1h', unread: 0 },
    { id: 3, name: 'Platform Admin', role: 'Admin', brand: 'System', lastMsg: 'Your monthly workforce payroll is ready for review.', time: '1d', unread: 0 }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center gap-2"><MessageSquare className="w-6 h-6 text-indigo-400" /> Messages</h2>
           <p className="text-sm text-slate-400">Internal communication hub for Brand Managers, SMMs, Reviewers, and Admins.</p>
        </div>
      </div>

      <Card className="flex-1 flex overflow-hidden border-white/5">
         <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-slate-900/50">
            <div className="p-4 border-b border-white/5">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-indigo-500 text-white" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto">
               {conversations.map(conv => (
                 <div key={conv.id} onClick={() => setActiveChat(conv.id)} className={`p-4 cursor-pointer transition-colors border-l-2 ${activeChat === conv.id ? 'bg-slate-800/80 border-indigo-500' : 'border-transparent hover:bg-slate-800/40'}`}>
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-semibold text-slate-200 text-sm">{conv.name}</h4>
                       <span className="text-xs text-slate-500">{conv.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{conv.role}</span>
                       <span className="text-[10px] text-slate-500">{conv.brand}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-xs text-slate-400 truncate pr-4">{conv.lastMsg}</p>
                       {conv.unread > 0 && <span className="bg-indigo-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0">{conv.unread}</span>}
                    </div>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="flex-1 flex flex-col bg-slate-900/20">
            {activeChat ? (
              <>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                         <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                         <h3 className="font-bold text-white text-sm">{conversations.find(c => c.id === activeChat)?.name}</h3>
                         <div className="flex items-center gap-2 text-xs">
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Online</span>
                            <span className="text-slate-500">• {conversations.find(c => c.id === activeChat)?.role}</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   <div className="flex justify-center"><span className="text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded-full border border-white/5">Today</span></div>
                   
                   <div className="flex flex-col gap-1 max-w-[80%]">
                      <div className="bg-slate-800 text-slate-200 p-3 rounded-2xl rounded-tl-sm text-sm border border-white/5">
                         Please ensure you use the Nusrat Jahan persona for the latest rapid task. It requires a specific maternal tone.
                      </div>
                      <span className="text-[10px] text-slate-500 ml-1">10:42 AM</span>
                   </div>
                   
                   <div className="flex flex-col gap-1 max-w-[80%] self-end items-end ml-auto">
                      <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-[0_0_10px_rgba(79,70,229,0.2)]">
                         I have completed the targeted engagement using the specified tone. The note has been added to the persona history.
                      </div>
                      <div className="flex items-center gap-1">
                         <span className="text-[10px] text-slate-500">10:45 AM</span>
                         <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                      </div>
                   </div>
                </div>
                
                <div className="p-4 bg-slate-900/50 border-t border-white/5">
                   <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..." 
                        className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white outline-none" 
                      />
                      <button className={`absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${message ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-slate-500'}`}>
                         <Send className="w-4 h-4 ml-0.5" />
                      </button>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                 <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                 <p>Select a conversation to start messaging</p>
              </div>
            )}
         </div>
      </Card>
    </div>
  );
}
