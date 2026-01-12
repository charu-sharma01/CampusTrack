
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, Message, UserRole, ItemType, AdminReport, ReportStatus, Conversation, AnalyticsData } from '../types';

const API_BASE = 'http://localhost:5000/api';

interface AppState {
  currentUser: User | null;
  items: Item[];
  messages: Message[];
  reports: AdminReport[];
  isServerOffline: boolean;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'isResolved'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  fetchMessages: (matchId: string) => Promise<Message[]>;
  fetchConversations: () => Promise<Conversation[]>;
  sendMessage: (payload: { matchId: string, toUserId: string, text: string, isContactShared?: boolean }) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  reportUser: (payload: { reportedUserId: string, reason: string, messageId?: string }) => Promise<void>;
  fetchAnalytics: () => Promise<AnalyticsData | null>;
  addReport: (report: Omit<AdminReport, 'id' | 'createdAt' | 'status'>) => void;
  updateReport: (id: string, status: ReportStatus) => void;
  refreshItems: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const MOCK_ITEMS: Item[] = [
  {
    id: 'mock-1',
    userId: 'admin',
    type: ItemType.LOST,
    title: 'Blue Laptop Sleeve',
    category: 'Electronics',
    location: 'Main Library',
    date: new Date().toISOString(),
    description: '14-inch blue fabric sleeve with a small coffee stain.',
    tags: ['laptop', 'blue'],
    createdAt: new Date().toISOString(),
    isResolved: false,
    imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&h=300&fit=crop'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [items, setItems] = useState<Item[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  };

  const fetchItems = async () => {
    if (demoMode) {
      setItems(MOCK_ITEMS);
      setIsServerOffline(false);
      return;
    }

    try {
      const [lostRes, foundRes] = await Promise.all([
        fetch(`${API_BASE}/items/lost`),
        fetch(`${API_BASE}/items/found`)
      ]);
      
      if (!lostRes.ok || !foundRes.ok) throw new Error("Server error");

      const lost = await lostRes.json();
      const found = await foundRes.json();
      
      const mapped = [...lost, ...found].map(i => ({
        ...i,
        id: i._id,
        type: i.dateLost ? ItemType.LOST : ItemType.FOUND,
        date: i.dateLost || i.dateFound
      }));
      setItems(mapped);
      setIsServerOffline(false);
    } catch (err) {
      setIsServerOffline(true);
      if (!demoMode) setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [demoMode]);

  const addItem = async (item: Omit<Item, 'id' | 'createdAt' | 'isResolved'>) => {
    if (demoMode) {
      const newItem = { ...item, id: Math.random().toString(), createdAt: new Date().toISOString(), isResolved: false };
      setItems(prev => [newItem as Item, ...prev]);
      return;
    }

    const endpoint = item.type === ItemType.LOST ? 'lost' : 'found';
    const payload = { ...item, [item.type === ItemType.LOST ? 'dateLost' : 'dateFound']: item.date };

    const res = await fetch(`${API_BASE}/items/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(currentUser as any)?.token}`
      },
      body: JSON.stringify(payload)
    });
    const newItem = await res.json();
    if (res.ok) {
      setItems(prev => [{ ...newItem, id: newItem._id, type: item.type, date: item.date }, ...prev]);
    } else {
      throw new Error(newItem.message || "Failed to add item");
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    if (demoMode) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      return;
    }
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(currentUser as any)?.token}`
      },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }
  };

  const deleteItem = async (id: string) => {
    if (demoMode) {
      setItems(prev => prev.filter(i => i.id !== id));
      return;
    }
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${(currentUser as any)?.token}`
      }
    });
    if (res.ok) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const fetchMessages = async (matchId: string): Promise<Message[]> => {
    if (demoMode) return [];
    try {
      const res = await fetch(`${API_BASE}/messages/${matchId}`, {
        headers: { 'Authorization': `Bearer ${(currentUser as any)?.token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  };

  const fetchConversations = async (): Promise<Conversation[]> => {
    if (demoMode) return [];
    try {
      const res = await fetch(`${API_BASE}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${(currentUser as any)?.token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  };

  const sendMessage = async (payload: { matchId: string, toUserId: string, text: string, isContactShared?: boolean }) => {
    if (demoMode) return;
    await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(currentUser as any)?.token}`
      },
      body: JSON.stringify(payload)
    });
  };

  const blockUser = async (userIdToBlock: string) => {
    if (demoMode) return;
    await fetch(`${API_BASE}/messages/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(currentUser as any)?.token}`
      },
      body: JSON.stringify({ userIdToBlock })
    });
  };

  const reportUser = async (payload: { reportedUserId: string, reason: string, messageId?: string }) => {
    if (demoMode) return;
    await fetch(`${API_BASE}/messages/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(currentUser as any)?.token}`
      },
      body: JSON.stringify(payload)
    });
  };

  const fetchAnalytics = async (): Promise<AnalyticsData | null> => {
    if (demoMode) return null;
    try {
      const res = await fetch(`${API_BASE}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${(currentUser as any)?.token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  };

  const addReport = (report: Omit<AdminReport, 'id' | 'createdAt' | 'status'>) => {
    setReports(prev => [...prev, { ...report, id: Date.now().toString(), status: ReportStatus.PENDING, createdAt: new Date().toISOString() }]);
  };

  const updateReport = (id: string, status: ReportStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <AppContext.Provider value={{
      currentUser, items, messages, reports, isServerOffline, demoMode, setDemoMode,
      setCurrentUser, addItem, updateItem, deleteItem,
      fetchMessages, fetchConversations, sendMessage, blockUser, reportUser, fetchAnalytics,
      addReport, updateReport, refreshItems: fetchItems
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppState must be used within AppProvider");
  return context;
};
