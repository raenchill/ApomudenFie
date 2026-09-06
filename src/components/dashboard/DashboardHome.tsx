import React, { useState, useMemo, useEffect } from 'react';
import { Search, TrendingUp, Clock, Store, PackageOpen, ChevronDown, Activity, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import MedicineCard from '../MedicineCard';
import { Medicine, User } from '../../types';
import { categories } from '../../data/medicines';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface DashboardHomeProps {
  user: User;
  onAddToCart: (medicine: Medicine) => void;
  searchQuery: string;
  onUserUpdate?: (updatedUser: User) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onAddToCart, searchQuery, onUserUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [activePharmacy, setActivePharmacy] = useState<string>('Local Pharmacy Store');
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const savedPharmacy = localStorage.getItem('selectedPharmacyName');
    if (savedPharmacy) {
      setActivePharmacy(savedPharmacy);
    }
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-update', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-update', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'medicines'), snapshot => {
      setMedicines(snapshot.docs.map(doc => {
        const data = doc.data();
        const stockValue = Number(data.stock ?? data.inStock ?? 0);
        return {
          id: doc.id,
          ...data,
          stock: stockValue,
          inStock: stockValue
        } as unknown as Medicine;
      }));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user.isNewUser && onUserUpdate) {
      const timer = setTimeout(() => {
        onUserUpdate({ ...user, isNewUser: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user.isNewUser, onUserUpdate, user]);

  const filteredMedicines = useMemo(() => {
    let filtered = medicines.filter(med => (med as any).pharmacyName === activePharmacy);
    
    if (searchQuery) {
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(med => med.category === selectedCategory);
    }
    
    return filtered;
  }, [medicines, activePharmacy, searchQuery, selectedCategory]);

  const quickActions = [
    { 
      icon: <Clock className="h-6 w-6 text-violet-400" />, 
      title: "Order History", 
      description: "Track your active prescriptions", 
      link: "/order-history"
    },
    { 
      icon: <TrendingUp className="h-6 w-6 text-violet-400" />, 
      title: "Health Insights", 
      description: "View personal health analytics", 
      link: "/health-insights"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased pb-20">
      
      {/* PREMIUM DARK HERO SECTION (Matching Pharmacies Page) */}
      <div className="relative py-12 md:py-16 overflow-hidden bg-slate-900 shadow-xl group">
        
        {/* Interactive Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1555633514-abcee6ab92e1?q=80&w=2000&auto=format&fit=crop" 
            alt="Pharmacy Background" 
            className="w-full h-full object-cover object-center opacity-40 transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-violet-900/60 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Left Side: Title & Info */}
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span>Live Marketplace Connection</span>
            </div>
            
            <h1 className="text-sm md:text-base text-slate-300 font-semibold tracking-wide uppercase mb-2 flex items-center gap-2">
              <Store className="h-5 w-5 text-violet-400" />
              Shopping Live Inventory At
            </h1>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 leading-tight">
              {activePharmacy}
            </h2>
          </div>

          {/* Right Side: Glassmorphism Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-4 w-full md:w-auto shrink-0 z-10">
            {quickActions.map((action, idx) => (
              <Link 
                key={idx} 
                to={action.link} 
                className="w-full md:w-80 bg-white/10 backdrop-blur-xl text-white p-5 rounded-2xl shadow-lg border border-white/20 text-left hover:-translate-y-1 hover:bg-white/15 hover:shadow-violet-900/50 transition-all duration-300 flex items-center justify-between group/btn cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-600/50 shadow-inner group-hover/btn:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base tracking-tight mb-0.5">{action.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover/btn:text-white transform -translate-x-2 group-hover/btn:translate-x-0 transition-all duration-300" />
              </Link>
            ))}
          </div>

        </div>
      </div>

      <Link
        to="/cart"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-violet-600 text-white px-4 py-3 shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:bg-violet-500 transition-all duration-300"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-sm font-bold">Cart</span>
        {cartCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-violet-700 px-1">
            {cartCount}
          </span>
        )}
      </Link>

      {/* CATALOG SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        
        {/* Floating Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 text-violet-600" />
              Facility Catalog
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Browse verified clinical medical inventory ready for dispatch.</p>
          </div>
          
          <div className="w-full md:w-auto relative group">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              className="w-full md:w-72 appearance-none px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 cursor-pointer transition-all hover:bg-slate-100 shadow-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="font-medium text-slate-700">{cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredMedicines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map(med => (
              <MedicineCard key={med.id} medicine={med} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          /* Premium Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm max-w-2xl mx-auto mt-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
              <PackageOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Inventory Unavailable</h4>
            <p className="text-slate-500 mt-2 max-w-md mx-auto font-medium leading-relaxed">
              This partner facility currently has no products matching your selected parameters. Try adjusting your search or category filter.
            </p>
            <button 
              onClick={() => setSelectedCategory('All Categories')}
              className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-md active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;