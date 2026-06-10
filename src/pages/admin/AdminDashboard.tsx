import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Truck,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Trash2,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import MedicineManager from './MedicineManager';
import OrderManager from './OrderManager';
import DelivererManager from './DelivererManager';
import WarehouseDashboard from '../warehouse/WarehouseDashboard';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  const [tab, setTab] = useState<'medicines' | 'orders' | 'deliverers' | 'users' | 'warehouse'>('medicines');
  const [stats, setStats] = useState({
    medicines: 0,
    orders: 0,
    deliverers: 0,
    users: 0
  });

  const tabs = [
    { key: 'medicines', label: 'Medicines', icon: <Package className="w-5 h-5 mr-2" /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5 mr-2" /> },
    { key: 'deliverers', label: 'Riders', icon: <Truck className="w-5 h-5 mr-2" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-5 h-5 mr-2" /> },
    { key: 'warehouse', label: 'Warehouse', icon: <Package className="w-5 h-5 mr-2" /> },
  ];

  const fetchStats = async () => {
    try {
      const [medicinesSnap, ordersSnap, deliverersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'medicines')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'deliverers')),
        getDocs(collection(db, 'users'))
      ]);

      setStats({
        medicines: medicinesSnap.size,
        orders: ordersSnap.size,
        deliverers: deliverersSnap.size,
        users: usersSnap.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your pharmacy operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medicines</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.medicines}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Truck className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Riders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.deliverers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.users}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    tab === tabItem.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tabItem.icon}
                  {tabItem.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {tab === 'medicines' && <MedicineManager />}
            {tab === 'orders' && <OrderManager />}
            {tab === 'deliverers' && <DelivererManager />}
            {tab === 'users' && <UserManager />}
            {tab === 'warehouse' && <WarehouseDashboard />}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Manager Component
const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      // Sort by creation date (newest first)
      usersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSampleData = async () => {
    try {
      const success = await clearSampleData();
      if (success) {
        setSuccessMessage('Sample data cleared successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchUsers(); // Refresh the user list
      } else {
        setSuccessMessage('Failed to clear sample data');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error clearing sample data:', error);
      setSuccessMessage('Error clearing sample data');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleFixUserStatus = async () => {
    try {
      const result = await fixUserStatus();
      if (result.success) {
        setSuccessMessage(result.message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000); // Longer timeout for this message
        fetchUsers(); // Refresh the user list
      } else {
        setSuccessMessage('Failed to fix user status');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error fixing user status:', error);
      setSuccessMessage('Error fixing user status');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    
    try {
      // Mark user as deleted instead of actually deleting
      await updateDoc(doc(db, 'users', userToDelete.id), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: 'admin'
      });
      
      setSuccessMessage(`User "${userToDelete.name}" has been removed from the system`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setSuccessMessage('Failed to delete user');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      
      // Get user's local timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Format with user's local timezone
      const formattedDate = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: userTimezone
      });
      
      // Add timezone abbreviation
      const timezoneAbbr = getTimezoneAbbreviation(userTimezone);
      
      return `${formattedDate} (${timezoneAbbr})`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getTimezoneAbbreviation = (timezone: string): string => {
    const timezoneMap: { [key: string]: string } = {
      'America/New_York': 'EST/EDT',
      'America/Chicago': 'CST/CDT',
      'America/Denver': 'MST/MDT',
      'America/Los_Angeles': 'PST/PDT',
      'Europe/London': 'GMT/BST',
      'Europe/Paris': 'CET/CEST',
      'Asia/Tokyo': 'JST',
      'Asia/Shanghai': 'CST',
      'Asia/Kolkata': 'IST',
      'Africa/Lagos': 'WAT',
      'Africa/Cairo': 'EET',
      'Australia/Sydney': 'AEST/AEDT',
      'Pacific/Auckland': 'NZST/NZDT'
    };
    
    return timezoneMap[timezone] || timezone.split('/').pop()?.replace('_', ' ') || timezone;
  };

  // Filter out deleted users
  const activeUsers = users.filter(user => !user.isDeleted);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Active Users: {activeUsers.length}
          </div>
          {users.some(user => user.id.startsWith('sample-user-')) && (
            <button
              onClick={handleClearSampleData}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Sample Data
            </button>
          )}
          <button
            onClick={handleFixUserStatus}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <User className="w-4 h-4 mr-2" />
            Fix User Status
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove User</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to remove <strong>{userToDelete.name}</strong> from the system?
              </p>
              <p className="text-sm text-gray-600">
                This user will no longer be able to access the application and all their data will be marked as inactive.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}

      {activeUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No active users found</h3>
          <p className="text-gray-500">Users will appear here once they register</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeUsers.map((user) => (
            <div key={user.id} className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow ${
              user.id.startsWith('sample-user-') ? 'border-red-300 bg-red-50' : ''
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">User ID: {user.id}</p>
                    {user.id.startsWith('sample-user-') && (
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                        Sample Data
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => confirmDelete(user)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove user from system"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{user.phone}</span>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{user.address}</span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    Joined: {formatDate(user.createdAt)}
                  </span>
                </div>

                {user.lastLogin && (
                  <div className="flex items-center text-sm">
                    <LogOut className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      Last Login: {formatDate(user.lastLogin)}
                    </span>
                  </div>
                )}

                {user.lastLogout && (
                  <div className="flex items-center text-sm">
                    <LogOut className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      Last Logout: {formatDate(user.lastLogout)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isActive ? '🟢 Online' : '⚫ Offline'}
                  </span>
                  <span>Member</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 