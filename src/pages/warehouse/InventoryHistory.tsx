import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { History, Loader2 } from 'lucide-react';

interface MovementItem {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'in' | 'out';
  quantity: number;
  beforeCount?: number;
  afterCount?: number;
  createdAt?: any;
  note?: string | null;
}

const InventoryHistory: React.FC = () => {
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'stock_movements'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as any[];
      setMovements(items as any);
    } catch (e) {
      console.error('Failed to load movements', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const formatDate = (ts: any) => {
    try {
      const date = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
      if (!date) return '—';
      return date.toLocaleString();
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="ml-2 text-gray-600">Loading history...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Inventory History</h2>
        <button onClick={fetchMovements} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      {movements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No stock movements recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Before → After</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{m.medicineName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.type === 'in' ? 'bg-violet-100 text-violet-800' : 'bg-red-100 text-red-800'}`}>
                      {m.type === 'in' ? 'IN' : 'OUT'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{m.quantity}</td>
                  <td className="px-4 py-3 text-gray-700">{m.beforeCount ?? 0} → {m.afterCount ?? 0}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-sm truncate" title={m.note || ''}>{m.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryHistory;
