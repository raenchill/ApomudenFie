// // import React, { useState, useEffect } from 'react';
// // import { Plus, Edit, Trash2, Star, User, Phone, Truck, AlertTriangle, Camera, Image as ImageIcon, Loader2, Lock } from 'lucide-react';
// // import { db } from '../../firebase';
// // import { collection, getDocs, getDoc, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// // import { Rider } from '../../data/riders';
// // import { clearOldDelivererData } from '../../utils/clearOldDelivererData';
// // import { fixRiderDataSync } from '../../utils/fixRiderDataSync';

// // interface Deliverer extends Rider {
// //   id: string;
// //   rating: number;
// //   totalDeliveries: number;
// //   isActive: boolean;
// //   totalRatingsCount?: number;
// //   totalStarsAccumulated?: number;
// //   pin?: string; // Added PIN to the interface
// // }

// // const DelivererManager: React.FC = () => {
// //   const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
// //   const [formData, setFormData] = useState({
// //     name: '',
// //     phone: '',
// //     vehicleNumber: '',
// //     image: '',
// //     pin: '' // Added PIN to state
// //   });
// //   const [imageFile, setImageFile] = useState<File | null>(null);
// //   const [imagePreview, setImagePreview] = useState<string>('');
// //   const [editingId, setEditingId] = useState<string | null>(null);
// //   const [showSuccess, setShowSuccess] = useState(false);
// //   const [successMessage, setSuccessMessage] = useState('');
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
// //   const [riderToDelete, setRiderToDelete] = useState<Deliverer | null>(null);

// //   const compressImage = (file: File): Promise<string> => {
// //     return new Promise((resolve, reject) => {
// //       const canvas = document.createElement('canvas');
// //       const ctx = canvas.getContext('2d');
// //       const img = new Image();
      
// //       img.onload = () => {
// //         try {
// //           const maxSize = 300;
// //           let { width, height } = img;
          
// //           if (width > height) {
// //             if (width > maxSize) {
// //               height = (height * maxSize) / width;
// //               width = maxSize;
// //             }
// //           } else {
// //             if (height > maxSize) {
// //               width = (width * maxSize) / height;
// //               height = maxSize;
// //             }
// //           }
          
// //           canvas.width = width;
// //           canvas.height = height;
// //           ctx?.drawImage(img, 0, 0, width, height);
          
// //           const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
// //           resolve(compressedDataUrl);
// //         } catch (error) {
// //           reject(error);
// //         }
// //       };
      
// //       img.onerror = (error) => reject(error);
// //       img.src = URL.createObjectURL(file);
// //     });
// //   };

// //   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (file) {
// //       setImageFile(file);
// //       try {
// //         const compressedImage = await compressImage(file);
// //         setImagePreview(compressedImage);
// //         setFormData(prev => ({ ...prev, image: compressedImage }));
// //       } catch (error) {
// //         const reader = new FileReader();
// //         reader.onload = (e) => {
// //           const result = e.target?.result as string;
// //           setImagePreview(result);
// //           setFormData(prev => ({ ...prev, image: result }));
// //         };
// //         reader.readAsDataURL(file);
// //       }
// //     }
// //   };

// //   const fetchDeliverers = async () => {
// //     try {
// //       const querySnapshot = await getDocs(collection(db, 'deliverers'));
// //       const deliverersData = querySnapshot.docs.map(doc => ({
// //         id: doc.id,
// //         ...doc.data()
// //       })) as Deliverer[];
// //       setDeliverers(deliverersData);
// //     } catch (error) {
// //       console.error('Error fetching deliverers:', error);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchDeliverers();
// //   }, []);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (editingId) return;
    
// //     setIsSubmitting(true);
// //     if (!formData.name.trim() || !formData.phone.trim() || !formData.vehicleNumber.trim() || formData.pin.length !== 4) {
// //       setSuccessMessage('Please fill in all required fields and ensure PIN is 4 digits.');
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //       setIsSubmitting(false);
// //       return;
// //     }

// //     try {
// //       const delivererData = {
// //         name: formData.name,
// //         phone: formData.phone,
// //         vehicleNumber: formData.vehicleNumber.toUpperCase(),
// //         pin: formData.pin, // Save the PIN to the database
// //         image: formData.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xLjM0IDI0LTR2LTRIMFY4YzAgMi42NiA5Ljc5IDQgMTIgNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEyYzQuNDIgMCA4LTEuNzkgOC00cy0zLjU4LTQtOC00LTggMS43OS04IDQgMy.1OCA0IDggNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=',
// //         rating: 5.0,
// //         totalDeliveries: 0,
// //         isActive: true,
// //         createdAt: new Date(),
// //         totalRatingsCount: 0,
// //         totalStarsAccumulated: 0
// //       };

// //       await addDoc(collection(db, 'deliverers'), delivererData);
// //       setSuccessMessage('Rider added successfully!');
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
      
// //       setFormData({ name: '', phone: '', vehicleNumber: '', image: '', pin: '' });
// //       setImageFile(null);
// //       setImagePreview('');
// //       fetchDeliverers();
// //     } catch (error: any) {
// //       setSuccessMessage('Failed to add rider. Please try again.');
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const confirmDelete = (rider: Deliverer) => {
// //     setRiderToDelete(rider);
// //     setShowDeleteConfirm(true);
// //   };

// //   const executeDelete = async () => {
// //     if (!riderToDelete) return;
// //     try {
// //       const docRef = doc(db, 'deliverers', riderToDelete.id);
// //       await deleteDoc(docRef);
// //       setSuccessMessage(`Rider "${riderToDelete.name}" deleted successfully`);
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //       fetchDeliverers();
// //     } catch (error: any) {
// //       setSuccessMessage('Failed to delete rider. Please try again.');
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //     } finally {
// //       setShowDeleteConfirm(false);
// //       setRiderToDelete(null);
// //     }
// //   };

// //   const cancelDelete = () => {
// //     setShowDeleteConfirm(false);
// //     setRiderToDelete(null);
// //   };

// //   const handleEdit = (deliverer: Deliverer) => {
// //     setEditingId(deliverer.id);
// //     setFormData({
// //       name: deliverer.name,
// //       phone: deliverer.phone,
// //       vehicleNumber: deliverer.vehicleNumber,
// //       image: deliverer.image || '',
// //       pin: deliverer.pin || '' // Load the PIN when editing
// //     });
// //     setImagePreview(deliverer.image || '');
// //   };

// //   const handleUpdate = async () => {
// //     if (!editingId) return;
// //     setIsSubmitting(true);

// //     if (formData.pin.length !== 4) {
// //       setSuccessMessage('PIN must be exactly 4 digits.');
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //       setIsSubmitting(false);
// //       return;
// //     }

// //     try {
// //       const docRef = doc(db, 'deliverers', editingId);
// //       await updateDoc(docRef, {
// //         name: formData.name,
// //         phone: formData.phone,
// //         vehicleNumber: formData.vehicleNumber.toUpperCase(),
// //         pin: formData.pin, // Update the PIN
// //         image: formData.image
// //       });
      
// //       setSuccessMessage('Rider updated successfully!');
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //       cancelEdit();
// //       fetchDeliverers();
// //     } catch (error) {
// //       setSuccessMessage('Failed to update rider. Please try again.');
// //       setShowSuccess(true);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const cancelEdit = () => {
// //     setEditingId(null);
// //     setFormData({ name: '', phone: '', vehicleNumber: '', image: '', pin: '' });
// //     setImageFile(null);
// //     setImagePreview('');
// //   };

// //   const handleClearOldData = async () => {
// //     try {
// //       const success = await clearOldDelivererData();
// //       if (success) {
// //         setSuccessMessage('Old deliverer data cleared successfully!');
// //         setShowSuccess(true);
// //         setTimeout(() => setShowSuccess(false), 3000);
// //         fetchDeliverers();
// //       }
// //     } catch (error) {
// //       console.error('Error clearing old data:', error);
// //     }
// //   };

// //   const handleFixRiderDataSync = async () => {
// //     try {
// //       const result = await fixRiderDataSync();
// //       if (result.success) {
// //         setSuccessMessage(result.message);
// //         setShowSuccess(true);
// //         setTimeout(() => setShowSuccess(false), 5000);
// //         fetchDeliverers();
// //       }
// //     } catch (error) {
// //       console.error('Error fixing data sync:', error);
// //     }
// //   };

// //   return (
// //     <div className="space-y-6">
// //       {/* Header Bar */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
// //         <div>
// //           <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Rider Management</h2>
// //           <p className="text-sm font-medium text-gray-500 mt-0.5">Total active fleet personnel: {deliverers.length}</p>
// //         </div>
// //         <div className="flex items-center gap-3">
// //           <button
// //             type="button"
// //             onClick={handleClearOldData}
// //             className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs uppercase tracking-wider border border-amber-200/60 rounded-xl transition-all"
// //           >
// //             <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Old Data
// //           </button>
// //           <button
// //             type="button"
// //             onClick={handleFixRiderDataSync}
// //             className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-wider border border-red-100 rounded-xl transition-all"
// //           >
// //             <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Fix Data Sync
// //           </button>
// //         </div>
// //       </div>

// //       {showSuccess && (
// //         <div className="fixed top-6 right-6 bg-white border border-violet-200 text-violet-800 font-semibold px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
// //           <div className="h-2 w-2 rounded-full bg-violet-600 animate-pulse"></div>
// //           <span>{successMessage}</span>
// //         </div>
// //       )}

// //       {/* Delete Confirmation Modal */}
// //       {showDeleteConfirm && riderToDelete && (
// //         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
// //             <div className="p-6 text-center">
// //               <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
// //                 <AlertTriangle className="w-6 h-6" />
// //               </div>
// //               <h2 className="text-xl font-bold text-gray-900 tracking-tight">Delete Fleet Rider?</h2>
// //               <p className="text-sm text-gray-500 mt-2 leading-relaxed">
// //                 Are you sure you want to permanently remove <strong>{riderToDelete.name}</strong> from the logistics network?
// //               </p>
// //             </div>
// //             <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
// //               <button
// //                 type="button"
// //                 onClick={cancelDelete}
// //                 className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-semibold text-sm transition-all shadow-sm"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 type="button"
// //                 onClick={executeDelete}
// //                 className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 font-semibold text-sm transition-all shadow-sm"
// //               >
// //                 Delete Rider
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Form Card */}
// //       <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
// //         <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">
// //           {editingId ? 'Edit Fleet Rider Profile' : 'Register New Rider'}
// //         </h3>
        
// //         <form onSubmit={editingId ? (e) => e.preventDefault() : handleSubmit} className="space-y-5">
// //           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
// //             <div className="md:col-span-1">
// //               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
// //               <input
// //                 type="text"
// //                 value={formData.name}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
// //                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
// //                 placeholder="e.g. Kofi Mensah"
// //                 required
// //               />
// //             </div>

// //             <div className="md:col-span-1">
// //               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
// //               <input
// //                 type="tel"
// //                 value={formData.phone}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
// //                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
// //                 placeholder="e.g. 0541234567"
// //                 required
// //               />
// //             </div>

// //             <div className="md:col-span-1">
// //               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Number / ID *</label>
// //               <input
// //                 type="text"
// //                 value={formData.vehicleNumber}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
// //                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
// //                 placeholder="e.g. GT-4521-24"
// //                 required
// //               />
// //             </div>

// //             {/* Added 4-Digit Access PIN Field */}
// //             <div className="md:col-span-1">
// //               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
// //                 <Lock className="w-3 h-3" /> 4-Digit Access PIN *
// //               </label>
// //               <input
// //                 type="text"
// //                 maxLength={4}
// //                 value={formData.pin}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
// //                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
// //                 placeholder="1234"
// //                 required
// //               />
// //             </div>
// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
// //             <div>
// //               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Profile Photo</label>
// //               <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50">
// //                 {imagePreview ? (
// //                   <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
// //                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
// //                     <button
// //                       type="button"
// //                       onClick={() => {
// //                         setImagePreview('');
// //                         setImageFile(null);
// //                         setFormData(prev => ({ ...prev, image: '' }));
// //                       }}
// //                       className="absolute top-1 right-1 bg-red-600 text-white rounded-lg p-1 text-xs shadow-md"
// //                     >
// //                       ×
// //                     </button>
// //                   </div>
// //                 ) : (
// //                   <label className="flex flex-col items-center gap-1.5 cursor-pointer text-gray-400 hover:text-violet-700 transition-colors py-2">
// //                     <ImageIcon className="w-6 h-6 stroke-[1.5]" />
// //                     <span className="text-xs font-bold tracking-wide">Upload Rider Photo</span>
// //                     <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
// //                   </label>
// //                 )}
// //               </div>
// //             </div>

// //             <div className="flex flex-col justify-end gap-3">
// //               {editingId ? (
// //                 <div className="flex gap-3">
// //                   <button
// //                     type="button"
// //                     onClick={handleUpdate}
// //                     disabled={isSubmitting}
// //                     className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
// //                   >
// //                     {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Update Rider Profile
// //                   </button>
// //                   <button
// //                     type="button"
// //                     onClick={cancelEdit}
// //                     className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
// //                   >
// //                     Cancel
// //                   </button>
// //                 </div>
// //               ) : (
// //                 <button
// //                   type="submit"
// //                   disabled={isSubmitting}
// //                   className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
// //                 >
// //                   {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Register Fleet Rider
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </form>
// //       </div>

// //       {/* Deliverers Table List */}
// //       <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
// //         <div className="px-6 py-5 border-b border-gray-100">
// //           <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Active Fleet Directory</h3>
// //         </div>
        
// //         {deliverers.length === 0 ? (
// //           <div className="text-center py-16">
// //             <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
// //             <h3 className="text-sm font-bold text-gray-700">No riders registered</h3>
// //             <p className="text-xs text-gray-400 mt-0.5">Add your first delivery personnel above to populate the fleet.</p>
// //           </div>
// //         ) : (
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-left border-collapse text-xs">
// //               <thead>
// //                 <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase text-[10px]">
// //                   <th className="p-4">Rider Profile</th>
// //                   <th className="p-4">Contact Phone</th>
// //                   <th className="p-4">Vehicle Tag</th>
// //                   <th className="p-4">Access PIN</th>
// //                   <th className="p-4">Live Rating</th>
// //                   <th className="p-4">Deliveries</th>
// //                   <th className="p-4 text-right">Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-gray-50">
// //                 {deliverers.map((deliverer) => {
// //                   const ratingsCount = deliverer.totalRatingsCount || 0;
// //                   const starsAccumulated = deliverer.totalStarsAccumulated || 0;
// //                   const liveAverageRating = ratingsCount > 0 
// //                     ? parseFloat((starsAccumulated / ratingsCount).toFixed(1)) 
// //                     : 5.0;

// //                   return (
// //                     <tr key={deliverer.id} className="hover:bg-gray-50/50 transition-colors">
// //                       <td className="p-4 whitespace-nowrap">
// //                         <div className="flex items-center gap-3">
// //                           <img
// //                             className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
// //                             src={deliverer.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xLjM0IDI0LTR2LTRIMFY4YzAgMi42NiA5Ljc5IDQgMTIgNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEyYzQuNDIgMCA4LTEuNzkgOC00cy0zLjU4LTQtOC00LTggMS43OS04IDQgMy.1OCA0IDggNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo='}
// //                             alt={deliverer.name}
// //                           />
// //                           <div>
// //                             <div className="font-bold text-gray-900 tracking-tight">{deliverer.name}</div>
// //                             <span className="text-[10px] text-gray-400 font-mono">ID: {deliverer.id}</span>
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td className="p-4 whitespace-nowrap font-mono text-gray-700">
// //                         <div className="flex items-center gap-1.5">
// //                           <Phone className="w-3.5 h-3.5 text-gray-400" />
// //                           {deliverer.phone}
// //                         </div>
// //                       </td>
// //                       <td className="p-4 whitespace-nowrap">
// //                         <div className="inline-flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg text-gray-800 font-mono font-bold uppercase text-[11px]">
// //                           <Truck className="w-3.5 h-3.5 text-gray-500" />
// //                           {deliverer.vehicleNumber}
// //                         </div>
// //                       </td>
// //                       {/* Show the PIN in the table so Admin can remember it to give to the rider */}
// //                       <td className="p-4 whitespace-nowrap">
// //                         <div className="inline-flex items-center gap-1 text-gray-700 font-mono font-bold tracking-widest bg-red-50 text-red-700 px-2 py-1 rounded-lg border border-red-100">
// //                            <Lock className="w-3 h-3 text-red-500" /> {deliverer.pin || 'N/A'}
// //                         </div>
// //                       </td>
// //                       <td className="p-4 whitespace-nowrap">
// //                         <div className="flex items-center gap-1">
// //                           <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
// //                           <span className="font-mono font-black text-gray-900">{liveAverageRating.toFixed(1)}</span>
// //                           <span className="text-[10px] text-gray-400 font-medium">({ratingsCount})</span>
// //                         </div>
// //                       </td>
// //                       <td className="p-4 whitespace-nowrap font-mono font-bold text-violet-700">
// //                         {deliverer.totalDeliveries} orders
// //                       </td>
// //                       <td className="p-4 whitespace-nowrap text-right">
// //                         <div className="inline-flex items-center gap-1">
// //                           <button
// //                             type="button"
// //                             onClick={() => handleEdit(deliverer)}
// //                             className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
// //                             title="Edit Rider"
// //                           >
// //                             <Edit className="w-4 h-4" />
// //                           </button>
// //                           <button
// //                             type="button"
// //                             onClick={() => confirmDelete(deliverer)}
// //                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
// //                             title="Delete Rider"
// //                           >
// //                             <Trash2 className="w-4 h-4" />
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default DelivererManager;

// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Star, User, Phone, Truck, AlertTriangle, Camera, Image as ImageIcon, Loader2, Lock } from 'lucide-react';
// import { db } from '../../firebase';
// import { collection, getDocs, getDoc, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// import { Rider } from '../../data/riders';

// interface Deliverer extends Rider {
//   id: string;
//   rating: number;
//   totalDeliveries?: number;
//   deliveries?: number;
//   completedOrders?: number;
//   isActive: boolean;
//   totalRatingsCount?: number;
//   totalStarsAccumulated?: number;
//   pin?: string;
// }

// const DelivererManager: React.FC = () => {
//   const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     vehicleNumber: '',
//     image: '',
//     pin: ''
//   });
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string>('');
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [riderToDelete, setRiderToDelete] = useState<Deliverer | null>(null);

//   const compressImage = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       const img = new Image();
      
//       img.onload = () => {
//         try {
//           const maxSize = 300;
//           let { width, height } = img;
          
//           if (width > height) {
//             if (width > maxSize) {
//               height = (height * maxSize) / width;
//               width = maxSize;
//             }
//           } else {
//             if (height > maxSize) {
//               width = (width * maxSize) / height;
//               height = maxSize;
//             }
//           }
          
//           canvas.width = width;
//           canvas.height = height;
//           ctx?.drawImage(img, 0, 0, width, height);
          
//           const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
//           resolve(compressedDataUrl);
//         } catch (error) {
//           reject(error);
//         }
//       };
      
//       img.onerror = (error) => reject(error);
//       img.src = URL.createObjectURL(file);
//     });
//   };

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       try {
//         const compressedImage = await compressImage(file);
//         setImagePreview(compressedImage);
//         setFormData(prev => ({ ...prev, image: compressedImage }));
//       } catch (error) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           const result = e.target?.result as string;
//           setImagePreview(result);
//           setFormData(prev => ({ ...prev, image: result }));
//         };
//         reader.readAsDataURL(file);
//       }
//     }
//   };

//   const fetchDeliverers = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, 'deliverers'));
//       const deliverersData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as Deliverer[];
//       setDeliverers(deliverersData);
//     } catch (error) {
//       console.error('Error fetching deliverers:', error);
//     }
//   };

//   useEffect(() => {
//     fetchDeliverers();
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (editingId) return;
    
//     setIsSubmitting(true);
//     if (!formData.name.trim() || !formData.phone.trim() || !formData.vehicleNumber.trim() || formData.pin.length !== 4) {
//       setSuccessMessage('Please fill in all required fields and ensure PIN is 4 digits.');
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const delivererData = {
//         name: formData.name,
//         phone: formData.phone,
//         vehicleNumber: formData.vehicleNumber.toUpperCase(),
//         pin: formData.pin,
//         image: formData.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xLjM0IDI0LTR2LTRIMFY4YzAgMi42NiA5Ljc5IDQgMTIgNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEyYzQuNDIgMCA4LTEuNzkgOC00cy0zLjU4LTQtOC00LTggMS43OS04IDQgMy.1OCA0IDggNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=',
//         rating: 5.0,
//         deliveries: 0, 
//         totalDeliveries: 0,
//         isActive: true,
//         createdAt: new Date(),
//         totalRatingsCount: 0,
//         totalStarsAccumulated: 0
//       };

//       await addDoc(collection(db, 'deliverers'), delivererData);
//       setSuccessMessage('Rider added successfully!');
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
      
//       setFormData({ name: '', phone: '', vehicleNumber: '', image: '', pin: '' });
//       setImageFile(null);
//       setImagePreview('');
//       fetchDeliverers();
//     } catch (error: any) {
//       setSuccessMessage('Failed to add rider. Please try again.');
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const confirmDelete = (rider: Deliverer) => {
//     setRiderToDelete(rider);
//     setShowDeleteConfirm(true);
//   };

//   const executeDelete = async () => {
//     if (!riderToDelete) return;
//     try {
//       const docRef = doc(db, 'deliverers', riderToDelete.id);
//       await deleteDoc(docRef);
//       setSuccessMessage(`Rider "${riderToDelete.name}" deleted successfully`);
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//       fetchDeliverers();
//     } catch (error: any) {
//       setSuccessMessage('Failed to delete rider. Please try again.');
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//     } finally {
//       setShowDeleteConfirm(false);
//       setRiderToDelete(null);
//     }
//   };

//   const cancelDelete = () => {
//     setShowDeleteConfirm(false);
//     setRiderToDelete(null);
//   };

//   const handleEdit = (deliverer: Deliverer) => {
//     setEditingId(deliverer.id);
//     setFormData({
//       name: deliverer.name,
//       phone: deliverer.phone,
//       vehicleNumber: deliverer.vehicleNumber,
//       image: deliverer.image || '',
//       pin: deliverer.pin || ''
//     });
//     setImagePreview(deliverer.image || '');
//   };

//   const handleUpdate = async () => {
//     if (!editingId) return;
//     setIsSubmitting(true);

//     if (formData.pin.length !== 4) {
//       setSuccessMessage('PIN must be exactly 4 digits.');
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const docRef = doc(db, 'deliverers', editingId);
//       await updateDoc(docRef, {
//         name: formData.name,
//         phone: formData.phone,
//         vehicleNumber: formData.vehicleNumber.toUpperCase(),
//         pin: formData.pin,
//         image: formData.image
//       });
      
//       setSuccessMessage('Rider updated successfully!');
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//       cancelEdit();
//       fetchDeliverers();
//     } catch (error) {
//       setSuccessMessage('Failed to update rider. Please try again.');
//       setShowSuccess(true);
//       setTimeout(() => setShowSuccess(false), 3000);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setFormData({ name: '', phone: '', vehicleNumber: '', image: '', pin: '' });
//     setImageFile(null);
//     setImagePreview('');
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header Bar - Removed the utility buttons */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Rider Management</h2>
//           <p className="text-sm font-medium text-gray-500 mt-0.5">Total active fleet personnel: {deliverers.length}</p>
//         </div>
//       </div>

//       {showSuccess && (
//         <div className="fixed top-6 right-6 bg-white border border-violet-200 text-violet-800 font-semibold px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
//           <div className="h-2 w-2 rounded-full bg-violet-600 animate-pulse"></div>
//           <span>{successMessage}</span>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && riderToDelete && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-6 text-center">
//               <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
//                 <AlertTriangle className="w-6 h-6" />
//               </div>
//               <h2 className="text-xl font-bold text-gray-900 tracking-tight">Delete Fleet Rider?</h2>
//               <p className="text-sm text-gray-500 mt-2 leading-relaxed">
//                 Are you sure you want to permanently remove <strong>{riderToDelete.name}</strong> from the logistics network?
//               </p>
//             </div>
//             <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
//               <button
//                 type="button"
//                 onClick={cancelDelete}
//                 className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-semibold text-sm transition-all shadow-sm"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={executeDelete}
//                 className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 font-semibold text-sm transition-all shadow-sm"
//               >
//                 Delete Rider
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Form Card */}
//       <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
//         <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">
//           {editingId ? 'Edit Fleet Rider Profile' : 'Register New Rider'}
//         </h3>
        
//         <form onSubmit={editingId ? (e) => e.preventDefault() : handleSubmit} className="space-y-5">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <div className="md:col-span-1">
//               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
//                 placeholder="e.g. Kofi Mensah"
//                 required
//               />
//             </div>

//             <div className="md:col-span-1">
//               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
//                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
//                 placeholder="e.g. 0541234567"
//                 required
//               />
//             </div>

//             <div className="md:col-span-1">
//               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Number / ID *</label>
//               <input
//                 type="text"
//                 value={formData.vehicleNumber}
//                 onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
//                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
//                 placeholder="e.g. GT-4521-24"
//                 required
//               />
//             </div>

//             <div className="md:col-span-1">
//               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
//                 <Lock className="w-3 h-3" /> 4-Digit Access PIN *
//               </label>
//               <input
//                 type="text"
//                 maxLength={4}
//                 value={formData.pin}
//                 onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
//                 className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
//                 placeholder="1234"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
//             <div>
//               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Profile Photo</label>
//               <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50">
//                 {imagePreview ? (
//                   <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
//                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setImagePreview('');
//                         setImageFile(null);
//                         setFormData(prev => ({ ...prev, image: '' }));
//                       }}
//                       className="absolute top-1 right-1 bg-red-600 text-white rounded-lg p-1 text-xs shadow-md"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ) : (
//                   <label className="flex flex-col items-center gap-1.5 cursor-pointer text-gray-400 hover:text-violet-700 transition-colors py-2">
//                     <ImageIcon className="w-6 h-6 stroke-[1.5]" />
//                     <span className="text-xs font-bold tracking-wide">Upload Rider Photo</span>
//                     <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                   </label>
//                 )}
//               </div>
//             </div>

//             <div className="flex flex-col justify-end gap-3">
//               {editingId ? (
//                 <div className="flex gap-3">
//                   <button
//                     type="button"
//                     onClick={handleUpdate}
//                     disabled={isSubmitting}
//                     className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
//                   >
//                     {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Update Rider Profile
//                   </button>
//                   <button
//                     type="button"
//                     onClick={cancelEdit}
//                     className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
//                 >
//                   {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Register Fleet Rider
//                 </button>
//               )}
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* Deliverers Table List */}
//       <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
//         <div className="px-6 py-5 border-b border-gray-100">
//           <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Active Fleet Directory</h3>
//         </div>
        
//         {deliverers.length === 0 ? (
//           <div className="text-center py-16">
//             <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//             <h3 className="text-sm font-bold text-gray-700">No riders registered</h3>
//             <p className="text-xs text-gray-400 mt-0.5">Add your first delivery personnel above to populate the fleet.</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse text-xs">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase text-[10px]">
//                   <th className="p-4">Rider Profile</th>
//                   <th className="p-4">Contact Phone</th>
//                   <th className="p-4">Vehicle Tag</th>
//                   <th className="p-4">Access PIN</th>
//                   <th className="p-4">Live Rating</th>
//                   <th className="p-4">Deliveries</th>
//                   <th className="p-4 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {deliverers.map((deliverer) => {
//                   const ratingsCount = deliverer.totalRatingsCount || 0;
//                   const starsAccumulated = deliverer.totalStarsAccumulated || 0;
//                   const liveAverageRating = ratingsCount > 0 
//                     ? parseFloat((starsAccumulated / ratingsCount).toFixed(1)) 
//                     : 5.0;

//                   return (
//                     <tr key={deliverer.id} className="hover:bg-gray-50/50 transition-colors">
//                       <td className="p-4 whitespace-nowrap">
//                         <div className="flex items-center gap-3">
//                           <img
//                             className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
//                             src={deliverer.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xLjM0IDI0LTR2LTRIMFY4YzAgMi42NiA5Ljc5IDQgMTIgNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEyYzQuNDIgMCA4LTEuNzkgOC00cy0zLjU4LTQtOC00LTggMS43OS04IDQgMy.1OCA0IDggNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo='}
//                             alt={deliverer.name}
//                           />
//                           <div>
//                             <div className="font-bold text-gray-900 tracking-tight">{deliverer.name}</div>
//                             <span className="text-[10px] text-gray-400 font-mono">ID: {deliverer.id}</span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-4 whitespace-nowrap font-mono text-gray-700">
//                         <div className="flex items-center gap-1.5">
//                           <Phone className="w-3.5 h-3.5 text-gray-400" />
//                           {deliverer.phone}
//                         </div>
//                       </td>
//                       <td className="p-4 whitespace-nowrap">
//                         <div className="inline-flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg text-gray-800 font-mono font-bold uppercase text-[11px]">
//                           <Truck className="w-3.5 h-3.5 text-gray-500" />
//                           {deliverer.vehicleNumber}
//                         </div>
//                       </td>
//                       <td className="p-4 whitespace-nowrap">
//                         <div className="inline-flex items-center gap-1 text-gray-700 font-mono font-bold tracking-widest bg-red-50 text-red-700 px-2 py-1 rounded-lg border border-red-100">
//                            <Lock className="w-3 h-3 text-red-500" /> {deliverer.pin || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="p-4 whitespace-nowrap">
//                         <div className="flex items-center gap-1">
//                           <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
//                           <span className="font-mono font-black text-gray-900">{liveAverageRating.toFixed(1)}</span>
//                           <span className="text-[10px] text-gray-400 font-medium">({ratingsCount})</span>
//                         </div>
//                       </td>
//                       <td className="p-4 whitespace-nowrap font-mono font-bold text-violet-700">
//                         {deliverer.deliveries || deliverer.completedOrders || deliverer.totalDeliveries || 0} orders
//                       </td>
//                       <td className="p-4 whitespace-nowrap text-right">
//                         <div className="inline-flex items-center gap-1">
//                           <button
//                             type="button"
//                             onClick={() => handleEdit(deliverer)}
//                             className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
//                             title="Edit Rider"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => confirmDelete(deliverer)}
//                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
//                             title="Delete Rider"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DelivererManager;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, User, Phone, Truck, AlertTriangle, Camera, Image as ImageIcon, Loader2, Lock, Smartphone } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, getDoc, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Rider } from '../../data/riders';

interface Deliverer extends Rider {
  id: string;
  rating: number;
  totalDeliveries?: number;
  deliveries?: number;
  completedOrders?: number;
  isActive: boolean;
  totalRatingsCount?: number;
  totalStarsAccumulated?: number;
  pin?: string;
  momoNumber?: string;
  momoNetwork?: string;
}

const DelivererManager: React.FC = () => {
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
    image: '',
    pin: '',
    momoNumber: '',
    momoNetwork: 'MTN'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState<Deliverer | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
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
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => reject(error);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const compressedImage = await compressImage(file);
        setImagePreview(compressedImage);
        setFormData(prev => ({ ...prev, image: compressedImage }));
      } catch (error) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
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
    if (editingId) return;
    
    setIsSubmitting(true);
    if (!formData.name.trim() || !formData.phone.trim() || !formData.vehicleNumber.trim() || formData.pin.length !== 4 || !formData.momoNumber.trim()) {
      setSuccessMessage('Please fill in all required fields and ensure PIN is 4 digits.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      const delivererData = {
        name: formData.name,
        phone: formData.phone,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        pin: formData.pin,
        momoNumber: formData.momoNumber,
        momoNetwork: formData.momoNetwork,
        image: formData.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xLjM0IDI0LTR2LTRIMFY4YzAgMi42NiA5Ljc5IDQgMTIgNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEyYzQuNDIgMCA4LTEuNzkgOC00cy0zLjU4LTQtOC00LTggMS43OS04IDQgMy41OCA0IDggNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=',
        rating: 5.0,
        deliveries: 0, 
        totalDeliveries: 0,
        isActive: true,
        createdAt: new Date(),
        totalRatingsCount: 0,
        totalStarsAccumulated: 0
      };

      await addDoc(collection(db, 'deliverers'), delivererData);
      setSuccessMessage('Rider added successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      setFormData({ name: '', phone: '', vehicleNumber: '', image: '', pin: '', momoNumber: '', momoNetwork: 'MTN' });
      setImageFile(null);
      setImagePreview('');
      fetchDeliverers();
    } catch (error: any) {
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
    try {
      const docRef = doc(db, 'deliverers', riderToDelete.id);
      await deleteDoc(docRef);
      setSuccessMessage(`Rider "${riderToDelete.name}" deleted successfully`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchDeliverers();
    } catch (error: any) {
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
      image: deliverer.image || '',
      pin: deliverer.pin || '',
      momoNumber: deliverer.momoNumber || '',
      momoNetwork: deliverer.momoNetwork || 'MTN'
    });
    setImagePreview(deliverer.image || '');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setIsSubmitting(true);

    if (formData.pin.length !== 4) {
      setSuccessMessage('PIN must be exactly 4 digits.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      const docRef = doc(db, 'deliverers', editingId);
      await updateDoc(docRef, {
        name: formData.name,
        phone: formData.phone,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        pin: formData.pin,
        momoNumber: formData.momoNumber,
        momoNetwork: formData.momoNetwork,
        image: formData.image
      });
      
      setSuccessMessage('Rider updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      cancelEdit();
      fetchDeliverers();
    } catch (error) {
      setSuccessMessage('Failed to update rider. Please try again.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', vehicleNumber: '', image: '', pin: '', momoNumber: '', momoNetwork: 'MTN' });
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Rider Management</h2>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Total active fleet personnel: {deliverers.length}</p>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-6 right-6 bg-white border border-violet-200 text-violet-800 font-semibold px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <div className="h-2 w-2 rounded-full bg-violet-600 animate-pulse"></div>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && riderToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Delete Fleet Rider?</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Are you sure you want to permanently remove <strong>{riderToDelete.name}</strong> from the logistics network?
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-semibold text-sm transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 font-semibold text-sm transition-all shadow-sm"
              >
                Delete Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">
          {editingId ? 'Edit Fleet Rider Profile' : 'Register New Rider'}
        </h3>
        
        <form onSubmit={editingId ? (e) => e.preventDefault() : handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                placeholder="e.g. Kofi Mensah"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Contact Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                maxLength={10}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                placeholder="e.g. 0541234567"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Number / ID *</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                placeholder="e.g. GT-4521-24"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3" /> 4-Digit Access PIN *
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.pin}
                onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                placeholder="1234"
                required
              />
            </div>

            {/* NEW FIELDS: Rider Payment Details */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Momo Network *
              </label>
              <select
                value={formData.momoNetwork}
                onChange={(e) => setFormData(prev => ({ ...prev, momoNetwork: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
              >
                <option value="MTN">MTN Mobile Money</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AT">AT Money</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Momo Number *</label>
              <input
                type="tel"
                value={formData.momoNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, momoNumber: e.target.value.replace(/\D/g, '') }))}
                maxLength={10}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                placeholder="e.g. 0241234567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Profile Photo</label>
              <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-lg p-1 text-xs shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-1.5 cursor-pointer text-gray-400 hover:text-violet-700 transition-colors py-2">
                    <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                    <span className="text-xs font-bold tracking-wide">Upload Rider Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3">
              {editingId ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Update Rider Profile
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Register Fleet Rider
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Deliverers Table List */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Active Fleet Directory</h3>
        </div>
        
        {deliverers.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700">No riders registered</h3>
            <p className="text-xs text-gray-400 mt-0.5">Add your first delivery personnel above to populate the fleet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase text-[10px]">
                  <th className="p-4">Rider Profile</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Payment Details</th>
                  <th className="p-4">Vehicle Tag</th>
                  <th className="p-4">Access PIN</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliverers.map((deliverer) => {
                  return (
                    <tr key={deliverer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                            src={deliverer.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJDMTRuMjEgMCAyNC0xLjM0IDI0LTR2LTRIMFY4YzAgMi42NiA5Ljc5IDQgMTIgNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEyYzQuNDIgMCA4LTEuNzkgOC00cy0zLjU4LTQtOC00LTggMS43OS04IDQgMy41OCA0IDggNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo='}
                            alt={deliverer.name}
                          />
                          <div>
                            <div className="font-bold text-gray-900 tracking-tight">{deliverer.name}</div>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {deliverer.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {deliverer.phone}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-violet-700 text-[11px]">{deliverer.momoNetwork || 'N/A'}</span>
                          <span className="font-mono text-gray-600">{deliverer.momoNumber || 'No number'}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg text-gray-800 font-mono font-bold uppercase text-[11px]">
                          <Truck className="w-3.5 h-3.5 text-gray-500" />
                          {deliverer.vehicleNumber}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 text-gray-700 font-mono font-bold tracking-widest bg-red-50 text-red-700 px-2 py-1 rounded-lg border border-red-100">
                           <Lock className="w-3 h-3 text-red-500" /> {deliverer.pin || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(deliverer)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Rider"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(deliverer)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Rider"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelivererManager;