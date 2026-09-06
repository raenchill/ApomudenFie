

// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { db } from '../../firebase';
// import { collection, addDoc, serverTimestamp, onSnapshot, query, where, getDocs } from 'firebase/firestore';
// import { Loader2, Camera, Image as ImageIcon, Clock, ShieldCheck, ArrowRight, Eye, EyeOff, ShieldAlert, FileText, CheckCircle2, XCircle } from 'lucide-react';
// import logoImg from '/src/assets/Aidfidelis logo background.png';

// const PharmacyRegisterPage: React.FC = () => {
//   const navigate = useNavigate();
//   const [submitting, setSubmitting] = useState(false);
//   const [submittedSuccess, setSubmittedSuccess] = useState(false);
//   const [registeredPharmacyId, setRegisteredPharmacyId] = useState<string | null>(null);
//   const [isApproved, setIsApproved] = useState(false);
//   const [isRejected, setIsRejected] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [error, setError] = useState('');

//   // Form Fields
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [location, setLocation] = useState('');
//   const [region, setRegion] = useState('Accra');
  
//   // Strict Security & Regulatory Credentials & Dispatch Time
//   const [councilLicenseNumber, setCouncilLicenseNumber] = useState('');
//   const [pharmacistInCharge, setPharmacistInCharge] = useState('');
//   const [workingHours, setWorkingHours] = useState('08:00 AM - 10:00 PM');
//   const [daysOpen, setDaysOpen] = useState('Monday - Saturday');
//   const [riders, setRiders] = useState('5 mins dispatch');

//   const [pharmacyImage, setPharmacyImage] = useState<string | null>(null);

//   // Eye Toggle States
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   useEffect(() => {
//     if (!registeredPharmacyId) return;

//     const unsubscribe = onSnapshot(collection(db, 'pharmacies'), (snapshot) => {
//       const docItem = snapshot.docs.find(d => d.id === registeredPharmacyId);
//       if (docItem) {
//         const data = docItem.data();
//         if (data.isApproved === true) {
//           setIsApproved(true);
//           setIsRejected(false);
//           localStorage.setItem('approvedPharmacyName', data.name);
//         } else if (data.isRejected === true) {
//           setIsRejected(true);
//           setIsApproved(false);
//           setRejectionReason(data.rejectionReason || 'No specific reason provided.');
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [registeredPharmacyId]);

//   const compressImage = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       const img = new Image();
//       img.onload = () => {
//         try {
//           const maxSize = 400;
//           let width = img.width;
//           let height = img.height;
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
//           resolve(canvas.toDataURL('image/jpeg', 0.7));
//         } catch (e) { reject(e); }
//       };
//       img.onerror = (err) => reject(err);
//       img.src = URL.createObjectURL(file);
//     });
//   };

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       try {
//         const compressed = await compressImage(file);
//         setPharmacyImage(compressed);
//       } catch (err) {
//         console.error('Image compression issue:', err);
//         setPharmacyImage(URL.createObjectURL(file));
//       }
//     }
//   };

//   // Strict Ghana Phone Number Validation (Only digits, exactly 10 digits starting with 0)
//   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value.replace(/\D/g, ''); 

//     if (val.length > 0) {
//       if (val[0] !== '0') {
//         val = ''; 
//       } else if (val.length > 1 && !['2', '5', '3', '9'].includes(val[1])) {
//         val = val.substring(0, 1); 
//       }
//     }

//     setPhone(val.slice(0, 10)); 
//   };

//   // Strict Pharmacy Council License Format Handler (Format: PC/REG/YYYY/#####)
//   const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value.toUpperCase();
//     setCouncilLicenseNumber(val);
//   };

//   const isLicenseValid = (license: string) => {
//     const regex = /^PC\/REG\/\d{4}\/\d+$/;
//     return regex.test(license);
//   };

//   const handlePharmacyRegistration = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!name.trim() || !location.trim() || !phone.trim() || !councilLicenseNumber.trim() || !pharmacistInCharge.trim() || !password.trim() || !confirmPassword.trim()) {
//       setError('Please fill in all required security and store details.');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     if (!pharmacyImage) {
//       setError('Please upload a storefront photo of your pharmacy to proceed.');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     if (!isLicenseValid(councilLicenseNumber.trim())) {
//       setError('Invalid Pharmacy Council License format. Required format: PC/REG/YYYY/XXXXX (e.g. PC/REG/2026/01492)');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     if (phone.length !== 10) {
//       setError('Please enter a valid 10-digit Ghana phone number (e.g., 0596620696).');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError('Passwords do not match. Please check again.');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     setSubmitting(true);
//     setError('');

//     try {
//       const passwordQuery = query(collection(db, 'pharmacies'), where('password', '==', password.trim()));
//       const passwordSnapshot = await getDocs(passwordQuery);
      
//       if (!passwordSnapshot.empty) {
//         setError('This password is already in use by another account. For security purposes, please choose a unique password.');
//         setSubmitting(false);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         return;
//       }

//       const docRef = await addDoc(collection(db, 'pharmacies'), {
//         name: name.trim(),
//         email: email.trim(),
//         phone: phone.trim(),
//         password: password.trim(), 
//         location: location.trim(),
//         region,
//         councilLicenseNumber: councilLicenseNumber.trim(), 
//         pharmacistInCharge: pharmacistInCharge.trim(),    
//         workingHours: `${workingHours} (${daysOpen})`,    
//         timing: `${workingHours}`,
//         riders: riders,
//         rating: 5.0,
//         isApproved: false, 
//         isRejected: false,
//         isVerified: false,
//         image: pharmacyImage,
//         createdAt: serverTimestamp()
//       });

//       setRegisteredPharmacyId(docRef.id);
//       setSubmittedSuccess(true);
//     } catch (err) {
//       console.error('Error registering pharmacy:', err);
//       setError('Failed to submit registration application. Please try again.');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (submittedSuccess) {
//     return (
//       <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
//         <div className="absolute inset-0 z-0 pointer-events-none">
//           <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]"></div>
//         </div>
//         <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center space-y-6 relative z-10 border border-slate-100">
          
//           {isRejected ? (
//             <>
//               <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-inner">
//                 <XCircle className="w-8 h-8" />
//               </div>
//               <div className="space-y-2">
//                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Registration Declined</h2>
//                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
//                   Unfortunately, your store application for <strong className="text-slate-800">{name}</strong> has been declined by the AidFidelis Admin team.
//                 </p>
//               </div>
//               <div className="p-4 bg-red-50/80 border border-red-200/60 rounded-2xl text-left space-y-1">
//                 <span className="text-[10px] font-black uppercase text-red-700 tracking-wider block">Reason for Rejection:</span>
//                 <p className="text-xs text-red-900 font-semibold">{rejectionReason}</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => { setSubmittedSuccess(false); setRegisteredPharmacyId(null); setIsRejected(false); }}
//                 className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
//               >
//                 Modify Application & Resubmit
//               </button>
//             </>
//           ) : !isApproved ? (
//             <>
//               <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
//                 <Clock className="w-8 h-8 animate-pulse" />
//               </div>
//               <div className="space-y-2">
//                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Review in Progress</h2>
//                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
//                   Your store registration for <strong className="text-slate-800">{name}</strong> along with your verified Pharmacy Council credentials have been logged for audit by the AidFidelis Admin team.
//                 </p>
//               </div>
//               <div className="p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-amber-800 shadow-sm">
//                 <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> Verifying license credentials...
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto border border-violet-100 shadow-inner">
//                 <ShieldCheck className="w-8 h-8" />
//               </div>
//               <div className="space-y-2">
//                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Store Verified & Approved!</h2>
//                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
//                   Your security credentials have been cleared. You can now access your management portal.
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => navigate('/pharmacy-login')}
//                 className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
//               >
//                 Proceed to Pharmacy Login <ArrowRight className="w-4 h-4" />
//               </button>
//             </>
//           )}

//           {!isRejected && (
//             <div className="pt-3 border-t border-slate-100">
//               <button type="button" onClick={() => navigate('/pharmacy-login')} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
//                 Return to Login Portal
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
//       <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
//         <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[60%] rounded-full bg-violet-600/15 blur-[150px]"></div>
//         <div className="absolute bottom-0 -left-[10%] w-[40%] h-[50%] rounded-full bg-indigo-600/15 blur-[150px]"></div>
//       </div>

//       <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 mb-6">
//         <div className="flex flex-col items-center justify-center gap-2 mb-3">
//           <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
//             <img src={logoImg} alt="Logo" className="h-12 w-12 object-contain" />
//           </div>
//           <span className="text-xl font-black text-white tracking-tight">AidFidelis Partner Network</span>
//         </div>
//         <h2 className="text-2xl font-black text-white tracking-tight">Secure Pharmacy Registration</h2>
//         <p className="text-xs font-semibold text-slate-400 mt-1">Provide legal storefront details and strict regulatory credentials.</p>
//       </div>

//       <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
//         <div className="bg-white py-8 px-6 shadow-2xl border border-slate-100 rounded-3xl sm:px-10">
          
//           {error && (
//             <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
//               <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
//             </div>
//           )}

//           <form onSubmit={handlePharmacyRegistration} className="space-y-5">
            
//             {/* Storefront Image Upload */}
//             <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
//               {pharmacyImage ? (
//                 <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
//                   <img src={pharmacyImage} alt="Preview" className="w-full h-full object-cover" />
//                   <label className="absolute bottom-1 right-1 bg-violet-600 text-white p-1 rounded-lg cursor-pointer shadow-md">
//                     <Camera className="w-3.5 h-3.5" />
//                     <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
//                   </label>
//                 </div>
//               ) : (
//                 <label className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-violet-600 transition-colors py-2">
//                   <ImageIcon className="w-8 h-8 stroke-[1.5]" />
//                   <span className="text-xs font-extrabold tracking-wide">Upload Pharmacy Storefront Photo *</span>
//                   <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
//                 </label>
//               )}
//             </div>

//             {/* Basic Store Info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Pharmacy Legal Name *</label>
//                 <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MedFront Pharmacy Ltd" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Operational Region *</label>
//                 <select value={region} onChange={e => setRegion(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
//                   <option value="Accra">Accra Metropolis</option>
//                   <option value="Kumasi">Kumasi Hub</option>
//                   <option value="Takoradi">Takoradi Hub</option>
//                   <option value="Tamale">Tamale Hub</option>
//                 </select>
//               </div>
//             </div>

//             {/* Strict Regulatory Credentials with Format Enforcement */}
//             <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 text-violet-800 text-xs font-extrabold">
//                   <FileText className="w-4 h-4 text-violet-600" /> Mandatory Security & Regulatory Credentials
//                 </div>
//                 {councilLicenseNumber && isLicenseValid(councilLicenseNumber) && (
//                   <span className="text-[10px] font-bold text-violet-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-violet-200">
//                     <CheckCircle2 className="w-3 h-3" /> Format Valid
//                   </span>
//                 )}
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Pharmacy Council License *</label>
//                   <input 
//                     type="text" 
//                     required 
//                     value={councilLicenseNumber} 
//                     onChange={handleLicenseChange} 
//                     placeholder="e.g. PC/REG/2026/01492" 
//                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white font-mono uppercase focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" 
//                   />
//                   <span className="text-[9px] text-slate-400 mt-1 block font-medium">Strict Format: PC/REG/YYYY/XXXXX</span>
//                 </div>
//                 <div>
//                   <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Pharmacist In-Charge Name *</label>
//                   <input type="text" required value={pharmacistInCharge} onChange={e => setPharmacistInCharge(e.target.value)} placeholder="e.g. Pharm. Kofi Mensah" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
//                 </div>
//               </div>
//             </div>

//             {/* Contact Details with Ghana Phone Restriction */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Business Email *</label>
//                 <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="pharmacy@domain.com" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Ghana Phone Number * (10 Digits)</label>
//                 <input 
//                   type="tel" 
//                   required 
//                   value={phone} 
//                   onChange={handlePhoneChange} 
//                   placeholder="e.g. 0596620696" 
//                   maxLength={10}
//                   className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 font-mono tracking-wider focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" 
//                 />
//                 <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">Format: Starts with 0 (e.g. 024..., 050..., 059...)</span>
//               </div>
//             </div>

//             {/* Working Hours & Dispatch Time Selection */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Operating Hours *</label>
//                 <select value={workingHours} onChange={e => setWorkingHours(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
//                   <option value="08:00 AM - 10:00 PM">08:00 AM - 10:00 PM</option>
//                   <option value="07:00 AM - 11:00 PM">07:00 AM - 11:00 PM</option>
//                   <option value="24 Hours Open">Open 24/7</option>
//                   <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Days of Operation *</label>
//                 <select value={daysOpen} onChange={e => setDaysOpen(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
//                   <option value="Monday - Saturday">Mon - Sat</option>
//                   <option value="Monday - Sunday">Mon - Sun</option>
//                   <option value="Weekdays Only">Weekdays Only</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Dispatch Speed *</label>
//                 <select value={riders} onChange={e => setRiders(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
//                   <option value="5 mins dispatch">5 mins dispatch</option>
//                   <option value="15 mins dispatch">15 mins dispatch</option>
//                   <option value="30 mins dispatch">30 mins dispatch</option>
//                   <option value="Instant Dispatch">Instant Dispatch</option>
//                 </select>
//               </div>
//             </div>

//             {/* Passwords with Anti-Copy/Paste & Right-Click Restrictions */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Secure Account Password *</label>
//                 <div className="relative">
//                   <input 
//                     type={showPassword ? 'text' : 'password'} 
//                     required 
//                     value={password} 
//                     onChange={e => setPassword(e.target.value)} 
//                     onCopy={e => e.preventDefault()}
//                     onPaste={e => e.preventDefault()}
//                     onCut={e => e.preventDefault()}
//                     onContextMenu={e => e.preventDefault()}
//                     placeholder="••••••••" 
//                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all select-none" 
//                   />
//                   <button 
//                     type="button" 
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Confirm Password *</label>
//                 <div className="relative">
//                   <input 
//                     type={showConfirmPassword ? 'text' : 'password'} 
//                     required 
//                     value={confirmPassword} 
//                     onChange={e => setConfirmPassword(e.target.value)} 
//                     onCopy={e => e.preventDefault()}
//                     onPaste={e => e.preventDefault()}
//                     onCut={e => e.preventDefault()}
//                     onContextMenu={e => e.preventDefault()}
//                     placeholder="••••••••" 
//                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all select-none" 
//                   />
//                   <button 
//                     type="button" 
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
//                   >
//                     {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Exact Street Location / Physical Address *</label>
//               <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Near Commercial Area Gate, Bantama High Street" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
//             </div>

//             <div className="pt-2">
//               <button type="submit" disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer">
//                 {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit Verified Application
//               </button>
//             </div>

//             <div className="text-center pt-2 text-xs font-bold">
//               <Link to="/pharmacy-login" className="text-violet-600 hover:underline">Already registered? Sign in</Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PharmacyRegisterPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { Loader2, Camera, Image as ImageIcon, Clock, ShieldCheck, ArrowRight, Eye, EyeOff, ShieldAlert, FileText, CheckCircle2, XCircle, ScrollText, CreditCard, Smartphone } from 'lucide-react';
// @ts-ignore
import { usePaystackPayment } from 'react-paystack';
import logoImg from '/src/assets/Aidfidelis logo background.png';

const PharmacyRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [registeredPharmacyId, setRegisteredPharmacyId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('Accra');
  
  // Strict Security & Regulatory Credentials & Dispatch Time
  const [councilLicenseNumber, setCouncilLicenseNumber] = useState('');
  const [pharmacistInCharge, setPharmacistInCharge] = useState('');
  const [workingHours, setWorkingHours] = useState('08:00 AM - 10:00 PM');
  const [daysOpen, setDaysOpen] = useState('Monday - Saturday');
  const [riders, setRiders] = useState('5 mins dispatch');

  // Customer Payment Receiving Details
  const [momoNetwork, setMomoNetwork] = useState('MTN');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoName, setMomoName] = useState('');

  const [pharmacyImage, setPharmacyImage] = useState<string | null>(null);

  // Terms and Conditions States
  const [showTerms, setShowTerms] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Eye Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Test Mode State
  const [useTestBypass, setUseTestBypass] = useState(false);

  // Subscription Amount (GHS 150)
  const SUBSCRIPTION_FEE_GHS = 150;

  // Paystack Configuration utilizing your Live Key
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: email || 'pharmacy@aidfidelis.com',
    amount: SUBSCRIPTION_FEE_GHS * 100, // Amount is in pesewas
    publicKey: 'pk_live_b6620196ae4179fa0ef87db28459970dd580939d', 
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  useEffect(() => {
    if (!registeredPharmacyId) return;

    const unsubscribe = onSnapshot(collection(db, 'pharmacies'), (snapshot) => {
      const docItem = snapshot.docs.find(d => d.id === registeredPharmacyId);
      if (docItem) {
        const data = docItem.data();
        if (data.isApproved === true) {
          setIsApproved(true);
          setIsRejected(false);
          localStorage.setItem('approvedPharmacyName', data.name);
        } else if (data.isRejected === true) {
          setIsRejected(true);
          setIsApproved(false);
          setRejectionReason(data.rejectionReason || 'No specific reason provided.');
        }
      }
    });

    return () => unsubscribe();
  }, [registeredPharmacyId]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        try {
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) { reject(e); }
      };
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setPharmacyImage(compressed);
      } catch (err) {
        console.error('Image compression issue:', err);
        setPharmacyImage(URL.createObjectURL(file));
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 0) {
      if (val[0] !== '0') val = ''; 
      else if (val.length > 1 && !['2', '5', '3', '9'].includes(val[1])) val = val.substring(0, 1); 
    }
    setPhone(val.slice(0, 10)); 
  };

  const handleMomoPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 0) {
      if (val[0] !== '0') val = ''; 
      else if (val.length > 1 && !['2', '5', '3', '9'].includes(val[1])) val = val.substring(0, 1); 
    }
    setMomoNumber(val.slice(0, 10)); 
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    setCouncilLicenseNumber(val);
  };

  const isLicenseValid = (license: string) => {
    const regex = /^PC\/REG\/\d{4}\/\d+$/;
    return regex.test(license);
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 5) {
      setHasReadTerms(true);
    }
  };

  const handlePreValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !location.trim() || !phone.trim() || !councilLicenseNumber.trim() || !pharmacistInCharge.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required security and store details.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!momoNumber.trim() || momoNumber.length !== 10 || !momoName.trim()) {
      setError('Please provide complete Mobile Money details for receiving customer payments.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!pharmacyImage) {
      setError('Please upload a storefront photo of your pharmacy to proceed.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isLicenseValid(councilLicenseNumber.trim())) {
      setError('Invalid Pharmacy Council License format. Required format: PC/REG/YYYY/XXXXX (e.g. PC/REG/2026/01492)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit Ghana phone number (e.g., 0596620696).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!termsAccepted) {
      setError('You must read and accept the Terms & Conditions before subscribing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const passwordQuery = query(collection(db, 'pharmacies'), where('password', '==', password.trim()));
      const passwordSnapshot = await getDocs(passwordQuery);
      
      if (!passwordSnapshot.empty) {
        setError('This password is already in use by another account. For security purposes, please choose a unique password.');
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (useTestBypass) {
        // Bypass Paystack entirely for testing
        handleSuccessfulPaymentAndRegister({ reference: `TEST_SUB_${Math.floor(Math.random() * 1000000)}` });
      } else {
        // Trigger Paystack popup if not in test mode
        initializePayment({
          onSuccess: (reference: any) => handleSuccessfulPaymentAndRegister(reference),
          onClose: () => {
            setSubmitting(false);
            setError('Payment was cancelled. You must complete the subscription payment to register.');
          }
        });
      }

    } catch (err) {
      console.error('Validation error:', err);
      setError('An error occurred while validating. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSuccessfulPaymentAndRegister = async (paymentRef: any) => {
    try {
      const docRef = await addDoc(collection(db, 'pharmacies'), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(), 
        location: location.trim(),
        region,
        councilLicenseNumber: councilLicenseNumber.trim(), 
        pharmacistInCharge: pharmacistInCharge.trim(),    
        workingHours: `${workingHours} (${daysOpen})`,    
        timing: `${workingHours}`,
        riders: riders,
        momoNetwork,
        momoNumber,
        momoName: momoName.trim(),
        rating: 5.0,
        isApproved: false, 
        isRejected: false,
        isVerified: false,
        image: pharmacyImage,
        subscriptionStatus: 'active',
        subscriptionReference: paymentRef.reference,
        subscriptionAmount: SUBSCRIPTION_FEE_GHS,
        createdAt: serverTimestamp()
      });

      setRegisteredPharmacyId(docRef.id);
      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Error saving pharmacy after payment:', err);
      setError('Payment successful, but failed to save application. Please contact support with reference: ' + paymentRef.reference);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]"></div>
        </div>
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center space-y-6 relative z-10 border border-slate-100">
          
          {isRejected ? (
            <>
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-inner">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Registration Declined</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Unfortunately, your store application for <strong className="text-slate-800">{name}</strong> has been declined by the AidFidelis Admin team.
                </p>
              </div>
              <div className="p-4 bg-red-50/80 border border-red-200/60 rounded-2xl text-left space-y-1">
                <span className="text-[10px] font-black uppercase text-red-700 tracking-wider block">Reason for Rejection:</span>
                <p className="text-xs text-red-900 font-semibold">{rejectionReason}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSubmittedSuccess(false); setRegisteredPharmacyId(null); setIsRejected(false); }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Modify Application & Resubmit
              </button>
            </>
          ) : !isApproved ? (
            <>
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Review in Progress</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Payment Confirmed! Your registration for <strong className="text-slate-800">{name}</strong> and Pharmacy Council credentials have been logged for audit.
                </p>
              </div>
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-amber-800 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> Verifying license credentials...
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto border border-violet-100 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Store Verified & Approved!</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Your security credentials have been cleared. You can now access your management portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/pharmacy-login')}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Pharmacy Login <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {!isRejected && (
            <div className="pt-3 border-t border-slate-100">
              <button type="button" onClick={() => navigate('/pharmacy-login')} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                Return to Login Portal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <ScrollText className="w-6 h-6 text-violet-600" />
              <h3 className="text-lg font-black text-slate-800">Platform Terms & Conditions</h3>
            </div>
            
            <div 
              onScroll={handleTermsScroll}
              className="overflow-y-auto flex-1 pr-2 space-y-4 text-xs text-slate-600 leading-relaxed custom-scrollbar"
            >
              <p className="font-bold text-slate-800">1. Introduction</p>
              <p>Welcome to AidFidelis Partner Network. By registering your pharmacy, you agree to these terms governing our SaaS platform.</p>
              
              <p className="font-bold text-slate-800">2. Subscription & Payments</p>
              <p>Pharmacies are required to pay a non-refundable monthly subscription fee of GHS {SUBSCRIPTION_FEE_GHS} to remain active on the platform. AidFidelis does not handle customer funds; you are responsible for collecting payments directly from customers using the Mobile Money details provided during registration.</p>
              
              <p className="font-bold text-slate-800">3. Regulatory Compliance</p>
              <p>You guarantee that your Pharmacy Council License is valid and that you operate within the legal boundaries of the Republic of Ghana. Any suspension of your license must be reported immediately.</p>
              
              <p className="font-bold text-slate-800">4. Order Fulfillment</p>
              <p>You agree to verify customer payments directly via your Mobile Money account and dispatch medications promptly using our partnered riders according to your selected dispatch speed.</p>
              
              <p className="font-bold text-slate-800">5. Liability</p>
              <p>AidFidelis is a software provider connecting patients, pharmacies, and riders. We hold no liability for misdiagnosed medications or disputes arising from direct financial transactions between you and the patient.</p>
              
              <div className="h-4"></div>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">(Scroll to bottom to accept)</p>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Close
              </button>
              <button 
                type="button" 
                disabled={!hasReadTerms}
                onClick={() => { setTermsAccepted(true); setShowTerms(false); }}
                className="px-6 py-2 bg-violet-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                I Have Read and Agree
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[60%] rounded-full bg-violet-600/15 blur-[150px]"></div>
        <div className="absolute bottom-0 -left-[10%] w-[40%] h-[50%] rounded-full bg-indigo-600/15 blur-[150px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 mb-6">
        <div className="flex flex-col items-center justify-center gap-2 mb-3">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <img src={logoImg} alt="Logo" className="h-12 w-12 object-contain" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">AidFidelis Partner Network</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Secure Pharmacy Registration</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Provide legal storefront details and pay your monthly subscription.</p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl border border-slate-100 rounded-3xl sm:px-10">
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handlePreValidation} className="space-y-5">
            
            {/* Storefront Image Upload */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              {pharmacyImage ? (
                <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={pharmacyImage} alt="Preview" className="w-full h-full object-cover" />
                  <label className="absolute bottom-1 right-1 bg-violet-600 text-white p-1 rounded-lg cursor-pointer shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-violet-600 transition-colors py-2">
                  <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                  <span className="text-xs font-extrabold tracking-wide">Upload Pharmacy Storefront Photo *</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {/* Basic Store Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Pharmacy Legal Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MedFront Pharmacy Ltd" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Operational Region *</label>
                <select value={region} onChange={e => setRegion(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
                  <option value="Accra">Accra Metropolis</option>
                  <option value="Kumasi">Kumasi Hub</option>
                  <option value="Takoradi">Takoradi Hub</option>
                  <option value="Tamale">Tamale Hub</option>
                </select>
              </div>
            </div>

            {/* Strict Regulatory Credentials */}
            <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-800 text-xs font-extrabold">
                  <FileText className="w-4 h-4 text-violet-600" /> Mandatory Security & Regulatory Credentials
                </div>
                {councilLicenseNumber && isLicenseValid(councilLicenseNumber) && (
                  <span className="text-[10px] font-bold text-violet-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-violet-200">
                    <CheckCircle2 className="w-3 h-3" /> Format Valid
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Pharmacy Council License *</label>
                  <input 
                    type="text" 
                    required 
                    value={councilLicenseNumber} 
                    onChange={handleLicenseChange} 
                    placeholder="e.g. PC/REG/2026/01492" 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white font-mono uppercase focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Pharmacist In-Charge Name *</label>
                  <input type="text" required value={pharmacistInCharge} onChange={e => setPharmacistInCharge(e.target.value)} placeholder="e.g. Pharm. Kofi Mensah" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Business Email *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="pharmacy@domain.com" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Ghana Phone Number *</label>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={handlePhoneChange} 
                  placeholder="e.g. 0596620696" 
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 font-mono tracking-wider focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" 
                />
              </div>
            </div>

            {/* Customer Payment Receiving Details */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex items-center gap-2 text-blue-800 text-xs font-extrabold mb-2">
                <Smartphone className="w-4 h-4 text-blue-600" /> Customer Payment Receiving Details
              </div>
              <p className="text-[10px] text-blue-600/80 font-medium leading-relaxed mb-3">
                This is the Mobile Money account where customers will send payments for their drug orders. The exact name provided below will be displayed at checkout so customers can verify before sending.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Momo Network *</label>
                  <select 
                    value={momoNetwork} 
                    onChange={e => setMomoNetwork(e.target.value)} 
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Telecel">Telecel Cash</option>
                    <option value="AT">AT Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Momo Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={momoNumber} 
                    onChange={handleMomoPhoneChange} 
                    placeholder="e.g. 0241234567" 
                    maxLength={10}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white font-mono tracking-wider focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Registered Momo Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={momoName} 
                    onChange={e => setMomoName(e.target.value)} 
                    placeholder="e.g. MedFront Pharmacy Ltd" 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Operating Hours *</label>
                <select value={workingHours} onChange={e => setWorkingHours(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
                  <option value="08:00 AM - 10:00 PM">08:00 AM - 10:00 PM</option>
                  <option value="07:00 AM - 11:00 PM">07:00 AM - 11:00 PM</option>
                  <option value="24 Hours Open">Open 24/7</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Days of Operation *</label>
                <select value={daysOpen} onChange={e => setDaysOpen(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
                  <option value="Monday - Saturday">Mon - Sat</option>
                  <option value="Monday - Sunday">Mon - Sun</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Dispatch Speed *</label>
                <select value={riders} onChange={e => setRiders(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all">
                  <option value="5 mins dispatch">5 mins dispatch</option>
                  <option value="15 mins dispatch">15 mins dispatch</option>
                  <option value="30 mins dispatch">30 mins dispatch</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Secure Account Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Confirm Password *</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    required 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" 
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Physical Address *</label>
              <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bantama High Street" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4">
              <input 
                type="checkbox" 
                id="terms"
                checked={termsAccepted}
                onChange={(e) => {
                  if (!hasReadTerms) {
                    e.preventDefault();
                    setShowTerms(true);
                  } else {
                    setTermsAccepted(e.target.checked);
                  }
                }}
                className="mt-1 w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 font-medium leading-relaxed">
                I have read and agree to the{' '}
                <button 
                  type="button" 
                  onClick={() => setShowTerms(true)}
                  className="text-violet-600 font-bold hover:underline"
                >
                  Terms and Conditions
                </button>
                . I understand that I must pay a non-refundable subscription fee of <strong>GHS {SUBSCRIPTION_FEE_GHS}/month</strong>.
              </label>
            </div>

            {/* UPDATED: Test Bypass UI and Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Payment Authorization</label>
                <button
                  type="button"
                  onClick={() => setUseTestBypass(!useTestBypass)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                    useTestBypass 
                      ? 'bg-amber-100 text-amber-700 border-amber-200' 
                      : 'text-blue-600 hover:underline bg-blue-50 border-blue-100'
                  }`}
                >
                  {useTestBypass ? 'Test Mode: ON' : 'Enable Testing Mode Bypass'}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className={`w-full text-white font-bold text-xs py-4 rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  useTestBypass 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {useTestBypass ? 'Bypass Payment & Register' : `Pay GHS ${SUBSCRIPTION_FEE_GHS} & Register`}
              </button>
            </div>

            <div className="text-center pt-2 text-xs font-bold">
              <Link to="/pharmacy-login" className="text-violet-600 hover:underline">Already registered? Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyRegisterPage;