import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, User, Phone, Truck, AlertTriangle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, getDoc, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Rider } from '../../data/riders';
import { clearOldDelivererData } from '../../utils/clearOldDelivererData';
import { fixRiderDataSync } from '../../utils/fixRiderDataSync';

interface Deliverer extends Rider {
  id: string;
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
}

const DelivererManager: React.FC = () => {
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState<Deliverer | null>(null);

  // Image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions (max 300x300)
          const maxSize = 300;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          console.log('Image compression completed, size:', compressedDataUrl.length);
          resolve(compressedDataUrl);
        } catch (error) {
          console.error('Error in image compression:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        reject(error);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Image file selected:', file.name, file.size);
      setImageFile(file);
      
      try {
        // Compress the image
        console.log('Starting image compression...');
        const compressedImage = await compressImage(file);
        console.log('Image compressed successfully, length:', compressedImage.length);
        setImagePreview(compressedImage);
        setFormData(prev => ({ ...prev, image: compressedImage }));
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        console.log('Using fallback image reading...');
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('Fallback image loaded, length:', result.length);
          setImagePreview(result);
          setFormData(prev => ({ ...prev, image: result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const fetchDeliverers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'deliverers'));
      const deliverersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deliverer[];
      setDeliverers(deliverersData);
    } catch (error) {
      console.error('Error fetching deliverers:', error);
    }
  };

  useEffect(() => {
    fetchDeliverers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we're in edit mode, don't handle submit here
    if (editingId) {
      console.log('In edit mode, ignoring form submit');
      return;
    }
    
    console.log('Starting to add new rider...');
    setIsSubmitting(true);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.vehicleNumber.trim()) {
      setSuccessMessage('Please fill in all required fields');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Form data:', formData);
      console.log('Image length:', formData.image?.length || 0);
      
      const delivererData = {
        name: formData.name,
        phone: formData.phone,
        vehicleNumber: formData.vehicleNumber,
        image: formData.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIGhlaWdodD0iMTUwIHZpZXdCb3g9IjAgMCAxNTAgMTUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0Y5RkFGQSIvPgo8Y2lyY2xlIGN4PSI3NSIgY3k9IjUwIiByPSIyMCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNNzUgNzVjMTEuMDQ2IDAgMjAtOC45NTQgMjAtMjBzLTguOTU0LTIwLTIwLTIwLTIwIDguOTU0LTIwIDIwIDguOTU0IDIwIDIwIDIweiIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNNzUgNzVjLTExLjA0NiAwLTIwLTguOTU0LTIwLTIwczguOTU0LTIwIDIwLTIwIDIwIDguOTU0IDIwIDIwLTguOTU0IDIwLTIwIDIweiIgZmlsbD0iI0M3Q0QwMCIvPgo8cGF0aCBkPSJNNzUgNzVjLTYuNjI3IDAtMTItNS4zNzMtMTItMTJzNS4zNzMtMTIgMTItMTIgMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTJ6IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K',
        rating: 0,
        totalDeliveries: 0,
        isActive: true,
        createdAt: new Date()
      };

      console.log('About to add document to Firestore...');
      const docRef = await addDoc(collection(db, 'deliverers'), delivererData);
      console.log('Document added successfully with ID:', docRef.id);
      
      setSuccessMessage('Rider added successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      setFormData({ name: '', phone: '', vehicleNumber: '', image: '' });
      setImageFile(null);
      setImagePreview('');
      fetchDeliverers();
    } catch (error: any) {
      console.error('Error saving deliverer:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setSuccessMessage('Failed to add rider. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (rider: Deliverer) => {
    setRiderToDelete(rider);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!riderToDelete) return;
    
    console.log('Starting to delete rider:', riderToDelete.name, 'ID:', riderToDelete.id);
    
    try {
      // Check if the document exists before deleting
      const docRef = doc(db, 'deliverers', riderToDelete.id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('Rider document not found in Firestore');
        setSuccessMessage('Rider not found. Please refresh and try again.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowDeleteConfirm(false);
        setRiderToDelete(null);
        fetchDeliverers();
        return;
      }

      console.log('Rider document found, proceeding with deletion...');
      await deleteDoc(docRef);
      console.log('Rider deleted successfully from Firestore');
      
      setSuccessMessage(`Rider "${riderToDelete.name}" has been deleted successfully`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh rider list
      fetchDeliverers();
    } catch (error: any) {
      console.error('Error deleting rider:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setSuccessMessage('Failed to delete rider. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setRiderToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRiderToDelete(null);
  };

  const handleEdit = (deliverer: Deliverer) => {
    setEditingId(deliverer.id);
    setFormData({
      name: deliverer.name,
      phone: deliverer.phone,
      vehicleNumber: deliverer.vehicleNumber,
      image: deliverer.image
    });
    setImagePreview(deliverer.image);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setIsSubmitting(true);

    try {
      // Check if the document exists before updating
      const docRef = doc(db, 'deliverers', editingId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        setSuccessMessage('Rider not found. Please refresh and try again.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setEditingId(null);
        setFormData({ name: '', phone: '', vehicleNumber: '', image: '' });
        setImageFile(null);
        setImagePreview('');
        fetchDeliverers();
        return;
      }

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        vehicleNumber: formData.vehicleNumber,
        image: formData.image
      };

      await updateDoc(docRef, updateData);
      
      setSuccessMessage('Rider updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      setEditingId(null);
      setFormData({ name: '', phone: '', vehicleNumber: '', image: '' });
      setImageFile(null);
      setImagePreview('');
      fetchDeliverers();
    } catch (error) {
      console.error('Error updating deliverer:', error);
      setSuccessMessage('Failed to update rider. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', vehicleNumber: '', image: '' });
    setImageFile(null);
    setImagePreview('');
  };

  const handleClearOldData = async () => {
    try {
      const success = await clearOldDelivererData();
      if (success) {
        setSuccessMessage('Old deliverer data cleared successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchDeliverers(); // Refresh the list
      } else {
        setSuccessMessage('Failed to clear old data');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error clearing old data:', error);
      setSuccessMessage('Error clearing old data');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleFixDataSync = async () => {
    try {
      const result = await fixRiderDataSync();
      if (result.success) {
        setSuccessMessage(result.message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000); // Longer timeout for this message
        fetchDeliverers(); // Refresh the list
      } else {
        setSuccessMessage('Failed to fix data sync');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error fixing data sync:', error);
      setSuccessMessage('Error fixing data sync');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rider Management</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total Riders: {deliverers.length}
          </div>
          <button
            onClick={handleClearOldData}
            className="inline-flex items-center px-3 py-1 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Old Data
          </button>
          <button
            onClick={handleFixDataSync}
            className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Fix Data Sync
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && riderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Rider</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>{riderToDelete.name}</strong>?
              </p>
              <p className="text-sm text-gray-600">
                This rider will be permanently removed from the system and all their data will be lost.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Delete Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Rider' : 'Add New Rider'}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter rider name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number *
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter vehicle number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Images will be automatically compressed to reduce file size
            </p>
          </div>

          {imagePreview && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                    setFormData(prev => ({ ...prev, image: '' }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3">
            {editingId ? (
              <>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Rider'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Rider'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Riders List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Riders</h3>
        </div>
        
        {deliverers.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No riders found</h3>
            <p className="text-gray-500">Add your first rider to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deliveries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliverers.map((deliverer) => (
                  <tr key={deliverer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                                                      <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={deliverer.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xLjM0IDI0LTR2LTRIMFY4YzAgMi42NiA5Ljc5IDQgMTIgNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEyYzQuNDIgMCA4LTEuNzkgOC00cy0zLjU4LTQtOC00LTggMS43OS04IDQgMy41OCA0IDggNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo='}
                              alt={deliverer.name}
                            />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {deliverer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {deliverer.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {deliverer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Truck className="w-4 h-4 mr-2 text-gray-400" />
                        {deliverer.vehicleNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {deliverer.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliverer.totalDeliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(deliverer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(deliverer)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelivererManager; 