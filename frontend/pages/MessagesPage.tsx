
import React, { useState, useEffect } from 'react';
import { useAppState } from '../store/AppContext';
import { Conversation } from '../types';
import ChatWindow from '../components/ChatWindow';

const MessagesPage: React.FC = () => {
  const { fetchConversations, currentUser } = useAppState();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);

  useEffect(() => {
    const load = async () => {
      const convs = await fetchConversations();
      setConversations(convs);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inbox</h1>
        <p className="text-slate-500 font-medium">Messages from your item matches.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>
          <p className="text-slate-500 font-bold">No conversations yet.</p>
          <p className="text-slate-400 text-sm mt-1">Start a chat by finding a match for your item.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden divide-y divide-slate-50">
          {conversations.map((conv) => (
            <div 
              key={conv.matchId}
              onClick={() => setActiveChat(conv)}
              className="p-6 flex items-center space-x-4 hover:bg-slate-50/80 transition cursor-pointer group"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-lg group-hover:scale-105 transition">
                  {conv.otherUser?.name?.charAt(0) || '?'}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-black text-slate-900 truncate">{conv.otherUser?.name || 'Item Submitter'}</h3>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                    {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-slate-900 font-black' : 'text-slate-500 font-medium'}`}>
                   {conv.lastMessage.fromUserId === (currentUser as any).id ? 'You: ' : ''}{conv.lastMessage.text}
                </p>
              </div>
              
              <div className="pl-4 opacity-0 group-hover:opacity-100 transition">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeChat && (
        <ChatWindow 
          matchId={activeChat.matchId}
          targetUserId={(activeChat as any).otherUserId}
          targetUserName={activeChat.otherUser?.name || 'Item Submitter'}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default MessagesPage;
