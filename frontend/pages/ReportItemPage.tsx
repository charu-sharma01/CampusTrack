
import React, { useState, useRef } from 'react';
import { useAppState } from '../store/AppContext';
import { ItemType } from '../types';

interface ReportItemPageProps {
  onNavigate: (page: string) => void;
}

const ReportItemPage: React.FC<ReportItemPageProps> = ({ onNavigate }) => {
  const { addItem, currentUser } = useAppState();
  const [type, setType] = useState<ItemType>(ItemType.LOST);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login to report an item.");
      onNavigate('login');
      return;
    }
    
    setIsUploading(true);
    try {
      await addItem({
        userId: currentUser.id,
        type,
        title,
        category,
        location,
        description,
        date,
        tags: title.split(' ').map(t => t.toLowerCase()),
        imageUrl: imagePreview || `https://picsum.photos/seed/${Math.random()}/400/300`
      });
      alert(`${type === ItemType.LOST ? 'Lost' : 'Found'} item reported successfully!`);
      onNavigate('dashboard');
    } catch (err) {
      alert("Failed to report item. Check backend connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900">Report an <span className="text-blue-600">Item</span></h1>
        <p className="text-slate-500 mt-2">Fill in the details below to report a lost or found item</p>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button 
          onClick={() => setType(ItemType.LOST)}
          className={`flex items-center px-8 py-3 rounded-xl font-bold transition ${type === ItemType.LOST ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          Lost Item
        </button>
        <button 
          onClick={() => setType(ItemType.FOUND)}
          className={`flex items-center px-8 py-3 rounded-xl font-bold transition ${type === ItemType.FOUND ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          Found Item
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer overflow-hidden min-h-[200px]"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl shadow-md" />
            ) : (
              <>
                <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <p className="text-sm font-bold text-slate-900">Add Photo</p>
                <p className="text-xs text-slate-500 mt-1">Click to upload an image of the item</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Item Name</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
              placeholder="e.g., Blue Backpack, iPhone 13, Student ID Card"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select 
                value={category}
                required
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Select a category</option>
                <option>Electronics</option>
                <option>Bags</option>
                <option>Clothing</option>
                <option>Personal Effects</option>
                <option>Documents</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{type === ItemType.LOST ? 'Last Seen Location' : 'Found Location'}</label>
              <input 
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                placeholder="e.g., Main Library, Cafeteria, Science Block"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
              placeholder="Provide a detailed description of the item (color, brand, distinguishing features, contents, etc.)"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Date {type === ItemType.LOST ? 'Lost' : 'Found'}</label>
            <input 
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>

          <button 
            disabled={isUploading}
            type="submit" 
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:opacity-50"
          >
            {isUploading ? 'Submitting...' : `Submit ${type === ItemType.LOST ? 'Lost' : 'Found'} Item Report`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportItemPage;
