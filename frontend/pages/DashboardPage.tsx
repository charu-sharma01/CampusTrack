
import React, { useState } from 'react';
import { useAppState } from '../store/AppContext';
import { Item, ItemType } from '../types';
import ChatWindow from '../components/ChatWindow';

const DashboardPage: React.FC = () => {
  const { currentUser, items, deleteItem, updateItem } = useAppState();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<{ itemId: string; score: number; reason: string }[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [activeChat, setActiveChat] = useState<{ matchId: string, targetUserId: string, targetUserName: string } | null>(null);

  if (!currentUser) return (
    <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-slate-100 p-6 rounded-full mb-4">
        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800">Authentication Required</h2>
      <p className="text-slate-500 max-w-xs mx-auto mt-2">Please log in to your student or admin portal to manage your reports.</p>
    </div>
  );

  const userItems = items.filter(i => i.userId === currentUser.id || i.userId === (currentUser as any)._id);

  const handleFindMatches = async (item: Item) => {
    setSelectedItem(item);
    setIsMatching(true);
    setMatches([]);
    
    try {
      const res = await fetch(`http://localhost:5000/api/items/match/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${(currentUser as any)?.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(data.filter((m: any) => m.score > 20));
      } else {
        alert(data.message || "Matching failed. Is the backend server running?");
      }
    } catch (err) {
      console.error("Connection error during matching", err);
      alert("Could not connect to the matching service. Ensure your Node.js backend is active.");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fade-in relative">
      {activeChat && (
        <ChatWindow 
          matchId={activeChat.matchId}
          targetUserId={activeChat.targetUserId}
          targetUserName={activeChat.targetUserName}
          onClose={() => setActiveChat(null)}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Activity Center</h1>
          <p className="text-slate-500 mt-1">Track your items and discover intelligent matches.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-center shadow-sm">
            <span className="block text-2xl font-bold text-blue-600">{userItems.length}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Reports</span>
          </div>
          <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 text-center shadow-sm">
            <span className="block text-2xl font-bold text-green-600">{userItems.filter(i => i.isResolved).length}</span>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Resolved</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">Your Recent Submissions</h2>
            <div className="h-px flex-1 bg-slate-100 mx-4"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {userItems.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <p className="text-slate-500 font-medium">You haven't reported anything yet.</p>
              </div>
            ) : (
              userItems.map(item => (
                <div key={item.id} className={`group bg-white p-5 rounded-3xl shadow-sm border transition-all hover:shadow-md flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center ${selectedItem?.id === item.id ? 'border-blue-300 ring-2 ring-blue-50' : 'border-slate-100'}`}>
                  <div className="relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full md:w-32 h-32 object-cover rounded-2xl" />
                    {item.isResolved && (
                      <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                        <div className="bg-white p-1 rounded-full shadow-lg">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-tight ${item.type === ItemType.LOST ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.type}
                      </span>
                      <span className="text-slate-300 text-xs">•</span>
                      <span className="text-slate-400 text-xs font-medium">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition">{item.title}</h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-1 italic">"{item.description}"</p>
                    <div className="flex items-center text-xs font-semibold text-slate-400">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {item.location}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleFindMatches(item)}
                      disabled={item.isResolved}
                      className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center shadow-lg shadow-blue-100 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Scan Matches
                    </button>
                    <button 
                      onClick={() => updateItem(item.id, { isResolved: !item.isResolved })}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition border ${item.isResolved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {item.isResolved ? 'Mark Active' : 'Mark Found'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-900">AI Match Engine</h3>
               <div className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-1 rounded-md">V2.5</div>
            </div>
            
            {!selectedItem ? (
              <div className="text-center py-10 opacity-60">
                <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Select one of your reported items to run the <span className="text-blue-600 font-bold">Intelligent Scanner</span>.</p>
              </div>
            ) : isMatching ? (
              <div className="text-center py-12">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-blue-50 border-b-blue-400 animate-spin-slow"></div>
                </div>
                <p className="text-slate-900 font-black tracking-tight">AI ANALYZING...</p>
                <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Cross-referencing titles & visual data</p>
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Targeting</p>
                  <p className="text-sm font-extrabold text-blue-600">{selectedItem.title}</p>
                </div>
                
                <div className="space-y-4">
                  {matches.map(match => {
                    const matchedItem = items.find(i => i.id === match.itemId);
                    if (!matchedItem) return null;
                    return (
                      <div key={match.itemId} className="p-4 rounded-2xl border-2 border-slate-50 bg-white hover:border-blue-200 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-slate-300">#{match.itemId.slice(-4)}</span>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${match.score > 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {match.score}% CONFIDENCE
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mb-3">
                          <img src={matchedItem.imageUrl} alt={matchedItem.title} className="w-12 h-12 object-cover rounded-xl shadow-sm" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{matchedItem.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{matchedItem.location}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl mb-4">
                           <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                             <span className="text-blue-600 font-bold mr-1">AI Verdict:</span> 
                             {match.reason}
                           </p>
                        </div>
                        <button 
                          onClick={() => setActiveChat({
                            matchId: `${selectedItem.id}-${matchedItem.id}`,
                            targetUserId: matchedItem.userId,
                            targetUserName: "Matched User"
                          })}
                          className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 transition shadow-lg shadow-slate-100"
                        >
                          CONTACT SUBMITTER
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                </div>
                <p className="text-slate-500 text-sm font-bold">No High-Confidence Matches</p>
                <p className="text-slate-400 text-[11px] mt-2 italic leading-relaxed">Our AI hasn't found a statistically significant match yet. We'll alert you if a new report comes in that looks similar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
