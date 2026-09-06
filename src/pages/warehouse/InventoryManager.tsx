import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Plus, Minus, Loader2, RefreshCw } from 'lucide-react';
import { medicineService } from '../../services/medicineService';

interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stockCount: number;
  inStock: boolean;
  pharmacyName?: string;
}

const InventoryManager: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMedicines = async () => {
    setLoading(true);
    // Dynamic fallback matching the setup chosen on the primary view
    const activePharmacy = localStorage.getItem('selectedPharmacyName') || 'Local Pharmacy Store';
    
    try {
      const allItems = await medicineService.getAllMedicines();
      // Filter out inventory strictly matching this specific warehouse storefront tag
      const filteredItems = (allItems as MedicineItem[]).filter(
        item => item.pharmacyName === activePharmacy
      );
      setMedicines(filteredItems);
    } catch (e) {
      console.error('Failed to load branch medicines', e);
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

      setMedicines(prev =>
        prev.map(m =>
          m.id === medicineId ? { ...m, stockCount: newCount, inStock: newCount > 0 } : m
        )
      );
    } catch (e) {
      console.error('Failed to update stock metrics', e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin w-6 h-6 text-violet-700" />
        <span className="ml-2.5 text-sm font-semibold text-gray-500 tracking-wide">
          Loading catalog inventory...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Table Action Header Section */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Stock Inventory Ledger</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Overview of items currently active in this warehouse instance
          </p>
        </div>
        <button
          onClick={fetchMedicines}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 bg-white rounded-lg shadow-sm hover:text-violet-700 hover:bg-violet-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </button>
      </div>

      {medicines.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 max-w-sm mx-auto my-4">
          <p className="text-sm font-bold text-gray-700">No batch records matched</p>
          <p className="text-xs text-gray-400 mt-1">This storefront catalog doesn't contain any products yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Generic formulation</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Classification</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Base Price</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Packs Available</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 font-medium text-gray-700">
              {medicines.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-base tracking-tight">{m.name}</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        m.inStock 
                          ? 'bg-violet-50 text-violet-700 border-violet-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {m.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{m.genericName}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{m.category}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">GHS {m.price?.toFixed?.(2) ?? m.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-base font-bold ${m.stockCount <= 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {m.stockCount ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => updateStock(m.id, -1)}
                        disabled={updatingId === m.id || (m.stockCount ?? 0) <= 0}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
                        title="Deduct 1 unit"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStock(m.id, +1)}
                        disabled={updatingId === m.id}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 transition-colors shadow-sm"
                        title="Add 1 unit"
                      >
                        <Plus className="w-4 h-4" />
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