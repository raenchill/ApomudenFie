
// import React, { useState, useEffect } from 'react';
// import { 
//   Users, 
//   ShoppingCart, 
//   Truck,
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   MapPin,
//   Trash2,
//   AlertTriangle,
//   LogOut,
//   Building2,
//   RefreshCw,
//   LayoutDashboard,
//   CheckCircle2,
//   X,
//   Package
// } from 'lucide-react';
// import PharmacyManager from './PharmacyManager';
// import DrugManager from './DrugManager';
// import OrderManager from './OrderManager';
// import DelivererManager from './DelivererManager';
// import { db } from '../../firebase';
// import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { clearSampleData } from '../../utils/clearSampleData';
// import { fixUserStatus } from '../../utils/fixUserStatus';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   address?: string;
//   createdAt?: any;
//   lastLogin?: any;
//   lastLogout?: any;
//   isActive?: boolean;
//   isDeleted?: boolean;
//   deletedAt?: any;
//   deletedBy?: string;
// }

// const AdminDashboard: React.FC = () => {
//   const [tab, setTab] = useState<'pharmacies' | 'drugs' | 'orders' | 'deliverers' | 'users'>('pharmacies');
//   const [stats, setStats] = useState({
//     pharmacies: 0,
//     orders: 0,
//     deliverers: 0,
//     users: 0,
//     pendingPharmacies: 0,
//     pendingDrugs: 0
//   });

//   // REAL-TIME LISTENERS FOR DASHBOARD COUNTS & NOTIFICATION PULSE DOTS
//   useEffect(() => {
//     const unsubPharmacies = onSnapshot(collection(db, 'pharmacies'), (snap) => {
//       const realPharmacies = snap.docs.filter(d => {
//         const data = d.data();
//         return !data.isStaticFallback && !data.isRejected;
//       });
//       const pendingCount = snap.docs.filter(d => {
//         const data = d.data();
//         return !data.isApproved && !data.isRejected && !data.isStaticFallback;
//       }).length;

//       setStats(prev => ({
//         ...prev,
//         pharmacies: realPharmacies.length,
//         pendingPharmacies: pendingCount
//       }));
//     });

//     const unsubMedicines = onSnapshot(collection(db, 'medicines'), (snap) => {
//       const pendingDrugsCount = snap.docs.filter(d => {
//         const data = d.data();
//         return !data.isApproved && !data.isRejected;
//       }).length;

//       setStats(prev => ({
//         ...prev,
//         pendingDrugs: pendingDrugsCount
//       }));
//     });

//     const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
//       setStats(prev => ({ ...prev, orders: snap.size }));
//     });

//     const unsubDeliverers = onSnapshot(collection(db, 'deliverers'), (snap) => {
//       setStats(prev => ({ ...prev, deliverers: snap.size }));
//     });

//     const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
//       setStats(prev => ({ ...prev, users: snap.size }));
//     });

//     return () => {
//       unsubPharmacies();
//       unsubMedicines();
//       unsubOrders();
//       unsubDeliverers();
//       unsubUsers();
//     };
//   }, []);

//   const tabs = [
//     { key: 'pharmacies', label: 'Pharmacies', icon: <Building2 className="w-4 h-4" />, hasPending: stats.pendingPharmacies > 0 },
//     { key: 'drugs', label: 'Drug Approvals', icon: <Package className="w-4 h-4" />, hasPending: stats.pendingDrugs > 0 },
//     { key: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
//     { key: 'deliverers', label: 'Riders', icon: <Truck className="w-4 h-4" /> },
//     { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
//   ];

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased p-4 md:p-8">
      
//       {/* Top Professional Header Banner */}
//       <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-8 shadow-sm border border-gray-100 bg-white">
//         <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-violet-950 p-6 md:p-8 text-white">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <div className="flex items-center gap-2">
//                 <LayoutDashboard className="h-6 w-6 text-violet-400" />
//                 <h1 className="text-3xl font-extrabold tracking-tight">Admin Management Platform</h1>
//               </div>
//               <p className="text-slate-300 font-medium text-sm mt-1 leading-relaxed">
//                 Super-administrative controls for platform vendor storefront onboarding, logistics logs, and client registries.
//               </p>
//             </div>
            
//             <div className="flex items-center gap-2 text-xs font-bold text-violet-300 bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl shadow-inner select-none self-start md:self-auto backdrop-blur-md">
//               <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-400" /> Real-time Live Sync Active
//             </div>
//           </div>

//           {/* Clean Rounded Pill Tabs Navigation Bar with Notification Pulse Dots */}
//           <div className="mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-5">
//             {tabs.map((tabItem) => (
//               <button
//                 key={tabItem.key}
//                 onClick={() => setTab(tabItem.key as any)}
//                 className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer relative ${
//                   tab === tabItem.key
//                     ? 'bg-violet-600 text-white shadow-lg transform scale-[1.02]'
//                     : 'bg-white/10 text-white hover:bg-white/20'
//                 }`}
//               >
//                 {tabItem.icon}
//                 <span>{tabItem.label}</span>
//                 {tabItem.hasPending && (
//                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Statistics Cluster Cards Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
//             <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
//               <Building2 className="w-6 h-6" />
//             </div>
//             <div>
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pharmacies</p>
//               <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.pharmacies}</p>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
//             <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
//               <ShoppingCart className="w-6 h-6" />
//             </div>
//             <div>
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orders Logged</p>
//               <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.orders}</p>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
//             <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
//               <Truck className="w-6 h-6" />
//             </div>
//             <div>
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Riders</p>
//               <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.deliverers}</p>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
//             <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
//               <Users className="w-6 h-6" />
//             </div>
//             <div>
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Users</p>
//               <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.users}</p>
//             </div>
//           </div>
//         </div>

//         {/* Component Display Grid Shell */}
//         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[450px]">
//           {tab === 'pharmacies' && <PharmacyManager />}
//           {tab === 'drugs' && <DrugManager />}
//           {tab === 'orders' && <OrderManager />}
//           {tab === 'deliverers' && <DelivererManager />}
//           {tab === 'users' && <UserManager />}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ==========================================================================
//    User Management Sub-Component Block
//    ========================================================================== */
// const UserManager: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [userToDelete, setUserToDelete] = useState<User | null>(null);

//   const showToast = (text: string, type: 'success' | 'info' = 'success') => {
//     setToastMessage({ text, type });
//     setTimeout(() => setToastMessage(null), 4000);
//   };

//   // REAL-TIME LISTENER FOR USERS
//   useEffect(() => {
//     setLoading(true);
//     const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
//       const usersData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as User[];
      
//       usersData.sort((a, b) => {
//         const dateA = a.createdAt?.toDate?.() || new Date(0);
//         const dateB = b.createdAt?.toDate?.() || new Date(0);
//         return dateB.getTime() - dateA.getTime();
//       });
      
//       setUsers(usersData);
//       setLoading(false);
//     }, (error) => {
//       console.error('Error fetching users:', error);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleClearSampleData = async () => {
//     try {
//       const success = await clearSampleData();
//       if (success) showToast('Sample database entities purged successfully.');
//       else showToast('Purging operations sequence dropped by server.', 'info');
//     } catch (error) {
//       console.error('Error clearing sample data:', error);
//     }
//   };

//   const handleFixUserStatus = async () => {
//     try {
//       const result = await fixUserStatus();
//       if (result.success) showToast(result.message);
//       else showToast('Identity state optimization sync aborted by database.', 'info');
//     } catch (error) {
//       console.error('Error fixing user status:', error);
//     }
//   };

//   const confirmDelete = (user: User) => {
//     setUserToDelete(user);
//     setShowDeleteConfirm(true);
//   };

//   const executeDelete = async () => {
//     if (!userToDelete) return;
//     try {
//       await updateDoc(doc(db, 'users', userToDelete.id), {
//         isDeleted: true,
//         deletedAt: serverTimestamp(),
//         deletedBy: 'admin'
//       });
//       showToast(`User listing "${userToDelete.name}" flagged inactive.`);
//     } catch (error) {
//       console.error('Error deleting user:', error);
//     } finally {
//       setShowDeleteConfirm(false);
//       setUserToDelete(null);
//     }
//   };

//   const cancelDelete = () => {
//     setShowDeleteConfirm(false);
//     setUserToDelete(null);
//   };

//   const formatDate = (date: any) => {
//     if (!date) return 'N/A';
//     try {
//       const dateObj = date.toDate ? date.toDate() : new Date(date);
//       const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//       const formattedDate = dateObj.toLocaleString('en-US', {
//         year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: userTimezone
//       });
//       const timezoneMap: { [key: string]: string } = {
//         'America/New_York': 'EST/EDT', 'America/Chicago': 'CST/CDT', 'America/Denver': 'MST/MDT', 'America/Los_Angeles': 'PST/PDT',
//         'Europe/London': 'GMT/BST', 'Europe/Paris': 'CET/CEST', 'Africa/Lagos': 'WAT', 'Africa/Accra': 'GMT', 'Asia/Kolkata': 'IST'
//       };
//       const timezoneAbbr = timezoneMap[userTimezone] || userTimezone.split('/').pop()?.replace('_', ' ') || userTimezone;
//       return `${formattedDate} (${timezoneAbbr})`;
//     } catch (error) {
//       return 'Invalid Date';
//     }
//   };

//   const activeUsers = users.filter(user => !user.isDeleted);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16 gap-3">
//         <RefreshCw className="animate-spin h-7 w-7 text-violet-600" />
//         <p className="text-sm font-semibold text-gray-500">Retrieving secure customer indexes...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 relative">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Client Account Registry</h2>
//           <p className="text-sm font-medium text-gray-500 mt-0.5">Total live active shoppers registered: {activeUsers.length}</p>
//         </div>
        
//         <div className="flex items-center gap-3 self-end sm:self-auto">
//           {users.some(user => user.id.startsWith('sample-user-')) && (
//             <button type="button" onClick={handleClearSampleData} className="inline-flex items-center px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase border border-red-100 rounded-xl transition-colors cursor-pointer">
//               <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Purge Mock Assets
//             </button>
//           )}
//           <button type="button" onClick={handleFixUserStatus} className="inline-flex items-center px-4 py-2.5 bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold text-xs uppercase border border-violet-100 rounded-xl transition-colors cursor-pointer">
//             <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Synchronize Status
//           </button>
//         </div>
//       </div>

//       {toastMessage && (
//         <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-medium text-xs px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800 animate-in fade-in">
//           <CheckCircle2 className="w-4 h-4 text-violet-400" />
//           <span>{toastMessage.text}</span>
//           <button type="button" onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
//         </div>
//       )}

//       {activeUsers.length === 0 ? (
//         <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
//           <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//           <h3 className="text-base font-bold text-gray-800 mb-1">No customer index records found</h3>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {activeUsers.map((user) => (
//             <div key={user.id} className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between hover:shadow-md transition-shadow ${user.id.startsWith('sample-user-') ? 'border-red-200 bg-red-50/40' : 'border-gray-100'}`}>
//               <div>
//                 <div className="flex items-start justify-between gap-2 mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-700 border border-violet-100"><User className="w-5 h-5" /></div>
//                     <div>
//                       <h3 className="font-bold text-gray-900 tracking-tight leading-none line-clamp-1">{user.name}</h3>
//                       <span className="text-[10px] text-gray-400 font-bold tracking-wide mt-1 block">ID: {user.id}</span>
//                     </div>
//                   </div>
//                   <button type="button" onClick={() => confirmDelete(user)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
//                 </div>

//                 <div className="space-y-2.5 border-t border-gray-50 pt-3 text-xs text-gray-600 font-medium">
//                   <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400 shrink-0" /><span className="truncate text-gray-700">{user.email}</span></div>
//                   {user.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-700">{user.phone}</span></div>}
//                   {user.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span className="truncate text-gray-700">{user.address}</span></div>}
//                   <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-500">Registered: <span className="text-gray-700">{formatDate(user.createdAt)}</span></span></div>
//                 </div>
//               </div>

//               <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between">
//                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${user.isActive ? 'bg-violet-50 text-violet-700 border border-violet-100' : 'bg-gray-100 text-gray-500'}`}>
//                   <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-violet-600 animate-pulse' : 'bg-gray-400'}`}></span>
//                   {user.isActive ? 'Online' : 'Offline'}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {showDeleteConfirm && userToDelete && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
//             <div className="p-6 text-center">
//               <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7" /></div>
//               <h2 className="text-xl font-black text-gray-900 tracking-tight">Deactivate Customer Access?</h2>
//               <p className="text-xs text-gray-500 mt-2 font-medium">Confirming will immediately flag <strong>{userToDelete.name}</strong> as an inactive registry member.</p>
//             </div>
//             <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
//               <button type="button" onClick={cancelDelete} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer">Abort Action</button>
//               <button type="button" onClick={executeDelete} className="px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs cursor-pointer">Deactivate Client</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingCart, Truck, User, Mail, Phone, Calendar, MapPin, 
  Trash2, AlertTriangle, LogOut, Building2, RefreshCw, LayoutDashboard, 
  CheckCircle2, X, Package, BellRing
} from 'lucide-react';
import PharmacyManager from './PharmacyManager';
import DrugManager from './DrugManager';
import OrderManager from './OrderManager';
import DelivererManager from './DelivererManager';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { clearSampleData } from '../../utils/clearSampleData';
import { fixUserStatus } from '../../utils/fixUserStatus';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: any;
  lastLogin?: any;
  lastLogout?: any;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: any;
  deletedBy?: string;
}

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'pharmacies' | 'drugs' | 'orders' | 'deliverers' | 'users'>('pharmacies');
  const [stats, setStats] = useState({
    pharmacies: 0,
    orders: 0,
    deliverers: 0,
    users: 0,
    pendingPharmacies: 0,
    pendingDrugs: 0
  });

  // Audio Notification Setup
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    audio.loop = true;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  // Handle playing audio when there is a pending pharmacy and admin is on a different tab
  useEffect(() => {
    if (stats.pendingPharmacies > 0 && tab !== 'pharmacies') {
      audio.play().catch(e => console.log("Browser blocked autoplay. User interaction needed.", e));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [stats.pendingPharmacies, tab, audio]);

  // REAL-TIME LISTENERS FOR DASHBOARD COUNTS
  useEffect(() => {
    const unsubPharmacies = onSnapshot(collection(db, 'pharmacies'), (snap) => {
      const realPharmacies = snap.docs.filter(d => {
        const data = d.data();
        return !data.isStaticFallback && !data.isRejected;
      });
      const pendingCount = snap.docs.filter(d => {
        const data = d.data();
        return !data.isApproved && !data.isRejected && !data.isStaticFallback;
      }).length;

      setStats(prev => ({
        ...prev,
        pharmacies: realPharmacies.length,
        pendingPharmacies: pendingCount
      }));
    });

    const unsubMedicines = onSnapshot(collection(db, 'medicines'), (snap) => {
      const pendingDrugsCount = snap.docs.filter(d => {
        const data = d.data();
        return !data.isApproved && !data.isRejected;
      }).length;

      setStats(prev => ({
        ...prev,
        pendingDrugs: pendingDrugsCount
      }));
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setStats(prev => ({ ...prev, orders: snap.size }));
    });

    const unsubDeliverers = onSnapshot(collection(db, 'deliverers'), (snap) => {
      setStats(prev => ({ ...prev, deliverers: snap.size }));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    return () => {
      unsubPharmacies();
      unsubMedicines();
      unsubOrders();
      unsubDeliverers();
      unsubUsers();
    };
  }, []);

  const tabs = [
    { key: 'pharmacies', label: 'Pharmacies', icon: <Building2 className="w-4 h-4" />, hasPending: stats.pendingPharmacies > 0 },
    { key: 'drugs', label: 'Drug Approvals', icon: <Package className="w-4 h-4" />, hasPending: stats.pendingDrugs > 0 },
    { key: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { key: 'deliverers', label: 'Riders', icon: <Truck className="w-4 h-4" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased p-4 md:p-8">
      
      {/* Floating Action Banner if unconfirmed pharmacies exist */}
      {stats.pendingPharmacies > 0 && tab !== 'pharmacies' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-600 transition-colors shadow-2xl z-50 animate-in slide-in-from-top" onClick={() => setTab('pharmacies')}>
          <BellRing className="w-5 h-5 animate-bounce" />
          <span className="text-sm font-bold uppercase tracking-wider">{stats.pendingPharmacies} New Pharmacy Registration(s) Pending!</span>
        </div>
      )}

      {/* Top Professional Header Banner */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-8 shadow-sm border border-gray-100 bg-white">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-violet-950 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-violet-400" />
                <h1 className="text-3xl font-extrabold tracking-tight">Admin Management Platform</h1>
              </div>
              <p className="text-slate-300 font-medium text-sm mt-1 leading-relaxed">
                Super-administrative controls for platform vendor storefront onboarding, logistics logs, and client registries.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-violet-300 bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl shadow-inner select-none self-start md:self-auto backdrop-blur-md">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-400" /> Real-time Live Sync Active
            </div>
          </div>

          {/* Clean Rounded Pill Tabs Navigation Bar with Notification Pulse Dots */}
          <div className="mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-5">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer relative ${
                  tab === tabItem.key
                    ? 'bg-violet-600 text-white shadow-lg transform scale-[1.02]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tabItem.icon}
                <span>{tabItem.label}</span>
                {tabItem.hasPending && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Statistics Cluster Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pharmacies</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.pharmacies}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orders Logged</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.orders}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Riders</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.deliverers}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Users</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.users}</p>
            </div>
          </div>
        </div>

        {/* Component Display Grid Shell */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[450px]">
          {tab === 'pharmacies' && <PharmacyManager />}
          {tab === 'drugs' && <DrugManager />}
          {tab === 'orders' && <OrderManager />}
          {tab === 'deliverers' && <DelivererManager />}
          {tab === 'users' && <UserManager />}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   User Management Sub-Component Block
   ========================================================================== */
const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // REAL-TIME LISTENER FOR USERS
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      usersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleClearSampleData = async () => {
    try {
      const success = await clearSampleData();
      if (success) showToast('Sample database entities purged successfully.');
      else showToast('Purging operations sequence dropped by server.', 'info');
    } catch (error) {
      console.error('Error clearing sample data:', error);
    }
  };

  const handleFixUserStatus = async () => {
    try {
      const result = await fixUserStatus();
      if (result.success) showToast(result.message);
      else showToast('Identity state optimization sync aborted by database.', 'info');
    } catch (error) {
      console.error('Error fixing user status:', error);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await updateDoc(doc(db, 'users', userToDelete.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: 'admin'
      });
      showToast(`User listing "${userToDelete.name}" flagged inactive.`);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      // Hardcoded strictly to Ghana / GMT timezone to fix the "Reykjavik" issue
      const formattedDate = dateObj.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Accra'
      });
      return `${formattedDate} (GMT)`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const activeUsers = users.filter(user => !user.isDeleted);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <RefreshCw className="animate-spin h-7 w-7 text-violet-600" />
        <p className="text-sm font-semibold text-gray-500">Retrieving secure customer indexes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Client Account Registry</h2>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Total live active shoppers registered: {activeUsers.length}</p>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {users.some(user => user.id.startsWith('sample-user-')) && (
            <button type="button" onClick={handleClearSampleData} className="inline-flex items-center px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase border border-red-100 rounded-xl transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Purge Mock Assets
            </button>
          )}
          <button type="button" onClick={handleFixUserStatus} className="inline-flex items-center px-4 py-2.5 bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold text-xs uppercase border border-violet-100 rounded-xl transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Synchronize Status
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-medium text-xs px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-violet-400" />
          <span>{toastMessage.text}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {activeUsers.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 mb-1">No customer index records found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeUsers.map((user) => (
            <div key={user.id} className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between hover:shadow-md transition-shadow ${user.id.startsWith('sample-user-') ? 'border-red-200 bg-red-50/40' : 'border-gray-100'}`}>
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-700 border border-violet-100"><User className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 tracking-tight leading-none line-clamp-1">{user.name}</h3>
                      <span className="text-[10px] text-gray-400 font-bold tracking-wide mt-1 block">ID: {user.id}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => confirmDelete(user)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="space-y-2.5 border-t border-gray-50 pt-3 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400 shrink-0" /><span className="truncate text-gray-700">{user.email}</span></div>
                  {user.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-700">{user.phone}</span></div>}
                  {user.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span className="truncate text-gray-700">{user.address}</span></div>}
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-500">Registered: <span className="text-gray-700">{formatDate(user.createdAt)}</span></span></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${user.isActive ? 'bg-violet-50 text-violet-700 border border-violet-100' : 'bg-gray-100 text-gray-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-violet-600 animate-pulse' : 'bg-gray-400'}`}></span>
                  {user.isActive ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7" /></div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Deactivate Customer Access?</h2>
              <p className="text-xs text-gray-500 mt-2 font-medium">Confirming will immediately flag <strong>{userToDelete.name}</strong> as an inactive registry member.</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={cancelDelete} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer">Abort Action</button>
              <button type="button" onClick={executeDelete} className="px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs cursor-pointer">Deactivate Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;