import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const clearOldDelivererData = async () => {
  try {
    // Get all deliverers from the deliverers collection
    const deliverersSnapshot = await getDocs(collection(db, 'deliverers'));
    
    // Delete deliverers that have old custom IDs (like R001, R002, etc.)
    const deletePromises = deliverersSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        // Check if the document has an old custom ID format
        return doc.id.startsWith('R') && /^R\d{3}$/.test(doc.id);
      })
      .map(doc => deleteDoc(doc.ref));
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} old deliverer records`);
      return true;
    } else {
      console.log('No old deliverer data found to delete');
      return true;
    }
  } catch (error) {
    console.error('Error clearing old deliverer data:', error);
    return false;
  }
}; 