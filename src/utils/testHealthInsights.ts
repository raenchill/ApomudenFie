import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export const testHealthInsights = async (userId: string) => {
  console.log('🧪 Testing Health Insights for user:', userId);
  
  try {
    // Test 1: Check if orders collection exists and has data
    console.log('📋 Test 1: Checking orders collection...');
    const ordersRef = collection(db, 'orders');
    const allOrdersSnapshot = await getDocs(ordersRef);
    console.log('Total orders in database:', allOrdersSnapshot.docs.length);
    
    if (allOrdersSnapshot.docs.length > 0) {
      console.log('Sample order:', allOrdersSnapshot.docs[0].data());
    }
    
    // Test 2: Check user-specific orders
    console.log('👤 Test 2: Checking user-specific orders...');
    const userOrdersQuery = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const userOrdersSnapshot = await getDocs(userOrdersQuery);
    console.log('User orders found:', userOrdersSnapshot.docs.length);
    
    if (userOrdersSnapshot.docs.length > 0) {
      console.log('User order sample:', userOrdersSnapshot.docs[0].data());
    }
    
    // Test 3: Check if other collections exist
    console.log('📁 Test 3: Checking other collections...');
    
    try {
      const prescriptionsRef = collection(db, 'prescriptions');
      const prescriptionsSnapshot = await getDocs(prescriptionsRef);
      console.log('Prescriptions found:', prescriptionsSnapshot.docs.length);
    } catch (error) {
      console.log('Prescriptions collection error:', error);
    }
    
    try {
      const symptomChecksRef = collection(db, 'symptomChecks');
      const symptomChecksSnapshot = await getDocs(symptomChecksRef);
      console.log('Symptom checks found:', symptomChecksSnapshot.docs.length);
    } catch (error) {
      console.log('Symptom checks collection error:', error);
    }
    
    try {
      const healthTipsRef = collection(db, 'healthTips');
      const healthTipsSnapshot = await getDocs(healthTipsRef);
      console.log('Health tips found:', healthTipsSnapshot.docs.length);
    } catch (error) {
      console.log('Health tips collection error:', error);
    }
    
    // Test 4: Check user data
    console.log('👤 Test 4: Checking user data...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('id', '==', userId));
    const userSnapshot = await getDocs(userQuery);
    console.log('User found:', userSnapshot.docs.length > 0);
    
    if (userSnapshot.docs.length > 0) {
      console.log('User data:', userSnapshot.docs[0].data());
    }
    
    console.log('✅ Health Insights test completed');
    
  } catch (error) {
    console.error('❌ Health Insights test failed:', error);
  }
};

export const createSampleOrder = async (userId: string) => {
  console.log('📝 Creating sample order for user:', userId);
  
  try {
    const { addDoc, serverTimestamp } = await import('firebase/firestore');
    const ordersRef = collection(db, 'orders');
    
    const sampleOrder = {
      userId: userId,
      items: [
        {
          id: 'sample-medicine-1',
          name: 'Paracetamol',
          price: 5.00,
          quantity: 2,
          medicine: {
            id: 'sample-medicine-1',
            name: 'Paracetamol',
            dosage: '500mg'
          }
        }
      ],
      totalAmount: 10.00,
      status: 'delivered',
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveryAddress: 'Sample Address',
      paymentMethod: 'cash'
    };
    
    const docRef = await addDoc(ordersRef, sampleOrder);
    console.log('✅ Sample order created with ID:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Failed to create sample order:', error);
    throw error;
  }
}; 