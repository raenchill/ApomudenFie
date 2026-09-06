// import React, { useState, useEffect } from 'react';
// import { db } from '../../firebase';
// import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { MapPin, ShieldCheck, Loader2, Trash2, CheckCircle, Clock, Mail, Phone, AlertTriangle, X, FileText, Send, Truck } from 'lucide-react';

// interface Pharmacy {
//   id: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   location: string;
//   region: string;
//   rating: number;
//   timing: string;
//   workingHours?: string;
//   riders: string;
//   image?: string;
//   isApproved?: boolean;
//   isRejected?: boolean;
//   rejectionReason?: string;
//   isStaticFallback?: boolean;
//   councilLicenseNumber?: string;
//   pharmacistInCharge?: string;
// }

// interface PharmacyManagerProps {
//   onPharmacyUpdated?: () => void;
// }

// const PharmacyManager: React.FC<PharmacyManagerProps> = ({ onPharmacyUpdated }) => {
//   const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [pharmacyToReject, setPharmacyToReject] = useState<Pharmacy | null>(null);
//   const [rejectionReason, setRejectionReason] = useState('');

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [pharmacyToDelete, setPharmacyToDelete] = useState<Pharmacy | null>(null);

//   const showToast = (text: string, type: 'success' | 'info' = 'success') => {
//     setToastMessage({ text, type });
//     setTimeout(() => setToastMessage(null), 4000);
//   };

//   // REAL-TIME LISTENER FOR INSTANT UPDATES
//   useEffect(() => {
//     setLoading(true);
//     const unsubscribe = onSnapshot(collection(db, 'pharmacies'), (snapshot) => {
//       const firestoreData = snapshot.docs.map(docSnapshot => ({
//         id: docSnapshot.id,
//         ...docSnapshot.data()
//       })) as Pharmacy[];
      
//       setPharmacies(firestoreData);
//       setLoading(false);
//       if (onPharmacyUpdated) onPharmacyUpdated();
//     }, (err) => {
//       console.error('Error listening to pharmacies:', err);
//       setError('Failed to load pharmacy submissions.');
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleToggleApproval = async (pharmacyId: string, currentStatus: boolean | undefined, isStatic?: boolean) => {
//     if (isStatic) {
//       showToast("System default fallback records cannot be modified.", "info");
//       return;
//     }

//     try {
//       const newStatus = !currentStatus;
//       const pharmacyDocRef = doc(db, 'pharmacies', pharmacyId);
//       await updateDoc(pharmacyDocRef, {
//         isApproved: newStatus,
//         isVerified: newStatus,
//         isRejected: false,
//         rejectionReason: ''
//       });
//       showToast(`Pharmacy status updated successfully.`);
//     } catch (err: any) {
//       showToast(`Could not update approval state. Details: ${err.message}`, "info");
//     }
//   };

//   const openRejectModal = (pharmacy: Pharmacy) => {
//     if (pharmacy.isStaticFallback) {
//       showToast("System default fallback records cannot be rejected.", "info");
//       return;
//     }
//     setPharmacyToReject(pharmacy);
//     setRejectionReason('');
//     setShowRejectModal(true);
//   };

//   const executeRejectPharmacy = async () => {
//     if (!pharmacyToReject || !rejectionReason.trim()) {
//       showToast("Please provide a specific reason for rejection.", "info");
//       return;
//     }

//     try {
//       const pharmacyDocRef = doc(db, 'pharmacies', pharmacyToReject.id);
//       await updateDoc(pharmacyDocRef, {
//         isApproved: false,
//         isRejected: true,
//         rejectionReason: rejectionReason.trim()
//       });
//       showToast(`Pharmacy registration marked as declined.`);
//     } catch (err: any) {
//       showToast(`Failed to update record: ${err.message}`, "info");
//     } finally {
//       setShowRejectModal(false);
//       setPharmacyToReject(null);
//     }
//   };

//   const confirmDeletePharmacy = (pharmacy: Pharmacy) => {
//     if (pharmacy.isStaticFallback) {
//       showToast("System default fallback records cannot be deleted.", "info");
//       return;
//     }
//     setPharmacyToDelete(pharmacy);
//     setShowDeleteConfirm(true);
//   };

//   const executeDeletePharmacy = async () => {
//     if (!pharmacyToDelete) return;
//     try {
//       await deleteDoc(doc(db, 'pharmacies', pharmacyToDelete.id));
//       showToast(`Pharmacy registration permanently deleted.`);
//     } catch (err: any) {
//       showToast(`Failed to delete: ${err.message}`, "info");
//     } finally {
//       setShowDeleteConfirm(false);
//       setPharmacyToDelete(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 gap-2">
//         <Loader2 className="animate-spin h-6 w-6 text-violet-600" />
//         <p className="text-xs font-semibold text-gray-400">Loading incoming vendor submissions...</p>
//       </div>
//     );
//   }

//   const activeRegisteredPharmacies = pharmacies.filter(p => !p.isStaticFallback && !p.isRejected);
//   const pendingPharmacies = pharmacies.filter(p => !p.isApproved && !p.isRejected && !p.isStaticFallback);
//   const approvedPharmacies = pharmacies.filter(p => p.isApproved || p.isStaticFallback);

//   return (
//     <div className="space-y-8 relative">
//       {toastMessage && (
//         <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800 animate-in fade-in">
//           <CheckCircle className="w-4 h-4 text-violet-400" />
//           <span>{toastMessage.text}</span>
//           <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
//           <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Joined Registrations</span>
//           <h3 className="text-2xl font-black text-gray-900 mt-1">{activeRegisteredPharmacies.length}</h3>
//         </div>
//         <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
//           <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Pending Approval Queue</span>
//           <h3 className="text-2xl font-black text-amber-700 mt-1">{pendingPharmacies.length}</h3>
//         </div>
//         <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
//           <span className="text-[10px] font-black uppercase text-violet-600 tracking-wider">Active Published Vendors</span>
//           <h3 className="text-2xl font-black text-violet-700 mt-1">{approvedPharmacies.length}</h3>
//         </div>
//       </div>

//       {error && <div className="bg-red-50 text-red-700 text-xs font-bold px-4 py-2.5 rounded-xl">{error}</div>}

//       {/* Pending Approval Section */}
//       <div className="space-y-3">
//         <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
//           <Clock className="w-4 h-4 text-amber-500" /> Pending Vendor Approvals
//         </h4>
        
//         {pendingPharmacies.length === 0 ? (
//           <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-xs font-medium">
//             No pending pharmacy registration applications right now.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {pendingPharmacies.map(pharm => (
//               <div key={pharm.id} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 bg-amber-50/25">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-center gap-3">
//                     <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200/60 overflow-hidden shrink-0">
//                       <img src={pharm.image || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop'} alt={pharm.name} className="w-full h-full object-cover" />
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <h5 className="font-bold text-gray-900 text-sm leading-tight">{pharm.name}</h5>
//                         <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">Pending Review</span>
//                       </div>
//                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">Region: {pharm.region || 'Accra'}</span>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1.5 shrink-0">
//                     <button onClick={() => handleToggleApproval(pharm.id, pharm.isApproved, pharm.isStaticFallback)} className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm cursor-pointer">
//                       <CheckCircle className="w-3.5 h-3.5" /> Approve
//                     </button>
//                     <button onClick={() => openRejectModal(pharm)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl cursor-pointer" title="Decline Registration">
//                       <X className="h-4 w-4" />
//                     </button>
//                     <button onClick={() => confirmDeletePharmacy(pharm)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl cursor-pointer" title="Permanently Delete">
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* DETAILED REGISTRATION CREDENTIALS DISPLAY */}
//                 <div className="space-y-2 border-t border-amber-100/60 pt-3 text-xs text-gray-600">
//                   <div className="flex items-center gap-2">
//                     <MapPin className="h-3.5 w-3.5 text-violet-600 shrink-0" />
//                     <span className="font-medium text-gray-800">Address: {pharm.location}</span>
//                   </div>
//                   {pharm.email && (
//                     <div className="flex items-center gap-2">
//                       <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
//                       <span className="text-gray-700">Email: {pharm.email}</span>
//                     </div>
//                   )}
//                   {pharm.phone && (
//                     <div className="flex items-center gap-2">
//                       <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
//                       <span className="font-mono text-gray-700">Phone: {pharm.phone}</span>
//                     </div>
//                   )}

//                   <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1.5 mt-2 shadow-sm">
//                     <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[11px]">
//                       <FileText className="w-3.5 h-3.5 text-amber-600" /> Regulatory Security Credentials & Details
//                     </div>
//                     <div className="flex items-center justify-between font-mono text-[11px]">
//                       <span className="text-gray-400 font-bold">Council License:</span>
//                       <span className="font-bold text-gray-800">{pharm.councilLicenseNumber || 'N/A'}</span>
//                     </div>
//                     <div className="flex items-center justify-between text-[11px]">
//                       <span className="text-gray-400 font-bold">Pharmacist In-Charge:</span>
//                       <span className="font-bold text-gray-800">{pharm.pharmacistInCharge || 'N/A'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border-t border-amber-100/60 pt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-600">
//                   <div className="bg-amber-100/40 border border-amber-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
//                     <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" /> 
//                     <span className="truncate">{pharm.timing || pharm.workingHours || '08:00 AM - 10:00 PM'}</span>
//                   </div>
//                   <div className="bg-amber-100/40 border border-amber-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
//                     <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" /> 
//                     <span className="truncate">{pharm.riders || '5 mins dispatch'}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Active Published Vendors Section */}
//       <div className="space-y-3 pt-4">
//         <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
//           <ShieldCheck className="w-4 h-4 text-violet-600" /> Active Published Pharmacies
//         </h4>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {approvedPharmacies.map(pharm => (
//             <div key={pharm.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
//               <div className="flex items-start justify-between gap-3">
//                 <div className="flex items-center gap-3">
//                   <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200/60 overflow-hidden shrink-0">
//                     <img src={pharm.image || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop'} alt={pharm.name} className="w-full h-full object-cover" />
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <h5 className="font-bold text-gray-900 text-sm leading-tight">{pharm.name}</h5>
//                       <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">Published</span>
//                     </div>
//                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">Region: {pharm.region || 'Accra'}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-1.5 shrink-0">
//                   <button onClick={() => handleToggleApproval(pharm.id, pharm.isApproved, pharm.isStaticFallback)} disabled={pharm.isStaticFallback} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-violet-50 border border-violet-200 text-violet-700 disabled:opacity-80">
//                     <ShieldCheck className="h-3.5 w-3.5" /> Approved
//                   </button>
//                   <button onClick={() => openRejectModal(pharm)} disabled={pharm.isStaticFallback} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl cursor-pointer disabled:opacity-50" title="Decline">
//                     <X className="h-4 w-4" />
//                   </button>
//                   {!pharm.isStaticFallback && (
//                     <button onClick={() => confirmDeletePharmacy(pharm)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl cursor-pointer" title="Delete">
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-2 border-t border-gray-50 pt-3 text-xs text-gray-600">
//                 <div className="flex items-center gap-2">
//                   <MapPin className="h-3.5 w-3.5 text-violet-600 shrink-0" />
//                   <span className="font-medium text-gray-800">Address: {pharm.location}</span>
//                 </div>
//                 {pharm.email && (
//                   <div className="flex items-center gap-2">
//                     <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
//                     <span className="text-gray-700">Email: {pharm.email}</span>
//                   </div>
//                 )}
//                 {pharm.phone && (
//                   <div className="flex items-center gap-2">
//                     <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
//                     <span className="font-mono text-gray-700">Phone: {pharm.phone}</span>
//                   </div>
//                 )}
//                 <div className="text-[11px] text-slate-500 font-mono">
//                   License: {pharm.councilLicenseNumber || 'N/A'} • Pharmacist: {pharm.pharmacistInCharge || 'N/A'}
//                 </div>
//               </div>

//               <div className="border-t border-gray-50 pt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-600">
//                 <div className="bg-gray-50 border border-gray-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
//                   <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
//                   <span className="truncate">{pharm.timing || pharm.workingHours || '08:00 AM - 10:00 PM'}</span>
//                 </div>
//                 <div className="bg-gray-50 border border-gray-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
//                   <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
//                   <span className="truncate">{pharm.riders || '5 mins dispatch'}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Rejection Modal */}
//       {showRejectModal && pharmacyToReject && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
//             <div className="p-6 text-center">
//               <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <AlertTriangle className="w-7 h-7" />
//               </div>
//               <h2 className="text-xl font-black text-gray-900 tracking-tight">Decline Registration</h2>
//               <p className="text-xs text-gray-500 mt-1 mb-4 font-medium">Provide a reason why <strong>{pharmacyToReject.name}</strong> was declined.</p>
//               <textarea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Invalid Pharmacy Council license number." className="w-full rounded-xl border border-gray-200 p-3 text-xs font-medium bg-gray-50" />
//             </div>
//             <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
//               <button onClick={() => setShowRejectModal(false)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer">Cancel</button>
//               <button onClick={executeRejectPharmacy} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs cursor-pointer"><Send className="w-3.5 h-3.5" /> Submit & Decline</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {showDeleteConfirm && pharmacyToDelete && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
//             <div className="p-6 text-center">
//               <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <AlertTriangle className="w-7 h-7" />
//               </div>
//               <h2 className="text-xl font-black text-gray-900 tracking-tight">Permanently Delete Pharmacy?</h2>
//               <p className="text-xs text-gray-500 mt-2 font-medium">Are you sure you want to completely erase <strong>{pharmacyToDelete.name}</strong>?</p>
//             </div>
//             <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
//               <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer">Cancel</button>
//               <button onClick={executeDeletePharmacy} className="px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs cursor-pointer">Delete Permanently</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PharmacyManager;

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { MapPin, ShieldCheck, Loader2, Trash2, CheckCircle, Clock, Mail, Phone, AlertTriangle, X, FileText, Send, Truck, Smartphone } from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location: string;
  region: string;
  rating: number;
  timing: string;
  workingHours?: string;
  riders: string;
  image?: string;
  isApproved?: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
  isStaticFallback?: boolean;
  councilLicenseNumber?: string;
  pharmacistInCharge?: string;
  // Momo details added
  momoNetwork?: string;
  momoNumber?: string;
  momoName?: string;
}

interface PharmacyManagerProps {
  onPharmacyUpdated?: () => void;
}

const PharmacyManager: React.FC<PharmacyManagerProps> = ({ onPharmacyUpdated }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pharmacyToReject, setPharmacyToReject] = useState<Pharmacy | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pharmacyToDelete, setPharmacyToDelete] = useState<Pharmacy | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // REAL-TIME LISTENER FOR INSTANT UPDATES
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'pharmacies'), (snapshot) => {
      const firestoreData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      })) as Pharmacy[];
      
      setPharmacies(firestoreData);
      setLoading(false);
      if (onPharmacyUpdated) onPharmacyUpdated();
    }, (err) => {
      console.error('Error listening to pharmacies:', err);
      setError('Failed to load pharmacy submissions.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleApproval = async (pharmacyId: string, currentStatus: boolean | undefined, isStatic?: boolean) => {
    if (isStatic) {
      showToast("System default fallback records cannot be modified.", "info");
      return;
    }

    try {
      const newStatus = !currentStatus;
      const pharmacyDocRef = doc(db, 'pharmacies', pharmacyId);
      await updateDoc(pharmacyDocRef, {
        isApproved: newStatus,
        isVerified: newStatus,
        isRejected: false,
        rejectionReason: ''
      });
      showToast(`Pharmacy status updated successfully.`);
    } catch (err: any) {
      showToast(`Could not update approval state. Details: ${err.message}`, "info");
    }
  };

  const openRejectModal = (pharmacy: Pharmacy) => {
    if (pharmacy.isStaticFallback) {
      showToast("System default fallback records cannot be rejected.", "info");
      return;
    }
    setPharmacyToReject(pharmacy);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const executeRejectPharmacy = async () => {
    if (!pharmacyToReject || !rejectionReason.trim()) {
      showToast("Please provide a specific reason for rejection.", "info");
      return;
    }

    try {
      const pharmacyDocRef = doc(db, 'pharmacies', pharmacyToReject.id);
      await updateDoc(pharmacyDocRef, {
        isApproved: false,
        isRejected: true,
        rejectionReason: rejectionReason.trim()
      });
      showToast(`Pharmacy registration marked as declined.`);
    } catch (err: any) {
      showToast(`Failed to update record: ${err.message}`, "info");
    } finally {
      setShowRejectModal(false);
      setPharmacyToReject(null);
    }
  };

  const confirmDeletePharmacy = (pharmacy: Pharmacy) => {
    if (pharmacy.isStaticFallback) {
      showToast("System default fallback records cannot be deleted.", "info");
      return;
    }
    setPharmacyToDelete(pharmacy);
    setShowDeleteConfirm(true);
  };

  const executeDeletePharmacy = async () => {
    if (!pharmacyToDelete) return;
    try {
      await deleteDoc(doc(db, 'pharmacies', pharmacyToDelete.id));
      showToast(`Pharmacy registration permanently deleted.`);
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`, "info");
    } finally {
      setShowDeleteConfirm(false);
      setPharmacyToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="animate-spin h-6 w-6 text-violet-600" />
        <p className="text-xs font-semibold text-gray-400">Loading incoming vendor submissions...</p>
      </div>
    );
  }

  const activeRegisteredPharmacies = pharmacies.filter(p => !p.isStaticFallback && !p.isRejected);
  const pendingPharmacies = pharmacies.filter(p => !p.isApproved && !p.isRejected && !p.isStaticFallback);
  const approvedPharmacies = pharmacies.filter(p => p.isApproved || p.isStaticFallback);

  return (
    <div className="space-y-8 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-violet-400" />
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Joined Registrations</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{activeRegisteredPharmacies.length}</h3>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Pending Approval Queue</span>
          <h3 className="text-2xl font-black text-amber-700 mt-1">{pendingPharmacies.length}</h3>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase text-violet-600 tracking-wider">Active Published Vendors</span>
          <h3 className="text-2xl font-black text-violet-700 mt-1">{approvedPharmacies.length}</h3>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-xs font-bold px-4 py-2.5 rounded-xl">{error}</div>}

      {/* Pending Approval Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" /> Pending Vendor Approvals
        </h4>
        
        {pendingPharmacies.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-xs font-medium">
            No pending pharmacy registration applications right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPharmacies.map(pharm => (
              <div key={pharm.id} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 bg-amber-50/25">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200/60 overflow-hidden shrink-0">
                      <img src={pharm.image || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop'} alt={pharm.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-gray-900 text-sm leading-tight">{pharm.name}</h5>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">Pending Review</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">Region: {pharm.region || 'Accra'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleToggleApproval(pharm.id, pharm.isApproved, pharm.isStaticFallback)} className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => openRejectModal(pharm)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl cursor-pointer" title="Decline Registration">
                      <X className="h-4 w-4" />
                    </button>
                    <button onClick={() => confirmDeletePharmacy(pharm)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl cursor-pointer" title="Permanently Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* DETAILED REGISTRATION CREDENTIALS DISPLAY */}
                <div className="space-y-2 border-t border-amber-100/60 pt-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                    <span className="font-medium text-gray-800">Address: {pharm.location}</span>
                  </div>
                  {pharm.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-700">Email: {pharm.email}</span>
                    </div>
                  )}
                  {pharm.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="font-mono text-gray-700">Phone: {pharm.phone}</span>
                    </div>
                  )}

                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1.5 mt-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-amber-600" /> Regulatory Security & Payments
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-gray-400 font-bold">Council License:</span>
                      <span className="font-bold text-gray-800">{pharm.councilLicenseNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-bold">Pharmacist In-Charge:</span>
                      <span className="font-bold text-gray-800">{pharm.pharmacistInCharge || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 mt-1 border-t border-dashed border-amber-100">
                      <span className="text-gray-400 font-bold">Momo Name:</span>
                      <span className="font-bold text-gray-800">{pharm.momoName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-bold">Momo Number:</span>
                      <span className="font-bold text-blue-700">{pharm.momoNetwork || 'MTN'} - {pharm.momoNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-amber-100/60 pt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-600">
                  <div className="bg-amber-100/40 border border-amber-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" /> 
                    <span className="truncate">{pharm.timing || pharm.workingHours || '08:00 AM - 10:00 PM'}</span>
                  </div>
                  <div className="bg-amber-100/40 border border-amber-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
                    <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" /> 
                    <span className="truncate">{pharm.riders || '5 mins dispatch'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Published Vendors Section */}
      <div className="space-y-3 pt-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-600" /> Active Published Pharmacies
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedPharmacies.map(pharm => (
            <div key={pharm.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200/60 overflow-hidden shrink-0">
                    <img src={pharm.image || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop'} alt={pharm.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-gray-900 text-sm leading-tight">{pharm.name}</h5>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">Published</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">Region: {pharm.region || 'Accra'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleToggleApproval(pharm.id, pharm.isApproved, pharm.isStaticFallback)} disabled={pharm.isStaticFallback} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-violet-50 border border-violet-200 text-violet-700 disabled:opacity-80">
                    <ShieldCheck className="h-3.5 w-3.5" /> Approved
                  </button>
                  {/* REMOVED DECLINE 'X' BUTTON FROM APPROVED SECTION */}
                  {!pharm.isStaticFallback && (
                    <button onClick={() => confirmDeletePharmacy(pharm)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl cursor-pointer" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <span className="font-medium text-gray-800">Address: {pharm.location}</span>
                </div>
                {pharm.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-gray-700">Email: {pharm.email}</span>
                  </div>
                )}
                {pharm.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-mono text-gray-700">Phone: {pharm.phone}</span>
                  </div>
                )}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1 mt-2">
                  <div className="text-[11px] text-slate-500 font-mono">
                    License: {pharm.councilLicenseNumber || 'N/A'} • Pharmacist: {pharm.pharmacistInCharge || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-bold border-t border-gray-200 pt-1 mt-1">
                    <Smartphone className="w-3.5 h-3.5" /> 
                    Momo: {pharm.momoNetwork || 'MTN'} - {pharm.momoNumber || 'N/A'} ({pharm.momoName || 'N/A'})
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-600">
                <div className="bg-gray-50 border border-gray-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                  <span className="truncate">{pharm.timing || pharm.workingHours || '08:00 AM - 10:00 PM'}</span>
                </div>
                <div className="bg-gray-50 border border-gray-200/60 px-2.5 py-2 rounded-xl flex items-center gap-1.5 overflow-hidden">
                  <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                  <span className="truncate">{pharm.riders || '5 mins dispatch'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && pharmacyToReject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Decline Registration</h2>
              <p className="text-xs text-gray-500 mt-1 mb-4 font-medium">Provide a reason why <strong>{pharmacyToReject.name}</strong> was declined.</p>
              <textarea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Invalid Pharmacy Council license number." className="w-full rounded-xl border border-gray-200 p-3 text-xs font-medium bg-gray-50" />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setShowRejectModal(false)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer">Cancel</button>
              <button onClick={executeRejectPharmacy} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs cursor-pointer"><Send className="w-3.5 h-3.5" /> Submit & Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && pharmacyToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Permanently Delete Pharmacy?</h2>
              <p className="text-xs text-gray-500 mt-2 font-medium">Are you sure you want to completely erase <strong>{pharmacyToDelete.name}</strong>?</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer">Cancel</button>
              <button onClick={executeDeletePharmacy} className="px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs cursor-pointer">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyManager;