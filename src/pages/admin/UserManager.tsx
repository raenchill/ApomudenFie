import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Fetch users from Firestore
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchUsers(); }, []);

  // Delete user from Firestore
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
    fetchUsers();
  };

  // Prepare to edit a user
  const handleEdit = (user: any) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  // Update user in Firestore
  const handleUpdate = async () => {
    if (!editId) return;
    await updateDoc(doc(db, 'users', editId), { name: editName, email: editEmail });
    setEditId(null);
    setEditName('');
    setEditEmail('');
    fetchUsers();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} className="mb-2 flex items-center gap-2">
            {editId === user.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded" />
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="border px-2 py-1 rounded" />
                <button onClick={handleUpdate} className="bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
              </>
            ) : (
              <>
                <span>{user.name} - {user.email}</span>
                <button onClick={() => handleEdit(user)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManager; 