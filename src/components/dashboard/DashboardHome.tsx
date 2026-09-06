import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Heart, Shield, Zap, TrendingUp, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import MedicineCard from '../MedicineCard';
import { Medicine, User } from '../../types';
import { categories } from '../../data/medicines';
import { db } from '../../firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

interface DashboardHomeProps {
  user: User;
  onAddToCart: (medicine: Medicine) => void;
  searchQuery: string;
  onUserUpdate?: (updatedUser: User) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user, onAddToCart, searchQuery, onUserUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');
  const [showPrescriptionOnly, setShowPrescriptionOnly] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'medicines'), snapshot => {
      setMedicines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine)));
    });
    return () => unsubscribe();
  }, []);

  // Clear isNewUser flag after user has seen the welcome message
  useEffect(() => {
    if (user.isNewUser && onUserUpdate) {
      const timer = setTimeout(() => {
        const updatedUser = { ...user, isNewUser: false };
        onUserUpdate(updatedUser);
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [user.isNewUser, onUserUpdate, user]);

  const filteredMedicines = useMemo(() => {
    let filtered = medicines;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(medicine => medicine.category === selectedCategory);
    }

    // Apply prescription filter
    if (showPrescriptionOnly) {
      filtered = filtered.filter(medicine => !medicine.requiresPrescription);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [medicines, searchQuery, selectedCategory, sortBy, showPrescriptionOnly]);

  const quickActions = [
    {
      icon: <Heart className="h-6 w-6 text-green-600" />,
      title: "AI Health Check",
      description: "Get instant symptom analysis",
      link: "/symptom-checker",
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-700" />,
      title: "Upload Prescription",
      description: "Quick prescription upload",
      link: "/upload-prescription",
      color: "bg-green-100 hover:bg-green-200"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Order History",
      description: "Track your orders",
      link: "/order-history",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-teal-600" />,
      title: "Health Insights",
      description: "View your health trends",
      link: "/health-insights",
      color: "bg-teal-50 hover:bg-teal-100"
    }
  ];

  const featuredMedicines = medicines.filter(medicine => (medicine.rating || 0) >= 4.5).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-fade-in-up">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
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
                <div className={`w-full h-full bg-white/20 flex items-center justify-center ${user.profilePic ? 'hidden' : ''}`}>
                  <span className="text-2xl font-bold text-white">
                    {user.name.split(' ')[0].charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {user.isNewUser ? (
                    <>
                      Welcome, {user.name.split(' ')[0]}! 🎉
                      <span className="ml-3 inline-block bg-yellow-400 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-full animate-pulse">
                        New User
                      </span>
                    </>
                  ) : (
                    <>Welcome back, {user.name.split(' ')[0]}! 👋</>
                  )}
                </h1>
              </div>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              {user.isNewUser ? (
                "Welcome to Apomudenfie! Let's get you started on your health journey."
              ) : (
                "How can we help you stay healthy today?"
              )}
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`${action.color} p-4 rounded-lg transition-all duration-200 transform hover:scale-105 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center text-center">
                    {action.icon}
                    <h3 className="font-semibold text-gray-800 mt-2 text-sm">{action.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Medicines */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Featured Medicines</h2>
              <p className="text-gray-600">Top-rated medicines recommended for you</p>
            </div>
            <div className="flex items-center gap-2 text-yellow-500">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-sm font-medium text-gray-600">Highly Rated</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMedicines.map((medicine, index) => (
              <div 
                key={medicine.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MedicineCard
                  medicine={medicine}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medicine Catalog */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Medicine Catalog</h2>
              <p className="text-gray-600">Browse our extensive collection of quality medicines</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <label className="flex items-center gap-2 px-4 py-2 border border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showPrescriptionOnly}
                  onChange={(e) => setShowPrescriptionOnly(e.target.checked)}
                  className="text-green-600"
                />
                <span className="text-sm">OTC only</span>
              </label>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <p className="text-blue-800">
                <strong>{filteredMedicines.length}</strong> results found for "{searchQuery}"
              </p>
            </div>
          )}

          {/* Medicine Grid */}
          {filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedicines.map((medicine, index) => (
                <div 
                  key={medicine.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <MedicineCard
                    medicine={medicine}
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <Search className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No medicines found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or browse different categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;