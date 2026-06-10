import React, { useState, useEffect, Fragment } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import { User, Order, CartItem } from '../../types';
import { ShoppingBag, Truck, CheckCircle, Clock, XCircle, Eye, Loader, Plus } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { createSampleOrders } from '../../utils/sampleOrders';

interface OrderHistoryWithFirebaseProps {
  user: User;
}

interface FirebaseOrder extends Order {
  riderId?: string;
  riderName?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  actualDeliveryDate?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const statusMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  delivered: {
    label: 'Delivered',
    color: 'text-green-700 bg-green-100',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />
  },
  processing: {
    label: 'Processing',
    color: 'text-yellow-700 bg-yellow-100',
    icon: <Clock className="h-5 w-5 text-yellow-600" />
  },
  shipped: {
    label: 'Shipped',
    color: 'text-blue-700 bg-blue-100',
    icon: <Truck className="h-5 w-5 text-blue-600" />
  },
  pending: {
    label: 'Pending',
    color: 'text-gray-700 bg-gray-100',
    icon: <ShoppingBag className="h-5 w-5 text-gray-600" />
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700 bg-red-100',
    icon: <XCircle className="h-5 w-5 text-red-600" />
  },
  failed: {
    label: 'Failed',
    color: 'text-red-700 bg-red-100',
    icon: <XCircle className="h-5 w-5 text-red-600" />
  }
};

const OrderHistoryWithFirebase: React.FC<OrderHistoryWithFirebaseProps> = ({ user }) => {
  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FirebaseOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingSamples, setCreatingSamples] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders for user ID:', user.id);
      
      const ordersRef = collection(db, 'orders');
      
      // First, try to get all orders to see if the collection exists
      const allOrdersSnapshot = await getDocs(ordersRef);
      console.log('Total orders in collection:', allOrdersSnapshot.size);
      
      // Log all orders to see their userId format
      allOrdersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Order userId:', data.userId, 'Type:', typeof data.userId);
      });
      
      // Try the specific user query without orderBy first
      let querySnapshot;
      try {
        const q = query(
          ordersRef, 
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        
        console.log('Executing query with orderBy for user:', user.id);
        querySnapshot = await getDocs(q);
        console.log('Query results count:', querySnapshot.size);
      } catch (orderByError) {
        console.log('OrderBy failed, trying without orderBy:', orderByError);
        // Fallback: try without orderBy
        const q = query(
          ordersRef, 
          where('userId', '==', user.id)
        );
        querySnapshot = await getDocs(q);
        console.log('Fallback query results count:', querySnapshot.size);
      }
      
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as FirebaseOrder[];
      
      // Sort manually by createdAt date (newest first)
      ordersData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Processed and sorted orders:', ordersData);
      
      // Debug: Check status values
      ordersData.forEach(order => {
        console.log(`Order ${order.id} status:`, order.status);
        console.log(`Order ${order.id} paymentStatus:`, order.paymentStatus);
      });
      
      setOrders(ordersData);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      console.error('Error details:', {
        message: err?.message || 'Unknown error',
        code: err?.code || 'No code',
        stack: err?.stack || 'No stack'
      });
      setError(`Failed to load order history: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (order: FirebaseOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateSampleOrders = async () => {
    setCreatingSamples(true);
    try {
      await createSampleOrders(user.id);
      await fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error creating sample orders:', error);
    } finally {
      setCreatingSamples(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-GH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return date.toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} cartItemsCount={0} onSearch={() => {}} onLogout={() => {}} />
        <main className="max-w-4xl mx-auto py-16 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">Loading your order history...</h2>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} cartItemsCount={0} onSearch={() => {}} onLogout={() => {}} />
        <main className="max-w-4xl mx-auto py-16 px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Unable to Load Orders</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} cartItemsCount={0} onSearch={() => {}} onLogout={() => {}} />
      <main className="max-w-4xl mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">Order History</h1>
          {orders.length === 0 && (
            <button
              onClick={handleCreateSampleOrders}
              disabled={creatingSamples}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
            >
              {creatingSamples ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Sample Orders
                </>
              )}
            </button>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
            <p className="text-gray-600">You have no past orders yet. When you place an order, it will appear here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-3 mb-2 md:mb-0">
                    {statusMap[order.status]?.icon}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusMap[order.status]?.color}`}>
                      {statusMap[order.status]?.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Order Date: <span className="font-medium text-gray-700">{formatDate(order.orderDate)}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="text-sm text-gray-700 font-medium">Order ID: {order.id}</span>
                    <span className="text-sm text-gray-700">Delivery: {order.shippingAddress}</span>
                    <span className="text-sm text-gray-700">Est. Delivery: {formatDate(order.estimatedDelivery)}</span>
                    {order.trackingNumber && (
                      <span className="text-sm text-blue-600 font-medium">Tracking: {order.trackingNumber}</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="text-sm text-gray-700 font-medium">Items:</span>
                    {order.items.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1 rounded-full text-xs">
                        <img src={item.medicine.image} alt={item.medicine.name} className="h-6 w-6 rounded object-cover" />
                        {item.medicine.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
                {order.riderName && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-700 font-medium">Rider: </span>
                    <span className="text-sm text-blue-600">{order.riderName}</span>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="text-lg font-bold text-green-700">Total: ₵{order.totalAmount.toFixed(2)}</span>
                  <button 
                    onClick={() => openModal(order)} 
                    className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <DashboardFooter />

      {/* Order Details Modal */}
      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-green-700 mb-2 flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-green-700" /> Order Details
                  </Dialog.Title>
                  {selectedOrder && (
                    <div>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <span className="text-sm text-gray-700 font-medium">Order ID: {selectedOrder.id}</span>
                        <span className="text-sm text-gray-700">Order Date: {formatDate(selectedOrder.orderDate)}</span>
                        <span className="text-sm text-gray-700">
                          Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[selectedOrder.status]?.color}`}>
                            {statusMap[selectedOrder.status]?.label}
                          </span>
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm text-gray-700 font-medium">Delivery Address:</span> 
                        <span className="text-gray-700"> {selectedOrder.shippingAddress}</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm text-gray-700 font-medium">Estimated Delivery:</span> 
                        <span className="text-gray-700"> {formatDate(selectedOrder.estimatedDelivery)}</span>
                      </div>
                      {selectedOrder.actualDeliveryDate && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-700 font-medium">Actual Delivery:</span> 
                          <span className="text-gray-700"> {formatDate(selectedOrder.actualDeliveryDate)}</span>
                        </div>
                      )}
                      {selectedOrder.trackingNumber && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-700 font-medium">Tracking Number:</span> 
                          <span className="text-gray-700"> {selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                      {selectedOrder.riderName && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-700 font-medium">Delivery Rider:</span> 
                          <span className="text-gray-700"> {selectedOrder.riderName}</span>
                        </div>
                      )}
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Items</h4>
                        <div className="divide-y divide-gray-100">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 py-3">
                              <img src={item.medicine.image} alt={item.medicine.name} className="h-12 w-12 rounded object-cover border" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">{item.medicine.name}</div>
                                <div className="text-xs text-gray-500">{item.medicine.dosage}</div>
                                <div className="text-xs text-gray-500">{item.medicine.manufacturer}</div>
                                {item.medicine.requiresPrescription && (
                                  <div className="text-xs text-red-600 mt-1">* Prescription required</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-700">
                                  ₵{(item.medicine.discountPrice || item.medicine.price).toFixed(2)} x {item.quantity}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Subtotal: ₵{((item.medicine.discountPrice || item.medicine.price) * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <span className="text-lg font-bold text-green-700">Total: ₵{selectedOrder.totalAmount.toFixed(2)}</span>
                        <button onClick={handlePrint} className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                          <CheckCircle className="h-4 w-4" /> Print/Download Receipt
                        </button>
                      </div>
                      <div className="mt-4 p-4 bg-green-50 rounded-lg text-green-800 text-sm flex items-center gap-2">
                        <Truck className="h-5 w-5 text-green-600" />
                        For support, call <span className="font-bold">+233 24 000 0000</span> or visit your nearest Apomudenfie pharmacy.
                      </div>
                    </div>
                  )}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default OrderHistoryWithFirebase; 