import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
  // Persist cart items to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('aidfidelis_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-3xl flex items-center justify-center mx-auto border border-violet-100 shadow-inner">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart is Empty</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">Your shopping cart is currently empty. Explore our verified pharmacy catalog to add items.</p>
          </div>
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans antialiased">
      {/* Professional Hero Section with Clear Cart & Medical Supplies Imagery */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl border border-slate-800">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop" 
            alt="Medical Cart and Pharmacy Inventory" 
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-violet-950/70 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-white/10 border border-white/20 text-violet-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block backdrop-blur-md">
              Secure Checkout Manifest
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Review Your Cart</h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium max-w-md leading-relaxed">
              Confirm your selected medications, verify dosages, and manage quantities before proceeding to safe delivery.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl self-start md:self-auto shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-violet-300 block tracking-wider">Total Selected</span>
              <span className="text-lg font-black text-white">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Units</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-base font-black text-gray-900 tracking-tight">
                Cart Items Manifest ({cartItems.length})
              </h2>
              <span className="text-[11px] bg-violet-50 text-violet-700 border border-violet-100 font-bold px-2.5 py-1 rounded-lg">
                Verified Storefront Inventory
              </span>
            </div>
            
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemPharmacy = (item as any).pharmacyName || (item as any).medicine?.pharmacyName || localStorage.getItem('selectedPharmacyName') || 'Selected Pharmacy';

                return (
                  <div 
                    key={item.medicine.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-gray-200/80 rounded-2xl bg-white hover:border-violet-500/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-inner">
                        <img
                          src={item.medicine.image}
                          alt={item.medicine.name}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            <Store className="w-3 h-3" /> {itemPharmacy}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">{item.medicine.name}</h3>
                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{item.medicine.genericName || 'Standard Pharmaceutical Formulation'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-mono font-black text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-lg border border-violet-100">
                            GH₵{item.medicine.price.toFixed(2)} each
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-5 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 shadow-inner">
                        <button
                          onClick={() => onUpdateQuantity(item.medicine.id, item.quantity - 1)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-white hover:shadow-xs transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black font-mono text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.medicine.id, item.quantity + 1)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-white hover:shadow-xs transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right sm:min-w-[80px]">
                        <span className="text-xs font-mono font-black text-gray-900 block">
                          GH₵{(item.medicine.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.medicine.id)}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm sticky top-6 space-y-6">
            <h2 className="text-base font-black text-gray-900 tracking-tight border-b border-gray-100 pb-4">
              Order Calculation
            </h2>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-medium text-gray-500">
                <span>Items Subtotal</span>
                <span className="font-mono font-bold text-gray-800">GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                <span className="font-black text-gray-900">Total Amount</span>
                <span className="font-mono font-black text-violet-700 text-lg">GH₵{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200/60 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                You will enter your delivery details, contact information, and payment method on the next page.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/delivery"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;