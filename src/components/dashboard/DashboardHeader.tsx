import React, { useState } from 'react';
import { ShoppingCart, User as UserIcon, Search, Heart, Menu, X, Pill, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../types';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="bg-green-700 p-2 rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-700">Apomudenfie</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, health products..."
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Navigation Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/symptom-checker"
              className="flex items-center space-x-1 text-gray-700 hover:text-green-700 transition-colors group"
            >
              <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">AI Health Check</span>
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center space-x-1 text-gray-700 hover:text-green-700 transition-colors group"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Cart</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200">
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <UserIcon className={`h-4 w-4 text-green-700 ${user.profilePic ? 'hidden' : ''}`} />
                </div>
                <span className="font-medium">{user.name.split(' ')[0]}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-lg border border-green-200 py-2 animate-fade-in-down z-50">
                  <div className="px-4 py-3 border-b border-green-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200 flex-shrink-0">
                        {user.profilePic ? (
                          <img 
                            src={user.profilePic} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <UserIcon className={`h-5 w-5 text-green-700 ${user.profilePic ? 'hidden' : ''}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsUserMenuOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-3 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Settings</span>
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in-down">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines..."
                  className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
            
            <div className="space-y-4">
              <Link
                to="/symptom-checker"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-5 w-5" />
                <span>AI Health Check</span>
              </Link>
              
              <Link
                to="/cart"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart ({cartItemsCount})</span>
              </Link>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200 flex-shrink-0">
                    {user.profilePic ? (
                      <img 
                        src={user.profilePic} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <UserIcon className={`h-5 w-5 text-green-700 ${user.profilePic ? 'hidden' : ''}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => { setIsMenuOpen(false); navigate('/settings'); }}
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-700 w-full text-left py-2"
                  >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={onLogout}
                    className="flex items-center space-x-3 text-red-600 hover:text-red-700 w-full text-left py-2"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;