import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { Medicine } from '../../types';

const MedicineManager: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Form fields - simplified
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');
  
  // Edit fields
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGenericName, setEditGenericName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editRequiresPrescription, setEditRequiresPrescription] = useState(false);
  const [editPrescriptionInstructions, setEditPrescriptionInstructions] = useState('');
  const [editStockCount, setEditStockCount] = useState('');
  const [editRating, setEditRating] = useState('');
  const [editReviews, setEditReviews] = useState('');
  
  // Notification states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Edit image states
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  const fetchMedicines = async () => {
    const querySnapshot = await getDocs(collection(db, 'medicines'));
    setMedicines(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine)));
  };

  useEffect(() => { fetchMedicines(); }, []);

  const handleAdd = async () => {
    console.log('Add button clicked');
    console.log('Form data:', { name, price, description, stockCount, imageFile, category, requiresPrescription });
    
    try {
      if (!name || !price || !description || !stockCount) {
        console.log('Validation failed:', { name: !!name, price: !!price, description: !!description, stockCount: !!stockCount, imageFile: !!imageFile });
        alert("Please fill all required fields (name, price, description, stock count).");
        return;
      }
      
      if (!imageFile) {
        console.log('No image file selected');
        alert("Please select an image file.");
        return;
      }

      setIsSubmitting(true);
      setImageUploadFailed(false);

      // Handle image - convert to data URL to avoid CORS issues
      let imageUrl = 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg'; // Default fallback
      
      try {
        console.log('Converting image to data URL...');
        // Convert image file to data URL
        const reader = new FileReader();
        const imagePromise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        
        reader.readAsDataURL(imageFile);
        imageUrl = await imagePromise as string;
        console.log('Image converted to data URL successfully');
      } catch (imageError) {
        console.error('Image conversion failed, using default image:', imageError);
        imageUrl = 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg';
        setImageUploadFailed(true);
      }

      // Create medicine object with simplified fields
      const medicineData = {
        name: name.trim(),
        genericName: name.trim(),
        category: category?.trim() || 'General',
        price: Number(price),
        description: description.trim(),
        dosage: 'As prescribed',
        manufacturer: 'Generic',
        requiresPrescription: Boolean(requiresPrescription),
        prescriptionInstructions: requiresPrescription ? (prescriptionInstructions?.trim() || '') : '',
        inStock: Number(stockCount) > 0,
        stockCount: Number(stockCount),
        image: imageUrl,
        rating: 4.5,
        reviews: 0,
        uses: [],
        sideEffects: [],
        precautions: []
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'medicines'), medicineData);
      console.log('Medicine saved to Firestore with ID:', docRef.id);
      console.log('Medicine data:', medicineData);

      // Reset form
      setName('');
      setCategory('');
      setPrice('');
      setDescription('');
      setRequiresPrescription(false);
      setPrescriptionInstructions('');
      setStockCount('');
      setImageFile(null);
      setImagePreview('');
      
      fetchMedicines();
      
      // Show success notification
      if (imageUploadFailed) {
        setSuccessMessage(`✅ ${name} added successfully! (Default image used)`);
      } else {
        setSuccessMessage(`✅ ${name} has been added successfully!`);
      }
      setShowSuccess(true);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error("Error adding medicine:", error);
      alert("Failed to add medicine. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'medicines', id));
      fetchMedicines();
      
      // Show success notification
      setSuccessMessage('✅ Medicine deleted successfully!');
      setShowSuccess(true);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Failed to delete medicine. See console for details.");
    }
  };

  const confirmDelete = (med: Medicine) => {
    setMedicineToDelete({ id: med.id, name: med.name });
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!medicineToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'medicines', medicineToDelete.id));
      fetchMedicines();
      
      // Show success notification
      setSuccessMessage(`✅ ${medicineToDelete.name} deleted successfully!`);
      setShowSuccess(true);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Failed to delete medicine. See console for details.");
    } finally {
      setShowDeleteConfirm(false);
      setMedicineToDelete(null);
    }
  };

  const handleEdit = (med: Medicine) => {
    setEditId(med.id);
    setEditName(med.name);
    setEditGenericName(med.genericName || '');
    setEditCategory(med.category || '');
    setEditPrice(String(med.price));
    setEditDiscountPrice(med.discountPrice ? String(med.discountPrice) : '');
    setEditDescription(med.description);
    setEditDosage(med.dosage || '');
    setEditManufacturer(med.manufacturer || '');
    setEditRequiresPrescription(med.requiresPrescription);
    setEditPrescriptionInstructions(med.prescriptionInstructions || '');
    setEditStockCount(String(med.stockCount));
    setEditRating(String(med.rating || 0));
    setEditReviews(String(med.reviews || 0));
    
    // Set current image as preview
    setEditImagePreview(med.image || '');
    setEditImageFile(null);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    
    try {
      // Handle image update
      let imageUrl = editImagePreview; // Keep current image if no new image selected
      
      if (editImageFile) {
        try {
          // Convert new image file to data URL
          const reader = new FileReader();
          const imagePromise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(editImageFile);
          imageUrl = await imagePromise as string;
        } catch (imageError) {
          // Keep the current image if conversion fails
        }
      }
      
      const updateData = {
        name: editName?.trim(),
        genericName: (editGenericName || editName)?.trim(),
        category: (editCategory || 'General')?.trim(),
        price: Number(editPrice),
        description: editDescription?.trim(),
        dosage: (editDosage || 'As prescribed')?.trim(),
        manufacturer: (editManufacturer || 'Generic')?.trim(),
        requiresPrescription: Boolean(editRequiresPrescription),
        prescriptionInstructions: editRequiresPrescription ? (editPrescriptionInstructions?.trim() || '') : '',
        inStock: Number(editStockCount) > 0,
        stockCount: Number(editStockCount),
        rating: Number(editRating),
        reviews: Number(editReviews),
        image: imageUrl
      };
      
      // Only add discountPrice if it has a valid value
      if (editDiscountPrice && editDiscountPrice.trim() !== '') {
        (updateData as any).discountPrice = Number(editDiscountPrice);
      }
      
      // Filter out any undefined or null values to prevent Firebase errors
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => 
          value !== undefined && 
          value !== null
        )
      );
      
      await updateDoc(doc(db, 'medicines', editId), cleanUpdateData);
      
      // Reset edit form
      setEditId(null);
      setEditName('');
      setEditGenericName('');
      setEditCategory('');
      setEditPrice('');
      setEditDiscountPrice('');
      setEditDescription('');
      setEditDosage('');
      setEditManufacturer('');
      setEditRequiresPrescription(false);
      setEditPrescriptionInstructions('');
      setEditStockCount('');
      setEditRating('');
      setEditReviews('');
      setEditImageFile(null);
      setEditImagePreview('');
      
      fetchMedicines();
      
      // Show success notification
      setSuccessMessage(`✅ ${editName} has been updated successfully!`);
      setShowSuccess(true);
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error("Error updating medicine:", error);
      alert("Failed to update medicine. See console for details.");
    }
  };

  return (
    <div>
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-right">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Medicine</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{medicineToDelete?.name}"</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMedicineToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Medicine Management</h2>
      <div className="mb-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Add New Medicine</h3>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Enter medicine name" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Category</option>
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Vitamins">Vitamins</option>
                  <option value="Wellness">Wellness</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₵) *</label>
                <input 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  placeholder="0.00" 
                  type="number" 
                  step="0.01" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input 
                  value={stockCount} 
                  onChange={e => setStockCount(e.target.value)} 
                  placeholder="0" 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Enter medicine description" 
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" 
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={requiresPrescription} 
                  onChange={e => setRequiresPrescription(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Requires Prescription</span>
              </label>
            </div>
            
            {requiresPrescription && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Instructions</label>
                <textarea 
                  value={prescriptionInstructions} 
                  onChange={e => setPrescriptionInstructions(e.target.value)} 
                  placeholder="Enter detailed prescription instructions (e.g., Take 1 tablet twice daily with food, Avoid alcohol, etc.)" 
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  These instructions will be shown to users after payment validation.
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Image *</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Note: Images are stored as data URLs to avoid CORS issues in development.
              </p>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm" />
                  <button 
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                console.log('Button clicked!');
                handleAdd();
              }} 
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 mt-2 ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Medicine...</span>
                </div>
              ) : (
                'Add Medicine'
              )}
            </button>
          </div>
          <div className="hidden lg:block flex-1">
            <div className="w-48 h-48 bg-gradient-to-tr from-blue-200 via-green-100 to-teal-100 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-blue-100" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}>
              <span className="text-6xl text-blue-300">💊</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Current Medicines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map(med => (
            <div key={med.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
              {med.image && (
                <img 
                  src={med.image} 
                  alt={med.name} 
                  className="w-32 h-32 object-cover rounded-lg mb-3 border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg';
                  }}
                />
              )}
              <div className="text-xl font-bold text-blue-800 mb-1">{med.name}</div>
              <div className="text-sm text-gray-600 mb-1">{med.genericName}</div>
              <div className="text-lg text-green-700 mb-1">
                GH₵{med.discountPrice || med.price}
                {med.discountPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">GH₵{med.price}</span>
                )}
              </div>
              <div className="text-gray-600 mb-2 text-center text-sm line-clamp-2">{med.description}</div>
              <div className="text-xs text-gray-500 mb-1">Category: {med.category}</div>
              <div className="text-xs text-gray-500 mb-1">Stock: {med.stockCount ?? 0}</div>
              <div className="text-xs text-gray-500 mb-2">Rating: {med.rating?.toFixed(1) || '0.0'} ({med.reviews || 0} reviews)</div>
              
              {editId === med.id ? (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                      <input 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        placeholder="Enter medicine name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        value={editCategory} 
                        onChange={e => setEditCategory(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="">Select Category</option>
                        <option value="Pain Relief">Pain Relief</option>
                        <option value="Antibiotics">Antibiotics</option>
                        <option value="Vitamins">Vitamins</option>
                        <option value="Wellness">Wellness</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₵) *</label>
                      <input 
                        value={editPrice} 
                        onChange={e => setEditPrice(e.target.value)} 
                        placeholder="0.00" 
                        type="number" 
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                      <input 
                        value={editStockCount} 
                        onChange={e => setEditStockCount(e.target.value)} 
                        placeholder="0" 
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      value={editDescription} 
                      onChange={e => setEditDescription(e.target.value)} 
                      placeholder="Enter medicine description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none" 
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editRequiresPrescription} 
                        onChange={e => setEditRequiresPrescription(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Requires Prescription</span>
                    </label>
                  </div>
                  
                  {editRequiresPrescription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Instructions</label>
                      <textarea 
                        value={editPrescriptionInstructions} 
                        onChange={e => setEditPrescriptionInstructions(e.target.value)} 
                        placeholder="Enter detailed prescription instructions (e.g., Take 1 tablet twice daily with food, Avoid alcohol, etc.)" 
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none" 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        These instructions will be shown to users after payment validation.
                      </p>
                    </div>
                  )}
                  
                  {/* Image Edit Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                    {editImagePreview && (
                      <img 
                        src={editImagePreview} 
                        alt="Current" 
                        className="w-24 h-24 object-cover rounded-lg border mb-2"
                      />
                    )}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Change Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditImageFile(file);
                        if (file) {
                          setEditImagePreview(URL.createObjectURL(file));
                        }
                      }} 
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep current image
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleUpdate} 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setEditId(null)} 
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(med)} className="bg-yellow-500 text-white px-3 py-1 rounded-xl font-bold text-sm">Edit</button>
                  <button onClick={() => confirmDelete(med)} className="bg-red-600 text-white px-3 py-1 rounded-xl font-bold text-sm">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicineManager;
