import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, ArrowLeft, User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../types';
import logoImg from '/src/assets/Aidfidelis logo background.png';

interface DashboardHeaderProps {
  user: User;
  cartItemsCount: number;
  onSearch: (query: string) => void;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user,
  cartItemsCount, 
  onSearch,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSignOutClick = () => {
    setIsProfileDropdownOpen(false);
    
    // Thoroughly clear stored user session flags
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('approvedPharmacyName');
    
    if (onLogout) {
      onLogout();
    }
    
    // Force a clean replacement redirect to login
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/pharmacies" className="flex items-center space-x-2">
            <img 
              src={logoImg} 
              alt="AidFidelis Logo" 
              className="h-[66px] w-[66px] object-contain my-auto" 
            />
            <span className="text-2xl font-bold text-violet-700">AidFidelis</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items in this pharmacy catalog..."
                className="w-full pl-10 pr-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-xs font-medium"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-5">
            <Link
              to="/cart"
              className="relative flex items-center space-x-1 text-gray-700 hover:text-violet-700 transition-colors group px-2 py-1"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs">Cart</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Switch Pharmacy Button */}
            <button
              onClick={() => navigate('/pharmacies')}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-violet-600 rounded-xl text-violet-700 hover:bg-violet-50 transition-all font-bold text-xs shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Switch Pharmacy
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full transition-all shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-violet-700 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-bold text-gray-800 tracking-tight max-w-[120px] truncate">
                  {user?.name || 'USER'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Dropdown Menu Popup */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-black text-gray-900 tracking-tight truncate">{user?.name || 'User Account'}</p>
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{user?.email || 'user@domain.com'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setIsProfileDropdownOpen(false); navigate('/settings'); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" /> Settings
                    </button>
                    <button
                      onClick={handleSignOutClick}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
            <div className="px-4 py-2 bg-gray-50 rounded-xl mb-2">
              <p className="text-xs font-bold text-gray-900">{user?.name || 'User Account'}</p>
              <p className="text-[11px] text-gray-400">{user?.email || ''}</p>
            </div>
            <button 
              onClick={() => { setIsMenuOpen(false); navigate('/pharmacies'); }}
              className="flex items-center space-x-2 text-violet-700 font-bold text-xs w-full text-left py-2 px-2 hover:bg-violet-50 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Switch Pharmacy</span>
            </button>
            <button
              onClick={handleSignOutClick}
              className="flex items-center space-x-2 text-red-600 font-bold text-xs w-full text-left py-2 px-2 hover:bg-red-50 rounded-lg border-t border-gray-100 pt-3"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;