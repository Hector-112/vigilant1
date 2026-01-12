
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category } from '../types';
import { getProductAdvice, extractProductInfoFromImage } from '../services/geminiService';
import { triggerHaptic } from '../services/hapticService';

interface AddProductProps {
  onAdd: (product: Product) => void;
  onNavigate: (page: any) => void;
  // Translation object
  t: any;
}

const AddProduct: React.FC<AddProductProps> = ({ onAdd, onNavigate, t }) => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food' as Category,
    expiryDate: '',
    reminderDays: 3
  });

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      triggerHaptic('medium');
    } catch (err) {
      console.error("Camera error:", err);
      setIsCameraOpen(false);
      alert("Could not access camera.");
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    triggerHaptic('heavy');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
      
      const result = await extractProductInfoFromImage(base64Data, 'image/jpeg');
      if (result) {
        triggerHaptic('heavy');
        
        let sanitizedDate = '';
        if (result.expiryDate && /^\d{4}-\d{2}-\d{2}$/.test(result.expiryDate)) {
          sanitizedDate = result.expiryDate;
        }

        setFormData(prev => ({
          ...prev,
          name: result.name || prev.name,
          category: (result.category as Category) || prev.category,
          expiryDate: sanitizedDate || prev.expiryDate
        }));
        stopCamera();
      } else {
        triggerHaptic('error');
      }
    }
    setScanning(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic('heavy');
    onAdd({
      id: Math.random().toString(36).substring(7).toUpperCase(),
      ...formData,
      status: 'Fresh',
      addedAt: new Date().toISOString()
    } as Product);
    setSuccess(true);
    setFormData({
      name: '',
      category: 'Food',
      expiryDate: '',
      reminderDays: 3
    });
  };

  const handleAiAssist = async () => {
    if (!formData.name) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic('medium');
    setLoading(true);
    const data = await getProductAdvice(formData.name);
    if (data) {
      triggerHaptic('light');
      const validCategories: Category[] = ['Food', 'Medicine', 'Cosmetics', 'Household', 'Other'];
      if (validCategories.includes(data.category as any)) {
        setFormData(prev => ({ ...prev, category: data.category as Category }));
      }
      if (!formData.expiryDate) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (data.estimatedShelfLife || 7));
        setFormData(prev => ({ ...prev, expiryDate: futureDate.toISOString().split('T')[0] }));
      }
    }
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    triggerHaptic('medium');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const result = await extractProductInfoFromImage(base64Data, file.type);
      
      if (result) {
        triggerHaptic('heavy');
        let sanitizedDate = '';
        if (result.expiryDate && /^\d{4}-\d{2}-\d{2}$/.test(result.expiryDate)) {
          sanitizedDate = result.expiryDate;
        }

        setFormData(prev => ({
          ...prev,
          name: result.name || prev.name,
          category: (result.category as Category) || prev.category,
          expiryDate: sanitizedDate || prev.expiryDate
        }));
      } else {
        triggerHaptic('error');
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (success) {
    return (
      <div className="max-w-xl mx-auto h-[60vh] flex flex-col items-center justify-center text-center page-fade-in">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-2xl mb-6">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Item Added</h2>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 mb-10">Tracking is now active</p>
        <div className="flex gap-4 w-full">
          <button 
            onClick={() => { triggerHaptic('medium'); setSuccess(false); }}
            className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest btn-press"
          >
            Add Another
          </button>
          <button 
            onClick={() => { triggerHaptic('medium'); onNavigate('inventory'); }}
            className="flex-1 bg-white border border-slate-200 text-slate-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest btn-press"
          >
            Go to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-24 lg:pb-8 page-fade-in">
      <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t.add || 'Add Item'}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">New Entry</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={startCamera}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all btn-press"
          >
            <i className="fa-solid fa-video"></i>
            Live Camera
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white border border-slate-100 px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all btn-press"
          >
            <i className="fa-solid fa-image text-indigo-500"></i>
            Upload
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </header>

      {isCameraOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col items-center justify-center p-6 page-fade-in">
          <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/10">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-white/20 m-12 rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
            </div>
            
            {scanning && (
              <div className="absolute inset-0 bg-indigo-600/20 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase text-white tracking-widest">Analysing Label...</p>
              </div>
            )}
          </div>

          <div className="mt-10 flex gap-6 w-full max-w-md">
            <button 
              onClick={stopCamera}
              className="flex-1 bg-white/10 text-white font-black py-5 rounded-[24px] text-[10px] uppercase tracking-widest backdrop-blur-md btn-press"
            >
              Cancel
            </button>
            <button 
              onClick={captureAndScan}
              disabled={scanning}
              className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-[24px] text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-500/30 btn-press"
            >
              {scanning ? 'Scanning...' : 'Capture Item'}
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold uppercase transition-all"
              placeholder="e.g. Milk"
              required
            />
            <button 
              type="button"
              onClick={handleAiAssist}
              disabled={loading || !formData.name}
              className="px-6 bg-slate-900 hover:bg-black disabled:opacity-30 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all btn-press shadow-lg shadow-slate-200"
            >
              {loading ? '...' : 'AI ASSIST'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => { triggerHaptic('light'); setFormData(prev => ({ ...prev, category: e.target.value as any })); }}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none text-[10px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
            >
              <option value="Food">Food</option>
              <option value="Medicine">Medicine</option>
              <option value="Cosmetics">Cosmetics</option>
              <option value="Household">Household</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry Date</label>
            <input 
              type="date" 
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none text-xs font-bold transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            SMS Alert Offset <span>{formData.reminderDays} Days Before</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="14" 
            value={formData.reminderDays}
            onChange={(e) => { triggerHaptic('light'); setFormData(prev => ({ ...prev, reminderDays: parseInt(e.target.value) })); }}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 btn-press"
        >
          {t.addNew || 'Add Item'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
