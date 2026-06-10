import React, { useState, Fragment } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import { User, Order } from '../../types';
import { ShoppingBag, Truck, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

interface OrderHistoryProps {
  user: User;
}

// Mock order data
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: '1',
    items: [
      {
        medicine: {
          id: '1',
          name: 'Paracetamol 500mg',
          genericName: 'Acetaminophen',
          category: 'Pain Relief',
          price: 12.99,
          discountPrice: 9.99,
          description: 'Effective pain relief and fever reducer.',
          dosage: '500mg tablets',
          manufacturer: 'HealthPharma Ltd.',
          requiresPrescription: false,
          inStock: true,
          stockCount: 150,
          image: 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg',
          rating: 4.5,
          reviews: 234,
          uses: [],
          sideEffects: [],
          precautions: []
        },
        quantity: 2
      },
      {
        medicine: {
          id: '2',
          name: 'Amoxicillin 250mg',
          genericName: 'Amoxicillin',
          category: 'Antibiotics',
          price: 24.99,
          description: 'Broad-spectrum antibiotic.',
          dosage: '250mg capsules',
          manufacturer: 'MediCore Inc.',
          requiresPrescription: true,
          inStock: true,
          stockCount: 89,
          image: 'https://images.pexels.com/photos/3683089/pexels-photo-3683089.jpeg',
          rating: 4.7,
          reviews: 156,
          uses: [],
          sideEffects: [],
          precautions: []
        },
        quantity: 1
      }
    ],
    total: 9.99 * 2 + 24.99,
    status: 'delivered',
    orderDate: '2024-05-01',
    estimatedDelivery: '2024-05-03',
    shippingAddress: 'Accra, Ghana'
  },
  {
    id: 'ORD-002',
    userId: '1',
    items: [
      {
        medicine: {
          id: '3',
          name: 'Vitamin D3 1000 IU',
          genericName: 'Cholecalciferol',
          category: 'Vitamins & Supplements',
          price: 18.99,
          discountPrice: 15.99,
          description: 'Essential vitamin D supplement.',
          dosage: '1000 IU tablets',
          manufacturer: 'NutriVital',
          requiresPrescription: false,
          inStock: true,
          stockCount: 200,
          image: 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg',
          rating: 4.6,
          reviews: 89,
          uses: [],
          sideEffects: [],
          precautions: []
        },
        quantity: 1
      }
    ],
    total: 15.99,
    status: 'processing',
    orderDate: '2024-05-10',
    estimatedDelivery: '2024-05-13',
    shippingAddress: 'Kumasi, Ghana'
  }
];

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
  }
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ user }) => {
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (order: Order) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} cartItemsCount={0} onSearch={() => {}} onLogout={() => {}} />
      <main className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Order History</h1>
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">You have no past orders yet. When you place an order, it will appear here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center gap-3 mb-2 md:mb-0">
                    {statusMap[order.status]?.icon}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusMap[order.status]?.color}`}>{statusMap[order.status]?.label}</span>
                  </div>
                  <div className="text-sm text-gray-500">Order Date: <span className="font-medium text-gray-700">{order.orderDate}</span></div>
                </div>
                <div className="mb-3">
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="text-sm text-gray-700 font-medium">Order ID: {order.id}</span>
                    <span className="text-sm text-gray-700">Delivery: {order.shippingAddress}</span>
                    <span className="text-sm text-gray-700">Est. Delivery: {order.estimatedDelivery}</span>
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="text-lg font-bold text-green-700">Total: ₵{order.total.toFixed(2)}</span>
                  <button onClick={() => openModal(order)} className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                        <span className="text-sm text-gray-700">Order Date: {selectedOrder.orderDate}</span>
                        <span className="text-sm text-gray-700">Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[selectedOrder.status]?.color}`}>{statusMap[selectedOrder.status]?.label}</span></span>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm text-gray-700 font-medium">Delivery Address:</span> <span className="text-gray-700">{selectedOrder.shippingAddress}</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm text-gray-700 font-medium">Estimated Delivery:</span> <span className="text-gray-700">{selectedOrder.estimatedDelivery}</span>
                      </div>
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
                                <div className="text-sm text-gray-700">₵{(item.medicine.discountPrice || item.medicine.price).toFixed(2)} x {item.quantity}</div>
                                <div className="text-xs text-gray-500">Subtotal: ₵{((item.medicine.discountPrice || item.medicine.price) * item.quantity).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <span className="text-lg font-bold text-green-700">Total: ₵{selectedOrder.total.toFixed(2)}</span>
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

export default OrderHistory; 