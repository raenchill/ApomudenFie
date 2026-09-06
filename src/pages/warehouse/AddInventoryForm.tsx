import React, { useState } from 'react';
import { db } from '../../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Loader2, Plus } from 'lucide-react';

const initial = {
  name: '',
  genericName: '',
  category: '',
  price: '',
  discountPrice: '',
  description: '',
  dosage: '',
  manufacturer: '',
  requiresPrescription: false,
  stockCount: '', // Changed to string for input tracking
  image: '', 
};

const AddInventoryForm: React.FC = () => {
  const [form, setForm] = useState({ ...initial });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setForm(prev => ({ ...prev, image: compressedBase64 }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);

    // Dynamic fallback so it never saves an unassigned branch item
    const activePharmacy = localStorage.getItem('selectedPharmacyName') || 'PlusLab Pharmacy';

    try {
      const payload = {
        name: form.name.trim(),
        genericName: form.genericName.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        // Robust check for empty or string promo prices
        discountPrice: form.discountPrice && String(form.discountPrice).trim() !== '' ? Number(form.discountPrice) : null,
        description: form.description.trim(),
        dosage: form.dosage.trim(),
        manufacturer: form.manufacturer.trim(),
        requiresPrescription: !!form.requiresPrescription,
        inStock: (Number(form.stockCount) || 0) > 0,
        stockCount: Number(form.stockCount) || 0,
        image: form.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        pharmacyName: activePharmacy,
        rating: 0,
        reviews: 0,
        uses: [],
        sideEffects: [],
        precautions: [],
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'medicines'), payload);
      setSuccess('Medicine added successfully to inventory');
      setForm({ ...initial });
      
      const fileInput = document.getElementById('medicine-image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Failed to add medicine to Firestore:', err);
      setSuccess('Failed to save item. Check connection or data parameters.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-violet-700">
          <Plus className="h-6 w-6" />
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Add Inventory Item</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1 font-medium">Create a new medicine listing inside your local warehouse catalog</p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Medicine Name</label>
            <input name="name" value={form.name} onChange={onChange} required placeholder="e.g., Paracetamol" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Generic Formulation</label>
            <input name="genericName" value={form.genericName} onChange={onChange} required placeholder="e.g., Acetaminophen" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Inventory Category</label>
            <input name="category" value={form.category} onChange={onChange} required placeholder="e.g., Pain Relief" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Price (GHS)</label>
              <input type="number" step="0.01" name="price" value={form.price} onChange={onChange} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Promo Price (GHS)</label>
              <input type="number" step="0.01" name="discountPrice" value={form.discountPrice} onChange={onChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Dosage Specifications</label>
            <input name="dosage" value={form.dosage} onChange={onChange} placeholder="e.g., 500mg" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Manufacturer Laboratory</label>
            <input name="manufacturer" value={form.manufacturer} onChange={onChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Clinical Product Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Stock Display Image</label>
            <div className="relative flex items-center">
              <input 
                id="medicine-image-upload"
                type="file" 
                accept=".jpg,.jpeg,.png,.jfif" 
                onChange={handleFileChange} 
                className="w-full text-sm font-medium text-gray-500 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Initial Pack Count</label>
              <input type="number" name="stockCount" value={form.stockCount} onChange={onChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all" />
            </div>
            <div className="flex items-center pt-5">
              <input id="requiresPrescription" name="requiresPrescription" type="checkbox" checked={!!form.requiresPrescription} onChange={onChange} className="h-4 w-4 text-violet-600 focus:ring-violet-500/20 border-gray-300 rounded accent-violet-600" />
              <label htmlFor="requiresPrescription" className="ml-2 text-sm text-gray-600 font-semibold select-none">Requires Prescription</label>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-4 border-t border-gray-100 pt-6 mt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className="inline-flex items-center px-6 py-2.5 rounded-xl text-white bg-violet-600 hover:bg-violet-700 font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Item to Catalog
            </button>
            {success && (
              <span className={`inline-flex items-center text-sm font-bold ${success.includes('successfully') ? 'text-violet-700' : 'text-red-600'}`}>
                {success}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryForm;