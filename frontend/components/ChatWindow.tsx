
import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../store/AppContext';
import { Message } from '../types';

interface ChatWindowProps {
  matchId: string;
  targetUserId: string;
  targetUserName: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ matchId, targetUserId, targetUserName, onClose }) => {
  const { currentUser, fetchMessages, sendMessage, blockUser, reportUser } = useAppState();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const msgs = await fetchMessages(matchId);
      setLocalMessages(msgs);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [matchId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [localMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    await sendMessage({ matchId, toUserId: targetUserId, text });
    const msgs = await fetchMessages(matchId);
    setLocalMessages(msgs);
  };

  const shareContact = async () => {
    if (!confirm("Share your contact info explicitly? By default details are masked.")) return;
    const text = `Contact shared: ${currentUser?.email}`;
    await sendMessage({ matchId, toUserId: targetUserId, text, isContactShared: true });
    const msgs = await fetchMessages(matchId);
    setLocalMessages(msgs);
  };

  const handleBlock = async () => {
    if (!confirm("Block this user? They will no longer be able to message you.")) return;
    await blockUser(targetUserId);
    alert("User blocked.");
    onClose();
  };

  const handleReport = async (msgId?: string) => {
    const reason = prompt("Reason for reporting this user/message:");
    if (!reason) return;
    await reportUser({ reportedUserId: targetUserId, reason, messageId: msgId });
    alert("Report submitted for moderation.");
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-[100] animate-fade-in max-h-[80vh] h-[550px]">
      {/* Header */}
      <div className="bg-blue-600 p-4 flex flex-none items-center justify-between text-white shadow-md z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-white/20">
            {targetUserName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold truncate max-w-[150px]">{targetUserName}</h4>
            <p className="text-[10px] opacity-70">Secured Match Chat</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
           <button onClick={() => handleReport()} title="Report User" className="p-1.5 hover:bg-white/10 rounded-lg transition text-white">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
           </button>
           <button onClick={handleBlock} title="Block User" className="p-1.5 hover:bg-white/10 rounded-lg transition text-white">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
           </button>
           <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition text-white">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
           </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : localMessages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-slate-400 font-medium italic">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          localMessages.map((msg, idx) => {
            const isMe = msg.fromUserId === (currentUser as any).id || msg.fromUserId === (currentUser as any)._id;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="group relative max-w-[85%]">
                  <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words ${
                    isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'} flex justify-between items-center`}>
                      <span>{new Date((msg as any).createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && msg.isRead && <span className="ml-2 font-bold">✓✓</span>}
                    </p>
                  </div>
                  {!isMe && (
                    <button 
                      onClick={() => handleReport(msg.id)}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-red-400 p-1"
                      title="Report message"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        {/* Extra spacer at bottom */}
        <div className="h-2" />
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-100 flex-none shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSend} className="flex flex-col space-y-3">
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-slate-400"
            />
            <button type="submit" disabled={!inputText.trim()} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
             <button type="button" onClick={shareContact} className="text-blue-600 hover:text-blue-700 hover:underline transition">Share Contact Details</button>
             <span className="flex items-center">
               <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               Private & Secure
             </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
