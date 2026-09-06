import React, { useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export interface ReceiverDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface ReceiverDetailsFormProps {
  onSubmit: (details: ReceiverDetails) => void;
}

const ReceiverDetailsForm: React.FC<ReceiverDetailsFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<ReceiverDetails>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<ReceiverDetails>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<ReceiverDetails> = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Address validation
    if (!form.address.trim()) {
      newErrors.address = 'Delivery address is required';
    } else if (form.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    // Phone validation
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+233|0)[0-9]{9}$/.test(form.phone.trim())) {
      newErrors.phone = 'Please enter a valid Ghanaian phone number';
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name as keyof ReceiverDetails]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate a brief delay for better UX
    setTimeout(() => {
      onSubmit(form);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form className="max-w-lg mx-auto p-8 min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-100 rounded-3xl shadow-2xl border border-blue-100" onSubmit={handleSubmit} style={{ perspective: 1000 }}>
      <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-blue-500 to-indigo-400 drop-shadow-lg" style={{ letterSpacing: 1 }}>Enter Your Delivery Details</h2>
      
      {/* Security Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>🔒 Secure Delivery:</strong> Your information is encrypted and will only be used for safe delivery of your medicines.
        </p>
      </div>
      
      <div className="w-full space-y-6">
        {/* Name */}
        <div className="relative">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`peer w-full bg-white/60 backdrop-blur-lg border-2 rounded-xl px-5 py-4 text-lg shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-transparent ${
              errors.name ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-violet-200 focus:ring-violet-400 focus:border-blue-400'
            }`}
            placeholder="Full Name"
            required
          />
          <label className={`absolute left-5 top-4 text-lg transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-5 peer-focus:text-sm bg-white/80 px-2 rounded-xl shadow-sm ${
            errors.name ? 'text-red-700 peer-focus:text-red-700' : 'text-gray-500 peer-focus:text-violet-700'
          }`}>
            <User className="inline w-5 h-5 mr-1 text-violet-400" /> Full Name
          </label>
          {errors.name && (
            <p className="text-red-600 text-sm mt-1 ml-2">{errors.name}</p>
          )}
        </div>
        {/* Address */}
        <div className="relative">
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className={`peer w-full bg-white/60 backdrop-blur-lg border-2 rounded-xl px-5 py-4 text-lg shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-transparent ${
              errors.address ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-blue-200 focus:ring-blue-400 focus:border-violet-400'
            }`}
            placeholder="Address"
            required
          />
          <label className={`absolute left-5 top-4 text-lg transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-5 peer-focus:text-sm bg-white/80 px-2 rounded-xl shadow-sm ${
            errors.address ? 'text-red-700 peer-focus:text-red-700' : 'text-gray-500 peer-focus:text-blue-700'
          }`}>
            <MapPin className="inline w-5 h-5 mr-1 text-blue-400" /> Address
          </label>
          {errors.address && (
            <p className="text-red-600 text-sm mt-1 ml-2">{errors.address}</p>
          )}
        </div>
        {/* Phone */}
        <div className="relative">
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`peer w-full bg-white/60 backdrop-blur-lg border-2 rounded-xl px-5 py-4 text-lg shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-transparent ${
              errors.phone ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-violet-200 focus:ring-violet-400 focus:border-blue-400'
            }`}
            placeholder="Phone Number (e.g., +233 50 123 4567)"
            required
          />
          <label className={`absolute left-5 top-4 text-lg transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-5 peer-focus:text-sm bg-white/80 px-2 rounded-xl shadow-sm ${
            errors.phone ? 'text-red-700 peer-focus:text-red-700' : 'text-gray-500 peer-focus:text-violet-700'
          }`}>
            <Phone className="inline w-5 h-5 mr-1 text-violet-400" /> Phone Number
          </label>
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1 ml-2">{errors.phone}</p>
          )}
        </div>
        {/* Email */}
        <div className="relative">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`peer w-full bg-white/60 backdrop-blur-lg border-2 rounded-xl px-5 py-4 text-lg shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-transparent ${
              errors.email ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-blue-200 focus:ring-blue-400 focus:border-violet-400'
            }`}
            placeholder="Email Address"
            required
          />
          <label className={`absolute left-5 top-4 text-lg transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-5 peer-focus:text-sm bg-white/80 px-2 rounded-xl shadow-sm ${
            errors.email ? 'text-red-700 peer-focus:text-red-700' : 'text-gray-500 peer-focus:text-blue-700'
          }`}>
            <Mail className="inline w-5 h-5 mr-1 text-blue-400" /> Email
          </label>
          {errors.email && (
            <p className="text-red-600 text-sm mt-1 ml-2">{errors.email}</p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-10 bg-gradient-to-r from-violet-600 to-blue-500 text-white px-10 py-4 rounded-2xl shadow-xl font-bold text-xl transition-all duration-200 w-full ${
          isSubmitting 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-105 hover:shadow-2xl'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          'Continue to Delivery Progress'
        )}
      </button>
    </form>
  );
};

export default ReceiverDetailsForm; 