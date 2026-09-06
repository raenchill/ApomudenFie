import React from 'react';
import { ShoppingCart, Shield, Tag, Calendar, AlertTriangle } from 'lucide-react';
import { Medicine } from '../types';

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onAddToCart }) => {
  const currentStock = Number((medicine as any).stock ?? (medicine as any).stockCount ?? (medicine as any).inStock ?? 0);
  const inStock = currentStock > 0;

  // Expiry check logic
  const expiryDate = (medicine as any).expiryDate;
  const today = new Date().toISOString().split('T')[0];
  const isExpired = expiryDate && expiryDate <= today;

  // Resolved price including admin markup if available
  const effectivePrice = Number((medicine as any).adminPrice ?? medicine.price);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col justify-between">
      
      {/* Top Image Section */}
      <div className="relative w-full h-52 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6 border-b border-slate-100">
        <img
          src={medicine.image}
          alt={medicine.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        {/* Discount Badge */}
        {medicine.discountPrice && (
          <div className="absolute top-4 left-4 bg-violet-100 text-violet-800 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Save GH₵{(effectivePrice - medicine.discountPrice).toFixed(2)}
          </div>
        )}
        
        {/* Prescription Badge */}
        {medicine.requiresPrescription && (
          <div className="absolute top-4 right-4 bg-slate-900 text-white px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold">
            <Shield className="h-3.5 w-3.5 text-violet-400" />
            <span>Rx</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex flex-col flex-1">
        
        {/* Category & Form Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg tracking-widest uppercase">
            {medicine.category}
          </span>
          {(medicine as any).form && (
            <span className="text-[10px] font-extrabold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg tracking-wider uppercase border border-violet-100">
              {(medicine as any).form}
            </span>
          )}
        </div>

        {/* Medicine Details */}
        <h3 className="font-extrabold text-xl text-slate-900 tracking-tight line-clamp-1 group-hover:text-violet-600 transition-colors mb-1">
          {medicine.name} {(medicine as any).dosage && <span className="text-sm font-semibold text-slate-500">({(medicine as any).dosage})</span>}
        </h3>
        
        <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mt-0.5 line-clamp-1">
          {medicine.genericName || (medicine as any).batchNumber ? `Batch: ${(medicine as any).batchNumber}` : "Standard Formulation"}
        </p>

        {/* Regulatory Expiry Status Display */}
        {expiryDate && (
          <div className={`mt-2.5 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${isExpired ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
            {isExpired ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" /> : <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            <span>{isExpired ? `Expired on: ${expiryDate}` : `Expires: ${expiryDate}`}</span>
          </div>
        )}
        
        {medicine.description && (
          <p className="text-slate-500 text-sm mt-3 line-clamp-2 min-h-[40px] leading-relaxed font-medium">
            {medicine.description}
          </p>
        )}
      </div>

      {/* Pricing and Action Footer */}
      <div className="px-6 pb-6 pt-0 mt-auto">
        
        <div className="flex items-end justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              GH₵{Number(medicine.discountPrice || effectivePrice).toFixed(2)}
            </span>
            {medicine.discountPrice && (
              <span className="text-sm text-slate-400 line-through font-semibold mt-0.5">
                GH₵{Number(effectivePrice).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md ${inStock && !isExpired ? 'text-violet-600 bg-violet-50' : 'text-rose-600 bg-rose-50'}`}>
              {isExpired ? 'Expired Stock' : inStock ? `${currentStock} In Stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart({ ...medicine, price: effectivePrice })}
          disabled={!inStock || isExpired}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
            inStock && !isExpired
              ? 'bg-slate-900 hover:bg-violet-600 text-white shadow-md hover:shadow-xl active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{isExpired ? 'Item Expired' : inStock ? 'Add to Cart' : 'Currently Unavailable'}</span>
        </button>

        {medicine.requiresPrescription && (
          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-slate-300" />
              Valid Clinical Script Required
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;