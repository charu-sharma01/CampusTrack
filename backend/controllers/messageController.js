
import Message from '../models/Message.js';
import Block from '../models/Block.js';
import UserReport from '../models/UserReport.js';
import mongoose from 'mongoose';

export const getMessages = async (req, res) => {
  const { matchId } = req.params;
  try {
    const messages = await Message.find({ matchId }).sort({ createdAt: 1 });
    // Mark as read when fetching
    await Message.updateMany(
      { matchId, toUserId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    }).sort({ createdAt: -1 });

    const conversations = [];
    const seenMatches = new Set();

    for (const msg of messages) {
      if (!seenMatches.has(msg.matchId)) {
        seenMatches.add(msg.matchId);
        const isFromMe = msg.fromUserId.toString() === userId.toString();
        const otherUserId = isFromMe ? msg.toUserId : msg.fromUserId;
        
        // In a real app, populate user details
        conversations.push({
          matchId: msg.matchId,
          otherUserId,
          lastMessage: msg,
          unreadCount: await Message.countDocuments({
            matchId: msg.matchId,
            toUserId: userId,
            isRead: false
          })
        });
      }
    }
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { matchId, toUserId, text, isContactShared } = req.body;
  try {
    const isBlocked = await Block.findOne({
      $or: [
        { blockerId: req.user._id, blockedId: toUserId },
        { blockerId: toUserId, blockedId: req.user._id }
      ]
    });

    if (isBlocked) {
      return res.status(403).json({ message: "Communication blocked." });
    }

    const message = new Message({
      matchId,
      fromUserId: req.user._id,
      toUserId,
      text,
      isContactShared: !!isContactShared
    });
    const saved = await message.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const blockUser = async (req, res) => {
  const { userIdToBlock } = req.body;
  try {
    const block = new Block({
      blockerId: req.user._id,
      blockedId: userIdToBlock
    });
    await block.save();
    res.status(201).json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reportUser = async (req, res) => {
  const { reportedUserId, reason, messageId } = req.body;
  try {
    const report = new UserReport({
      reporterId: req.user._id,
      reportedUserId,
      reason,
      messageId
    });
    await report.save();
    res.status(201).json({ message: "Report submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  const { messageId } = req.params;
  try {
    await Message.findByIdAndUpdate(messageId, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
