// import React, { useState, useEffect } from 'react';
// import { db } from '../../firebase';
// import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { ShoppingBag, MapPin, Building2, Trash2, Edit3, Calendar, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

// interface OrderItem {
//   medicine: {
//     name: string;
//     price: number;
//   };
//   quantity: number;
// }

// interface Order {
//   id: string;
//   pharmacyName?: string; // Target pharmacy requested field
//   receiverName?: string;
//   receiverPhone?: string;
//   deliveryAddress?: string;
//   cartItems?: OrderItem[];
//   totalPrice?: number;
//   status: 'pending' | 'processing' | 'delivered' | string;
//   createdAt?: any;
// }

// const OrderManager: React.FC = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [updatingId, setUpdatingId] = useState<string | null>(null);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const querySnapshot = await getDocs(collection(db, 'orders'));
//       const ordersData = querySnapshot.docs.map(doc => {
//         const data = doc.data();
        
//         // Custom logic fallback: if the dataset lacks a pharmacyName reference, automatically assign one of your standard storefront branches
//         const fallbackPharmacies = ['PlusLab Pharmacy', 'Top Up Pharmacy', 'Link Pharmacy', 'Panacea Pharmacy'];
//         const assignedPharmacy = data.pharmacyName || fallbackPharmacies[Math.floor(Math.random() * fallbackPharmacies.length)];

//         return {
//           id: doc.id,
//           ...data,
//           pharmacyName: assignedPharmacy
//         };
//       }) as Order[];

//       setOrders(ordersData);
//     } catch (error) {
//       console.error('Error fetching system logs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
//     const nextStatusMap: { [key: string]: string } = {
//       'pending': 'processing',
//       'processing': 'delivered',
//       'delivered': 'pending'
//     };
    
//     const nextStatus = nextStatusMap[currentStatus] || 'pending';
//     setUpdatingId(orderId);

//     try {
//       await updateDoc(doc(db, 'orders', orderId), {
//         status: nextStatus
//       });
//       await fetchOrders();
//     } catch (error) {
//       console.error('Failed to cycle status code:', error);
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const handleDeleteOrder = async (orderId: string) => {
//     if (!confirm('Are you absolutely certain you want to purge this order transaction listing permanently?')) return;
//     try {
//       await deleteDoc(doc(db, 'orders', orderId));
//       await fetchOrders();
//     } catch (error) {
//       console.error('Failed to wipe order record:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16 gap-3">
//         <Loader2 className="animate-spin h-7 w-7 text-violet-700" />
//         <p className="text-sm font-semibold text-gray-500">Retrieving system logistical manifest registers...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Top Title Bar Section */}
//       <div className="border-b border-gray-100 pb-5">
//         <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order Logistical Manifests</h2>
//         <p className="text-sm font-medium text-gray-500 mt-0.5">Track, update, and manage inbound global fulfillment distributions.</p>
//       </div>

//       {orders.length === 0 ? (
//         <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
//           <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//           <h3 className="text-base font-bold text-gray-800 mb-1">No execution manifests found</h3>
//           <p className="text-xs text-gray-500">Inbound customer purchase orders will register here in real time.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//           {orders.map((order) => (
//             <div 
//               key={order.id} 
//               className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between gap-4"
//             >
//               <div>
//                 {/* Header Info Block */}
//                 <div className="flex items-start justify-between gap-3 border-b border-gray-50 pb-3">
//                   <div className="space-y-1">
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs font-bold text-gray-400 font-mono">#{order.id.slice(0, 12)}...</span>
                      
//                       {/* Status Badging Configurations */}
//                       <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
//                         order.status === 'delivered' ? 'bg-violet-50 text-violet-700 border border-violet-100' :
//                         order.status === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
//                         'bg-amber-50 text-amber-700 border border-amber-100'
//                       }`}>
//                         {order.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
//                         {order.status === 'processing' && <Clock className="w-3 h-3" />}
//                         {order.status === 'pending' && <AlertCircle className="w-3 h-3" />}
//                         {order.status}
//                       </span>
//                     </div>

//                     {/* Pharmacy Source Labeling */}
//                     <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold mt-1">
//                       <Building2 className="w-3.5 h-3.5 text-violet-700 shrink-0" />
//                       <span>{order.pharmacyName}</span>
//                     </div>
//                   </div>

//                   {/* Operational Action Controls */}
//                   <div className="flex items-center gap-1 shrink-0">
//                     <button
//                       type="button"
//                       disabled={updatingId === order.id}
//                       onClick={() => handleUpdateStatus(order.id, order.status)}
//                       className="p-2 text-gray-500 hover:text-violet-700 hover:bg-violet-50 rounded-xl border border-transparent hover:border-violet-100 transition-all text-xs font-bold flex items-center gap-1"
//                       title="Cycle fulfillment status phase"
//                     >
//                       {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
//                       <span>Cycle Phase</span>
//                     </button>
                    
//                     <button
//                       type="button"
//                       onClick={() => handleDeleteOrder(order.id)}
//                       className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
//                       title="Purge transaction record"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Logistics & Delivery Details */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs font-medium border-b border-gray-50">
//                   <div className="space-y-1">
//                     <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consignee Identity</span>
//                     <p className="text-gray-900 font-bold">{order.receiverName || 'System Client'}</p>
//                     <p className="text-gray-500 font-mono text-[11px]">{order.receiverPhone || 'No linked phone'}</p>
//                   </div>
                  
//                   <div className="space-y-1">
//                     <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Routing Destination</span>
//                     <p className="text-gray-700 flex items-start gap-1">
//                       <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
//                       <span className="line-clamp-2">{order.deliveryAddress || 'On-Site Counter Collection'}</span>
//                     </p>
//                   </div>
//                 </div>

//                 {/* Itemized Cart Breakdowns */}
//                 <div className="pt-3">
//                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Itemized Breakdown</span>
//                   <div className="bg-gray-50/70 border border-gray-200/50 rounded-xl p-3 max-h-[120px] overflow-y-auto space-y-1.5">
//                     {order.cartItems && order.cartItems.length > 0 ? (
//                       order.cartItems.map((item, index) => (
//                         <div key={index} className="flex justify-between items-center text-xs font-medium text-gray-700">
//                           <span className="line-clamp-1">{item.medicine?.name || 'Medical Asset Item'}</span>
//                           <span className="text-gray-400 font-mono shrink-0 bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">
//                             x{item.quantity}
//                           </span>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-[11px] text-gray-400 italic">Prescription image attachment upload route sequence</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Lower Cost Evaluation Bar */}
//               <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
//                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//                   <Calendar className="w-3.5 h-3.5" /> Logged System Entry
//                 </div>
                
//                 <div className="text-right">
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gross Valuation</span>
//                   <span className="text-lg font-black text-violet-700 font-mono">
//                     ₵{(order.totalPrice || 0).toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderManager;

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, doc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { ShoppingBag, MapPin, Building2, Trash2, Calendar, CheckCircle2, Clock, AlertCircle, Loader2, CheckSquare, Square, X, AlertTriangle, User, Truck, Phone } from 'lucide-react';

interface OrderItem {
  medicine: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: string;
  pharmacyName?: string;
  receiverName?: string;
  receiverPhone?: string;
  deliveryAddress?: string;
  cartItems?: OrderItem[];
  totalPrice?: number;
  status: 'pending' | 'processing' | 'delivered' | string;
  createdAt?: any;
  riderInfo?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    id?: string;
    image?: string;
  };
}

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for Bulk Selection & Notifications
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Custom Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to format the Firebase Timestamp into a readable date string
  const formatOrderDate = (timestamp: any) => {
    if (!timestamp) return 'No Date Recorded';
    try {
      const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return dateObj.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // REAL-TIME LISTENER
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fallbackPharmacies = ['PlusLab Pharmacy', 'Top Up Pharmacy', 'Link Pharmacy', 'Panacea Pharmacy'];
        const assignedPharmacy = data.pharmacyName || fallbackPharmacies[Math.floor(Math.random() * fallbackPharmacies.length)];

        return {
          id: doc.id,
          ...data,
          pharmacyName: assignedPharmacy
        };
      }) as Order[];

      // Filter out cancelled or aborted orders so they don't clutter the admin panel
      const activeOrders = ordersData.filter(order => {
        const currentStatus = (order.status || '').toLowerCase();
        return !['cancelled', 'aborted', 'failed'].includes(currentStatus);
      });

      // Sort orders by newest first
      activeOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });

      setOrders(activeOrders);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching real-time logs:', error);
      showToast('Failed to sync live orders.', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // DELETE EXECUTION
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        // Single Delete
        await deleteDoc(doc(db, 'orders', deleteConfirm.id));
        showToast('Order successfully deleted.');
        setSelectedOrders(prev => prev.filter(id => id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'bulk') {
        // Bulk Delete
        const batch = writeBatch(db);
        selectedOrders.forEach(orderId => {
          const orderRef = doc(db, 'orders', orderId);
          batch.delete(orderRef);
        });
        await batch.commit();
        showToast(`Successfully deleted ${selectedOrders.length} orders.`);
        setSelectedOrders([]);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete order(s).', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // BULK ACTIONS LOGIC
  const toggleSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="animate-spin h-7 w-7 text-violet-700" />
        <p className="text-sm font-semibold text-gray-500">Retrieving system logistical manifest registers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      
      {/* Dynamic Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-4 ${notification.type === 'error' ? 'bg-red-900 text-white border-red-800' : 'bg-slate-900 text-white border-slate-800'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-violet-400" />}
          <span className="text-sm font-medium">{notification.text}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Custom Custom Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {deleteConfirm.type === 'bulk' ? 'Delete Selected Orders?' : 'Delete Order Record?'}
              </h2>
              <p className="text-xs text-gray-500 mt-2 font-medium px-4">
                {deleteConfirm.type === 'bulk' 
                  ? `Are you sure you want to permanently purge ${selectedOrders.length} selected transaction records? This action cannot be reversed.` 
                  : 'Are you sure you want to permanently purge this transaction listing? This action cannot be reversed.'}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setDeleteConfirm(null)} 
                disabled={isDeleting}
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                Cancel Action
              </button>
              <button 
                type="button" 
                onClick={executeDelete} 
                disabled={isDeleting}
                className="px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Title Bar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order Logistical Manifests</h2>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Track, update, and manage inbound global fulfillment distributions.</p>
        </div>

        {/* Bulk Action Controls */}
        {orders.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
            >
              {selectedOrders.length === orders.length ? <CheckSquare className="w-4 h-4 text-violet-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              {selectedOrders.length === orders.length ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedOrders.length > 0 && (
              <button
                onClick={() => setDeleteConfirm({ type: 'bulk' })}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedOrders.length})
              </button>
            )}
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 mb-1">No execution manifests found</h3>
          <p className="text-xs text-gray-500">Inbound customer purchase orders will register here in real time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {orders.map((order) => {
            const isSelected = selectedOrders.includes(order.id);
            return (
              <div 
                key={order.id} 
                className={`bg-white border rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden ${isSelected ? 'border-violet-500 ring-1 ring-violet-500' : 'border-gray-100'}`}
              >
                {/* Selection Checkbox overlay */}
                <div 
                  className={`absolute top-0 left-0 bottom-0 w-12 flex justify-center pt-6 cursor-pointer transition-colors z-10 ${isSelected ? 'bg-violet-50' : 'hover:bg-slate-50'}`}
                  onClick={() => toggleSelection(order.id)}
                >
                  {isSelected ? <CheckSquare className="w-5 h-5 text-violet-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                </div>

                <div className="pl-14 p-5 w-full flex flex-col h-full">
                  {/* Header Info Block */}
                  <div className="flex items-start justify-between gap-3 border-b border-gray-50 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 font-mono">#{order.id.slice(0, 12)}...</span>
                        
                        {/* Status Badging Configurations */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ['delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                          order.status === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          order.status === 'searching_riders' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          order.status === 'rider_assigned' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {['delivered', 'completed'].includes(order.status?.toLowerCase()) && <CheckCircle2 className="w-3 h-3" />}
                          {['processing', 'searching_riders', 'rider_assigned'].includes(order.status?.toLowerCase()) && <Clock className="w-3 h-3 animate-pulse" />}
                          {['pending', 'arrived'].includes(order.status?.toLowerCase()) && <AlertCircle className="w-3 h-3" />}
                          {order.status ? order.status.replace('_', ' ') : 'UNKNOWN'}
                        </span>
                      </div>

                      {/* Pharmacy Source Labeling */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold mt-1">
                        <Building2 className="w-3.5 h-3.5 text-violet-700 shrink-0" />
                        <span>{order.pharmacyName}</span>
                      </div>
                    </div>

                    {/* Trash Button Only */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ type: 'single', id: order.id })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                        title="Purge transaction record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Logistics & Delivery Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs font-medium border-b border-gray-50 flex-1">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consignee Identity</span>
                      <p className="text-gray-900 font-bold">{order.receiverName || 'System Client'}</p>
                      <p className="text-gray-500 font-mono text-[11px]">{order.receiverPhone || 'No linked phone'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Routing Destination</span>
                      <p className="text-gray-700 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.deliveryAddress || 'On-Site Counter Collection'}</span>
                      </p>
                    </div>
                  </div>

                  {/* RIDER INFO DISPLAY BLOCK */}
                  {order.riderInfo && (
                    <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          {order.riderInfo.image ? (
                            <img src={order.riderInfo.image} className="w-full h-full object-cover rounded-full" alt="Rider" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="block text-[9px] font-black text-indigo-600 uppercase tracking-wider leading-none mb-1">Assigned Logistics Rider</span>
                          <span className="text-xs font-bold text-gray-900 leading-none block">{order.riderInfo.name}</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-mono text-gray-500 space-y-0.5">
                        <div className="flex items-center gap-1 justify-end"><Phone className="w-3 h-3 text-gray-400" /> {order.riderInfo.phone}</div>
                        <div className="flex items-center gap-1 justify-end"><Truck className="w-3 h-3 text-gray-400" /> {order.riderInfo.vehicleNumber}</div>
                      </div>
                    </div>
                  )}

                  {/* Lower Cost Evaluation & Date Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                        <Calendar className="w-3.5 h-3.5" /> Ordered On
                      </span>
                      <span className="text-[11px] font-bold text-gray-600 font-mono">
                        {formatOrderDate(order.createdAt)}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Gross Valuation</span>
                      <span className="text-lg font-black text-violet-700 font-mono leading-none">
                        ₵{(order.totalPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderManager;