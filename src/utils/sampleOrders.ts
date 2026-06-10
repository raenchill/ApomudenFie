import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { CartItem } from '../types';

// Sample medicine data for creating test orders
const sampleMedicines = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: 'Pain Relief',
    price: 12.99,
    discountPrice: 9.99,
    description: 'Effective pain relief and fever reducer.',
    dosage: '500mg tablets',
    manufacturer: 'HealthPharma Ltd.',
    requiresPrescription: false,
    inStock: true,
    stockCount: 150,
    image: 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg',
    rating: 4.5,
    reviews: 234,
    uses: [],
    sideEffects: [],
    precautions: []
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    price: 24.99,
    description: 'Broad-spectrum antibiotic.',
    dosage: '250mg capsules',
    manufacturer: 'MediCore Inc.',
    requiresPrescription: true,
    inStock: true,
    stockCount: 89,
    image: 'https://images.pexels.com/photos/3683089/pexels-photo-3683089.jpeg',
    rating: 4.7,
    reviews: 156,
    uses: [],
    sideEffects: [],
    precautions: []
  },
  {
    id: '3',
    name: 'Vitamin D3 1000 IU',
    genericName: 'Cholecalciferol',
    category: 'Vitamins & Supplements',
    price: 18.99,
    discountPrice: 15.99,
    description: 'Essential vitamin D supplement.',
    dosage: '1000 IU tablets',
    manufacturer: 'NutriVital',
    requiresPrescription: false,
    inStock: true,
    stockCount: 200,
    image: 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg',
    rating: 4.6,
    reviews: 89,
    uses: [],
    sideEffects: [],
    precautions: []
  }
];

export const createSampleOrders = async (userId: string) => {
  try {
    const orders = [
      {
        userId: userId,
        items: [
          {
            medicine: sampleMedicines[0],
            quantity: 2
          },
          {
            medicine: sampleMedicines[1],
            quantity: 1
          }
        ] as CartItem[],
        total: 9.99 * 2 + 24.99,
        status: 'delivered',
        orderDate: new Date('2024-05-01').toISOString(),
        estimatedDelivery: new Date('2024-05-03').toISOString(),
        shippingAddress: 'Accra, Ghana',
        riderId: 'R001',
        riderName: 'Kwame Boateng',
        paymentStatus: 'completed',
        actualDeliveryDate: new Date('2024-05-02').toISOString(),
        trackingNumber: 'TRK-20240501001',
        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-05-02')
      },
      {
        userId: userId,
        items: [
          {
            medicine: sampleMedicines[2],
            quantity: 1
          }
        ] as CartItem[],
        total: 15.99,
        status: 'processing',
        orderDate: new Date('2024-05-10').toISOString(),
        estimatedDelivery: new Date('2024-05-13').toISOString(),
        shippingAddress: 'Kumasi, Ghana',
        riderId: 'R002',
        riderName: 'Akosua Mensah',
        paymentStatus: 'completed',
        trackingNumber: 'TRK-20240510001',
        createdAt: new Date('2024-05-10'),
        updatedAt: new Date('2024-05-10')
      },
      {
        userId: userId,
        items: [
          {
            medicine: sampleMedicines[0],
            quantity: 1
          },
          {
            medicine: sampleMedicines[2],
            quantity: 2
          }
        ] as CartItem[],
        total: 9.99 + (15.99 * 2),
        status: 'shipped',
        orderDate: new Date('2024-05-15').toISOString(),
        estimatedDelivery: new Date('2024-05-18').toISOString(),
        shippingAddress: 'Tema, Ghana',
        riderId: 'R003',
        riderName: 'Yaw Owusu',
        paymentStatus: 'completed',
        trackingNumber: 'TRK-20240515001',
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-05-16')
      }
    ];

    console.log('Creating sample orders for user:', userId);
    
    for (const order of orders) {
      await addDoc(collection(db, 'orders'), order);
      console.log('Sample order created:', order.trackingNumber);
    }

    console.log('All sample orders created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample orders:', error);
    return false;
  }
}; 