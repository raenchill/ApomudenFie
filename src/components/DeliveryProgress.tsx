import React, { useState, useEffect } from 'react';

import { Rider } from '../data/riders';
import { ReceiverDetails } from './ReceiverDetailsForm';
import { Truck, User, Mail, Phone, Home, Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import RiderRatingModal from './RiderRatingModal';
import { CartItem } from '../types';

interface DeliveryProgressProps {
  rider: Rider;
  receiver: ReceiverDetails;
  cartItems: CartItem[];
  user: any;
  onResetDelivery: () => void;
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

// Custom 3D marker icon

const DeliveryProgress: React.FC<DeliveryProgressProps> = ({ rider, receiver, cartItems, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [notified, setNotified] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  // Simulated rider position
  const [, setRiderPos] = useState(route[0]);
  const navigate = useNavigate();

  useEffect(() => {
    setRiderPos(route[currentStep]);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setNotified(false);
    }
  };

  const handleNotify = () => {
    setNotified(true);
    alert(`Receiver notified: ${steps[currentStep]}`);
  };

  const handleRatingSubmitted = () => {
    setHasRated(true);
  };

  // 3D progress bar width
  const progressPercent = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100 rounded-3xl shadow-2xl" style={{ perspective: 1200 }}>
      <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-green-500 to-teal-400 drop-shadow-lg" style={{ letterSpacing: 1 }}>Delivery Progress</h2>
      {/* 3D Cards */}
      <div className="flex flex-col md:flex-row gap-8 w-full mb-10 justify-center items-center">
        {/* Rider Card */}
        <div className="relative bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col items-center transform hover:scale-105 transition-transform duration-300 border border-blue-100" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)', transform: 'rotateY(-8deg)' }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 via-green-300 to-teal-200 shadow-lg flex items-center justify-center mb-3 border-4 border-white/80">
            <img src={rider.image} alt={rider.name} className="w-20 h-20 rounded-full object-cover shadow-xl" />
          </div>
          <div className="font-bold text-lg text-blue-800 flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> {rider.name}</div>
          <div className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-4 h-4 text-green-500" /> {rider.phone}</div>
          <div className="text-xs text-gray-500 mt-1">ID: {rider.id}</div>
          <div className="text-xs text-green-700 font-semibold bg-green-100 rounded-full px-3 py-1 mt-2 shadow">Vehicle: {rider.vehicleNumber}</div>
        </div>
        {/* Receiver Card */}
        <div className="relative bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col items-center transform hover:scale-105 transition-transform duration-300 border border-green-100" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', transform: 'rotateY(8deg)' }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 via-blue-200 to-yellow-100 shadow-lg flex items-center justify-center mb-3 border-4 border-white/80">
            <User className="w-16 h-16 text-green-600" />
          </div>
          <div className="font-bold text-lg text-green-800 flex items-center gap-2"><User className="w-5 h-5 text-green-400" /> {receiver.name}</div>
          <div className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-4 h-4 text-blue-500" /> {receiver.phone}</div>
          <div className="text-xs text-gray-500 mt-1">{receiver.address}</div>
          <div className="text-xs text-blue-700 font-semibold bg-blue-100 rounded-full px-3 py-1 mt-2 shadow flex items-center gap-1"><Mail className="w-4 h-4 text-blue-400" /> {receiver.email}</div>
        </div>
      </div>
      {/* 3D Progress Bar */}
      <div className="relative w-full max-w-xl mb-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-8 bg-gradient-to-r from-blue-200 via-green-100 to-teal-100 rounded-full shadow-inner border border-blue-100" style={{ zIndex: 1 }} />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 rounded-full bg-gradient-to-r from-blue-500 via-green-400 to-teal-300 shadow-lg transition-all duration-700" style={{ width: `${progressPercent}%`, zIndex: 2 }} />
        {/* 3D Delivery Icon */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${progressPercent}% - 24px)` }}>
          <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-200 animate-bounce" style={{ boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.18)' }}>
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
                onClick={() => setShowRatingModal(true)}
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
      <RiderRatingModal
        riderId={rider.id}
        riderName={rider.name}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};

export default DeliveryProgress; 