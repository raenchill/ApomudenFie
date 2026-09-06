import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { seedFirebaseMedicines } from './seedFirebaseMedicines';

interface SetupResult { success: boolean; message: string }

const runWarehouseSetup = async (): Promise<SetupResult> => {
  try {
    // Ensure medicines exist (seed if empty)
    const medsSnap = await getDocs(collection(db, 'medicines'));
    if (medsSnap.empty) {
      await seedFirebaseMedicines();
    }

    // Ensure stock_movements collection exists (create placeholder if empty)
    const moveSnap = await getDocs(collection(db, 'stock_movements'));
    if (moveSnap.empty) {
      await addDoc(collection(db, 'stock_movements'), {
        medicineId: 'placeholder',
        medicineName: 'placeholder',
        type: 'in',
        quantity: 0,
        note: 'collection-initializer',
        beforeCount: 0,
        afterCount: 0,
        createdAt: serverTimestamp()
      });
    }

    return { success: true, message: 'Warehouse collections are ready.' };
  } catch (e: any) {
    console.error('Warehouse setup failed', e);
    return { success: false, message: e?.message || 'Unknown error' };
  }
};

export default runWarehouseSetup; 