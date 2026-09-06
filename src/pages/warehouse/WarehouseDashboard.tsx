import React, { useState } from 'react';
import { Boxes, History, PlusCircle } from 'lucide-react';
import InventoryManager from './InventoryManager';
import StockMovementForm from './StockMovementForm';
import InventoryHistory from './InventoryHistory';
import AddInventoryForm from './AddInventoryForm';

const WarehouseDashboard: React.FC = () => {
  const [tab, setTab] = useState<'inventory' | 'movement' | 'history' | 'add'>('inventory');

  return (
    <div>
      <div className="rounded-2xl overflow-hidden mb-6 shadow-[0_20px_50px_rgba(8,112,184,0.25)]">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">Warehouse</h1>
              <p className="text-blue-50 mt-1">Manage inventory, movements and history</p>
            </div>
            <div className="hidden md:flex gap-3">
              <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2 text-white shadow-inner">Real-time synced</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setTab('inventory')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition shadow ${
                tab === 'inventory'
                  ? 'bg-white text-blue-700 shadow-[0_10px_20px_rgba(8,112,184,0.35)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Boxes className="inline w-4 h-4 mr-2" /> Inventory
            </button>
            <button
              onClick={() => setTab('movement')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition shadow ${
                tab === 'movement'
                  ? 'bg-white text-blue-700 shadow-[0_10px_20px_rgba(8,112,184,0.35)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PlusCircle className="inline w-4 h-4 mr-2" /> Stock Movement
            </button>
            <button
              onClick={() => setTab('add')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition shadow ${
                tab === 'add'
                  ? 'bg-white text-blue-700 shadow-[0_10px_20px_rgba(8,112,184,0.35)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PlusCircle className="inline w-4 h-4 mr-2" /> Add Item
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition shadow ${
                tab === 'history'
                  ? 'bg-white text-blue-700 shadow-[0_10px_20px_rgba(8,112,184,0.35)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <History className="inline w-4 h-4 mr-2" /> History
            </button>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 md:p-6">
          {tab === 'inventory' && <InventoryManager />}
          {tab === 'movement' && <StockMovementForm />}
          {tab === 'add' && <AddInventoryForm />}
          {tab === 'history' && <InventoryHistory />}
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard; 