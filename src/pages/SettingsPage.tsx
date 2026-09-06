import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { Trash2, User as UserIcon, Mail, Camera, Edit2, ArrowLeft, Phone, MapPin, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout, onUserUpdate }) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [profilePic, setProfilePic] = useState<string | null>(user.profilePic || null);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || user.name || '');
          setEmail(userData.email || user.email || '');
          setPhone(userData.phone || user.phone || '');
          setAddress(userData.address || user.address || '');
          setProfilePic(userData.profilePic || user.profilePic || null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user profile options');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user.id, user.name, user.email, user.phone, user.address, user.profilePic]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          const maxSize = 300;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (error) => reject(error);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        setProfilePic(compressedImage);
      } catch (error) {
        console.error('Error compressing image:', error);
        setProfilePic(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      if (!name.trim() || !email.trim()) {
        setError('Full identity name and contact email fields are strictly required');
        setSaving(false);
        return;
      }

      const userRef = doc(db, 'users', user.id);
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        updatedAt: serverTimestamp()
      };

      if (profilePic && profilePic !== user.profilePic) {
        updateData.profilePic = profilePic;
      }

      await updateDoc(userRef, updateData);
      
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          ...(profilePic && profilePic !== user.profilePic && { profilePic })
        });
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving profile changes:', error);
      setError('Failed to update system parameters. Try checking your sync context.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: 'user'
      });
      onLogout();
      navigate('/');
    } catch (error: any) {
      console.error('Account removal aborted:', error);
      setError('Failed to securely process account deletion parameters.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setProfilePic(user.profilePic || null);
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-violet-700" />
          <p className="text-xs font-semibold text-gray-500">Synchronizing account parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 antialiased py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Action Row */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-2xs hover:text-violet-700 hover:bg-violet-50/50 transition-all duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
          </button>
          
          {success && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl shadow-2xs animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" /> Profile Synchronized Successfully
            </span>
          )}
        </div>

        {/* Core Control Wrapper Layout */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-900 via-violet-800 to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <span className="bg-white/10 border border-white/20 text-violet-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2">
                User Security & Profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Account Configuration</h1>
              <p className="text-xs font-medium text-violet-100 mt-1 max-w-lg leading-relaxed">
                Review operational preferences and update your secure user credentials and logistics delivery data.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-4 py-3 rounded-2xl mb-6 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Image Asset Framing */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50/60 border border-gray-100 rounded-3xl relative">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center border-2 border-gray-200/80 shadow-sm overflow-hidden relative">
                    {profilePic ? (
                      <img src={profilePic} alt="Identity profile avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-10 h-10 text-violet-700/60" />
                    )}
                  </div>
                  {editing && (
                    <label className="absolute -bottom-2 -right-2 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-xl shadow-md cursor-pointer transition-colors border-2 border-white">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                    </label>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <h3 className="text-sm font-black text-gray-950 tracking-tight">{name || 'User Account'}</h3>
                  <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200/60 px-2.5 py-0.5 rounded-lg">
                    <Shield className="w-3 h-3" /> {((user as any).role) || 'Verified Client'}
                  </div>
                </div>
              </div>

              {/* Functional Fields Cluster */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Full Identification Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      disabled={!editing}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 shadow-2xs text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Linked Communication Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      disabled={!editing}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 shadow-2xs text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Mobile Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        disabled={!editing}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="0596620696"
                        className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 shadow-2xs text-xs font-bold text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Logistics Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        disabled={!editing}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="e.g. East Legon High St, Accra"
                        className="w-full rounded-2xl border border-gray-200 pl-10 pr-4 py-3 shadow-2xs text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 disabled:bg-gray-50/70 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Operations Control Row */}
              <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 order-2 sm:order-1">
                  {editing ? (
                    <>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white bg-violet-600 hover:bg-violet-700 font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase tracking-wider transition-all shadow-2xs"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white bg-violet-600 hover:bg-violet-700 font-bold text-xs uppercase tracking-wider shadow-sm transition-all gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Modify Profile Data
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-red-600 bg-red-50/80 hover:bg-red-100 border border-red-100 font-bold text-xs uppercase tracking-wider transition-colors order-1 sm:order-2"
                >
                  Deactivate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay Component */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-inner">
                <Trash2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Deactivate Account?</h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                Confirming will flag your user profile as inactive and immediately terminate active access tokens.
              </p>
            </div>
            <div className="bg-gray-50/80 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs uppercase tracking-wider transition-all shadow-2xs"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                disabled={deleting}
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;