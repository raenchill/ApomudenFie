import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import logoImg from '/src/assets/Aidfidelis logo background.png';

const PharmacyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [pharmacyName, setPharmacyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePharmacyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyName.trim() || !password.trim()) {
      setError('Please enter your pharmacy name and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const q = query(
        collection(db, 'pharmacies'),
        where('name', '==', pharmacyName.trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid pharmacy name or password.');
        setLoading(false);
        return;
      }

      const pharmacyDoc = querySnapshot.docs[0];
      const pharmacyData = pharmacyDoc.data();

      if (pharmacyData.password !== password.trim()) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      if (!pharmacyData.isApproved) {
        setError('Your pharmacy registration is still pending admin approval.');
        setLoading(false);
        return;
      }

      localStorage.setItem('approvedPharmacyName', pharmacyData.name);
      navigate('/pharmacy-dashboard');
    } catch (err) {
      console.error('Pharmacy login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex flex-col items-center justify-center gap-2 mb-3">
          <img src={logoImg} alt="Logo" className="h-16 w-16 object-contain" />
          <span className="text-xl font-black text-violet-700 tracking-tight">AidFidelis</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pharmacy Partner Portal</h2>
        <p className="text-xs font-semibold text-gray-400 mt-1">Sign in with your store name and password.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-3xl sm:px-10">
          {error && <div className="bg-red-50 text-red-700 text-xs font-bold px-4 py-3 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handlePharmacyLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Pharmacy Exact Name *</label>
              <input type="text" required value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} placeholder="e.g. MedFront Pharmacy" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium bg-white" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-xs font-medium bg-white" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Access Pharmacy Dashboard
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-100 text-xs font-bold">
              <Link to="/pharmacy-register" className="text-violet-700 hover:underline">
                Don't have a storefront yet? Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLoginPage;