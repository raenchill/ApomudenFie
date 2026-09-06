import React, { useState, useEffect } from 'react';
import { Boxes, History, PlusCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InventoryManager from './InventoryManager';
import StockMovementForm from './StockMovementForm';
import InventoryHistory from './InventoryHistory';
import AddInventoryForm from './AddInventoryForm';

const WarehouseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'inventory' | 'movement' | 'history' | 'add'>('inventory');
  const [activePharmacy, setActivePharmacy] = useState<string>('Local Pharmacy Store');

  useEffect(() => {
    // Read the active store context so the warehouse logs inventory dynamically
    const savedPharmacy = localStorage.getItem('selectedPharmacyName');
    if (savedPharmacy) {
      setActivePharmacy(savedPharmacy);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans antialiased">
      {/* Top Utility Header Action Row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/pharmacies')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:text-violet-700 hover:bg-violet-50 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Storefronts
        </button>
        <div className="flex items-center gap-2 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full shadow-inner select-none">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Real-time Inventory Synced
        </div>
      </div>

      {/* Main Professional Banner */}
      <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden mb-8 shadow-md border border-gray-100 bg-white">
        <div className="bg-gradient-to-r from-violet-800 via-violet-700 to-indigo-600 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Warehouse Control Hub</h1>
              <p className="text-blue-100 font-medium text-sm mt-1 leading-relaxed">
                Logistics, real-time stock allocation and movement history tracking for:{' '}
                <span className="font-extrabold text-white bg-black/15 px-2.5 py-0.5 rounded-lg border border-white/10 ml-1">
                  {activePharmacy}
                </span>
              </p>
            </div>
          </div>

          {/* Clean Rounded Tabs Bar */}
          <div className="mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-5">
            <button
              onClick={() => setTab('inventory')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab === 'inventory'
                  ? 'bg-white text-violet-800 shadow-md transform scale-[1.02]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Boxes className="w-4 h-4" /> Current Inventory
            </button>
            <button
              onClick={() => setTab('movement')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab === 'movement'
                  ? 'bg-white text-violet-800 shadow-md transform scale-[1.02]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Stock Movement
            </button>
            <button
              onClick={() => setTab('add')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab === 'add'
                  ? 'bg-white text-violet-800 shadow-md transform scale-[1.02]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Add New Item
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab === 'history'
                  ? 'bg-white text-violet-800 shadow-md transform scale-[1.02]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <History className="w-4 h-4" /> Action Logs
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Component Shell */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[400px]">
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