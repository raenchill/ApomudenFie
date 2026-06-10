import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, User as UserIcon, Mail, Image as ImageIcon, Edit2, ArrowLeft, Phone, MapPin } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user data from Firestore
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
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user.id, user.name, user.email, user.phone, user.address, user.profilePic]);

  // Image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions (max 300x300)
          const maxSize = 300;
          let { width, height } = img;
          
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
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress the image
        const compressedImage = await compressImage(file);
        setProfilePic(compressedImage);
        setProfilePicFile(file);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file
        setProfilePic(URL.createObjectURL(file));
        setProfilePicFile(file);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      // Validate required fields
      if (!name.trim() || !email.trim()) {
        setError('Name and email are required');
        setSaving(false);
        return;
      }

      // Update user in Firestore
      const userRef = doc(db, 'users', user.id);
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        updatedAt: serverTimestamp()
      };

      // Add profile picture if changed
      if (profilePic && profilePic !== user.profilePic) {
        updateData.profilePic = profilePic;
      }

      await updateDoc(userRef, updateData);
      
      // Update the user object in parent component if callback is provided
      if (onUserUpdate) {
        const updatedUser = {
          ...user,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          ...(profilePic && profilePic !== user.profilePic && { profilePic })
        };
        onUserUpdate(updatedUser);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving user data:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    
    try {
      // Mark user as deleted instead of actually deleting
      await updateDoc(doc(db, 'users', user.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: 'user'
      });
      
      // Logout the user
      onLogout();
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setProfilePic(user.profilePic || null);
    setProfilePicFile(null);
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl mx-auto bg-white/70 rounded-3xl shadow-2xl p-10 border border-blue-100 backdrop-blur-lg" style={{ boxShadow: '0 16px 48px 0 rgba(31, 38, 135, 0.18)', perspective: 1200 }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-8 font-semibold text-lg"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        
        <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-green-500 to-teal-400 drop-shadow-lg text-center">Account Settings</h1>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-400 via-blue-200 to-yellow-100 shadow-lg flex items-center justify-center border-4 border-white/80 overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-20 h-20 text-green-600" />
              )}
            </div>
            {editing && (
              <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <ImageIcon className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              </label>
            )}
          </div>
          
          {editing ? (
            <div className="space-y-4 w-full max-w-md">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Number"
              />
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Address"
                rows={3}
              />
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-blue-800">
                <UserIcon className="w-5 h-5 text-green-400" /> {name}
              </div>
              <div className="flex items-center justify-center gap-2 text-md text-gray-700">
                <Mail className="w-5 h-5 text-blue-400" /> {email}
              </div>
              {phone && (
                <div className="flex items-center justify-center gap-2 text-md text-gray-700">
                  <Phone className="w-5 h-5 text-blue-400" /> {phone}
                </div>
              )}
              {address && (
                <div className="flex items-center justify-center gap-2 text-md text-gray-700 max-w-md">
                  <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" /> {address}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gradient-to-r from-gray-600 to-gray-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200"
            >
              <Edit2 className="w-5 h-5 inline-block mr-2" /> Edit Profile
            </button>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg hover:scale-105 transition-transform duration-200"
          >
            <Trash2 className="w-5 h-5 inline-block mr-2" /> Delete Account
          </button>
        </div>
        
        {/* Success Message */}
        {success && (
          <div className="mt-6 text-green-700 font-bold text-center animate-pulse">
            Changes saved successfully!
          </div>
        )}
        
        {/* Delete Warning Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up max-w-sm w-full">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">Are you sure?</h2>
              <p className="text-gray-700 mb-4">This action will permanently delete your account and all associated data. This cannot be undone.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 