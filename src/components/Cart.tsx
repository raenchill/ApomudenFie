import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { Trash2, Plus, Minus, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { CartItem } from '../types';
import { paymentService } from '../services/paymentService';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 10 : 0; // 10 GHS shipping
  const total = subtotal + shipping;

  const [userEmail, setUserEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [showPrescriptions, setShowPrescriptions] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="mb-6">
            <img
              src="/images/cart.jpg"
              alt="Empty Cart"
              className="mx-auto h-48 w-48 object-cover rounded-full shadow-lg"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some medicines to get started!</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const publicKey = 'pk_live_b6620196ae4179fa0ef87db28459970dd580939d'; // Paystack live public key
  
  const paystackProps = {
    email: userEmail,
    amount: total * 100, // Paystack expects amount in kobo/pesewas
    currency: 'GHS',
    publicKey,
    text: processing ? 'Processing...' : 'Pay Now',
    onSuccess: async (reference: any) => {
      console.log('Paystack payment success:', reference);
      setPaymentReference(reference.reference);
      setProcessing(true);
      setPaymentError('');
      
      try {
        // Simulate backend payment verification (in real app, verify with your backend)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify payment with backend service
        const result = await paymentService.processPayment(
          reference.reference, 
          total, 
          userEmail, 
          cartItems
        );
        
        if (result.success) {
          setPaymentSuccess(true);
          setShowPrescriptions(true);
          console.log('Payment validated successfully!');
        } else {
          setPaymentError(result.message || 'Payment verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentError('Payment verification failed. Please contact support.');
      } finally {
        setProcessing(false);
      }
    },
    onClose: () => {
      setProcessing(false);
      console.log('Payment closed');
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cart Header with Image */}
      <div className="relative mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl transform rotate-3"></div>
          <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="/images/cart.jpg"
              alt="Shopping Cart"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Cart</h1>
                <p className="text-lg md:text-xl">Review your selected medicines</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cart Items ({cartItems.length})</h2>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.medicine.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <img
                    src={item.medicine.image}
                    alt={item.medicine.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.medicine.name}</h3>
                    <p className="text-sm text-gray-600">{item.medicine.genericName}</p>
                    <p className="text-lg font-bold text-green-600">{item.medicine.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.medicine.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.medicine.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.medicine.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">{shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Temporary Testing Notice */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Testing Mode:</strong> Payment validation is temporarily bypassed for testing purposes.
              </p>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {paymentError}
              </div>
            )}

            {/* Payment Success */}
            {paymentSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Payment successful! Reference: {paymentReference}
              </div>
            )}

            {/* Proceed to Delivery Button - Always Enabled */}
            <Link
              to="/delivery"
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
            >
              Proceed to Delivery
            </Link>

            {/* Optional Payment Button for Testing */}
            <details className="mb-4">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                Test Payment Flow (Optional)
              </summary>
              <div className="mt-2">
                <PaystackButton
                  {...paystackProps}
                  className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    processing || !userEmail.trim()
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={processing || !userEmail.trim()}
                />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
