import React, { useState } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface RiderRatingModalProps {
  riderId: string;
  riderName: string;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted: () => void;
}

const RiderRatingModal: React.FC<RiderRatingModalProps> = ({
  riderId,
  riderName,
  isOpen,
  onClose,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }

    console.log('Submitting rating:', { rating, comment, riderId });
    setIsSubmitting(true);
    
    try {
      // Get the current rider document
      const riderRef = doc(db, 'deliverers', riderId);
      console.log('Looking for rider with ID:', riderId);
      
      const riderDoc = await getDoc(riderRef);
      console.log('Rider document exists:', riderDoc.exists());
      
      if (riderDoc.exists()) {
        const riderData = riderDoc.data();
        console.log('Current rider data:', riderData);
        
        const currentRating = riderData.rating || 0;
        const currentTotalDeliveries = riderData.totalDeliveries || 0;
        
        // Calculate new average rating
        const newTotalDeliveries = currentTotalDeliveries + 1;
        const newRating = ((currentRating * currentTotalDeliveries) + rating) / newTotalDeliveries;
        
        console.log('Rating calculation:', {
          currentRating,
          currentTotalDeliveries,
          newRating,
          newTotalDeliveries
        });
        
        // Update the rider's rating and delivery count
        await updateDoc(riderRef, {
          rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
          totalDeliveries: newTotalDeliveries
        });

        console.log('Rating updated successfully!');

        // Store the individual rating and comment (optional - for future analytics)
        const ratingData = {
          riderId,
          rating,
          comment,
          timestamp: new Date(),
          deliveryId: `delivery_${Date.now()}` // Generate a unique delivery ID
        };

        // You could store this in a separate 'ratings' collection for analytics
        // await addDoc(collection(db, 'ratings'), ratingData);

        console.log('Setting success state...');
        setIsSubmitted(true);
        
        setTimeout(() => {
          console.log('Closing modal and calling onRatingSubmitted...');
          onRatingSubmitted();
          onClose();
          // Reset form
          setRating(0);
          setComment('');
          setIsSubmitted(false);
        }, 2000);
      } else {
        console.error('Rider not found with ID:', riderId);
        alert('Rider not found. Please try again.');
      }
    } catch (error) {
      console.error('Error updating rider rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('RiderRatingModal render:', { isOpen, isSubmitted, isSubmitting, rating });
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Delivery</h2>
              <p className="text-gray-600">How was your experience with {riderName}?</p>
            </div>

            {/* Rating Stars */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Label */}
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-700">
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Comment Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your delivery experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/200 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleRatingSubmit}
              disabled={isSubmitting || rating === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </button>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your rating has been submitted successfully.</p>
            <div className="flex justify-center mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderRatingModal; 