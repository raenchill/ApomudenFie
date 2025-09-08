import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import { medicineService } from '../../services/medicineService';

interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stockCount: number;
  inStock: boolean;
}

const InventoryManager: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const items = await medicineService.getAllMedicines();
      setMedicines(items as any);
    } catch (e) {
      console.error('Failed to load medicines', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const updateStock = async (medicineId: string, delta: number) => {
    const target = medicines.find(m => m.id === medicineId);
    if (!target) return;

    const newCount = Math.max(0, (target.stockCount || 0) + delta);
    setUpdatingId(medicineId);

    try {
      await updateDoc(doc(db, 'medicines', medicineId), {
        stockCount: newCount,
        inStock: newCount > 0
      });

      setMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, stockCount: newCount, inStock: newCount > 0 } : m));
    } catch (e) {
      console.error('Failed to update stock', e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="ml-2 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Inventory</h2>
        <button onClick={fetchMedicines} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      {medicines.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No medicines found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.inStock ? 'In Stock' : 'Out of Stock'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.genericName}</td>
                  <td className="px-4 py-3 text-gray-700">{m.category}</td>
                  <td className="px-4 py-3 text-gray-700">GHS {m.price?.toFixed?.(2) ?? m.price}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{m.stockCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStock(m.id, -1)}
                        disabled={updatingId === m.id || (m.stockCount ?? 0) <= 0}
                        className="inline-flex items-center px-3 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm"
                        title="Decrease stock"
                      >
                        <MinusCircle className="w-4 h-4 mr-1" />
                        -1
                      </button>
                      <button
                        onClick={() => updateStock(m.id, +1)}
                        disabled={updatingId === m.id}
                        className="inline-flex items-center px-3 py-2 rounded-xl border border-transparent text-white bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 disabled:opacity-50 shadow-[0_10px_20px_rgba(8,112,184,0.25)]"
                        title="Increase stock"
                      >
                        <PlusCircle className="w-4 h-4 mr-1" />
                        +1
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
