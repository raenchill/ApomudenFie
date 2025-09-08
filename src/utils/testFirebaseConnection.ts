import { db } from '../firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test 1: Check if we can access the orders collection
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    console.log('Orders collection accessible. Found orders:', ordersSnapshot.docs.length);
    
    // Test 2: Check if we can access the medicines collection
    const medicinesRef = collection(db, 'medicines');
    const medicinesSnapshot = await getDocs(medicinesRef);
    console.log('Medicines collection accessible. Found medicines:', medicinesSnapshot.docs.length);
    
    // Test 3: Check if we can access the users collection
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    console.log('Users collection accessible. Found users:', usersSnapshot.docs.length);
    
    // Test 4: Check if we can access the deliverers collection
    const deliverersRef = collection(db, 'deliverers');
    const deliverersSnapshot = await getDocs(deliverersRef);
    console.log('Deliverers collection accessible. Found deliverers:', deliverersSnapshot.docs.length);
    
    return {
      success: true,
      orders: ordersSnapshot.docs.length,
      medicines: medicinesSnapshot.docs.length,
      users: usersSnapshot.docs.length,
      deliverers: deliverersSnapshot.docs.length
    };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return {
      success: false,
      error: error
    };
  }
};

export const createSampleOrder = async (userId: string) => {
  try {
    console.log('Creating sample order for user:', userId);
    
    const sampleOrder = {
      userId: userId,
      items: [
        {
          medicine: {
            id: 'sample-medicine-1',
            name: 'Paracetamol',
            category: 'Pain Relief',
            price: 5.00,
            discountPrice: 4.50
          },
          quantity: 2
        },
        {
          medicine: {
            id: 'sample-medicine-2',
            name: 'Vitamin C',
            category: 'Vitamins',
            price: 8.00,
            discountPrice: 7.20
          },
          quantity: 1
        }
      ],
      totalAmount: 16.20,
      status: 'delivered',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      deliveryAddress: 'Sample Address, Accra, Ghana',
      paymentMethod: 'card'
    };
    
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, sampleOrder);
    console.log('Sample order created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating sample order:', error);
    throw error;
  }
};

export const checkUserOrders = async (userId: string) => {
  try {
    console.log('Checking orders for user:', userId);
    
    const ordersRef = collection(db, 'orders');
    const { getDocs, query, where } = await import('firebase/firestore');
    const q = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    console.log('Found orders for user:', querySnapshot.docs.length);
    
    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Order ${index + 1}:`, {
        id: doc.id,
        totalAmount: data.totalAmount,
        status: data.status,
        createdAt: data.createdAt?.toDate(),
        itemsCount: data.items?.length || 0
      });
    });
    
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('Error checking user orders:', error);
    return 0;
  }
}; 