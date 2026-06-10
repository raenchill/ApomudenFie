import React, { useState } from 'react';
import { db } from '../../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Loader2 } from 'lucide-react';

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
  stockCount: 0,
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);

    try {
      const payload = {
        name: form.name.trim(),
        genericName: form.genericName.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        description: form.description.trim(),
        dosage: form.dosage.trim(),
        manufacturer: form.manufacturer.trim(),
        requiresPrescription: !!form.requiresPrescription,
        inStock: (Number(form.stockCount) || 0) > 0,
        stockCount: Number(form.stockCount) || 0,
        image: form.image.trim() || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        rating: 0,
        reviews: 0,
        uses: [],
        sideEffects: [],
        precautions: [],
        createdAt: serverTimestamp()
      } as any;

      await addDoc(collection(db, 'medicines'), payload);
      setSuccess('Medicine added successfully');
      setForm({ ...initial });
    } catch (e) {
      console.error('Failed to add medicine', e);
      setSuccess('Failed to add medicine');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 rounded-2xl p-[1px] shadow-[0_20px_50px_rgba(8,112,184,0.3)]">
        <div className="bg-white rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Add Inventory Item</h2>
          <p className="text-gray-600 mt-1">Create a new medicine in your catalog</p>

          <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" value={form.name} onChange={onChange} required placeholder="e.g., Paracetamol" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
              <input name="genericName" value={form.genericName} onChange={onChange} required placeholder="e.g., Acetaminophen" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input name="category" value={form.category} onChange={onChange} required placeholder="e.g., Analgesic" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (GHS)</label>
                <input type="number" step="0.01" name="price" value={form.price} onChange={onChange} required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (GHS)</label>
                <input type="number" step="0.01" name="discountPrice" value={form.discountPrice} onChange={onChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
              <input name="dosage" value={form.dosage} onChange={onChange} placeholder="e.g., 500mg" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input name="manufacturer" value={form.manufacturer} onChange={onChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={onChange} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input name="image" value={form.image} onChange={onChange} placeholder="https://..." className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                <input type="number" name="stockCount" value={form.stockCount} onChange={onChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex items-center">
                <input id="requiresPrescription" name="requiresPrescription" type="checkbox" checked={!!form.requiresPrescription} onChange={onChange} className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="requiresPrescription" className="ml-2 text-sm text-gray-700">Requires Prescription</label>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className="inline-flex items-center px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-emerald-500 shadow-[0_10px_20px_rgba(8,112,184,0.35)] hover:shadow-[0_14px_30px_rgba(8,112,184,0.45)] transform hover:-translate-y-0.5 transition">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Item
              </button>
              {success && (
                <span className={`inline-flex items-center text-sm ${success.includes('successfully') ? 'text-green-700' : 'text-red-700'}`}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {success}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryForm; 