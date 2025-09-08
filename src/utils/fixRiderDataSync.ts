import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const fixRiderDataSync = async () => {
  try {
    // Get all deliverers from the deliverers collection
    const deliverersSnapshot = await getDocs(collection(db, 'deliverers'));
    
    console.log('Total riders in Firestore:', deliverersSnapshot.docs.length);
    
    // Log all rider IDs for debugging
    deliverersSnapshot.docs.forEach(doc => {
      console.log('Rider in Firestore:', doc.id, doc.data().name);
    });
    
    // Delete any riders that might be causing sync issues
    // This will remove all riders and let you start fresh
    const deletePromises = deliverersSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} riders to fix sync issues`);
      return {
        success: true,
        message: `Deleted ${deletePromises.length} riders to fix sync issues. You can now add riders fresh.`
      };
    } else {
      console.log('No riders found to delete');
      return {
        success: true,
        message: 'No riders found in database. You can add new riders.'
      };
    }
  } catch (error) {
    console.error('Error fixing rider data sync:', error);
    return {
      success: false,
      message: 'Error fixing rider data sync'
    };
  }
}; 