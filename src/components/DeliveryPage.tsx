// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { PaystackButton } from 'react-paystack';
// import { User, Phone, MapPin, Truck, Star, Compass, CheckCircle2, Search, ArrowRight, ArrowLeft, CreditCard, AlertCircle, ShieldCheck, Home, Store, Shield, Tag, Loader2, Lock } from 'lucide-react';
// import { db } from '../firebase';
// import { collection, addDoc, doc, onSnapshot, serverTimestamp, updateDoc, increment, getDocs, query, where } from 'firebase/firestore';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import logoImg from '/src/assets/Aidfidelis logo background.png';
// import { paymentService } from '../services/paymentService';

// mapboxgl.accessToken = 'pk.eyJ1IjoiZW13ZXR0YSIsImEiOiJjbXM3MHZmNmUwYXhiMnZxc28wNDE3NmJ2In0.Jcjx7V74N8NECDZ1WWWqYA'; 

// interface DeliveryPageProps {
//   user: any;
//   cartItems?: any[];
//   totalPrice?: number;
//   clearCart?: () => void;
// }

// const pharmacyLocationRegistry: { [key: string]: [number, number] } = {
//   'PlusLab Pharmacy': [5.6362, -0.1654], 
//   'Top Up Pharmacy': [5.5500, -0.1867],  
//   'Link Pharmacy': [6.6745, -1.5716],    
//   'Babylife Pharmacy': [6.6974, -1.6322], 
//   'Panacea Pharmacy': [6.6625, -1.6358],   
//   'Ernest Chemists': [6.6894, -1.6224],    
//   'Kells Pharmacy': [5.6062, -0.1754],     
//   'By Grace Pharmacy': [6.6730, -1.5650],
//   'Mr.Wettas Pharmacy': [6.6800, -1.5900],
//   'MedFont Pharmacy': [6.6690, -1.5540]
// };

// const localLandmarks = [
//   { place_name: 'Prestige Hostel, Kotei, Kumasi', center: [-1.5582, 6.6783] },
//   { place_name: 'Queen\'s Hall, KNUST Campus', center: [-1.5702, 6.6748] },
//   { place_name: 'Unity Hall (Katanga), KNUST Campus', center: [-1.5731, 6.6812] },
//   { place_name: 'Africa Hall, KNUST Campus', center: [-1.5645, 6.6761] },
//   { place_name: 'Independence Hall (Indy), KNUST Campus', center: [-1.5681, 6.6712] },
//   { place_name: 'University Hall (Conti), KNUST Campus', center: [-1.5752, 6.6789] },
//   { place_name: 'Republic Hall, KNUST Campus', center: [-1.5612, 6.6734] },
//   { place_name: 'Pent Hostel, Ayeduase', center: [-1.5521, 6.6705] },
//   { place_name: 'Jubilee Hostel, Ayeduase', center: [-1.5498, 6.6682] },
//   { place_name: 'Ucok Hostel, Kotei', center: [-1.5564, 6.6821] },
//   { place_name: 'KES Hostel, Kotei', center: [-1.5601, 6.6759] },
//   { place_name: 'Kotei Main Town Centre', center: [-1.5550, 6.6790] },
//   { place_name: 'Ayeduase Gate, KNUST', center: [-1.5512, 6.6724] },
//   { place_name: 'Bomso, Kumasi', center: [-1.5842, 6.6901] },
//   { place_name: 'Amakom, Kumasi', center: [-1.6023, 6.6812] }
// ];

// const DeliveryPage: React.FC<DeliveryPageProps> = ({ user, cartItems = [], totalPrice = 0, clearCart }) => {
//   const navigate = useNavigate();
  
//   const groupedPharmaciesMap: { [key: string]: any[] } = {};
//   if (Array.isArray(cartItems)) {
//     cartItems.forEach(item => {
//       const pharmName = item.pharmacyName || item.medicine?.pharmacyName || localStorage.getItem('selectedPharmacyName') || 'Link Pharmacy';
//       if (!groupedPharmaciesMap[pharmName]) {
//         groupedPharmaciesMap[pharmName] = [];
//       }
//       groupedPharmaciesMap[pharmName].push(item);
//     });
//   }

//   const involvedPharmacies = Object.keys(groupedPharmaciesMap);
//   const primaryPharmacy = involvedPharmacies[0] || 'Link Pharmacy';

//   const LOCAL_STORAGE_ORDER_KEY = `aidfidelis_active_order_${user?.email || 'guest'}`;
  
//   const [deliveryStep, setDeliveryStep] = useState<'details' | 'searching' | 'assigned' | 'arrived' | 'completed'>('details');
//   const [currentOrderId, setCurrentOrderId] = useState<string | null>(() => {
//     return localStorage.getItem(LOCAL_STORAGE_ORDER_KEY);
//   });

//   const [assignedRider, setAssignedRider] = useState<any>(null);
//   const [riderLiveCoords, setRiderLiveCoords] = useState<[number, number] | null>(null);
//   const [simulatedEta, setSimulatedEta] = useState<number>(10);

//   const [receiverName, setReceiverName] = useState(user?.name || '');
//   const [receiverPhone, setReceiverPhone] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [userEmail, setUserEmail] = useState(user?.email || '');
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
//   const [isSearchingLocations, setIsSearchingLocations] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [selectedDestinationName, setSelectedDestinationName] = useState('');

//   const [promoCodeInput, setPromoCodeInput] = useState('');
//   const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
//   const [promoMessage, setPromoMessage] = useState({ text: '', isError: false });

//   const [paymentVerified, setPaymentVerified] = useState(false);
//   const [processingPayment, setProcessingPayment] = useState(false);
//   const [paymentReference, setPaymentReference] = useState('');
//   const [paymentError, setPaymentError] = useState('');

//   const [selectedRating, setSelectedRating] = useState<number>(0);

//   const [pharmacyCoords, setPharmacyCoords] = useState<[number, number]>(
//     pharmacyLocationRegistry[primaryPharmacy] || [6.6745, -1.5716]
//   );

//   const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
//   const [distanceKm, setDistanceKm] = useState<number>(0);
//   const [deliveryFee, setDeliveryFee] = useState<number>(0);

//   const mapContainerRef = useRef<HTMLDivElement>(null);
//   const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
//   const motorMarkerRef = useRef<mapboxgl.Marker | null>(null);
//   const customerMarkerRef = useRef<mapboxgl.Marker | null>(null);

//   useEffect(() => {
//     if (pharmacyLocationRegistry[primaryPharmacy]) {
//       setPharmacyCoords(pharmacyLocationRegistry[primaryPharmacy]);
//     }
//   }, [primaryPharmacy]);

//   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     if (/^\d*$/.test(val)) {
//       setReceiverPhone(val);
//       if (val.length > 0 && (val.length !== 10 && val.length !== 12)) {
//         setPhoneError('Ghanaian phone number must be exactly 10 digits (e.g. 0596620696)');
//       } else {
//         setPhoneError('');
//       }
//     } else {
//       setPhoneError('Only numeric digits are allowed in phone numbers');
//     }
//   };

//   const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371; 
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const d = R * c;
    
//     setDistanceKm(parseFloat(d.toFixed(1)));
//     setDeliveryFee(parseFloat((5 + d * 3.50).toFixed(2))); 
//   };

//   useEffect(() => {
//     if (!searchQuery.trim() || searchQuery.length < 2) {
//       setLocationSuggestions([]);
//       setIsSearchingLocations(false);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       setIsSearchingLocations(true);
//       try {
//         const queryLower = searchQuery.toLowerCase();
//         const matchedLocal = localLandmarks.filter(item => 
//           item.place_name.toLowerCase().includes(queryLower)
//         );

//         const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=gh&bbox=-3.245,4.72,1.19,11.17&limit=5`);
//         const data = await res.json();
//         const mapboxFeatures = data && data.features ? data.features : [];

//         const combined = [...matchedLocal, ...mapboxFeatures];
//         setLocationSuggestions(combined);
//         setShowSuggestions(true);
//       } catch (err) {
//         console.error("Search error:", err);
//         const matchedLocal = localLandmarks.filter(item => 
//           item.place_name.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//         setLocationSuggestions(matchedLocal);
//         setShowSuggestions(true);
//       } finally {
//         setIsSearchingLocations(false);
//       }
//     }, 250);

//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   const handleSelectLiveLocation = (item: any) => {
//     const [lon, lat] = item.center;
//     const name = item.place_name;

//     setSelectedDestinationName(name);
//     setSearchQuery(name);
//     setCustomerCoords([lat, lon]);
//     calculateDistance(pharmacyCoords[0], pharmacyCoords[1], lat, lon);
//     setShowSuggestions(false);

//     if (mapInstanceRef.current) {
//       mapInstanceRef.current.flyTo({ center: [lon, lat], zoom: 15 });
//     }
//   };

//   useEffect(() => {
//     if (!mapContainerRef.current) return;

//     const map = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/mapbox/streets-v12',
//       center: [pharmacyCoords[1], pharmacyCoords[0]],
//       zoom: 13
//     });

//     map.addControl(new mapboxgl.NavigationControl(), 'top-right');
//     mapInstanceRef.current = map;

//     map.on('load', () => {
//       map.resize();
//     });

//     return () => {
//       map.remove();
//     };
//   }, []);

//   const activeMotorPosition = riderLiveCoords || pharmacyCoords;

//   useEffect(() => {
//     const map = mapInstanceRef.current;
//     if (!map) return;

//     if (!motorMarkerRef.current) {
//       const el = document.createElement('div');
//       el.className = 'custom-motor-marker';
//       el.innerHTML = `<div style="background: #ffffff; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid #16a34a; font-size: 22px;">🏍️</div>`;
      
//       motorMarkerRef.current = new mapboxgl.Marker(el)
//         .setLngLat([activeMotorPosition[1], activeMotorPosition[0]])
//         .addTo(map);
//     } else {
//       motorMarkerRef.current.setLngLat([activeMotorPosition[1], activeMotorPosition[0]]);
//     }

//     if (customerCoords) {
//       if (!customerMarkerRef.current) {
//         customerMarkerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
//           .setLngLat([customerCoords[1], customerCoords[0]])
//           .addTo(map);
//       } else {
//         customerMarkerRef.current.setLngLat([customerCoords[1], customerCoords[0]]);
//       }

//       const geojsonLine = {
//         type: 'Feature' as const,
//         properties: {},
//         geometry: {
//           type: 'LineString' as const,
//           coordinates: [
//             [activeMotorPosition[1], activeMotorPosition[0]],
//             [customerCoords[1], customerCoords[0]]
//           ]
//         }
//       };

//       if (map.getSource('route')) {
//         (map.getSource('route') as mapboxgl.GeoJSONSource).setData(geojsonLine);
//       } else {
//         map.addSource('route', { type: 'geojson', data: geojsonLine });
//         map.addLayer({
//           id: 'route',
//           type: 'line',
//           source: 'route',
//           layout: { 'line-join': 'round', 'line-cap': 'round' },
//           paint: { 'line-color': '#16a34a', 'line-width': 4, 'line-opacity': 0.8, 'line-dasharray': [2, 2] }
//         });
//       }

//       const bounds = new mapboxgl.LngLatBounds();
//       bounds.extend([activeMotorPosition[1], activeMotorPosition[0]]);
//       bounds.extend([customerCoords[1], customerCoords[0]]);
//       map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
//     }
//   }, [activeMotorPosition, customerCoords]);

//   const handleApplyPromo = async () => {
//     setPromoMessage({ text: '', isError: false });

//     if (promoCodeInput.trim().toUpperCase() !== 'AIDFREE26') {
//       setPromoMessage({ text: 'Invalid promotional code.', isError: true });
//       return;
//     }

//     if (!userEmail.trim()) {
//       setPromoMessage({ text: 'Please provide your email first to check promo eligibility.', isError: true });
//       return;
//     }

//     try {
//       const now = new Date();
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);

//       const ordersRef = collection(db, 'orders');
//       const q = query(
//         ordersRef, 
//         where('userEmail', '==', userEmail.trim()),
//         where('appliedPromo', '==', 'AIDFREE26')
//       );
      
//       const querySnapshot = await getDocs(q);
//       let alreadyUsedThisWeek = false;

//       querySnapshot.forEach(docSnap => {
//         const data = docSnap.data();
//         if (data.createdAt) {
//           const orderDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
//           if (orderDate >= startOfWeek) {
//             alreadyUsedThisWeek = true;
//           }
//         }
//       });

//       if (alreadyUsedThisWeek) {
//         setPromoMessage({ text: 'You have already used your free delivery for this week!', isError: true });
//       } else {
//         setAppliedPromo('AIDFREE26');
//         setPromoMessage({ text: 'Code applied! Free delivery unlocked.', isError: false });
//         setPromoCodeInput('');
//       }
//     } catch (err) {
//       console.error("Promo verification error:", err);
//       setPromoMessage({ text: 'Error verifying promo eligibility.', isError: true });
//     }
//   };

//   const finalDeliveryFee = appliedPromo === 'AIDFREE26' ? 0 : deliveryFee;
//   const grossTotal = totalPrice + finalDeliveryFee;
//   const paystackPublicKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined)?.trim() || '';
//   const paystackConfigError = !paystackPublicKey
//     ? 'Payment configuration is missing. Set VITE_PAYSTACK_PUBLIC_KEY in your environment.'
//     : !/^pk_(test|live)_[A-Za-z0-9]+$/.test(paystackPublicKey)
//       ? 'Paystack key format is invalid. Use a valid pk_test_* or pk_live_* public key.'
//       : '';

//   const paystackProps = {
//     email: userEmail || 'test@domain.com',
//     amount: grossTotal * 100,
//     currency: 'GHS',
//     publicKey: paystackPublicKey,
//     text: processingPayment ? 'Verifying Payment...' : 'Pay with Paystack',
//     onSuccess: async (reference: any) => {
//       setPaymentReference(reference.reference);
//       setProcessingPayment(true);
//       setPaymentError('');
      
//       try {
//         await new Promise(resolve => setTimeout(resolve, 1500));
//         const result = await paymentService.processPayment(
//           reference.reference, 
//           grossTotal, 
//           userEmail || 'test@domain.com', 
//           cartItems
//         );
        
//         if (result.success) {
//           setPaymentVerified(true);
//         } else {
//           setPaymentError(result.message || 'Payment verification failed.');
//         }
//       } catch (error) {
//         setPaymentError('Payment validation error occurred.');
//       } finally {
//         setProcessingPayment(false);
//       }
//     },
//     onClose: () => {
//       setProcessingPayment(false);
//     },
//   };

//   const handleInitiateOrderDispatch = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!receiverName.trim() || !receiverPhone.trim() || phoneError || !customerCoords || !paymentVerified) return;

//     setDeliveryStep('searching');

//     const pickupStops = involvedPharmacies.map(pharmName => ({
//       pharmacyName: pharmName,
//       coords: pharmacyLocationRegistry[pharmName] || [6.6745, -1.5716],
//       items: groupedPharmaciesMap[pharmName].map(i => ({
//         name: i.medicine.name,
//         quantity: i.quantity,
//         price: i.medicine.price
//       }))
//     }));

//     try {
//       for (const item of cartItems) {
//         const medicineId = item.medicine?.id || item.id;
//         const quantityBought = item.quantity || 1;

//         if (medicineId) {
//           const medRef = doc(db, 'medicines', medicineId);
//           await updateDoc(medRef, {
//             stock: increment(-quantityBought)
//           });
//         }
//       }

//       const orderRef = await addDoc(collection(db, 'orders'), {
//         receiverName: receiverName.trim(),
//         receiverPhone: receiverPhone.trim(),
//         userEmail: userEmail.trim(),
//         deliveryAddress: selectedDestinationName || searchQuery,
//         pharmacyName: involvedPharmacies.join(', '),
//         pickupStops,
//         deliveryFee: finalDeliveryFee,
//         originalDeliveryFee: deliveryFee,
//         appliedPromo: appliedPromo || null,
//         totalPrice: grossTotal,
//         paymentReference: paymentReference || 'TEST_MODE',
//         status: 'searching_riders',
//         pharmacyCoords,
//         customerLocation: { lat: customerCoords[0], lng: customerCoords[1] },
//         createdAt: serverTimestamp()
//       });

//       setCurrentOrderId(orderRef.id);
//       localStorage.setItem(LOCAL_STORAGE_ORDER_KEY, orderRef.id);
//     } catch (err) {
//       console.error(err);
//       setDeliveryStep('details');
//     }
//   };

//   useEffect(() => {
//     if (!currentOrderId) return;
//     const unsubscribe = onSnapshot(doc(db, 'orders', currentOrderId), async (docSnap) => {
//       if (docSnap.exists()) {
//         const orderData = docSnap.data();
        
//         if (orderData.riderLocation) {
//           setRiderLiveCoords([orderData.riderLocation.lat, orderData.riderLocation.lng]);
//         }

//         if (orderData.customerLocation && !customerCoords) {
//           setCustomerCoords([orderData.customerLocation.lat, orderData.customerLocation.lng]);
//         }
        
//         if (orderData.riderInfo?.id) {
//           const riderDocRef = doc(db, 'deliverers', orderData.riderInfo.id);
//           onSnapshot(riderDocRef, (riderSnap) => {
//             if (riderSnap.exists()) {
//               const liveRiderData = riderSnap.data();
//               setAssignedRider({
//                 ...orderData.riderInfo,
//                 totalRatingsCount: liveRiderData.totalRatingsCount || 0,
//                 totalStarsAccumulated: liveRiderData.totalStarsAccumulated || 0
//               });
//             } else {
//               setAssignedRider(orderData.riderInfo);
//             }
//           });
//         }

//         if (orderData.status === 'searching_riders') {
//           setDeliveryStep('searching');
//         } else if (orderData.status === 'rider_assigned') {
//           setDeliveryStep('assigned');
//         } else if (orderData.status === 'arrived' || orderData.status === 'delivered') {
//           setDeliveryStep('arrived');
//         } else if (orderData.status === 'completed') {
//           setDeliveryStep('completed');
//         }
//       } else {
//         localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
//         setCurrentOrderId(null);
//         setDeliveryStep('details');
//       }
//     });
//     return () => unsubscribe();
//   }, [currentOrderId, customerCoords]);

//   const handleRatingSubmit = async () => {
//     if (!selectedRating) return;
//     if (currentOrderId) {
//       try {
//         await updateDoc(doc(db, 'orders', currentOrderId), {
//           riderRating: selectedRating,
//           status: 'completed'
//         });

//         if (assignedRider?.id) {
//           const riderRef = doc(db, 'deliverers', assignedRider.id);
//           await updateDoc(riderRef, {
//             totalRatingsCount: increment(1),
//             totalStarsAccumulated: increment(selectedRating)
//           });
//         }
//       } catch (err) {
//         console.error("Failed to commit star review score:", err);
//       }
//     }
    
//     localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
//     setDeliveryStep('completed');
//   };

//   const handleReturnToPharmacies = () => {
//     if (clearCart) clearCart();
//     localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
//     navigate('/pharmacies');
//   };

//   const totalCount = assignedRider?.totalRatingsCount || 0;
//   const totalStars = assignedRider?.totalStarsAccumulated || 0;
//   const liveAssignedAverage = totalCount > 0 ? parseFloat((totalStars / totalCount).toFixed(1)) : 0;

//   return (
//     <div className="w-screen h-screen flex bg-white font-sans antialiased overflow-hidden">
      
//       {/* LEFT PANEL SIDEBAR */}
//       <div className="w-full md:w-[440px] h-full bg-white flex flex-col justify-between border-r border-gray-100 z-10 shadow-xl relative shrink-0">
        
//         <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
//           <div className="flex items-center gap-3">
//             {deliveryStep === 'details' && (
//               <button
//                 type="button"
//                 onClick={() => navigate('/cart')}
//                 className="p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-xl transition-colors border border-gray-200/60 bg-white shadow-sm flex items-center justify-center"
//               >
//                 <ArrowLeft className="h-4 w-4" />
//               </button>
//             )}
//             <div className="flex items-center gap-2">
//               <img src={logoImg} alt="AidFidelis Logo" className="h-8 w-8 object-contain" />
//               <div>
//                 <span className="text-sm font-black text-violet-700 block tracking-tight leading-none">AidFidelis</span>
//                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Secure Checkout</span>
//               </div>
//             </div>
//           </div>
//           <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border border-gray-200/40">
//             Fulfillment Portal
//           </span>
//         </div>

//         <div className="p-6 flex-1 overflow-y-auto space-y-6">
//           {deliveryStep === 'details' && (
//             <form onSubmit={handleInitiateOrderDispatch} className="space-y-5">
//               <div>
//                 <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Checkout & Delivery</h2>
//                 <p className="text-xs font-semibold text-gray-400 mt-0.5">Enter delivery details and complete payment to dispatch courier.</p>
//               </div>

//               <div className="space-y-3.5">
//                 <div>
//                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Receiver Name *</label>
//                   <input
//                     type="text"
//                     required
//                     value={receiverName}
//                     onChange={e => setReceiverName(e.target.value)}
//                     placeholder="e.g. Emmanuel Mawuli Wetta"
//                     className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Receiver Contact Phone (Numbers Only) *</label>
//                   <input
//                     type="tel"
//                     required
//                     maxLength={10}
//                     value={receiverPhone}
//                     onChange={handlePhoneChange}
//                     placeholder="e.g. 0596620696"
//                     className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white font-mono"
//                   />
//                   {phoneError && <p className="text-[10px] font-bold text-red-600 mt-1">{phoneError}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email Address for Payment Receipt *</label>
//                   <input
//                     type="email"
//                     required
//                     value={userEmail}
//                     onChange={e => setUserEmail(e.target.value)}
//                     placeholder="e.g. user@domain.com"
//                     className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white font-mono"
//                   />
//                 </div>

//                 <div className="relative">
//                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Fulfillment Drop-off Address *</label>
//                   <div className="relative">
//                     <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-gray-400" />
//                     <input
//                       type="text"
//                       required
//                       placeholder="Search Prestige, Unity Hall, Kotei..."
//                       value={searchQuery}
//                       onFocus={() => setShowSuggestions(true)}
//                       onChange={e => setSearchQuery(e.target.value)}
//                       className="w-full rounded-xl border border-gray-200 pl-10 pr-9 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
//                     />
//                     {isSearchingLocations && (
//                       <Loader2 className="absolute right-3 top-3 h-4 w-4 text-violet-600 animate-spin" />
//                     )}
//                   </div>

//                   {showSuggestions && locationSuggestions.length > 0 && (
//                     <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-[220px] overflow-y-auto z-[2000] divide-y divide-gray-50">
//                       {locationSuggestions.map((item, idx) => (
//                         <div
//                           key={idx}
//                           onClick={() => handleSelectLiveLocation(item)}
//                           className="p-3 text-xs font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-800 cursor-pointer transition-colors flex items-start gap-2"
//                         >
//                           <MapPin className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
//                           <span className="line-clamp-2">{item.place_name}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* REFINED, CLEAN PROMO CODE UI BOX */}
//               <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
//                 <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
//                   <Tag className="w-3.5 h-3.5 text-violet-600" /> Have a Promo Code?
//                 </label>
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={promoCodeInput}
//                     onChange={e => setPromoCodeInput(e.target.value)}
//                     placeholder="e.g. AIDFREE26"
//                     className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleApplyPromo}
//                     className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0"
//                   >
//                     Apply
//                   </button>
//                 </div>
//                 {promoMessage.text && (
//                   <div className={`text-[11px] font-bold p-2.5 rounded-xl flex items-center gap-2 ${promoMessage.isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-violet-50 text-violet-800 border border-violet-100'}`}>
//                     {promoMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
//                     <span className="leading-tight">{promoMessage.text}</span>
//                   </div>
//                 )}
//               </div>

//               {/* Multi-Store Pickup Itinerary Breakdown */}
//               <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
//                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Multi-Store Pickup Itinerary ({involvedPharmacies.length})</span>
//                 <div className="space-y-2">
//                   {involvedPharmacies.map((pharmName) => (
//                     <div key={pharmName} className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs space-y-1.5">
//                       <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
//                         <Store className="w-3.5 h-3.5 text-indigo-600" />
//                         <span>{pharmName}</span>
//                       </div>
//                       <ul className="pl-5 text-[11px] text-gray-600 list-disc space-y-0.5">
//                         {groupedPharmaciesMap[pharmName].map((item, idx) => (
//                           <li key={idx}>
//                             {item.quantity}x {item.medicine.name} (GH₵{(item.medicine.price * item.quantity).toFixed(2)})
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Order Calculation Box */}
//               <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold text-gray-500 space-y-2.5">
//                 <div className="flex justify-between items-center text-gray-400 font-medium">
//                   <span>Route Trajectory Distance:</span>
//                   <span className="font-mono text-gray-700">{distanceKm} km</span>
//                 </div>
//                 <div className="flex justify-between items-center text-gray-400 font-medium">
//                   <span>Dynamic Logistics Fare:</span>
//                   <span className="font-mono text-violet-700">
//                     {appliedPromo === 'AIDFREE26' ? (
//                       <span className="flex items-center gap-1.5">
//                         <span className="line-through text-gray-400">₵{deliveryFee.toFixed(2)}</span>
//                         <span className="bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-black">FREE</span>
//                       </span>
//                     ) : (
//                       `+ ₵${deliveryFee.toFixed(2)}`
//                     )}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-gray-400 font-medium">
//                   <span>Items Subtotal:</span>
//                   <span className="font-mono text-gray-700">₵{totalPrice.toFixed(2)}</span>
//                 </div>
//                 <div className="border-t border-gray-200 pt-2.5 flex justify-between text-sm text-gray-900 font-black">
//                   <span>Gross Invoiced Total:</span>
//                   <span className="font-mono text-violet-800">₵{grossTotal.toFixed(2)}</span>
//                 </div>
//               </div>

//               {/* Payment Section with Testing Mode Option */}
//               <div className="space-y-3 pt-2 border-t border-gray-100">
//                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Payment Authorization *</label>
                
//                 {paymentError && (
//                   <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
//                     <AlertCircle className="w-4 h-4 shrink-0" />
//                     <span>{paymentError}</span>
//                   </div>
//                 )}

//                 {paystackConfigError && (
//                   <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-2">
//                     <AlertCircle className="w-4 h-4 shrink-0" />
//                     <span>{paystackConfigError}</span>
//                   </div>
//                 )}

//                 {paymentVerified ? (
//                   <div className="p-3.5 bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold rounded-xl flex items-center gap-2">
//                       <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
//                       <span>Payment Verified!</span>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <PaystackButton
//                       {...paystackProps}
//                       className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
//                         processingPayment || !userEmail.trim() || !customerCoords || !!paystackConfigError
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
//                           : "bg-blue-600 hover:bg-blue-700 text-white"
//                       }`}
//                       disabled={processingPayment || !userEmail.trim() || !customerCoords || !!paystackConfigError}
//                     />
//                   </div>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={!customerCoords || !receiverPhone.trim() || !!phoneError || !receiverName.trim() || !paymentVerified}
//                 className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
//               >
//                 Request Courier Dispatch <ArrowRight className="h-3.5 w-3.5" />
//               </button>
//             </form>
//           )}

//           {deliveryStep === 'searching' && (
//             <div className="py-12 text-center space-y-4">
//               <Compass className="h-10 w-10 text-violet-600 mx-auto animate-spin" />
//               <div>
//                 <h3 className="text-base font-bold text-gray-800">Matching Nearby Riders...</h3>
//                 <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">Broadcasting routing price variables directly into active fleet operator nodes.</p>
//               </div>
//               <button 
//                 type="button" 
//                 onClick={() => {
//                   localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
//                   setCurrentOrderId(null);
//                   setDeliveryStep('details');
//                 }} 
//                 className="text-xs text-red-500 hover:underline font-bold"
//               >
//                 Abort Placement Request
//               </button>
//             </div>
//           )}

//           {deliveryStep === 'assigned' && assignedRider && (
//             <div className="space-y-6">
//               <div className="border-b border-gray-100 pb-4">
//                 <span className="text-[10px] font-black tracking-widest text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full uppercase">
//                   Fulfillment Active
//                 </span>
//                 <h3 className="font-black text-gray-900 text-xl tracking-tight mt-2">Rider assigned to your order</h3>
//                 <p className="text-xs text-gray-400 font-medium mt-1">
//                   Estimated arrival time: <strong className="text-violet-700 font-mono text-sm">{simulatedEta} mins</strong>
//                 </p>
//               </div>

//               <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/80 rounded-3xl p-5 shadow-md space-y-4">
//                 <div className="flex items-center gap-4">
//                   <div className="relative">
//                     <img 
//                       src={assignedRider.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
//                       alt={assignedRider.name} 
//                       className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" 
//                     />
//                     <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-1 rounded-full text-[9px] shadow">
//                       <ShieldCheck className="w-3 h-3" />
//                     </div>
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-extrabold text-gray-900 text-base tracking-tight truncate">{assignedRider.name}</h4>
//                     <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 mt-1">
//                       <Truck className="w-3 h-3" /> {assignedRider.vehicleNumber || 'Moto: GT-4592-24'}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Direct Contact</span>
//                     {assignedRider.phone ? (
//                       <a href={`tel:${assignedRider.phone}`} className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1">
//                         <Phone className="w-3 h-3" /> {assignedRider.phone}
//                       </a>
//                     ) : (
//                       <span className="font-mono text-gray-600 font-bold">+233 59 662 0696</span>
//                     )}
//                   </div>

//                   <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between text-xs">
//                     <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Courier Rating</span>
//                     <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
//                       <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
//                       <span className="font-black text-gray-900 font-mono text-xs">
//                         {totalCount > 0 ? liveAssignedAverage.toFixed(1) : '4.9'}
//                       </span>
//                       <span className="text-[9px] text-gray-400 font-bold">({totalCount > 0 ? totalCount : '124'})</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {deliveryStep === 'arrived' && (
//             <div className="py-6 text-center space-y-5 animate-in fade-in duration-300">
//               <div className="w-12 h-12 bg-violet-50 border border-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
//                 <CheckCircle2 className="w-6 h-6" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Consignment Arrived!</h2>
//                 <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">Your package has been successfully delivered. Please rate your driver to complete the trip.</p>
//               </div>
              
//               <div className="flex items-center justify-center gap-1.5 pt-2">
//                 {[1, 2, 3, 4, 5].map((stars) => (
//                   <button
//                     key={stars}
//                     type="button"
//                     onClick={() => setSelectedRating(stars)}
//                     className={`transition-transform hover:scale-125 duration-150 ${
//                       stars <= selectedRating ? 'text-amber-400' : 'text-gray-300'
//                     }`}
//                   >
//                     <Star className="w-8 h-8 fill-current" />
//                   </button>
//                 ))}
//               </div>

//               {selectedRating > 0 && (
//                 <button
//                   type="button"
//                   onClick={handleRatingSubmit}
//                   className="w-full mt-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
//                 >
//                   Submit {selectedRating}-Star Rating <ArrowRight className="h-3.5 w-3.5" />
//                 </button>
//               )}
//             </div>
//           )}

//           {deliveryStep === 'completed' && (
//             <div className="py-10 text-center space-y-5 animate-in fade-in duration-300">
//               <div className="w-14 h-14 bg-violet-50 border border-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
//                 <CheckCircle2 className="w-7 h-7" />
//               </div>
//               <div className="space-y-1">
//                 <h2 className="text-xl font-black text-gray-900 tracking-tight">Thank You!</h2>
//                 <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">Your rating has been recorded successfully. Have a healthy day!</p>
//               </div>
//               <div>
//                 <button
//                   type="button"
//                   onClick={handleReturnToPharmacies}
//                   className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
//                 >
//                   <Home className="w-4 h-4" /> Return to Pharmacies
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="p-4 border-t border-gray-50 text-[10px] text-gray-400 font-medium text-center bg-gray-50/20">
//           AidFidelis Real-Time Distribution Encrypted System Node
//         </div>
//       </div>

//       {/* RIGHT FULL SCREEN MAPBOX LIVE MAP */}
//       <div className="flex-1 h-full bg-gray-100 z-0 relative">
//         <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
//       </div>
//     </div>
//   );
// };

// export default DeliveryPage;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Truck, Star, Compass, CheckCircle2, Search, ArrowRight, ArrowLeft, CreditCard, AlertCircle, ShieldCheck, Home, Store, Tag, Loader2, Lock, Smartphone } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, doc, onSnapshot, serverTimestamp, updateDoc, increment, getDocs, query, where } from 'firebase/firestore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import logoImg from '/src/assets/Aidfidelis logo background.png';

mapboxgl.accessToken = 'pk.eyJ1IjoiZW13ZXR0YSIsImEiOiJjbXM3MHZmNmUwYXhiMnZxc28wNDE3NmJ2In0.Jcjx7V74N8NECDZ1WWWqYA'; 

interface DeliveryPageProps {
  user: any;
  cartItems?: any[];
  totalPrice?: number;
  clearCart?: () => void;
}

const pharmacyLocationRegistry: { [key: string]: [number, number] } = {
  'PlusLab Pharmacy': [5.6362, -0.1654], 
  'Top Up Pharmacy': [5.5500, -0.1867],  
  'Link Pharmacy': [6.6745, -1.5716],    
  'Babylife Pharmacy': [6.6974, -1.6322], 
  'Panacea Pharmacy': [6.6625, -1.6358],   
  'Ernest Chemists': [6.6894, -1.6224],    
  'Kells Pharmacy': [5.6062, -0.1754],     
  'By Grace Pharmacy': [6.6730, -1.5650],
  'Mr.Wettas Pharmacy': [6.6800, -1.5900],
  'MedFont Pharmacy': [6.6690, -1.5540]
};

const localLandmarks = [
  { place_name: 'Sowutuom, Accra', center: [-0.2833, 5.6031] },
  { place_name: 'Lapaz, Accra', center: [-0.2333, 5.6050] },
  { place_name: 'Awoshie, Accra', center: [-0.2667, 5.6000] },
  { place_name: 'Ablekuma, Accra', center: [-0.3137, 5.6373] },
  { place_name: 'Dansoman, Accra', center: [-0.2745, 5.5391] },
  { place_name: 'Achimota, Accra', center: [-0.2281, 5.6162] },
  { place_name: 'Kaneshie, Accra', center: [-0.2300, 5.5500] },
  { place_name: 'Madina, Accra', center: [-0.1652, 5.6801] },
  { place_name: 'East Legon, Accra', center: [-0.1581, 5.6342] },
  { place_name: 'Spintex Road, Accra', center: [-0.1082, 5.6152] },
  { place_name: 'Osu Oxford Street, Accra', center: [-0.1791, 5.5556] },
  { place_name: 'Prestige Hostel, Kotei, Kumasi', center: [-1.5582, 6.6783] },
  { place_name: 'Queen\'s Hall, KNUST Campus, Kumasi', center: [-1.5702, 6.6748] },
  { place_name: 'Unity Hall (Katanga), KNUST Campus, Kumasi', center: [-1.5731, 6.6812] },
  { place_name: 'Adum Central, Kumasi', center: [-1.6233, 6.6942] },
  { place_name: 'Bantama, Kumasi', center: [-1.6254, 6.7021] },
  { place_name: 'Kejetia Market, Kumasi', center: [-1.6192, 6.6934] },
  { place_name: 'Cape Coast Castle, Cape Coast', center: [-1.2466, 5.1053] },
  { place_name: 'Takoradi Market Circle, Western Region', center: [-1.7554, 4.8845] },
  { place_name: 'Tamale Central Market, Northern Region', center: [-0.8393, 9.4075] }
];

const DeliveryPage: React.FC<DeliveryPageProps> = ({ user, cartItems = [], totalPrice = 0, clearCart }) => {
  const navigate = useNavigate();
  
  const groupedPharmaciesMap: { [key: string]: any[] } = {};
  if (Array.isArray(cartItems)) {
    cartItems.forEach(item => {
      const pharmName = item.pharmacyName || item.medicine?.pharmacyName || localStorage.getItem('selectedPharmacyName') || 'Link Pharmacy';
      if (!groupedPharmaciesMap[pharmName]) {
        groupedPharmaciesMap[pharmName] = [];
      }
      groupedPharmaciesMap[pharmName].push(item);
    });
  }

  const involvedPharmacies = Object.keys(groupedPharmaciesMap);
  const primaryPharmacy = involvedPharmacies[0] || 'Link Pharmacy';

  const LOCAL_STORAGE_ORDER_KEY = `aidfidelis_active_order_${user?.email || 'guest'}`;
  const LOCAL_STORAGE_PHARMACY_KEY = `aidfidelis_active_pharmacy_${user?.email || 'guest'}`;
  
  const [deliveryStep, setDeliveryStep] = useState<'details' | 'awaiting_confirmation' | 'rider_selection' | 'awaiting_rider_confirmation' | 'searching' | 'assigned' | 'arrived' | 'completed'>('details');
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(() => {
    const savedOrderId = localStorage.getItem(LOCAL_STORAGE_ORDER_KEY);
    const savedPharmacy = localStorage.getItem(LOCAL_STORAGE_PHARMACY_KEY);
    // Discard if pharmacy is missing (legacy) or belongs to a different pharmacy
    if (savedOrderId && (!savedPharmacy || savedPharmacy !== primaryPharmacy)) {
      localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PHARMACY_KEY);
      return null;
    }
    return savedOrderId;
  });

  const [availableRiders, setAvailableRiders] = useState<any[]>([]);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [assignedRider, setAssignedRider] = useState<any>(null);
  const [riderLiveCoords, setRiderLiveCoords] = useState<[number, number] | null>(null);
  const [simulatedEta, setSimulatedEta] = useState<number>(10);
  const [isCompletingPreviousRide, setIsCompletingPreviousRide] = useState<boolean>(false);

  const [showTimeoutModal, setShowTimeoutModal] = useState<boolean>(false);

  const [receiverName, setReceiverName] = useState(user?.name || '');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDestinationName, setSelectedDestinationName] = useState('');

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState({ text: '', isError: false });

  // Modified Payment State: Now asks for Sender Name
  const [senderMomoName, setSenderMomoName] = useState('');
  const [pharmacyMomoDetails, setPharmacyMomoDetails] = useState<any[]>([]);

  const [selectedRating, setSelectedRating] = useState<number>(0);

  const [pharmacyCoords, setPharmacyCoords] = useState<[number, number]>(
    pharmacyLocationRegistry[primaryPharmacy] || [6.6745, -1.5716]
  );

  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const motorMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const customerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      if (involvedPharmacies.length === 0) return;
      try {
        const q = query(collection(db, 'pharmacies'), where('name', 'in', involvedPharmacies.slice(0, 10)));
        const snap = await getDocs(q);
        const details: any[] = [];
        snap.forEach(doc => {
          details.push(doc.data());
        });
        setPharmacyMomoDetails(details);
      } catch (e) {
        console.error("Error fetching pharmacy momo details:", e);
      }
    };
    fetchPharmacyDetails();
  }, [involvedPharmacies]);

  useEffect(() => {
    if (pharmacyLocationRegistry[primaryPharmacy]) {
      setPharmacyCoords(pharmacyLocationRegistry[primaryPharmacy]);
    }
  }, [primaryPharmacy]);

  // Reset stale order when the active pharmacy changes mid-session
  useEffect(() => {
    const savedPharmacy = localStorage.getItem(LOCAL_STORAGE_PHARMACY_KEY);
    if (currentOrderId && (!savedPharmacy || savedPharmacy !== primaryPharmacy)) {
      localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PHARMACY_KEY);
      setCurrentOrderId(null);
      setDeliveryStep('details');
    }
  }, [primaryPharmacy]);

  useEffect(() => {
    if (deliveryStep !== 'rider_selection') return;

    const fetchAvailableRiders = async () => {
      try {
        const riderQuery = query(collection(db, 'deliverers'), where('isOnline', '==', true));
        const snap = await getDocs(riderQuery);
        const riders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableRiders(riders);

        if (riders.length > 0) {
          try {
            const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextCtor) {
              const ctx = new AudioContextCtor();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(700, ctx.currentTime);
              gain.gain.setValueAtTime(0.09, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            }
          } catch (e) {
            console.warn('Could not play rider selection alert', e);
          }
        }
      } catch (error) {
        console.error('Error loading active riders:', error);
        setAvailableRiders([]);
      }
    };

    fetchAvailableRiders();
  }, [deliveryStep]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (deliveryStep === 'searching') {
      timer = setTimeout(async () => {
        if (currentOrderId) {
          try {
            await updateDoc(doc(db, 'orders', currentOrderId), { status: 'expired_no_riders' });
          } catch (e) {}
          localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
          localStorage.removeItem(LOCAL_STORAGE_PHARMACY_KEY);
          setCurrentOrderId(null);
        }
        setDeliveryStep('details');
        setShowTimeoutModal(true);
      }, 120000); 
    }
    return () => clearTimeout(timer);
  }, [deliveryStep, currentOrderId]);

  const handleChooseRider = async (rider: any) => {
    if (!currentOrderId) return;
    setSelectedRider(rider);
    setDeliveryStep('awaiting_rider_confirmation');

    try {
      await updateDoc(doc(db, 'orders', currentOrderId), {
        chosenRiderId: rider.id,
        chosenRiderName: rider.name,
        chosenRiderPhone: rider.phone,
        chosenRiderVehicleNumber: rider.vehicleNumber,
        status: 'rider_selected'
      });
    } catch (error) {
      console.error('Error selecting rider:', error);
      setDeliveryStep('rider_selection');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setReceiverPhone(val);
      if (val.length > 0 && (val.length !== 10 && val.length !== 12)) {
        setPhoneError('Ghanaian phone number must be exactly 10 digits (e.g. 0596620696)');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('Only numeric digits are allowed in phone numbers');
    }
  };

  const calculateDistanceFallback = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    
    setDistanceKm(parseFloat(d.toFixed(1)));
    setDeliveryFee(parseFloat((5 + d * 3.50).toFixed(2))); 
  };

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setLocationSuggestions([]);
      setIsSearchingLocations(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocations(true);
      const queryLower = searchQuery.toLowerCase();
      try {
        const matchedLocal = localLandmarks.filter(item => 
          item.place_name.toLowerCase().includes(queryLower)
        );

        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=gh&limit=5`);
        const data = await res.json();
        const mapboxFeatures = data && data.features ? data.features : [];

        const combined = [...matchedLocal, ...mapboxFeatures];
        setLocationSuggestions(combined);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Search error:", err);
        const matchedLocal = localLandmarks.filter(item => 
          item.place_name.toLowerCase().includes(queryLower)
        );
        setLocationSuggestions(matchedLocal);
        setShowSuggestions(true);
      } finally {
        setIsSearchingLocations(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLiveLocation = (item: any) => {
    const [lon, lat] = item.center;
    const name = item.place_name;

    setSelectedDestinationName(name);
    setSearchQuery(name);
    setCustomerCoords([lat, lon]);
    
    calculateDistanceFallback(pharmacyCoords[0], pharmacyCoords[1], lat, lon);
    setShowSuggestions(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center: [lon, lat], zoom: 14 });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [pharmacyCoords[1], pharmacyCoords[0]],
      zoom: 13
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapInstanceRef.current = map;

    map.on('load', () => {
      map.resize();
    });

    return () => {
      map.remove();
    };
  }, []);

  const activeMotorPosition = riderLiveCoords || pharmacyCoords;

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!motorMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-motor-marker';
      el.innerHTML = `<div style="background: #ffffff; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid #16a34a; font-size: 22px;">🏥</div>`;
      
      motorMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat([activeMotorPosition[1], activeMotorPosition[0]])
        .addTo(map);
    } else {
      motorMarkerRef.current.setLngLat([activeMotorPosition[1], activeMotorPosition[0]]);
    }

    const isFinished = deliveryStep === 'arrived' || deliveryStep === 'completed';

    if (isFinished) {
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getLayer('route-glow')) map.removeLayer('route-glow');
      if (map.getSource('route')) map.removeSource('route');
      if (customerMarkerRef.current) {
        customerMarkerRef.current.remove();
        customerMarkerRef.current = null;
      }
      map.flyTo({ center: [activeMotorPosition[1], activeMotorPosition[0]], zoom: 15, speed: 1.2 });
      return;
    }

    if (customerCoords) {
      if (!customerMarkerRef.current) {
        customerMarkerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
          .setLngLat([customerCoords[1], customerCoords[0]])
          .addTo(map);
      } else {
        customerMarkerRef.current.setLngLat([customerCoords[1], customerCoords[0]]);
      }

      const fetchRealDrivingRoute = async () => {
        const start: [number, number] = [activeMotorPosition[1], activeMotorPosition[0]]; 
        const end: [number, number] = [customerCoords[1], customerCoords[0]]; 

        try {
          const queryRes = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          );
          const json = await queryRes.json();
          const routeData = json.routes[0];
          const routeCoordinates = routeData.geometry.coordinates;

          const actualRoadDistanceKm = parseFloat((routeData.distance / 1000).toFixed(1));
          setDistanceKm(actualRoadDistanceKm);
          setDeliveryFee(parseFloat((5 + actualRoadDistanceKm * 3.50).toFixed(2)));

          const geojsonLine = {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: routeCoordinates
            }
          };

          if (map.getSource('route')) {
            (map.getSource('route') as mapboxgl.GeoJSONSource).setData(geojsonLine);
          } else {
            map.addSource('route', { type: 'geojson', data: geojsonLine });
            
            map.addLayer({
              id: 'route-glow',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#4ade80', 'line-width': 10, 'line-opacity': 0.3 }
            });

            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#16a34a', 'line-width': 5, 'line-opacity': 0.9 }
            });
          }

          const bounds = new mapboxgl.LngLatBounds(start, start);
          for (const coord of routeCoordinates) {
            bounds.extend(coord as [number, number]);
          }
          map.fitBounds(bounds, { padding: 100, maxZoom: 15 });

        } catch (error) {
          console.error("Mapbox Directions API Error:", error);
        }
      };

      fetchRealDrivingRoute();
    }
  }, [activeMotorPosition, customerCoords, deliveryStep]);

  const handleApplyPromo = async () => {
    setPromoMessage({ text: '', isError: false });

    if (promoCodeInput.trim().toUpperCase() !== 'AIDFREE26') {
      setPromoMessage({ text: 'Invalid promotional code.', isError: true });
      return;
    }

    if (!userEmail.trim()) {
      setPromoMessage({ text: 'Please provide your email first to check promo eligibility.', isError: true });
      return;
    }

    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef, 
        where('userEmail', '==', userEmail.trim()),
        where('appliedPromo', '==', 'AIDFREE26')
      );
      
      const querySnapshot = await getDocs(q);
      let alreadyUsedThisWeek = false;

      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.createdAt) {
          const orderDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (orderDate >= startOfWeek) {
            alreadyUsedThisWeek = true;
          }
        }
      });

      if (alreadyUsedThisWeek) {
        setPromoMessage({ text: 'You have already used your free delivery for this week!', isError: true });
      } else {
        setAppliedPromo('AIDFREE26');
        setPromoMessage({ text: 'Code applied! Free delivery unlocked.', isError: false });
        setPromoCodeInput('');
      }
    } catch (err) {
      console.error("Promo verification error:", err);
      setPromoMessage({ text: 'Error verifying promo eligibility.', isError: true });
    }
  };

  const finalDeliveryFee = appliedPromo === 'AIDFREE26' ? 0 : deliveryFee;

  const handleInitiateOrderDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim() || !receiverPhone.trim() || phoneError || !customerCoords || !senderMomoName.trim()) return;

    setDeliveryStep('awaiting_confirmation');

    const pickupStops = involvedPharmacies.map(pharmName => ({
      pharmacyName: pharmName,
      coords: pharmacyLocationRegistry[pharmName] || [6.6745, -1.5716],
      items: groupedPharmaciesMap[pharmName].map(i => ({
        name: i.medicine.name,
        quantity: i.quantity,
        price: i.medicine.price
      }))
    }));

    try {
      for (const item of cartItems) {
        const medicineId = item.medicine?.id || item.id;
        const quantityBought = item.quantity || 1;

        if (medicineId) {
          const medRef = doc(db, 'medicines', medicineId);
          await updateDoc(medRef, {
            stock: increment(-quantityBought)
          });
        }
      }

      const orderRef = await addDoc(collection(db, 'orders'), {
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        userEmail: userEmail.trim(),
        deliveryAddress: selectedDestinationName || searchQuery,
        pharmacyName: involvedPharmacies.join(', '),
        pickupStops,
        deliveryFee: finalDeliveryFee,
        originalDeliveryFee: deliveryFee,
        appliedPromo: appliedPromo || null,
        totalPrice: totalPrice, 
        senderMomoName: senderMomoName.trim(),
        status: 'awaiting_vendor_confirmation', 
        pharmacyCoords,
        customerLocation: { lat: customerCoords[0], lng: customerCoords[1] },
        createdAt: serverTimestamp()
      });

      setCurrentOrderId(orderRef.id);
      localStorage.setItem(LOCAL_STORAGE_ORDER_KEY, orderRef.id);
      localStorage.setItem(LOCAL_STORAGE_PHARMACY_KEY, primaryPharmacy);
      setDeliveryStep('rider_selection');
      setAvailableRiders([]);
    } catch (err) {
      console.error(err);
      setDeliveryStep('details');
    }
  };

  useEffect(() => {
    if (!currentOrderId) return;
    const unsubscribe = onSnapshot(doc(db, 'orders', currentOrderId), async (docSnap) => {
      if (docSnap.exists()) {
        const orderData = docSnap.data();
        
        if (orderData.riderLocation) {
          setRiderLiveCoords([orderData.riderLocation.lat, orderData.riderLocation.lng]);
        }

        if (orderData.customerLocation && !customerCoords) {
          setCustomerCoords([orderData.customerLocation.lat, orderData.customerLocation.lng]);
        }

        if (orderData.chosenRiderId && !selectedRider) {
          setSelectedRider({
            id: orderData.chosenRiderId,
            name: orderData.chosenRiderName,
            phone: orderData.chosenRiderPhone,
            vehicleNumber: orderData.chosenRiderVehicleNumber,
          });
        }
        
        if (orderData.riderInfo?.id) {
          const riderDocRef = doc(db, 'deliverers', orderData.riderInfo.id);
          onSnapshot(riderDocRef, (riderSnap) => {
            if (riderSnap.exists()) {
              const liveRiderData = riderSnap.data();
              
              const activeDeliveries = liveRiderData.deliveries || liveRiderData.totalDeliveries || 0;
              if (activeDeliveries > 5) {
                setIsCompletingPreviousRide(true);
              }

              setAssignedRider({
                ...orderData.riderInfo,
                totalRatingsCount: liveRiderData.totalRatingsCount || 0,
                totalStarsAccumulated: liveRiderData.totalStarsAccumulated || 0
              });
            } else {
              setAssignedRider(orderData.riderInfo);
            }
          });
        }

        if (orderData.status === 'awaiting_vendor_confirmation') {
          setDeliveryStep('awaiting_confirmation');
        } else if (orderData.status === 'rider_selection') {
          setDeliveryStep('rider_selection');
        } else if (orderData.status === 'rider_selected') {
          setDeliveryStep('awaiting_rider_confirmation');
        } else if (orderData.status === 'searching_riders') {
          setDeliveryStep('searching');
        } else if (orderData.status === 'rider_assigned') {
          setDeliveryStep('assigned');
        } else if (orderData.status === 'arrived' || orderData.status === 'delivered') {
          setDeliveryStep('arrived');
        } else if (orderData.status === 'completed') {
          setDeliveryStep('completed');
        }
      } else {
        localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
        localStorage.removeItem(LOCAL_STORAGE_PHARMACY_KEY);
        setCurrentOrderId(null);
        setDeliveryStep('details');
      }
    });
    return () => unsubscribe();
  }, [currentOrderId, customerCoords, selectedRider]);

  const handleRatingSubmit = async () => {
    if (!selectedRating) return;
    if (currentOrderId) {
      try {
        await updateDoc(doc(db, 'orders', currentOrderId), {
          riderRating: selectedRating,
          status: 'completed'
        });

        if (assignedRider?.id) {
          const riderRef = doc(db, 'deliverers', assignedRider.id);
          await updateDoc(riderRef, {
            totalRatingsCount: increment(1),
            totalStarsAccumulated: increment(selectedRating)
          });
        }
      } catch (err) {
        console.error("Failed to commit star review score:", err);
      }
    }
    
    localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PHARMACY_KEY);
    setDeliveryStep('completed');
  };

  const handleReturnToPharmacies = () => {
    if (clearCart) clearCart();
    localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PHARMACY_KEY);
    navigate('/pharmacies');
  };

  const totalCount = assignedRider?.totalRatingsCount || 0;
  const totalStars = assignedRider?.totalStarsAccumulated || 0;
  const liveAssignedAverage = totalCount > 0 ? parseFloat((totalStars / totalCount).toFixed(1)) : 0;

  return (
    <div className="w-screen min-h-screen flex flex-col bg-white font-sans antialiased overflow-hidden relative md:h-screen md:flex-row">
      
      {/* 2-MINUTE RIDER TIMEOUT POPUP MODAL */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[3000] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Riders Unavailable</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Riders not available at the moment. Please try again after some time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTimeoutModal(false)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* LEFT PANEL SIDEBAR */}
      <div className="w-full md:w-[440px] h-auto min-h-[52vh] bg-white flex flex-col justify-between border-b border-gray-100 z-10 shadow-xl relative shrink-0 md:h-full md:border-b-0 md:border-r">
        
        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            {deliveryStep === 'details' && (
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-xl transition-colors border border-gray-200/60 bg-white shadow-sm flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="AidFidelis Logo" className="h-8 w-8 object-contain" />
              <div>
                <span className="text-sm font-black text-violet-700 block tracking-tight leading-none">AidFidelis</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Secure Checkout</span>
              </div>
            </div>
          </div>
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border border-gray-200/40">
            Fulfillment Portal
          </span>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {deliveryStep === 'details' && (
            <form onSubmit={handleInitiateOrderDispatch} className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Checkout & Delivery</h2>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Enter delivery details and confirm your vendor payment.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Receiver Name *</label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={e => setReceiverName(e.target.value)}
                    placeholder="e.g. Emmanuel Mawuli Wetta"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Receiver Contact Phone (Numbers Only) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={receiverPhone}
                    onChange={handlePhoneChange}
                    placeholder="e.g. 0596620696"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white font-mono"
                  />
                  {phoneError && <p className="text-[10px] font-bold text-red-600 mt-1">{phoneError}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email Address for Payment Receipt *</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="e.g. user@domain.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white font-mono"
                  />
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Fulfillment Drop-off Address *</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Search any location in Ghana..."
                      value={searchQuery}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-9 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                    />
                    {isSearchingLocations && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 text-violet-600 animate-spin" />
                    )}
                  </div>

                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-[220px] overflow-y-auto z-[2000] divide-y divide-gray-50">
                      {locationSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectLiveLocation(item)}
                          className="p-3 text-xs font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-800 cursor-pointer transition-colors flex items-start gap-2"
                        >
                          <MapPin className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.place_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-violet-600" /> Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value)}
                    placeholder="e.g. AIDFREE26"
                    className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage.text && (
                  <div className={`text-[11px] font-bold p-2.5 rounded-xl flex items-center gap-2 ${promoMessage.isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-violet-50 text-violet-800 border border-violet-100'}`}>
                    {promoMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    <span className="leading-tight">{promoMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Multi-Store Pickup Breakdown */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Multi-Store Pickup Itinerary ({involvedPharmacies.length})</span>
                <div className="space-y-2">
                  {involvedPharmacies.map((pharmName) => (
                    <div key={pharmName} className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                        <Store className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{pharmName}</span>
                      </div>
                      <ul className="pl-5 text-[11px] text-gray-600 list-disc space-y-0.5">
                        {groupedPharmaciesMap[pharmName].map((item, idx) => (
                          <li key={idx}>
                            {item.quantity}x {item.medicine.name} (GH₵{(item.medicine.price * item.quantity).toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Split Payment Calculation Box */}
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-violet-700" />
                  <h3 className="text-xs font-black text-violet-900 uppercase tracking-wider">Direct Pharmacy Transfer</h3>
                </div>
                
                <p className="text-[11px] text-violet-700 font-medium leading-relaxed bg-white/60 p-2.5 rounded-xl">
                  Please send exactly <strong className="font-mono text-sm text-violet-900">₵{totalPrice.toFixed(2)}</strong> to the pharmacy's Momo number below. <br/><br/>
                  <span className="text-gray-600">Note: Pay the <strong className="font-mono text-gray-900">₵{finalDeliveryFee.toFixed(2)}</strong> delivery fee directly to the rider upon arrival.</span>
                </p>

                <div className="space-y-2 pt-1">
                  {pharmacyMomoDetails.length > 0 ? (
                    pharmacyMomoDetails.map((pharm, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-violet-200 flex justify-between items-center shadow-sm">
                        <div>
                          <div className="text-xs font-bold text-gray-900">{pharm.name}</div>
                          <div className="text-[10px] text-gray-500 font-medium">Network: {pharm.momoNetwork || 'MTN'}</div>
                          <div className="text-[10px] text-violet-600 font-bold mt-0.5">Account Name: {pharm.momoName || 'Not Specified'}</div>
                        </div>
                        <div className="font-mono font-black text-violet-700 tracking-wider">
                          {pharm.momoNumber || '024XXXXXXX'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-3 rounded-xl border border-violet-200 flex justify-between items-center shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{primaryPharmacy}</div>
                        <div className="text-[10px] text-gray-500 font-medium">Network: MTN Mobile Money</div>
                        <div className="text-[10px] text-violet-600 font-bold mt-0.5">Account Name: Not Specified</div>
                      </div>
                      <div className="font-mono font-black text-violet-700 tracking-wider">
                        024 123 4567
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-black text-violet-800 uppercase tracking-wider mb-1.5">
                    Enter Sender's Momo Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderMomoName}
                    onChange={e => setSenderMomoName(e.target.value)}
                    placeholder="e.g. Emmanuel Mawuli Wetta"
                    className="w-full rounded-xl border border-violet-300 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!customerCoords || !receiverPhone.trim() || !!phoneError || !receiverName.trim() || !senderMomoName.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                Confirm Payment & Dispatch <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {deliveryStep === 'awaiting_confirmation' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-violet-600 mx-auto animate-spin" />
              <div>
                <h3 className="text-base font-bold text-gray-800">Verifying Payment...</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  Waiting for the pharmacy to confirm receipt of your Mobile Money transfer from <strong className="font-mono text-gray-900">{senderMomoName}</strong>. Once confirmed, a rider will be dispatched.
                </p>
              </div>
            </div>
          )}

          {deliveryStep === 'rider_selection' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">Choose a rider</h3>
                <p className="text-xs text-gray-500 mt-1">Available riders currently signed in to their portal are listed below.</p>
              </div>

              <div className="space-y-3">
                {availableRiders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
                    No active riders are online right now. Please try again in a moment.
                  </div>
                ) : (
                  availableRiders.map((rider) => (
                    <button
                      key={rider.id}
                      type="button"
                      onClick={() => handleChooseRider(rider)}
                      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
                    >
                      <div className="flex items-center gap-3">
                        <img src={rider.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={rider.name} className="h-12 w-12 rounded-2xl object-cover border border-gray-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-gray-900 truncate">{rider.name}</p>
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Online</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">{rider.vehicleNumber || 'Bike / Motor'} • {rider.phone || 'No phone listed'}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {deliveryStep === 'awaiting_rider_confirmation' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-violet-600 mx-auto animate-spin" />
              <div>
                <h3 className="text-base font-bold text-gray-800">Waiting for rider confirmation...</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedRider ? `Request sent to ${selectedRider.name}. Please wait for them to confirm the ride.` : 'Your rider request is pending confirmation.'}
                </p>
              </div>
            </div>
          )}

          {deliveryStep === 'searching' && (
            <div className="py-12 text-center space-y-4">
              <Compass className="h-10 w-10 text-violet-600 mx-auto animate-spin" />
              <div>
                <h3 className="text-base font-bold text-gray-800">Matching Nearby Riders...</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">Payment Confirmed! Broadcasting routing variables directly into active fleet operator nodes.</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
                  localStorage.removeItem(LOCAL_STORAGE_PHARMACY_KEY);
                  setCurrentOrderId(null);
                  setDeliveryStep('details');
                }} 
                className="text-xs text-red-500 hover:underline font-bold"
              >
                Abort Placement Request
              </button>
            </div>
          )}

          {deliveryStep === 'assigned' && assignedRider && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] font-black tracking-widest text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full uppercase">
                  Fulfillment Active
                </span>
                <h3 className="font-black text-gray-900 text-xl tracking-tight mt-2">Rider assigned to your order</h3>
                
                {isCompletingPreviousRide && (
                  <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Driver is completing a previous ride before heading to pickup.</span>
                  </div>
                )}

                <p className="text-xs text-gray-400 font-medium mt-2">
                  Estimated arrival time: <strong className="text-violet-700 font-mono text-sm">{simulatedEta} mins</strong>
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/80 rounded-3xl p-5 shadow-md space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={assignedRider.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt={assignedRider.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-1 rounded-full text-[9px] shadow">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-gray-900 text-base tracking-tight truncate">{assignedRider.name}</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 mt-1">
                      <Truck className="w-3 h-3" /> {assignedRider.vehicleNumber || 'Moto: GT-4592-24'}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Direct Contact</span>
                    {assignedRider.phone ? (
                      <a href={`tel:${assignedRider.phone}`} className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {assignedRider.phone}
                      </a>
                    ) : (
                      <span className="font-mono text-gray-600 font-bold">+233 59 662 0696</span>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Courier Rating</span>
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span className="font-black text-gray-900 font-mono text-xs">
                        {totalCount > 0 ? liveAssignedAverage.toFixed(1) : '4.9'}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold">({totalCount > 0 ? totalCount : '124'})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deliveryStep === 'arrived' && (
            <div className="py-6 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-12 h-12 bg-violet-50 border border-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Consignment Arrived!</h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Please pay the <strong className="font-mono text-gray-900">₵{finalDeliveryFee.toFixed(2)}</strong> delivery fare to the rider. Rate your driver below to complete the trip.
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setSelectedRating(stars)}
                    className={`transition-transform hover:scale-125 duration-150 ${
                      stars <= selectedRating ? 'text-amber-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>

              {selectedRating > 0 && (
                <button
                  type="button"
                  onClick={handleRatingSubmit}
                  className="w-full mt-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  Submit {selectedRating}-Star Rating <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {deliveryStep === 'completed' && (
            <div className="py-10 text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-violet-50 border border-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Thank You!</h2>
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">Your rating has been recorded successfully. Have a healthy day!</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleReturnToPharmacies}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  <Home className="w-4 h-4" /> Return to Pharmacies
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-50 text-[10px] text-gray-400 font-medium text-center bg-gray-50/20">
          AidFidelis Real-Time Distribution Encrypted System Node
        </div>
      </div>

      {/* RIGHT FULL SCREEN MAPBOX LIVE MAP */}
      <div className="relative flex-1 h-[42vh] min-h-[280px] bg-gray-100 z-0 md:h-full">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

export default DeliveryPage;