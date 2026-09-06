import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { User, Phone, Truck, Loader, Star } from 'lucide-react';
import { Rider } from '../data/riders';

interface FirebaseRider extends Rider {
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  createdAt: Date;
}

interface DeliveryPageWithFirebaseProps {
  onSelectRider: (rider: FirebaseRider) => void;
}

const DeliveryPageWithFirebase: React.FC<DeliveryPageWithFirebaseProps> = ({ onSelectRider }) => {
  const [selectedRider, setSelectedRider] = useState<FirebaseRider | null>(null);
  const [riders, setRiders] = useState<FirebaseRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const ridersRef = collection(db, 'deliverers');
      // Remove the isActive filter for now to see all riders
      const querySnapshot = await getDocs(ridersRef);
      
      console.log('Fetched riders:', querySnapshot.docs.length);
      
      const ridersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Rider data:', data);
        return {
          ...data,
          id: data.id || doc.id,
        };
      }) as FirebaseRider[];
      
      console.log('Processed riders:', ridersData);
      setRiders(ridersData);
    } catch (err) {
      console.error('Error fetching riders:', err);
      setError('Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-100 rounded-3xl shadow-2xl">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading available riders...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-100 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Unable to Load Riders</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchRiders}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (riders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-100 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Riders Available</h2>
          <p className="text-gray-500 mb-4">There are currently no active riders available for delivery.</p>
          <button
            onClick={fetchRiders}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-300"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-100 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-violet-500 to-indigo-400 drop-shadow-lg" style={{ letterSpacing: 1 }}>Choose a Delivery Rider</h2>
      {!selectedRider ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {riders.map(rider => (
            <div
              key={rider.id}
              className="relative bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col items-center cursor-pointer border border-blue-100 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
              style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', perspective: 800 }}
              onClick={() => setSelectedRider(rider)}
            >
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:animate-pulse border-4 border-blue-200 opacity-60" style={{ zIndex: 1 }} />
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 via-violet-300 to-indigo-200 shadow-lg flex items-center justify-center mb-3 border-4 border-white/80 z-10">
                {rider.image ? (
                  <img src={rider.image} alt={rider.name} className="w-20 h-20 rounded-full object-cover shadow-xl" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
                    {rider.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="font-bold text-lg text-blue-800 flex items-center gap-2 z-10">
                <User className="w-5 h-5 text-blue-400" /> 
                {rider.name}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1 z-10">
                <Phone className="w-4 h-4 text-violet-500" /> 
                {rider.phone}
              </div>
              <div className="text-xs text-gray-500 mt-1 z-10">ID: {rider.id}</div>
              <div className="text-xs text-blue-600 font-semibold bg-blue-100 rounded-full px-2 py-1 mt-1 z-10 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                {rider.rating.toFixed(1)} ({rider.totalDeliveries} deliveries)
              </div>
              {/* Floating vehicle badge */}
              <div className="absolute -top-4 right-4 bg-gradient-to-r from-violet-400 to-blue-300 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1 z-20 border-2 border-white">
                <Truck className="w-4 h-4" /> 
                {rider.vehicleNumber}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-10 flex flex-col items-center border-2 border-blue-200 transform scale-105 transition-all duration-300" style={{ boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.22)', perspective: 800 }}>
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-400 via-violet-300 to-indigo-200 shadow-lg flex items-center justify-center mb-3 border-4 border-white/80">
            {selectedRider.image ? (
              <img src={selectedRider.image} alt={selectedRider.name} className="w-24 h-24 rounded-full object-cover shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl">
                {selectedRider.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="font-bold text-2xl text-blue-800 flex items-center gap-2 mb-1">
            <User className="w-6 h-6 text-blue-400" /> 
            {selectedRider.name}
          </div>
          <div className="mb-1 text-lg text-gray-600 flex items-center gap-1">
            <Phone className="w-5 h-5 text-violet-500" /> 
            {selectedRider.phone}
          </div>
          <div className="mb-1 text-sm text-gray-500">ID: {selectedRider.id}</div>
          <div className="mb-2 text-sm text-blue-600 font-semibold bg-blue-100 rounded-full px-3 py-1">
            Rating: {selectedRider.rating.toFixed(1)} ⭐ | {selectedRider.totalDeliveries} deliveries
          </div>
          {/* Floating vehicle badge */}
          <div className="absolute -top-4 right-8 bg-gradient-to-r from-violet-400 to-blue-300 text-white text-sm font-bold px-6 py-2 rounded-full shadow-xl flex items-center gap-2 z-20 border-2 border-white">
            <Truck className="w-5 h-5" /> 
            {selectedRider.vehicleNumber}
          </div>
          <button
            className="mt-6 bg-gradient-to-r from-blue-600 to-violet-500 text-white px-8 py-3 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200"
            onClick={() => onSelectRider(selectedRider)}
          >
            Proceed to Enter Receiver Details
          </button>
          <button
            className="mt-4 text-sm text-gray-500 underline hover:text-blue-700"
            onClick={() => setSelectedRider(null)}
          >
            Choose another rider
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryPageWithFirebase; 