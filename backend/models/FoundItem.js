
import mongoose from 'mongoose';

const foundItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  dateFound: { type: Date, required: true },
  imageUrl: { type: String },
  tags: [{ type: String }],
  isResolved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('FoundItem', foundItemSchema);
