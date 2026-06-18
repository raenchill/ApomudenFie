import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import QuickActions from './QuickActions';

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  imageUrl?: string;
}

const PharmacyList: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pharmacies'), snapshot => {
      setPharmacies(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Pharmacy)));
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <QuickActions />
      <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Pharmacies</h2>
            <p className="text-gray-600">Pharmacies onboarded to the network</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((p) => (
            <Link key={p.id} to={`/pharmacy/${p.id}`} className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">🏥</div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.address}</p>
                  <p className="text-sm text-gray-500">{p.phone}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacyList;
