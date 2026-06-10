import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const clearSampleData = async () => {
  try {
    // Get all users from the users collection
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    // Delete users that have sample IDs
    const deletePromises = usersSnapshot.docs
      .filter(doc => doc.id.startsWith('sample-user-'))
      .map(doc => deleteDoc(doc.ref));
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} sample users`);
      return true;
    } else {
      console.log('No sample users found to delete');
      return true;
    }
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return false;
  }
}; 