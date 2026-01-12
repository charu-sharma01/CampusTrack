
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

export enum ItemType {
  LOST = 'lost',
  FOUND = 'found'
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campusVerified: boolean;
  createdAt: string;
  blockedUsers?: string[];
}

export interface Item {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  isResolved: boolean;
}

export interface Message {
  id: string;
  matchId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isContactShared?: boolean;
}

export interface Conversation {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface AdminReport {
  id: string;
  reportedItemId?: string;
  reportedUserId?: string;
  reason: string;
  status: ReportStatus;
  adminId?: string;
  createdAt: string;
}

export interface AnalyticsData {
  itemsReported: number;
  itemsMatched: number;
  itemsRecovered: number;
  activeUsers: number;
  messageVolume: number;
  growth: number;
  byCategory: { name: string; value: number }[];
  byLocation: { name: string; value: number }[];
}
