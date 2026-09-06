import React from 'react';
import { ShoppingCart, Star, Shield, Truck } from 'lucide-react';
import { Medicine } from '../types';

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onAddToCart }) => {
  // Determine inStock based on stockCount
  const inStock = typeof medicine.stockCount === 'number' && medicine.stockCount > 0;
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={medicine.image}
          alt={medicine.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {medicine.discountPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            Save ₵{(medicine.price - medicine.discountPrice).toFixed(2)}
          </div>
        )}
        {medicine.requiresPrescription && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
            <Shield className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {medicine.category}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {medicine.rating} ({medicine.reviews})
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-lg text-gray-800 mb-1">{medicine.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{medicine.genericName}</p>
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{medicine.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-600">
              ₵{medicine.discountPrice || medicine.price}
            </span>
            {medicine.discountPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₵{medicine.price}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{medicine.dosage}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-green-600 text-sm">
            <Truck className="h-4 w-4 mr-1" />
            <span>Free delivery</span>
          </div>
          <span className={`text-sm ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            {inStock ? `${medicine.stockCount} in stock` : 'Out of stock'}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(medicine)}
          disabled={!inStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
            inStock
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>

        {medicine.requiresPrescription && (
          <p className="text-xs text-red-600 mt-2 text-center">
            * Prescription required
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;