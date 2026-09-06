import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Shield, MapPin, ShoppingCart, LogOut, Search, Upload, 
  User as UserIcon, Settings, Heart, Clock, Sparkles, Activity, Truck, ChevronRight, ChevronDown 
} from 'lucide-react';
import logoImg from '/src/assets/Aidfidelis logo background.png';
import { User } from '../types';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface PharmaciesPageProps {
  user: User | null;
  onLogout: () => Promise<void> | void; 
}

const PharmaciesPage: React.FC<PharmaciesPageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { pharmacyId } = useParams<{ pharmacyId?: string }>();
  const [userRegion, setUserRegion] = useState<string>('All');
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true); 
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [dynamicPharmacies, setDynamicPharmacies] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate cart items count from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const totalCount = cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
        setCartCount(totalCount);
      }
    } catch (e) {
      console.error("Error reading cart count:", e);
    }
  }, []);

  useEffect(() => {
    const fetchDynamicPharmacies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pharmacies'));
        const dynamicData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const approvedData = dynamicData.filter(
          (pharm: any) =>
            pharm.isApproved === true &&
            pharm.isRejected !== true
        );
        setDynamicPharmacies(approvedData);
      } catch (error) {
        console.error("Error fetching dynamic pharmacies:", error);
      }
    };
    fetchDynamicPharmacies();
  }, []);

  // When the AI sends the user to /pharmacies/:pharmacyId,
  // automatically focus that pharmacy and remove region/search filters
  // that could otherwise hide it.
  useEffect(() => {
    if (!pharmacyId || dynamicPharmacies.length === 0) {
      return;
    }

    const selected = dynamicPharmacies.find(
      (pharmacy) => pharmacy.id === pharmacyId
    );

    if (!selected) {
      return;
    }

    setUserRegion('All');
    setSearchQuery('');

    localStorage.setItem(
      'selectedPharmacyId',
      selected.id
    );

    localStorage.setItem(
      'selectedPharmacyName',
      selected.name
    );

    window.setTimeout(() => {
      document
        .getElementById(`pharmacy-${selected.id}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 150);
  }, [pharmacyId, dynamicPharmacies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          setUserRegion(lat >= 6.5 && lat <= 6.9 ? 'Kumasi' : 'Accra');
          setLoadingLocation(false);
        },
        () => {
          setUserRegion('All');
          setLoadingLocation(false);
        },
        { timeout: 5000 } 
      );
    } else {
      setLoadingLocation(false);
    }
  }, []);

  const checkPharmacyIsOpen = (timingStr: string) => {
    if (!timingStr) return true; 
    const lower = timingStr.toLowerCase();
    if (lower.includes('24/7') || lower.includes('24 hours')) return true;

    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const timeRegex = /(\d{1,2}):?(\d{2})?\s*(am|pm)/gi;
      const matches = [...timingStr.matchAll(timeRegex)];
      
      if (matches.length >= 2) {
        const parseMatch = (match: RegExpMatchArray) => {
          let hours = parseInt(match[1], 10);
          const minutes = match[2] ? parseInt(match[2], 10) : 0;
          const modifier = match[3].toLowerCase();
          if (modifier === 'pm' && hours < 12) hours += 12;
          if (modifier === 'am' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };

        const openMinutes = parseMatch(matches[0]);
        const closeMinutes = parseMatch(matches[1]);

        if (closeMinutes > openMinutes) {
          return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
        } else {
          return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
        }
      }
    } catch (e) {
      // Fallback
    }
    return true;
  };

  const filteredPharmacies = dynamicPharmacies
    .filter((pharm) => {
      const matchesRegion =
        userRegion === 'All' ||
        (pharm.region &&
          pharm.region.toLowerCase() ===
            userRegion.toLowerCase());

      const pharmacyName = String(
        pharm.name ?? ''
      ).toLowerCase();

      const pharmacyLocation = String(
        pharm.location ?? ''
      ).toLowerCase();

      const normalizedSearch =
        searchQuery.toLowerCase();

      const matchesSearch =
        pharmacyName.includes(normalizedSearch) ||
        pharmacyLocation.includes(normalizedSearch);

      return matchesRegion && matchesSearch;
    })
    .sort((a, b) => {
      if (!pharmacyId) return 0;
      if (a.id === pharmacyId) return -1;
      if (b.id === pharmacyId) return 1;
      return 0;
    });

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      localStorage.removeItem('selectedPharmacyName');
      localStorage.removeItem('selectedPharmacyId');
      await onLogout(); 
    } catch (error) {
      console.error("Logout execution failed, falling back to window redirect:", error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between antialiased font-sans">
      <div>
        <style>{`
          @keyframes marqueeLeftToRight {
            0% { transform: translate3d(-33.333%, 0, 0); }
            100% { transform: translate3d(0%, 0, 0); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marqueeLeftToRight 25s linear infinite;
          }
        `}</style>

        {/* Promo Bar */}
        <div className="bg-slate-900 text-white text-sm font-semibold py-3 w-full overflow-hidden relative select-none flex border-b border-slate-800">
          <div className="marquee-track gap-16">
            {[1, 2, 3].map((key) => (
              <div key={key} className="flex items-center gap-3 shrink-0">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-slate-200">Complimentary delivery on your first prescription order with code:</span>
                <span className="font-bold text-slate-900 tracking-wide bg-violet-400 px-3 py-0.5 rounded-md">
                  AIDFREE26
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Glassmorphism Navigation bar */}
        <nav className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50 px-4 lg:px-8 h-20 flex justify-between items-center border-b border-slate-200/50 transition-all">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src={logoImg} alt="Logo" className="h-14 w-14 object-contain group-hover:scale-105 transition-transform duration-300" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              AidFidelis
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Cart Button with Live Counter Badge */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-2 text-slate-700 hover:text-violet-700 bg-white/80 hover:bg-slate-100 border border-slate-200/65 px-4 py-2.5 rounded-full shadow-sm font-bold text-sm transition-all cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 text-violet-600" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 text-slate-700 hover:text-violet-700 transition-all p-1.5 pr-4 rounded-full hover:bg-white/80 border border-transparent hover:border-slate-200/60 shadow-sm hover:shadow cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-inner">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-slate-600" />
                  )}
                </div>
                <span className="font-bold hidden sm:block tracking-tight text-sm">
                  {user?.name ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown 
                  className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180 text-violet-600' : ''}`} 
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-5 py-4 border-b border-slate-100/50 bg-slate-50/50 rounded-t-2xl">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Guest User'}</p>
                    <p className="text-xs text-slate-500 truncate mt-1">{user?.email || 'No email linked'}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setIsUserMenuOpen(false); navigate('/settings'); }} 
                    className="w-full text-left px-5 py-3 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-3 transition-colors font-semibold cursor-pointer"
                  >
                    <Settings className="h-4 w-4" /> Account Settings
                  </button>
                  <button 
                    type="button"
                    onClick={handleLogout} 
                    className="w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-semibold cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Secure Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative py-20 md:py-28 overflow-hidden bg-slate-900">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=2079&auto=format&fit=crop" 
              alt="Modern Clinical Pharmacy" 
              className="w-full h-full object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-violet-900/60 mix-blend-multiply"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-md">
                <Activity className="h-3.5 w-3.5" />
                <span>Verified Healthcare Network</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 leading-tight mb-4">
                Premium Pharmacy <br className="hidden md:block"/> Care, Delivered.
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-xl">
                Hello {user?.name ? user.name.split(' ')[0] : 'User'}, welcome to your digital health hub. Access top-rated pharmacies and track your essential medications instantly.
              </p>
            </div>

            {/* AI Assistant Button */}
            <button 
              type="button"
              onClick={() => navigate('/symptom-checker')}
              className="w-full md:w-auto bg-white/10 backdrop-blur-xl text-white p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 text-left hover:-translate-y-1 hover:bg-white/15 transition-all duration-300 group shrink-0 max-w-sm cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex items-start gap-5">
                <div className="p-3.5 bg-violet-500/20 rounded-2xl text-violet-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-violet-500/30">
                  <Heart className="h-7 w-7 fill-violet-500/50" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-white text-lg tracking-tight">AI Health Assistant</h3>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-normal leading-relaxed">
                    Analyze symptoms instantly and discover recommended treatments.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Directory Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Network Directory</h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">
                {loadingLocation ? "Locating active facilities..." : `Showing verified pharmacy facilities operating in ${userRegion}.`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search facilities..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-10 pr-4 py-2.5 w-full sm:w-72 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 text-slate-800 font-medium shadow-sm transition-all placeholder:text-slate-400" 
                />
              </div>
              <button 
                type="button"
                onClick={() => navigate('/upload-prescription')} 
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Upload Script
              </button>
            </div>
          </div>

          {/* Region Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {['All', 'Accra', 'Kumasi'].map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setUserRegion(reg)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
                  userRegion === reg 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {reg} Region
              </button>
            ))}
          </div>

          {/* Pharmacy Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadingLocation ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex flex-col justify-between p-5 animate-pulse">
                  <div className="w-full h-48 bg-slate-100 rounded-xl mb-5"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-5 bg-slate-100 rounded-md w-3/4"></div>
                    <div className="h-4 bg-slate-50 rounded-md w-1/2"></div>
                    <div className="h-8 bg-slate-50 rounded-md w-1/3 mt-4"></div>
                  </div>
                  <div className="h-12 bg-slate-100 rounded-xl mt-6 w-full"></div>
                </div>
              ))
            ) : filteredPharmacies.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white border border-slate-200 border-dashed rounded-3xl shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No facilities found</h3>
                <p className="text-sm font-medium text-slate-500">There are currently no verified facilities in this area.</p>
              </div>
            ) : (
              filteredPharmacies.map((pharmacy) => {
                const isOpen = checkPharmacyIsOpen(pharmacy.timing || pharmacy.workingHours);

                return (
                  <div
                    id={`pharmacy-${pharmacy.id}`}
                    key={pharmacy.id}
                    className={`group bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                      pharmacy.id === pharmacyId
                        ? 'border-violet-500 ring-4 ring-violet-500/10 shadow-xl'
                        : 'border-slate-200 hover:border-violet-200'
                    }`}
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img 
                        src={pharmacy.image || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop'} 
                        alt={pharmacy.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        <div className="bg-white/95 backdrop-blur-md text-violet-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" /> Verified
                        </div>

                        {pharmacy.id === pharmacyId && (
                          <div className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Selected from AI
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-violet-700 transition-colors tracking-tight">
                            {pharmacy.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-start text-slate-500 text-sm gap-2 mb-4 font-medium">
                          <MapPin className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-snug">{pharmacy.location}</span>
                        </div>

                        <div className="mb-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                            isOpen 
                              ? 'bg-violet-50/50 text-violet-700 border-violet-100' 
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-violet-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {isOpen ? 'Accepting Orders' : 'Currently Closed'}
                          </span>
                        </div>
                      </div>

                      {/* Hours and Dispatch Grid */}
                      <div className="border-t border-slate-100 pt-4 mt-2 mb-5 grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-600">
                        <div className="bg-slate-50 border border-slate-100 px-2 py-2 rounded-lg flex items-center gap-1 overflow-hidden" title={pharmacy.workingHours || pharmacy.timing || '08:00 AM - 10:00 PM'}>
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" /> 
                          <span className="truncate">{pharmacy.workingHours || pharmacy.timing || '08:00 AM - 10:00 PM'}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 px-2 py-2 rounded-lg flex items-center gap-1 overflow-hidden" title={pharmacy.riders || '5 mins dispatch'}>
                          <Truck className="w-3 h-3 text-slate-400 shrink-0" /> 
                          <span className="truncate">{pharmacy.riders || '5 mins dispatch'}</span>
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => {
                          localStorage.setItem(
                            'selectedPharmacyId',
                            pharmacy.id
                          );
                          localStorage.setItem(
                            'selectedPharmacyName',
                            pharmacy.name
                          );
                          navigate('/dashboard');
                        }} 
                        className="w-full bg-slate-50 hover:bg-violet-600 text-slate-700 hover:text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-200 hover:border-violet-600 transition-all duration-300 cursor-pointer"
                      >
                        Access Catalog <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default PharmaciesPage;