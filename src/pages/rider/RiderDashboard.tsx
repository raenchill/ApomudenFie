

// import React, { useState, useEffect, useRef } from 'react';
// import { db } from '../../firebase';
// import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, increment } from 'firebase/firestore';
// import { Truck, MapPin, Phone, User, CheckCircle2, Navigation, Compass, XCircle, LogIn, Store, Package, ArrowLeft, Lock } from 'lucide-react';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import logoImg from '/src/assets/Aidfidelis logo background.png';

// mapboxgl.accessToken = 'pk.eyJ1IjoiZW13ZXR0YSIsImEiOiJjbXM3MHZmNmUwYXhiMnZxc28wNDE3NmJ2In0.Jcjx7V74N8NECDZ1WWWqYA';

// const RiderDashboard: React.FC = () => {
//   const [currentRider, setCurrentRider] = useState<any>(null);
//   const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
//   const [allRiders, setAllRiders] = useState<any[]>([]);
//   const [availableJobs, setAvailableJobs] = useState<any[]>([]);
//   const [activeOrder, setActiveOrder] = useState<any>(null);
//   const [isSliderTracked, setIsSliderTracked] = useState(false);
//   const [deliveryCompleted, setDeliveryCompleted] = useState(false);
//   const [declinedJobIds, setDeclinedJobIds] = useState<string[]>([]);
//   const [currentRiderCoords, setCurrentRiderCoords] = useState<[number, number] | null>(null);
  
//   const [pendingRider, setPendingRider] = useState<any>(null);
//   const [pinInput, setPinInput] = useState('');
//   const [pinError, setPinError] = useState('');

//   const mapContainerRef = useRef<HTMLDivElement>(null);
//   const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
//   const motorMarkerRef = useRef<mapboxgl.Marker | null>(null);
//   const customerMarkerRef = useRef<mapboxgl.Marker | null>(null);

//   useEffect(() => {
//     const fetchRiders = async () => {
//       try {
//         const snap = await getDocs(collection(db, 'deliverers'));
//         setAllRiders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
//       } catch (err) {
//         console.error("Error fetching riders:", err);
//       }
//     };
//     fetchRiders();
//   }, []);

//   // Live Geolocation Watcher for Rider
//   useEffect(() => {
//     if (!activeOrder || !currentRider) return;

//     if ('geolocation' in navigator) {
//       const watcher = navigator.geolocation.watchPosition(
//         async (position) => {
//           const lat = position.coords.latitude;
//           const lng = position.coords.longitude;
//           const newCoords: [number, number] = [lat, lng];
//           setCurrentRiderCoords(newCoords);

//           try {
//             const orderRef = doc(db, 'orders', activeOrder.id);
//             await updateDoc(orderRef, {
//               riderLocation: { lat, lng }
//             });
//           } catch (err) {
//             console.error("Error updating rider location to firebase:", err);
//           }
//         },
//         (error) => {
//           console.error("Geolocation tracking error:", error);
//         },
//         { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
//       );

//       return () => navigator.geolocation.clearWatch(watcher);
//     }
//   }, [activeOrder, currentRider]);

//   const playChime = () => {
//     try {
//       const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
//       if (!AudioContext) return;
//       const ctx = new AudioContext();
//       const osc = ctx.createOscillator();
//       const gain = ctx.createGain();
//       osc.type = 'sine';
//       osc.frequency.setValueAtTime(600, ctx.currentTime);
//       gain.gain.setValueAtTime(0.1, ctx.currentTime);
//       gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
//       osc.connect(gain);
//       gain.connect(ctx.destination);
//       osc.start(); osc.stop(ctx.currentTime + 0.4);
//     } catch (e) {}
//   };

//   useEffect(() => {
//     if (!currentRider || !sessionStartTime) return;
    
//     const jobsQuery = query(collection(db, 'orders'), where('status', '==', 'searching_riders'));
//     const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
//       const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
//       const filtered = jobs.filter(j => {
//         const isNotDeclined = !declinedJobIds.includes(j.id);
//         const orderTime = (j as any).createdAt?.toDate ? (j as any).createdAt.toDate() : new Date(0);
//         const isNewOrder = orderTime >= sessionStartTime;
        
//         return isNotDeclined && isNewOrder;
//       });

//       if (filtered.length > availableJobs.length) playChime();
//       setAvailableJobs(filtered);
//     });
//     return () => unsubscribe();
//   }, [declinedJobIds, availableJobs.length, currentRider, sessionStartTime]);

//   const handleAcceptJob = async (orderId: string) => {
//     try {
//       const orderRef = doc(db, 'orders', orderId);
//       await updateDoc(orderRef, {
//         status: 'rider_assigned',
//         riderInfo: {
//           id: currentRider.id,
//           name: currentRider.name,
//           phone: currentRider.phone,
//           vehicleNumber: currentRider.vehicleNumber,
//           image: currentRider.image
//         }
//       });
//       const accepted = availableJobs.find(j => j.id === orderId);
//       if (accepted) {
//         setActiveOrder({ ...accepted, status: 'rider_assigned' });
//         setDeliveryCompleted(false);
//       }
//     } catch (err) { console.error(err); }
//   };

//   const handleCompleteTrip = async () => {
//     if (!activeOrder) return;
//     try {
//       await updateDoc(doc(db, 'orders', activeOrder.id), { status: 'arrived' });
      
//       if (currentRider && currentRider.id) {
//         const riderRef = doc(db, 'deliverers', currentRider.id);
//         await updateDoc(riderRef, {
//           totalDeliveries: increment(1),
//           deliveries: increment(1)
//         });
//       }

//       setDeliveryCompleted(true);
//     } catch (err) { console.error(err); }
//   };

//   const handleResetDashboard = () => {
//     setActiveOrder(null);
//     setIsSliderTracked(false);
//     setDeliveryCompleted(false);
//     setCurrentRiderCoords(null);
//   };

//   const handleDeclineLocalJob = (orderId: string) => {
//     setDeclinedJobIds(prev => [...prev, orderId]);
//     setAvailableJobs(prev => prev.filter(j => j.id !== orderId));
//   };

//   const handlePinSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const expectedPin = pendingRider.pin || '0000'; 
    
//     if (pinInput === expectedPin) {
//       setCurrentRider(pendingRider);
//       setSessionStartTime(new Date()); 
//       setPendingRider(null);
//       setPinInput('');
//       setPinError('');
//     } else {
//       setPinError('Incorrect PIN. Please try again.');
//       setPinInput('');
//     }
//   };

//   const activePharmacyCoords: [number, number] = activeOrder?.pharmacyCoords || [6.6745, -1.5716];
//   const activeCustomerCoords: [number, number] = activeOrder?.customerLocation ? [activeOrder.customerLocation.lat, activeOrder.customerLocation.lng] : [6.6731, -1.5657];
//   const currentMotorPosition = currentRiderCoords || activePharmacyCoords;

//   useEffect(() => {
//     if (!currentRider || !mapContainerRef.current) return;

//     const map = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/mapbox/light-v11',
//       center: [currentMotorPosition[1], currentMotorPosition[0]],
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
//   }, [currentRider]);

//   useEffect(() => {
//     if (!currentRider) return;
//     const map = mapInstanceRef.current;
//     if (!map) return;

//     if (!motorMarkerRef.current) {
//       const el = document.createElement('div');
//       el.className = 'custom-motor-marker';
//       el.innerHTML = `
//         <div style="background: #ffffff; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,0.25); border: 3px solid #16a34a;">
//           <img src="https://cdn-icons-png.flaticon.com/512/1048/1048313.png" style="width: 28px; height: 28px; object-fit: contain;" />
//         </div>
//       `;
      
//       motorMarkerRef.current = new mapboxgl.Marker(el)
//         .setLngLat([currentMotorPosition[1], currentMotorPosition[0]])
//         .addTo(map);
//     } else {
//       motorMarkerRef.current.setLngLat([currentMotorPosition[1], currentMotorPosition[0]]);
//     }

//     if (deliveryCompleted || !activeOrder) {
//       if (map.getLayer('route')) map.removeLayer('route');
//       if (map.getLayer('route-glow')) map.removeLayer('route-glow');
//       if (map.getSource('route')) map.removeSource('route');
//       if (customerMarkerRef.current) {
//         customerMarkerRef.current.remove();
//         customerMarkerRef.current = null;
//       }
//       map.flyTo({ center: [currentMotorPosition[1], currentMotorPosition[0]], zoom: 15, speed: 1.2 });
//       return;
//     }

//     if (activeOrder && !deliveryCompleted) {
//       if (!customerMarkerRef.current) {
//         customerMarkerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
//           .setLngLat([activeCustomerCoords[1], activeCustomerCoords[0]])
//           .addTo(map);
//       } else {
//         customerMarkerRef.current.setLngLat([activeCustomerCoords[1], activeCustomerCoords[0]]);
//       }

//       const fetchRealDrivingRoute = async () => {
//         const start: [number, number] = [currentMotorPosition[1], currentMotorPosition[0]]; 
//         const end: [number, number] = [activeCustomerCoords[1], activeCustomerCoords[0]]; 

//         try {
//           const queryRes = await fetch(
//             `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
//           );
//           const json = await queryRes.json();
//           const routeData = json.routes[0];
//           const routeCoordinates = routeData.geometry.coordinates;

//           const geojsonLine = {
//             type: 'Feature' as const,
//             properties: {},
//             geometry: {
//               type: 'LineString' as const,
//               coordinates: routeCoordinates
//             }
//           };

//           if (map.getSource('route')) {
//             (map.getSource('route') as mapboxgl.GeoJSONSource).setData(geojsonLine);
//           } else {
//             map.addSource('route', { type: 'geojson', data: geojsonLine });
            
//             map.addLayer({
//               id: 'route-glow',
//               type: 'line',
//               source: 'route',
//               layout: { 'line-join': 'round', 'line-cap': 'round' },
//               paint: { 'line-color': '#4ade80', 'line-width': 10, 'line-opacity': 0.3 }
//             });

//             map.addLayer({
//               id: 'route',
//               type: 'line',
//               source: 'route',
//               layout: { 'line-join': 'round', 'line-cap': 'round' },
//               paint: { 'line-color': '#16a34a', 'line-width': 5, 'line-opacity': 0.9 }
//             });
//           }

//           const bounds = new mapboxgl.LngLatBounds(start, start);
//           for (const coord of routeCoordinates) {
//             bounds.extend(coord as [number, number]);
//           }
//           map.fitBounds(bounds, { padding: 100, maxZoom: 15 });

//         } catch (error) {
//           console.error("Mapbox Directions API Error:", error);
//         }
//       };

//       fetchRealDrivingRoute();
//     }
//   }, [currentMotorPosition, activeOrder, deliveryCompleted, currentRider]);

//   if (!currentRider) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center relative overflow-hidden">
          
//           {!pendingRider ? (
//             <div className="animate-in fade-in duration-300">
//               <img src={logoImg} alt="Logo" className="h-16 w-16 mx-auto mb-6" />
//               <h2 className="text-xl font-black text-gray-900 mb-6">Select Your Rider Profile</h2>
//               <div className="space-y-3">
//                 {allRiders.map(r => (
//                   <button 
//                     key={r.id} 
//                     onClick={() => {
//                       setPendingRider(r);
//                       setPinError('');
//                       setPinInput('');
//                     }} 
//                     className="w-full flex items-center gap-3 p-3 hover:bg-violet-50 rounded-xl border border-gray-100 transition-all text-left cursor-pointer"
//                   >
//                     <img src={r.image} className="w-10 h-10 rounded-full object-cover" />
//                     <div>
//                       <div className="text-sm font-bold">{r.name}</div>
//                       <div className="text-[10px] text-gray-400 font-mono">{r.vehicleNumber}</div>
//                     </div>
//                     <LogIn className="ml-auto w-4 h-4 text-violet-600" />
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="animate-in slide-in-from-right-4 duration-300">
//               <button 
//                 onClick={() => setPendingRider(null)} 
//                 className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
              
//               <div className="pt-6">
//                 <img src={pendingRider.image} className="h-20 w-20 rounded-full object-cover border-4 border-violet-50 mx-auto mb-4 shadow-sm" />
//                 <h2 className="text-xl font-black text-gray-900 tracking-tight">Welcome back!</h2>
//                 <p className="text-xs text-gray-500 mb-6">Enter your 4-digit PIN to access dispatch.</p>
                
//                 <form onSubmit={handlePinSubmit} className="space-y-4">
//                   <div className="relative max-w-[200px] mx-auto">
//                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="password"
//                       maxLength={4}
//                       value={pinInput}
//                       onChange={(e) => {
//                         setPinInput(e.target.value.replace(/\D/g, ''));
//                         setPinError('');
//                       }}
//                       className={`w-full text-center tracking-[0.5em] font-mono text-xl py-3 pl-10 pr-4 rounded-xl border ${pinError ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-200 bg-gray-50 focus:ring-violet-500'} focus:outline-none focus:ring-2 transition-all`}
//                       placeholder="••••"
//                       autoFocus
//                       required
//                     />
//                   </div>
                  
//                   {pinError && <p className="text-xs text-red-600 font-bold">{pinError}</p>}
                  
//                   <button 
//                     type="submit"
//                     className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md mt-4 cursor-pointer"
//                   >
//                     Verify & Login
//                   </button>
//                 </form>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-screen h-screen flex bg-gray-50 font-sans antialiased overflow-hidden">
//       <div className="w-full md:w-[420px] h-full bg-white flex flex-col justify-between border-r border-gray-100 z-10 shadow-xl shrink-0">
//         <header className="bg-white border-b border-gray-50 px-6 py-4 flex items-center justify-between bg-gray-50/50">
//           <div className="flex items-center gap-2">
//             <img src={currentRider.image} className="h-9 w-9 rounded-lg object-cover" />
//             <div>
//               <span className="text-sm font-black text-violet-700 block leading-none">{currentRider.name}</span>
//               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Driver Gateway</span>
//             </div>
//           </div>
//           <button 
//             onClick={() => {
//               setCurrentRider(null);
//               setSessionStartTime(null);
//               setActiveOrder(null);
//               setDeliveryCompleted(false);
//             }} 
//             className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-1 rounded cursor-pointer"
//           >
//             Logout
//           </button>
//         </header>

//         <div className="p-6 flex-1 overflow-y-auto space-y-6">
//           {!activeOrder ? (
//             <>
//               <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Available Requests</h2>
//               {availableJobs.length === 0 ? (
//                 <div className="text-center py-10">
//                   <p className="text-sm text-gray-500">No new delivery requests since you logged in.</p>
//                 </div>
//               ) : (
//                 availableJobs.map(job => (
//                   <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
//                     <div className="text-xs space-y-1 text-gray-800">
//                       <div><span className="text-gray-400 block text-[9px] uppercase">Pickup Pharmacies</span><strong>{job.pharmacyName}</strong></div>
//                       <div className="pt-1.5"><span className="text-gray-400 block text-[9px] uppercase">Drop-off Target</span><strong>{job.deliveryAddress}</strong></div>
//                     </div>
//                     <div className="flex justify-end items-center pt-2 border-t border-gray-50">
//                       <div className="flex gap-2">
//                         <button onClick={() => handleDeclineLocalJob(job.id)} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl border border-gray-200 transition-colors cursor-pointer">
//                           <XCircle className="w-4 h-4" />
//                         </button>
//                         <button onClick={() => handleAcceptJob(job.id)} className="px-3 py-1.5 bg-violet-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm hover:bg-violet-700 transition-colors cursor-pointer">
//                           <Navigation className="w-3 h-3 rotate-45" /> Accept
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </>
//           ) : deliveryCompleted ? (
//             <div className="py-12 text-center space-y-4">
//               <div className="w-16 h-16 bg-violet-50 border border-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
//                 <CheckCircle2 className="w-8 h-8" />
//               </div>
//               <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Delivery Has Been Completed</h3>
//               <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">Consignment successfully handed over to recipient. Waiting for next dispatch assignment.</p>
//               <button 
//                 onClick={handleResetDashboard}
//                 className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
//               >
//                 Return to Job Queue
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-5">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-extrabold text-gray-900 text-base">Active Trip Itinerary</h3>
//                 <span className="text-[10px] font-black uppercase bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded border border-violet-100">En Route</span>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
//                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Pickup Manifest Stops</span>
//                 {activeOrder.pickupStops && activeOrder.pickupStops.length > 0 ? (
//                   <div className="space-y-2.5">
//                     {activeOrder.pickupStops.map((stop: any, index: number) => (
//                       <div key={index} className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs space-y-1.5">
//                         <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
//                           <Store className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
//                           <span>Stop {index + 1}: {stop.pharmacyName}</span>
//                         </div>
//                         <ul className="pl-5 text-[11px] text-gray-600 list-disc space-y-0.5 font-medium">
//                           {stop.items.map((item: any, i: number) => (
//                             <li key={i}>
//                               <strong className="text-gray-900">{item.quantity}x</strong> {item.name}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-xs text-gray-700">
//                     <p>• <strong>Pickup Location:</strong> {activeOrder.pharmacyName}</p>
//                   </div>
//                 )}

//                 <div className="border-t border-gray-200 pt-2.5 mt-2 text-xs space-y-1 text-gray-700">
//                   <p>• <strong>Final Drop-off Target:</strong> {activeOrder.deliveryAddress}</p>
//                   <p>• <strong>Recipient:</strong> {activeOrder.receiverName}</p>
//                   {activeOrder.receiverPhone && (
//                     <p>
//                       • <strong>Phone:</strong>{' '}
//                       <a href={`tel:${activeOrder.receiverPhone}`} className="text-blue-600 font-mono font-bold hover:underline">
//                         {activeOrder.receiverPhone}
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="w-full h-14 bg-gray-100 rounded-2xl p-1.5 relative border flex items-center overflow-hidden">
//                 <div className="absolute left-0 top-0 bottom-0 bg-violet-600 rounded-2xl transition-all duration-300" style={{ width: isSliderTracked ? '100%' : '56px' }} />
//                 <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-400 uppercase z-10">{isSliderTracked ? "Completing..." : "Swipe to finish"}</div>
//                 <input 
//                   type="range" 
//                   min="0" 
//                   max="100" 
//                   value={isSliderTracked ? 100 : 0}
//                   onChange={e => { if(e.target.value === '100') { setIsSliderTracked(true); handleCompleteTrip(); } }} 
//                   className="absolute inset-0 opacity-0 cursor-grab w-full h-full z-20" 
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="flex-1 h-full bg-gray-100 z-0 relative">
//         <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
//       </div>
//     </div>
//   );
// };

// export default RiderDashboard;

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, increment } from 'firebase/firestore';
import { CheckCircle2, Navigation, XCircle, LogIn, Store, ArrowLeft, Lock } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import logoImg from '/src/assets/Aidfidelis logo background.png';

mapboxgl.accessToken = 'pk.eyJ1IjoiZW13ZXR0YSIsImEiOiJjbXM3MHZmNmUwYXhiMnZxc28wNDE3NmJ2In0.Jcjx7V74N8NECDZ1WWWqYA';

const RiderDashboard: React.FC = () => {
  const [currentRider, setCurrentRider] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isSliderTracked, setIsSliderTracked] = useState(false);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [declinedJobIds, setDeclinedJobIds] = useState<string[]>([]);
  const [currentRiderCoords, setCurrentRiderCoords] = useState<[number, number] | null>(null);
  
  const [pendingRider, setPendingRider] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const motorMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const customerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const snap = await getDocs(collection(db, 'deliverers'));
        setAllRiders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching riders:", err);
      }
    };
    fetchRiders();
  }, []);

  // Live Geolocation Watcher for Rider
  useEffect(() => {
    if (!activeOrder || !currentRider) return;

    if ('geolocation' in navigator) {
      const watcher = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newCoords: [number, number] = [lat, lng];
          setCurrentRiderCoords(newCoords);

          try {
            const orderRef = doc(db, 'orders', activeOrder.id);
            await updateDoc(orderRef, {
              riderLocation: { lat, lng }
            });
          } catch (err) {
            console.error("Error updating rider location to firebase:", err);
          }
        },
        (error) => {
          console.error("Geolocation tracking error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watcher);
    }
  }, [activeOrder, currentRider]);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  useEffect(() => {
    if (!currentRider || !sessionStartTime) return;

    const jobsQuery = query(collection(db, 'orders'), where('status', 'in', ['searching_riders', 'rider_selected']));
    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobs: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filtered = jobs.filter((j: any) => {
        const isNotDeclined = !declinedJobIds.includes(j.id);
        const orderTime = (j as any).createdAt?.toDate ? (j as any).createdAt.toDate() : new Date(0);
        const isNewOrder = orderTime >= sessionStartTime;
        const isTargetedToThisRider = j.status === 'rider_selected' && j.chosenRiderId === currentRider.id;
        const isGeneralAvailable = j.status === 'searching_riders';

        return isNotDeclined && isNewOrder && (isGeneralAvailable || isTargetedToThisRider);
      });

      if (filtered.length > availableJobs.length) playChime();
      setAvailableJobs(filtered);
    });
    return () => unsubscribe();
  }, [declinedJobIds, availableJobs.length, currentRider, sessionStartTime]);

  const handleAcceptJob = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'rider_assigned',
        riderInfo: {
          id: currentRider.id,
          name: currentRider.name,
          phone: currentRider.phone,
          vehicleNumber: currentRider.vehicleNumber,
          image: currentRider.image
        }
      });
      const accepted = availableJobs.find(j => j.id === orderId);
      if (accepted) {
        setActiveOrder({ ...accepted, status: 'rider_assigned' });
        setDeliveryCompleted(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleCompleteTrip = async () => {
    if (!activeOrder) return;
    try {
      await updateDoc(doc(db, 'orders', activeOrder.id), { status: 'arrived' });
      
      if (currentRider && currentRider.id) {
        const riderRef = doc(db, 'deliverers', currentRider.id);
        await updateDoc(riderRef, {
          totalDeliveries: increment(1),
          deliveries: increment(1)
        });
      }

      setDeliveryCompleted(true);
    } catch (err) { console.error(err); }
  };

  const handleResetDashboard = () => {
    setActiveOrder(null);
    setIsSliderTracked(false);
    setDeliveryCompleted(false);
    setCurrentRiderCoords(null);
  };

  const handleDeclineLocalJob = (orderId: string) => {
    setDeclinedJobIds(prev => [...prev, orderId]);
    setAvailableJobs(prev => prev.filter(j => j.id !== orderId));
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPin = pendingRider.pin || '0000'; 
    
    if (pinInput === expectedPin) {
      setCurrentRider(pendingRider);
      setSessionStartTime(new Date()); 
      setPendingRider(null);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Authorization denied.');
      setPinInput('');
    }
  };

  const activePharmacyCoords: [number, number] = activeOrder?.pharmacyCoords || [6.6745, -1.5716];
  const activeCustomerCoords: [number, number] = activeOrder?.customerLocation ? [activeOrder.customerLocation.lat, activeOrder.customerLocation.lng] : [6.6731, -1.5657];
  const currentMotorPosition = currentRiderCoords || activePharmacyCoords;

  useEffect(() => {
    if (!currentRider || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [currentMotorPosition[1], currentMotorPosition[0]],
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
  }, [currentRider]);

  useEffect(() => {
    if (!currentRider) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!motorMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-motor-marker';
      el.innerHTML = `
        <div style="background: #ffffff; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,0.25); border: 3px solid #16a34a;">
          <img src="https://cdn-icons-png.flaticon.com/512/1048/1048313.png" style="width: 28px; height: 28px; object-fit: contain;" />
        </div>
      `;
      
      motorMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat([currentMotorPosition[1], currentMotorPosition[0]])
        .addTo(map);
    } else {
      motorMarkerRef.current.setLngLat([currentMotorPosition[1], currentMotorPosition[0]]);
    }

    if (deliveryCompleted || !activeOrder) {
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getLayer('route-glow')) map.removeLayer('route-glow');
      if (map.getSource('route')) map.removeSource('route');
      if (customerMarkerRef.current) {
        customerMarkerRef.current.remove();
        customerMarkerRef.current = null;
      }
      map.flyTo({ center: [currentMotorPosition[1], currentMotorPosition[0]], zoom: 15, speed: 1.2 });
      return;
    }

    if (activeOrder && !deliveryCompleted) {
      if (!customerMarkerRef.current) {
        customerMarkerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
          .setLngLat([activeCustomerCoords[1], activeCustomerCoords[0]])
          .addTo(map);
      } else {
        customerMarkerRef.current.setLngLat([activeCustomerCoords[1], activeCustomerCoords[0]]);
      }

      const fetchRealDrivingRoute = async () => {
        const start: [number, number] = [currentMotorPosition[1], currentMotorPosition[0]]; 
        const end: [number, number] = [activeCustomerCoords[1], activeCustomerCoords[0]]; 

        try {
          const queryRes = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          );
          const json = await queryRes.json();
          const routeData = json.routes[0];
          const routeCoordinates = routeData.geometry.coordinates;

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
  }, [currentMotorPosition, activeOrder, deliveryCompleted, currentRider]);

  if (!currentRider) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient High-Tech Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Subtle Grid Map Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

        {/* Glassmorphism Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center relative z-10">
          
          {!pendingRider ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-950 border border-slate-800 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner">
                <img src={logoImg} alt="Logo" className="h-12 w-12 object-contain" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Fleet Terminal</h2>
              <p className="text-slate-400 text-xs font-medium mb-8">Select your operator node to initialize session.</p>
              
              <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {allRiders.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => {
                      setPendingRider(r);
                      setPinError('');
                      setPinInput('');
                    }} 
                    className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 hover:bg-violet-900/20 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 text-left cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.2)]"
                  >
                    <div className="relative">
                      <img src={r.image} className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 group-hover:border-violet-500/50 transition-colors" />
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-violet-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">{r.vehicleNumber}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center group-hover:bg-violet-500/20 group-hover:border-violet-500/50 transition-colors">
                      <LogIn className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setPendingRider(null)} 
                className="absolute top-6 left-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="pt-6">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-20"></div>
                  <img src={pendingRider.image} className="relative w-full h-full rounded-full object-cover border-4 border-slate-800 shadow-xl" />
                </div>
                
                <h2 className="text-xl font-black text-white tracking-tight">Identity Verification</h2>
                <p className="text-xs text-violet-400/80 mb-8 mt-1 font-mono uppercase tracking-widest">{pendingRider.vehicleNumber}</p>
                
                <form onSubmit={handlePinSubmit} className="space-y-6">
                  <div className="relative max-w-[220px] mx-auto">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${pinError ? 'text-red-400' : 'text-slate-500'}`} />
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value.replace(/\D/g, ''));
                        setPinError('');
                      }}
                      className={`w-full text-center tracking-[1em] font-mono text-2xl py-4 pl-12 pr-4 rounded-2xl border ${pinError ? 'border-red-500/50 bg-red-500/10 text-red-400 focus:ring-red-500/50' : 'border-slate-700 bg-slate-950/50 text-violet-400 focus:ring-violet-500/50 focus:border-violet-500'} focus:outline-none focus:ring-2 transition-all backdrop-blur-sm`}
                      placeholder="••••"
                      autoFocus
                      required
                    />
                  </div>
                  
                  {pinError && <p className="text-xs text-red-400 font-bold bg-red-500/10 py-2 px-4 rounded-lg inline-block border border-red-500/20">{pinError}</p>}
                  
                  <button 
                    type="submit"
                    className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 font-black text-sm py-4 rounded-2xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 mt-2 cursor-pointer"
                  >
                    Authorize Access
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex bg-gray-50 font-sans antialiased overflow-hidden">
      <div className="w-full md:w-[420px] h-full bg-white flex flex-col justify-between border-r border-gray-100 z-10 shadow-xl shrink-0">
        <header className="bg-white border-b border-gray-50 px-6 py-4 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <img src={currentRider.image} className="h-9 w-9 rounded-lg object-cover" />
            <div>
              <span className="text-sm font-black text-violet-700 block leading-none">{currentRider.name}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Driver Gateway</span>
            </div>
          </div>
          <button 
            onClick={() => {
              setCurrentRider(null);
              setSessionStartTime(null);
              setActiveOrder(null);
              setDeliveryCompleted(false);
            }} 
            className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-1 rounded cursor-pointer"
          >
            Logout
          </button>
        </header>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {!activeOrder ? (
            <>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Available Requests</h2>
              {availableJobs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500">No new delivery requests since you logged in.</p>
                </div>
              ) : (
                availableJobs.map(job => (
                  <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="text-xs space-y-1 text-gray-800">
                      <div><span className="text-gray-400 block text-[9px] uppercase">Pickup Pharmacies</span><strong>{job.pharmacyName}</strong></div>
                      <div className="pt-1.5"><span className="text-gray-400 block text-[9px] uppercase">Drop-off Target</span><strong>{job.deliveryAddress}</strong></div>
                    </div>
                    <div className="flex justify-end items-center pt-2 border-t border-gray-50">
                      <div className="flex gap-2">
                        <button onClick={() => handleDeclineLocalJob(job.id)} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl border border-gray-200 transition-colors cursor-pointer">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAcceptJob(job.id)} className="px-3 py-1.5 bg-violet-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm hover:bg-violet-700 transition-colors cursor-pointer">
                          <Navigation className="w-3 h-3 rotate-45" /> Accept
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : deliveryCompleted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-violet-50 border border-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Delivery Has Been Completed</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">Consignment successfully handed over to recipient. Waiting for next dispatch assignment.</p>
              <button 
                onClick={handleResetDashboard}
                className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Return to Job Queue
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-base">Active Trip Itinerary</h3>
                <span className="text-[10px] font-black uppercase bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded border border-violet-100">En Route</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Pickup Manifest Stops</span>
                {activeOrder.pickupStops && activeOrder.pickupStops.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeOrder.pickupStops.map((stop: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                          <Store className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Stop {index + 1}: {stop.pharmacyName}</span>
                        </div>
                        <ul className="pl-5 text-[11px] text-gray-600 list-disc space-y-0.5 font-medium">
                          {stop.items.map((item: any, i: number) => (
                            <li key={i}>
                              <strong className="text-gray-900">{item.quantity}x</strong> {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-700">
                    <p>• <strong>Pickup Location:</strong> {activeOrder.pharmacyName}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2.5 mt-2 text-xs space-y-1 text-gray-700">
                  <p>• <strong>Final Drop-off Target:</strong> {activeOrder.deliveryAddress}</p>
                  <p>• <strong>Recipient:</strong> {activeOrder.receiverName}</p>
                  {activeOrder.receiverPhone && (
                    <p>
                      • <strong>Phone:</strong>{' '}
                      <a href={`tel:${activeOrder.receiverPhone}`} className="text-blue-600 font-mono font-bold hover:underline">
                        {activeOrder.receiverPhone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full h-14 bg-gray-100 rounded-2xl p-1.5 relative border flex items-center overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 bg-violet-600 rounded-2xl transition-all duration-300" style={{ width: isSliderTracked ? '100%' : '56px' }} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-400 uppercase z-10">{isSliderTracked ? "Completing..." : "Swipe to finish"}</div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={isSliderTracked ? 100 : 0}
                  onChange={e => { if(e.target.value === '100') { setIsSliderTracked(true); handleCompleteTrip(); } }} 
                  className="absolute inset-0 opacity-0 cursor-grab w-full h-full z-20" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 h-full bg-gray-100 z-0 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

export default RiderDashboard;