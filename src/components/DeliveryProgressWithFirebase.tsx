import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { ReceiverDetails } from './ReceiverDetailsForm';
import { Truck, User, Mail, Phone, Home, Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Rider } from '../data/riders';
import RiderRatingModal from './RiderRatingModal';
import NotificationModal from './NotificationModal';
import { CartItem } from '../types';

// Add custom CSS for animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  .animate-slide-in {
    animation: slideIn 0.5s ease-out;
  }
  
  .car-moving {
    transition: left 1s ease-in-out;
  }
`;

interface DeliveryProgressWithFirebaseProps {
  riderId: string;
  receiver: ReceiverDetails;
  cartItems: CartItem[];
  user: any;
  onResetDelivery: () => void;
}

interface FirebaseRider extends Rider {
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  createdAt: Date;
}

const steps = [
  'Drug Picked Up',
  'In Transit (Halfway)',
  'Arrived at Location',
];

// Simulated route coordinates (Accra, Ghana area)
const route = [
  [5.5600, -0.2050], // Start
  [5.5700, -0.2100], // Halfway
  [5.5800, -0.2200], // End
];

const DeliveryProgressWithFirebase: React.FC<DeliveryProgressWithFirebaseProps> = ({ 
  riderId, 
  receiver,
  cartItems,
  user
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [notified, setNotified] = useState(false);
  const [rider, setRider] = useState<FirebaseRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [riderNotifications, setRiderNotifications] = useState<string[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  // Simulated rider position
  const [, setRiderPos] = useState(route[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRiderData();
  }, [riderId]);

  useEffect(() => {
    setRiderPos(route[currentStep]);
    // Update car position based on current step
    const newPosition = (currentStep / (steps.length - 1)) * 100;
    setCarPosition(newPosition);
  }, [currentStep]);

  const fetchRiderData = async () => {
    try {
      setLoading(true);
      console.log('Fetching rider data for riderId:', riderId);
      
      const ridersRef = collection(db, 'deliverers');
      const querySnapshot = await getDocs(ridersRef);
      
      console.log('Total riders fetched:', querySnapshot.docs.length);
      
      // Find the rider by ID (check both the document ID and the id field)
      let foundRider = null;
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Checking rider:', { docId: doc.id, riderId: data.id, targetId: riderId });
        
        if (doc.id === riderId || data.id === riderId) {
          foundRider = {
            ...data,
            id: data.id || doc.id,
            firebaseId: doc.id,
          } as FirebaseRider & { firebaseId: string };
        }
      });
      
      if (foundRider) {
        console.log('Found rider:', foundRider);
        setRider(foundRider);
      } else {
        console.log('Rider not found. Available riders:', querySnapshot.docs.map(doc => ({ docId: doc.id, riderId: doc.data().id })));
        setError('Selected rider is no longer available. Please go back and choose another rider.');
      }
    } catch (err) {
      console.error('Error fetching rider data:', err);
      setError('Failed to load rider information');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setNotified(false);
      
      // Save order to Firebase when delivery is completed
      if (currentStep === steps.length - 2) { // Last step
        saveOrderToFirebase();
      }
    }
  };

  const saveOrderToFirebase = async () => {
    try {
      const total = cartItems.reduce((sum, item) => {
        const price = item.medicine.discountPrice || item.medicine.price;
        return sum + (price * item.quantity);
      }, 0);

      const orderData = {
        userId: user.id,
        items: cartItems,
        totalAmount: total, // Fixed: changed from 'total' to 'totalAmount' to match Order interface
        status: 'delivered',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date().toISOString(),
        shippingAddress: `${receiver.address}, ${receiver.phone}`,
        riderId: riderId,
        riderName: rider?.name || 'Unknown Rider',
        paymentStatus: 'completed',
        actualDeliveryDate: new Date().toISOString(),
        trackingNumber: `TRK-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Saving order to Firebase:', orderData);
      await addDoc(collection(db, 'orders'), orderData);
      console.log('Order saved successfully!');
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleNotify = () => {
    setNotified(true);
    const timestamp = new Date().toLocaleTimeString();
    const notification = `🚚 ${rider?.name} has notified ${receiver.name} about: ${steps[currentStep]} (${timestamp})`;
    setRiderNotifications(prev => [...prev, notification]);
    
    // Show notification modal automatically
    setShowNotificationModal(true);
    
    // Auto-clear notification after 8 seconds
    setTimeout(() => {
      setRiderNotifications(prev => prev.filter(n => n !== notification));
    }, 8000);
  };

  const clearNotifications = () => {
    setRiderNotifications([]);
  };

  const openNotificationModal = () => {
    setShowNotificationModal(true);
  };

  const handleRatingSubmitted = () => {
    console.log('Rating submitted, updating state...');
    setHasRated(true);
    // Refresh rider data to get updated rating
    fetchRiderData();
  };

  // 3D progress bar width
  const progressPercent = (currentStep / (steps.length - 1)) * 100;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading rider information...</h2>
        </div>
      </div>
    );
  }

  if (error || !rider) {
    return (
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Rider Not Found</h2>
          <p className="text-gray-500 mb-4">{error || 'Unable to load rider information'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100 rounded-3xl shadow-2xl" style={{ perspective: 1200 }}>
      <div className="relative">
        <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-green-500 to-teal-400 drop-shadow-lg" style={{ letterSpacing: 1 }}>Delivery Progress</h2>
        
        {/* Floating Notification Badge */}
        {riderNotifications.length > 0 && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-pulse shadow-lg">
              {riderNotifications.length}
            </div>
          </div>
        )}
      </div>
      {/* 3D Cards */}
      <div className="flex flex-col md:flex-row gap-8 w-full mb-10 justify-center items-center">
        {/* Rider Card */}
        <div className="relative bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col items-center transform hover:scale-105 transition-transform duration-300 border border-blue-100" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)', transform: 'rotateY(-8deg)' }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 via-green-300 to-teal-200 shadow-lg flex items-center justify-center mb-3 border-4 border-white/80">
            {rider.image ? (
              <img src={rider.image} alt={rider.name} className="w-20 h-20 rounded-full object-cover shadow-xl" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-xl">
                {rider.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="font-bold text-lg text-blue-800 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> 
            {rider.name}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-4 h-4 text-green-500" /> 
            {rider.phone}
          </div>
          <div className="text-xs text-gray-500 mt-1">ID: {rider.id}</div>
          <div className="text-xs text-green-700 font-semibold bg-green-100 rounded-full px-3 py-1 mt-2 shadow">
            Vehicle: {rider.vehicleNumber}
          </div>
          <div className="text-xs text-blue-700 font-semibold bg-blue-100 rounded-full px-3 py-1 mt-1 shadow flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            {rider.rating.toFixed(1)} ({rider.totalDeliveries} deliveries)
          </div>
        </div>
        {/* Receiver Card */}
        <div className="relative bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col items-center transform hover:scale-105 transition-transform duration-300 border border-green-100" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', transform: 'rotateY(8deg)' }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 via-blue-200 to-yellow-100 shadow-lg flex items-center justify-center mb-3 border-4 border-white/80">
            <User className="w-16 h-16 text-green-600" />
          </div>
          <div className="font-bold text-lg text-green-800 flex items-center gap-2">
            <User className="w-5 h-5 text-green-400" /> 
            {receiver.name}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-4 h-4 text-blue-500" /> 
            {receiver.phone}
          </div>
          <div className="text-xs text-gray-500 mt-1">{receiver.address}</div>
          <div className="text-xs text-blue-700 font-semibold bg-blue-100 rounded-full px-3 py-1 mt-2 shadow flex items-center gap-1">
            <Mail className="w-4 h-4 text-blue-400" /> 
            {receiver.email}
          </div>
        </div>
      </div>
      {/* 3D Progress Bar with Moving Car */}
      <div className="relative w-full max-w-xl mb-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-8 bg-gradient-to-r from-blue-200 via-green-100 to-teal-100 rounded-full shadow-inner border border-blue-100" style={{ zIndex: 1 }} />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 rounded-full bg-gradient-to-r from-blue-500 via-green-400 to-teal-300 shadow-lg transition-all duration-700" style={{ width: `${progressPercent}%`, zIndex: 2 }} />
        
        {/* Moving Car Animation */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out" 
          style={{ 
            left: `calc(${carPosition}% - 24px)`,
            zIndex: 3
          }}
        >
          <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-200 animate-pulse" style={{ boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.18)' }}>
            <Truck className="w-8 h-8 text-blue-600 drop-shadow-lg" />
          </div>
        </div>
        {/* Steps as 3D nodes */}
        <div className="relative flex justify-between items-center w-full z-10" style={{ top: 36 }}>
          {steps.map((step, idx) => (
            <div key={step} className="flex flex-col items-center" style={{ transform: 'translateZ(20px)' }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-lg border-4 ${idx <= currentStep ? 'bg-blue-600 text-white border-blue-400' : 'bg-gray-200 text-gray-500 border-gray-300'} transition-all duration-500`} style={{ boxShadow: idx === currentStep ? '0 0 16px 4px #3b82f6' : undefined }}>{idx + 1}</div>
              <div className={`text-xs text-center font-semibold ${idx === currentStep ? 'text-blue-700' : 'text-gray-500'}`}>{step}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Notification Button */}
      <div className="w-full max-w-xl mb-6 flex justify-center">
        <button
          onClick={openNotificationModal}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 ${
            riderNotifications.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 hover:scale-105'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          disabled={riderNotifications.length === 0}
        >
          <Truck className="w-5 h-5" />
          View Notifications
          {riderNotifications.length > 0 && (
            <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {riderNotifications.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Controls */}
      <div className="flex gap-4 mt-4">
        <button
          className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50"
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Next Step
        </button>
        <button
          className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50"
          onClick={handleNotify}
          disabled={notified}
        >
          Notify Receiver
        </button>
      </div>
      {currentStep === steps.length - 1 && (
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="text-center text-green-700 font-extrabold text-2xl animate-pulse drop-shadow-lg">Delivery Completed!</div>
          
          {/* Rating Section */}
          {!hasRated && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">How was your delivery experience?</p>
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold hover:scale-105 transition-transform duration-200"
                onClick={() => {
                  console.log('Rating button clicked, opening modal...');
                  console.log('Rider data:', rider);
                  setShowRatingModal(true);
                }}
              >
                <Star className="w-5 h-5" /> Rate Your Driver
              </button>
            </div>
          )}
          
          {hasRated && (
            <div className="text-center bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-semibold">Thank you for rating!</span>
              </div>
              <p className="text-green-600 text-sm">Your feedback helps improve our service.</p>
            </div>
          )}
          
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-green-500 text-white px-8 py-4 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="w-6 h-6" /> Back to Home
          </button>
        </div>
      )}
      
      {/* Rating Modal */}
      {rider && (
        <RiderRatingModal
          riderId={(rider as any).firebaseId || rider.id}
          riderName={rider.name}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={riderNotifications}
        onClearAll={clearNotifications}
      />
      </div>
    </>
  );
};

export default DeliveryProgressWithFirebase; 