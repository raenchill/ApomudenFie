import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface MedicineOption {
  id: string;
  name: string;
  stockCount: number;
}

const StockMovementForm: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    medicineId: '',
    type: 'in' as 'in' | 'out',
    quantity: 1,
    note: ''
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'medicines'));
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as any[];
      setMedicines(items.map(i => ({ id: i.id, name: i.name, stockCount: i.stockCount ?? 0 })));
    } catch (e) {
      console.error('Failed to load medicines', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicineId || form.quantity <= 0) return;

    setSubmitting(true);
    try {
      const medRef = doc(db, 'medicines', form.medicineId);
      const medSnap = await getDoc(medRef);
      if (!medSnap.exists()) throw new Error('Medicine not found');
      const medData = medSnap.data() as any;

      const delta = form.type === 'in' ? form.quantity : -form.quantity;
      const newCount = Math.max(0, (medData.stockCount ?? 0) + delta);

      // Record movement first
      await addDoc(collection(db, 'stock_movements'), {
        medicineId: form.medicineId,
        medicineName: medData.name,
        type: form.type,
        quantity: form.quantity,
        note: form.note || null,
        beforeCount: medData.stockCount ?? 0,
        afterCount: newCount,
        createdAt: serverTimestamp()
      });

      // Update medicine stock
      await updateDoc(medRef, {
        stockCount: newCount,
        inStock: newCount > 0
      });

      setForm({ medicineId: '', type: 'in', quantity: 1, note: '' });
      fetchMedicines();
      alert('Stock movement recorded');
    } catch (e) {
      console.error('Failed to submit stock movement', e);
      alert('Failed to submit stock movement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="ml-2 text-gray-600">Loading medicines...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Stock Movement</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.medicineId}
            onChange={e => setForm({ ...form, medicineId: e.target.value })}
            required
          >
            <option value="">Select medicine</option>
            {medicines.map(m => (
              <option key={m.id} value={m.id}>{m.name} (Stock: {m.stockCount})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as any })}
            >
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-md px-3 py-2"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea
            className="w-full border rounded-md px-3 py-2"
            rows={3}
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
          Save Movement
        </button>
      </form>
    </div>
  );
};

export default StockMovementForm;
