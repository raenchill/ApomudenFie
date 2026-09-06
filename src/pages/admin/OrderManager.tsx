import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  // Fetch orders from Firestore
  const fetchOrders = async () => {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchOrders(); }, []);

  // Delete order from Firestore
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'orders', id));
    fetchOrders();
  };

  // Prepare to edit an order
  const handleEdit = (order: any) => {
    setEditId(order.id);
    setEditStatus(order.status);
  };

  // Update order in Firestore
  const handleUpdate = async () => {
    if (!editId) return;
    await updateDoc(doc(db, 'orders', editId), { status: editStatus });
    setEditId(null);
    setEditStatus('');
    fetchOrders();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id} className="mb-2 flex items-center gap-2">
            <span>Order #{order.id} - Status: </span>
            {editId === order.id ? (
              <>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="border px-2 py-1 rounded">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <button onClick={handleUpdate} className="bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
              </>
            ) : (
              <>
                <span className="font-semibold">{order.status}</span>
                <button onClick={() => handleEdit(order)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(order.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderManager; 