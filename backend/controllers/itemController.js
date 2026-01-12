
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import { GoogleGenAI, Type } from "@google/genai";

export const createLostItem = async (req, res) => {
  try {
    const item = new LostItem({ ...req.body, userId: req.user._id });
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createFoundItem = async (req, res) => {
  try {
    const item = new FoundItem({ ...req.body, userId: req.user._id });
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLostItems = async (req, res) => {
  try {
    const items = await LostItem.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateItemStatus = async (req, res) => {
  const { id } = req.params;
  const { isResolved } = req.body;
  
  try {
    let item = await LostItem.findByIdAndUpdate(id, { isResolved }, { new: true });
    if (!item) {
      item = await FoundItem.findByIdAndUpdate(id, { isResolved }, { new: true });
    }

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteItem = async (req, res) => {
  const { id } = req.params;
  
  try {
    let item = await LostItem.findByIdAndDelete(id);
    if (!item) {
      item = await FoundItem.findByIdAndDelete(id);
    }

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const matchItem = async (req, res) => {
  const { itemId } = req.params;
  
  try {
    let target = await LostItem.findById(itemId);
    let candidates;
    let targetType = 'lost';

    if (!target) {
      target = await FoundItem.findById(itemId);
      if (!target) return res.status(404).json({ message: 'Item not found' });
      candidates = await LostItem.find({ isResolved: false, category: target.category });
      targetType = 'found';
    } else {
      candidates = await FoundItem.find({ isResolved: false, category: target.category });
    }

    if (candidates.length === 0) {
      return res.json([]);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Match this ${targetType} item with candidates. 
      Target: ${target.title}. Desc: ${target.description}. Loc: ${target.location}.
      
      Candidates:
      ${candidates.map(c => `[ID: ${c._id}] ${c.title} - ${c.description} at ${c.location}`).join('\n')}

      Evaluate based on:
      1. Physical attributes (color, brand).
      2. Location proximity.
      3. Key nouns.

      Return JSON array of top 3 objects with: itemId, score (0-100), and reason.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemId: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["itemId", "score", "reason"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error) {
    console.error("Gemini Match Error:", error);
    res.status(500).json({ message: "Matching service failed", error: error.message });
  }
};
