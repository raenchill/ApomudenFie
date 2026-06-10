import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export const fixExistingOrders = async () => {
  try {
    console.log('Fixing existing orders with wrong field names...');
    
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    console.log('Found orders to check:', querySnapshot.docs.length);
    
    let fixedCount = 0;
    
    for (const orderDoc of querySnapshot.docs) {
      const data = orderDoc.data();
      
      // Check if order has 'total' field but no 'totalAmount' field
      if (data.total !== undefined && data.totalAmount === undefined) {
        console.log(`Fixing order ${orderDoc.id}: changing 'total' to 'totalAmount'`);
        
        await updateDoc(doc(db, 'orders', orderDoc.id), {
          totalAmount: data.total,
          // Remove the old 'total' field
          total: null
        });
        
        fixedCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} orders`);
    return fixedCount;
  } catch (error) {
    console.error('Error fixing orders:', error);
    throw error;
  }
};

interface OrderIssue {
  orderId: string;
  issue: string;
}

export const checkOrderDataStructure = async () => {
  try {
    console.log('Checking order data structure...');
    
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    console.log('Total orders in database:', querySnapshot.docs.length);
    
    const issues: OrderIssue[] = [];
    
    querySnapshot.docs.forEach((orderDoc, index) => {
      const data = orderDoc.data();
      
      console.log(`Order ${index + 1}:`, {
        id: orderDoc.id,
        hasTotal: 'total' in data,
        hasTotalAmount: 'totalAmount' in data,
        total: data.total,
        totalAmount: data.totalAmount,
        userId: data.userId,
        status: data.status
      });
      
      if (data.total !== undefined && data.totalAmount === undefined) {
        issues.push({
          orderId: orderDoc.id,
          issue: 'Has "total" field but missing "totalAmount" field'
        });
      }
      
      if (data.totalAmount === undefined && data.total === undefined) {
        issues.push({
          orderId: orderDoc.id,
          issue: 'Missing both "total" and "totalAmount" fields'
        });
      }
    });
    
    console.log('Data structure issues found:', issues);
    return issues;
  } catch (error) {
    console.error('Error checking order data structure:', error);
    throw error;
  }
}; 