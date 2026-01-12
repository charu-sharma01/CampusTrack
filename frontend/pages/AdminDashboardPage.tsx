
import React, { useState, useEffect } from 'react';
import { useAppState } from '../store/AppContext';
import { ItemType, AnalyticsData } from '../types';

const AdminDashboardPage: React.FC = () => {
  const { items, deleteItem, updateItem, currentUser, fetchAnalytics } = useAppState();
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'management' | 'analytics'>('management');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (view === 'analytics') {
      fetchAnalytics().then(setAnalytics);
    }
  }, [view]);

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === ItemType.LOST).length,
    found: items.filter(i => i.type === ItemType.FOUND).length,
    resolved: items.filter(i => i.isResolved).length,
    resolutionRate: items.length ? Math.round((items.filter(i => i.isResolved).length / items.length) * 100) : 0
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-slate-500 mt-2">Only administrators can access this portal.</p>
      </div>
    );
  }

  const renderAnalytics = () => (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Items Recovered', value: analytics?.itemsRecovered || 0, color: 'green' },
          { label: 'Platform Matches', value: analytics?.itemsMatched || 0, color: 'blue' },
          { label: 'Active Users', value: analytics?.activeUsers || 0, color: 'purple' },
          { label: 'Message Volume', value: analytics?.messageVolume || 0, color: 'pink' }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`text-3xl font-black text-${s.color}-600 mb-1`}>{s.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex justify-between items-center">
            Recovery Performance
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-lg">Real-time</span>
          </h3>
          <div className="space-y-6">
            {analytics?.byCategory.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  <span>{cat.name}</span>
                  <span>{cat.value} Reports</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(cat.value / (analytics.itemsReported || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Engagement Growth (30 Days)</h3>
           <div className="flex-1 flex items-end justify-between min-h-[200px] space-x-2">
              {[30, 45, 35, 60, 55, 75, 90, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-slate-50 rounded-t-xl group-hover:bg-blue-600 transition-all duration-300 cursor-pointer relative" style={{ height: `${h}%` }}>
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        +{h}% growth
                     </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold mt-3">Day {i*4}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
               <div className="inline-flex items-center px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/30">
                  Efficiency Analysis
               </div>
               <h3 className="text-4xl font-black mb-6 leading-tight">Matched Success Rate</h3>
               <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Our Intelligent Matching algorithm has successfully paired belongings for <strong>{stats.resolutionRate}%</strong> of all reports this academic term.
               </p>
               <div className="flex space-x-12">
                  <div>
                    <div className="text-4xl font-black text-white">{analytics?.messageVolume || 0}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Chat Volume</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-blue-400">+{analytics?.growth || 0}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">User Growth</div>
                  </div>
               </div>
            </div>
            <div className="flex justify-center">
               <div className="w-64 h-64 border-[16px] border-slate-800 rounded-full flex items-center justify-center relative">
                  <div className="text-center">
                     <div className="text-6xl font-black text-blue-500">{stats.resolutionRate}</div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Percent Recovered</div>
                  </div>
                  <svg className="absolute -inset-4 w-[288px] h-[288px] -rotate-90 pointer-events-none">
                     <circle 
                        cx="144" cy="144" r="132" 
                        stroke="currentColor" strokeWidth="16" fill="none" 
                        className="text-blue-500" 
                        strokeDasharray="829.38" 
                        strokeDashoffset={829.38 * (1 - stats.resolutionRate / 100)}
                        strokeLinecap="round"
                      ></circle>
                  </svg>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring platform-wide engagement and item recovery.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setView('management')}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${view === 'management' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Item Management
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${view === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Analytics & Growth
          </button>
        </div>
      </div>

      {view === 'management' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Platform Items', value: stats.total, color: 'slate', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { label: 'Lost Reports', value: stats.lost, color: 'blue', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { label: 'Found Reports', value: stats.found, color: 'orange', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { label: 'Resolution Rate', value: `${stats.resolutionRate}%`, color: 'green', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-4 group-hover:scale-110 transition`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                </div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-black text-slate-900">Platform Reports</h2>
              <div className="flex items-center space-x-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${filter === 'all' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>ALL</button>
                  <button onClick={() => setFilter('lost')} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${filter === 'lost' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>LOST</button>
                  <button onClick={() => setFilter('found')} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${filter === 'found' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>FOUND</button>
                </div>
                <div className="relative w-full md:w-64">
                  <input 
                    type="text" 
                    placeholder="Search titles, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                          <div>
                            <div className="text-sm font-bold text-slate-900">{item.title}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Ref: {item.id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-600">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-xs text-slate-500">
                          {item.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.type === ItemType.LOST ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {item.type}
                          </span>
                          {item.isResolved && (
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-black uppercase">Resolved</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => updateItem(item.id, { isResolved: !item.isResolved })}
                            className={`p-2 rounded-lg transition ${item.isResolved ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </button>
                          <button 
                            onClick={() => { if(confirm('Permanently delete this item?')) deleteItem(item.id) }}
                            className="p-2 text-red-500 bg-red-50 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : renderAnalytics()}
    </div>
  );
};

export default AdminDashboardPage;
