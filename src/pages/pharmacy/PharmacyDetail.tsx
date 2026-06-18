import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import MedicineCard from '../../components/MedicineCard';
import { Medicine } from '../../types';
import QuickActions from '../../components/dashboard/QuickActions';

const PharmacyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    if (!id) return;
    const dRef = doc(db, 'pharmacies', id);
    getDoc(dRef).then(snap => setPharmacy(snap.exists() ? snap.data() : null));

    // Try to load medicines for this pharmacy by matching pharmacyId field
    const q = query(collection(db, 'medicines'), where('pharmacyId', '==', id));
    const unsub = onSnapshot(q, snap => {
      const results = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Medicine));
      if (results.length > 0) {
        setMedicines(results);
      } else {
        // fallback: load all medicines if none specific to this pharmacy
        const allUnsub = onSnapshot(collection(db, 'medicines'), allSnap => {
          setMedicines(allSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Medicine)));
        });
        return () => allUnsub();
      }
    });

    return () => unsub();
  }, [id]);

  if (!pharmacy) return <div className="p-8">Loading pharmacy...</div>;

  return (
    <div>
      <QuickActions />
      <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          {pharmacy.imageUrl ? (
            <img src={pharmacy.imageUrl} alt={pharmacy.name} className="w-24 h-24 object-cover rounded-md" />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">🏥</div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{pharmacy.name}</h1>
            <p className="text-gray-600">{pharmacy.address}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Medicines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {medicines.map(m => (
            <MedicineCard key={m.id} medicine={m} onAddToCart={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetail;
