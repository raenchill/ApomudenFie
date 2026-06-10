import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export const fixUserStatus = async () => {
  try {
    // Get all users from the users collection
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log('Total users in Firestore:', usersSnapshot.docs.length);
    
    // Update users who don't have isActive field
    const updatePromises = usersSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.isActive === undefined; // Users without isActive field
      })
      .map(doc => {
        const data = doc.data();
        // Set as inactive by default (since we can't know their current status)
        return updateDoc(doc.ref, {
          isActive: false
        });
      });
    
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Updated ${updatePromises.length} users with isActive field`);
      return {
        success: true,
        message: `Updated ${updatePromises.length} users with isActive field. All users are now set to inactive by default.`
      };
    } else {
      console.log('All users already have isActive field');
      return {
        success: true,
        message: 'All users already have isActive field. No updates needed.'
      };
    }
  } catch (error) {
    console.error('Error fixing user status:', error);
    return {
      success: false,
      message: 'Error fixing user status'
    };
  }
}; 