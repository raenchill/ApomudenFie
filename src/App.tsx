// import { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { auth, db } from './firebase';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/auth/LoginPage';
// import RegisterPage from './pages/auth/RegisterPage';
// import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
// import ResetPasswordPage from './pages/auth/ResetPasswordPage';
// import Dashboard from './pages/dashboard/Dashboard';
// import SymptomChecker from './pages/dashboard/SymptomChecker';
// import Cart from './pages/dashboard/Cart';
// import OrderHistoryWithFirebase from './pages/dashboard/OrderHistoryWithFirebase';
// import HealthInsights from './pages/dashboard/HealthInsights';
// import PrescriptionUpload from './pages/dashboard/PrescriptionUpload';

// import DeliveryPage from './components/DeliveryPage';
// import RiderDashboard from './pages/rider/RiderDashboard';

// import AdminDashboard from './pages/admin/AdminDashboard';
// import SettingsPage from './pages/SettingsPage';
// import PharmaciesPage from './pages/PharmaciesPage';
// import PharmacyRegisterPage from './pages/auth/PharmacyRegisterPage';
// import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
// import PharmacyLoginPage from './pages/auth/PharmacyLoginPage';

// import { CartItem, Medicine, User } from './types';

// function App() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true); 
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       try {
//         if (firebaseUser) {
//           if (!user) {
//             const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
//             if (userDoc.exists()) {
//               setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
//             }
//           }
//         } else {
//           setUser(null);
//           setCartItems([]);
//           setSearchQuery('');
//         }
//       } catch (err) {
//         console.error("Auth session restoration failed:", err);
//       } finally {
//         setLoading(false); 
//       }
//     });
//     return () => unsubscribe();
//   }, [user]);

//   const addToCart = (medicine: Medicine) => {
//     setCartItems(prev => {
//       const existingItem = prev.find(item => item.medicine.id === medicine.id);
//       if (existingItem) {
//         return prev.map(item =>
//           item.medicine.id === medicine.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prev, { medicine, quantity: 1 }];
//     });
//   };

//   const updateQuantity = (medicineId: string, quantity: number) => {
//     if (quantity <= 0) {
//       setCartItems(prev => prev.filter(item => item.medicine.id !== medicineId));
//     } else {
//       setCartItems(prev =>
//         prev.map(item =>
//           item.medicine.id === medicineId
//             ? { ...item, quantity }
//             : item
//         )
//       );
//     }
//   };

//   const removeItem = (medicineId: string) => {
//     setCartItems(prev => prev.filter(item => item.medicine.id !== medicineId));
//   };

//   const handleClearCart = () => {
//     setCartItems([]);
//   };

//   const handleLogin = (userData: User) => {
//     setUser(userData);
//   };

//   const handleLogout = async () => {
//     if (user) {
//       try {
//         await updateDoc(doc(db, 'users', user.id), {
//           lastLogout: serverTimestamp(),
//           isActive: false
//         });
//       } catch (error) {
//         console.error('Error updating logout timestamp:', error);
//       }
//     }
    
//     // Sign out from Firebase Auth to terminate persistence
//     try {
//       await signOut(auth);
//     } catch (err) {
//       console.error('Firebase sign out error:', err);
//     }

//     // Clear session storage flags
//     localStorage.clear();

//     setUser(null);
//     setCartItems([]);
//     setSearchQuery('');
//   };

//   const handleUserUpdate = (updatedUser: User) => {
//     setUser(updatedUser);
//   };

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//   };

//   const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//   const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-700 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50">
//         <Routes>
//           <Route path="/" element={user ? <Navigate to="/pharmacies" replace /> : <LandingPage />} />
          
//           {/* Pharmacy Partner Routes */}
//           <Route path="/pharmacy-register" element={<PharmacyRegisterPage />} />
//           <Route path="/pharmacy-login" element={<PharmacyLoginPage />} />
//           <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />

//           <Route path="/login" element={user ? <Navigate to="/pharmacies" replace /> : <LoginPage onLogin={handleLogin} />} />
//           <Route path="/register" element={user ? <Navigate to="/pharmacies" replace /> : <RegisterPage onRegister={handleLogin} />} />
//           <Route path="/forgot-password" element={user ? <Navigate to="/pharmacies" replace /> : <ForgotPasswordPage />} />
//           <Route path="/reset-password" element={user ? <Navigate to="/pharmacies" replace /> : <ResetPasswordPage />} />
          
//           <Route path="/pharmacies" element={user ? <PharmaciesPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          
//           <Route path="/dashboard" element={
//             user ? (
//               <Dashboard 
//                 user={user}
//                 cartItemsCount={cartItemsCount}
//                 onSearch={handleSearch}
//                 onLogout={handleLogout}
//                 onAddToCart={addToCart}
//                 searchQuery={searchQuery}
//                 onUserUpdate={handleUserUpdate}
//               />
//             ) : <Navigate to="/login" replace />
//           } />
//           <Route path="/symptom-checker" element={
//             user ? <SymptomChecker user={user} cartItemsCount={cartItemsCount} onLogout={handleLogout} /> : <SymptomChecker user={{ id: 'demo-user', name: 'Demo User', email: 'demo@example.com', prescriptions: [] }} cartItemsCount={0} onLogout={handleLogout} />
//           } />
//           <Route path="/cart" element={
//             user ? (
//               <Cart 
//                 user={user}
//                 cartItems={cartItems}
//                 onUpdateQuantity={updateQuantity}
//                 onRemoveItem={removeItem}
//                 onLogout={handleLogout}
//               />
//             ) : <Navigate to="/login" replace />
//           } />
//           <Route path="/order-history" element={user ? <OrderHistoryWithFirebase user={user} /> : <Navigate to="/login" replace />} />
//           <Route path="/health-insights" element={user ? <HealthInsights user={user} /> : <Navigate to="/login" replace />} />
//           <Route path="/upload-prescription" element={user ? <PrescriptionUpload user={user} onAddToCart={addToCart} /> : <Navigate to="/login" replace />} />
          
//           <Route path="/delivery" element={
//             user && cartItems.length > 0 ? (
//               <DeliveryPage 
//                 user={user} 
//                 cartItems={cartItems} 
//                 totalPrice={subtotalPrice} 
//                 clearCart={handleClearCart} 
//               />
//             ) : <Navigate to="/cart" replace />
//           } />
          
//           <Route path="/admin" element={<AdminDashboard />} />
//           <Route path="/rider-portal" element={<RiderDashboard />} />

//           <Route path="/settings" element={
//             user ? <SettingsPage user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" replace />
//           } />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { auth, db } from './firebase';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import PharmacyRegisterPage from './pages/auth/PharmacyRegisterPage';
import PharmacyLoginPage from './pages/auth/PharmacyLoginPage';

import Dashboard from './pages/dashboard/Dashboard';
import SymptomChecker from './pages/dashboard/SymptomChecker';
import Cart from './pages/dashboard/Cart';
import OrderHistoryWithFirebase from './pages/dashboard/OrderHistoryWithFirebase';
import HealthInsights from './pages/dashboard/HealthInsights';
import PrescriptionUpload from './pages/dashboard/PrescriptionUpload';

import DeliveryPage from './components/DeliveryPage';

import RiderDashboard from './pages/rider/RiderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import PharmaciesPage from './pages/PharmaciesPage';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';

import { CartItem, Medicine, User } from './types';


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const previousUserIdRef = useRef<string | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');


  // ============================================================
  // RESTORE FIREBASE AUTH SESSION
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          const previousUserId = previousUserIdRef.current;

          if (previousUserId && !firebaseUser) {
            await updateDoc(
              doc(db, 'users', previousUserId),
              {
                isActive: false,
                lastLogout: serverTimestamp(),
              }
            ).catch(() => undefined);
          }

          if (firebaseUser) {
            const userDoc = await getDoc(
              doc(db, 'users', firebaseUser.uid)
            );

            if (userDoc.exists()) {
              const firestoreUser = {
                id: firebaseUser.uid,
                ...userDoc.data(),
              } as User;

              setUser(firestoreUser);

              await updateDoc(
                doc(db, 'users', firebaseUser.uid),
                {
                  isActive: true,
                  lastLogin: serverTimestamp(),
                }
              ).catch(() => undefined);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
            setCartItems([]);
            setSearchQuery('');
          }

          previousUserIdRef.current = firebaseUser ? firebaseUser.uid : null;
        } catch (err) {
          console.error(
            'Auth session restoration failed:',
            err
          );

          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);


  // ============================================================
  // CART
  // ============================================================
  const addToCart = (medicine: Medicine) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.medicine.id === medicine.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          medicine,
          quantity: 1,
        },
      ];
    });
  };


  const updateQuantity = (
    medicineId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      setCartItems((prev) =>
        prev.filter(
          (item) => item.medicine.id !== medicineId
        )
      );

      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };


  const removeItem = (medicineId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => item.medicine.id !== medicineId
      )
    );
  };


  const handleClearCart = () => {
    setCartItems([]);
  };


  // ============================================================
  // AUTH
  // ============================================================
  const handleLogin = (userData: User) => {
    setUser(userData);
  };


  const handleLogout = async () => {
    if (user) {
      try {
        await updateDoc(
          doc(db, 'users', user.id),
          {
            lastLogout: serverTimestamp(),
            isActive: false,
          }
        );
      } catch (error) {
        console.error(
          'Error updating logout timestamp:',
          error
        );
      }
    }

    try {
      await signOut(auth);
    } catch (err) {
      console.error(
        'Firebase sign out error:',
        err
      );
    }

    // Clear locally selected pharmacy / session values.
    localStorage.clear();

    setUser(null);
    setCartItems([]);
    setSearchQuery('');
  };


  const handleUserUpdate = (
    updatedUser: User
  ) => {
    setUser(updatedUser);
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };


  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );


  const subtotalPrice = cartItems.reduce(
    (sum, item) =>
      sum +
      item.medicine.price * item.quantity,
    0
  );


  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-700 border-t-transparent" />
      </div>
    );
  }


  // ============================================================
  // ROUTES
  // ============================================================
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          {/* ----------------------------------------------------
              PUBLIC / LANDING
          ---------------------------------------------------- */}
          <Route
            path="/"
            element={
              user
                ? <Navigate to="/pharmacies" replace />
                : <LandingPage />
            }
          />


          {/* ----------------------------------------------------
              PHARMACY PARTNER
          ---------------------------------------------------- */}
          <Route
            path="/pharmacy-register"
            element={<PharmacyRegisterPage />}
          />

          <Route
            path="/pharmacy-login"
            element={<PharmacyLoginPage />}
          />

          <Route
            path="/pharmacy-dashboard"
            element={<PharmacyDashboard />}
          />


          {/* ----------------------------------------------------
              CUSTOMER AUTH
          ---------------------------------------------------- */}
          <Route
            path="/login"
            element={
              user
                ? <Navigate to="/pharmacies" replace />
                : <LoginPage onLogin={handleLogin} />
            }
          />

          <Route
            path="/register"
            element={
              user
                ? <Navigate to="/pharmacies" replace />
                : <RegisterPage onRegister={handleLogin} />
            }
          />

          <Route
            path="/forgot-password"
            element={
              user
                ? <Navigate to="/pharmacies" replace />
                : <ForgotPasswordPage />
            }
          />

          <Route
            path="/reset-password"
            element={
              user
                ? <Navigate to="/pharmacies" replace />
                : <ResetPasswordPage />
            }
          />


          {/* ----------------------------------------------------
              PHARMACIES

              Both routes point to the same page.

              /pharmacies
              /pharmacies/:pharmacyId

              This lets the symptom checker later send a user
              directly to a selected pharmacy.
          ---------------------------------------------------- */}
          <Route
            path="/pharmacies"
            element={
              user ? (
                <PharmaciesPage
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/pharmacies/:pharmacyId"
            element={
              user ? (
                <PharmaciesPage
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          {/* ----------------------------------------------------
              CUSTOMER DASHBOARD
          ---------------------------------------------------- */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard
                  user={user}
                  cartItemsCount={cartItemsCount}
                  onSearch={handleSearch}
                  onLogout={handleLogout}
                  onAddToCart={addToCart}
                  searchQuery={searchQuery}
                  onUserUpdate={handleUserUpdate}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          {/* ----------------------------------------------------
              AI SYMPTOM CHECKER
          ---------------------------------------------------- */}
          <Route
            path="/symptom-checker"
            element={
              user ? (
                <SymptomChecker
                  user={user}
                  cartItemsCount={cartItemsCount}
                  onLogout={handleLogout}
                />
              ) : (
                <SymptomChecker
                  user={{
                    id: 'demo-user',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    prescriptions: [],
                  }}
                  cartItemsCount={0}
                  onLogout={handleLogout}
                />
              )
            }
          />


          {/* ----------------------------------------------------
              CART
          ---------------------------------------------------- */}
          <Route
            path="/cart"
            element={
              user ? (
                <Cart
                  user={user}
                  cartItems={cartItems}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          {/* ----------------------------------------------------
              ORDER HISTORY
          ---------------------------------------------------- */}
          <Route
            path="/order-history"
            element={
              user ? (
                <OrderHistoryWithFirebase
                  user={user}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          {/* ----------------------------------------------------
              HEALTH INSIGHTS
          ---------------------------------------------------- */}
          <Route
            path="/health-insights"
            element={
              user ? (
                <HealthInsights user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          {/* ----------------------------------------------------
              PRESCRIPTION UPLOAD

              Your real route is /upload-prescription.

              /prescription-upload is also supported as an alias
              so older symptom-checker code will not break.
          ---------------------------------------------------- */}
          <Route
            path="/upload-prescription"
            element={
              user ? (
                <PrescriptionUpload
                  user={user}
                  onAddToCart={addToCart}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/prescription-upload"
            element={
              <Navigate
                to="/upload-prescription"
                replace
              />
            }
          />


          {/* ----------------------------------------------------
              DELIVERY
          ---------------------------------------------------- */}
          <Route
            path="/delivery"
            element={
              user && cartItems.length > 0 ? (
                <DeliveryPage
                  user={user}
                  cartItems={cartItems}
                  totalPrice={subtotalPrice}
                  clearCart={handleClearCart}
                />
              ) : (
                <Navigate to="/cart" replace />
              )
            }
          />


          {/* ----------------------------------------------------
              ADMIN / RIDER
          ---------------------------------------------------- */}
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/rider-portal"
            element={<RiderDashboard />}
          />


          {/* ----------------------------------------------------
              SETTINGS
          ---------------------------------------------------- */}
          <Route
            path="/settings"
            element={
              user ? (
                <SettingsPage
                  user={user}
                  onLogout={handleLogout}
                  onUserUpdate={handleUserUpdate}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          {/* ----------------------------------------------------
              FALLBACK
          ---------------------------------------------------- */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </div>
    </Router>
  );
}


export default App;