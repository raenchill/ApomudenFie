import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Building, Check, Lock, Key } from 'lucide-react';
import { db, storage, auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const PharmacyRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    registrationNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in the required fields');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      // Create Firebase Auth user using provided email & password
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCred.user.uid;

      let imageUrl = '';
      if (file) {
        const sRef = storageRef(storage, `pharmacies/${uid}/${Date.now()}_${file.name}`);
        await uploadBytes(sRef, file);
        imageUrl = await getDownloadURL(sRef);
      }

      // Store pharmacy document using uid as the doc id
      await setDoc(doc(db, 'pharmacies', uid), {
        uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        registrationNumber: formData.registrationNumber,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        verified: false
      });

      // After registration, sign out so the pharmacy can login with their credentials
      setSuccess(true);
      setIsLoading(false);
      try { await (await import('firebase/auth')).signOut(auth); } catch {}
      navigate('/pharmacy/login');
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setFormData({ name: '', email: '', phone: '', address: '', registrationNumber: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Error saving pharmacy:', err);
      setError('Failed to submit. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 mb-8">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="bg-green-700 p-3 rounded-xl inline-block mb-4">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-900 mb-1">Pharmacy Registration</h1>
            <p className="text-gray-600">Register your pharmacy to join the network</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Pharmacy Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input name="name" value={formData.name} onChange={handleChange} required
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg" placeholder="Name of pharmacy" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input name="email" value={formData.email} onChange={handleChange} type="email" required
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg" placeholder="contact@pharmacy.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input name="phone" value={formData.phone} onChange={handleChange} required
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg" placeholder="e.g. +233 24 000 0000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input name="address" value={formData.address} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg" placeholder="Street, City" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Registration Number</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg" placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input name="password" value={formData.password} onChange={handleChange} type="password" required
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg" placeholder="Create a password" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" required
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg" placeholder="Confirm password" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Pharmacy Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
              {previewUrl && (
                <div className="mt-3">
                  <img src={previewUrl} alt="preview" className="w-40 h-28 object-cover rounded-md border" />
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:bg-green-400">
              {isLoading ? 'Submitting...' : 'Register Pharmacy'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Already registered? </span>
            <Link to="/pharmacy/login" className="text-green-700 font-semibold hover:underline">Log in</Link>
          </div>

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold">Registration submitted</div>
                <div className="text-sm">We will review your submission and contact you.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyRegister;
