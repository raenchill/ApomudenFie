import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const sampleMedicines = [
  {
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: 'Pain Relief',
    price: 12.99,
    discountPrice: 9.99,
    description: 'Effective pain relief and fever reducer for adults and children over 12 years.',
    dosage: '500mg tablets',
    manufacturer: 'HealthPharma Ltd.',
    requiresPrescription: false,
    inStock: true,
    stockCount: 150,
    image: 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg',
    rating: 4.5,
    reviews: 234,
    uses: ['Pain relief', 'Fever reduction', 'Headache', 'Muscle pain'],
    sideEffects: ['Rare allergic reactions', 'Liver damage with overdose'],
    precautions: ['Do not exceed recommended dose', 'Avoid alcohol consumption']
  },
  {
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    price: 24.99,
    description: 'Broad-spectrum antibiotic for bacterial infections.',
    dosage: '250mg capsules',
    manufacturer: 'MediCore Inc.',
    requiresPrescription: true,
    inStock: true,
    stockCount: 89,
    image: 'https://images.pexels.com/photos/3683089/pexels-photo-3683089.jpeg',
    rating: 4.7,
    reviews: 156,
    uses: ['Bacterial infections', 'Respiratory tract infections', 'Skin infections'],
    sideEffects: ['Nausea', 'Diarrhea', 'Allergic reactions'],
    precautions: ['Complete full course', 'Take with food if stomach upset occurs']
  },
  {
    name: 'Vitamin D3 1000 IU',
    genericName: 'Cholecalciferol',
    category: 'Vitamins & Supplements',
    price: 18.99,
    discountPrice: 15.99,
    description: 'Essential vitamin D supplement for bone health and immune support.',
    dosage: '1000 IU tablets',
    manufacturer: 'NutriVital',
    requiresPrescription: false,
    inStock: true,
    stockCount: 200,
    image: 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg',
    rating: 4.6,
    reviews: 89,
    uses: ['Bone health', 'Immune support', 'Vitamin D deficiency'],
    sideEffects: ['Rare: nausea with high doses'],
    precautions: ['Do not exceed recommended dose', 'Store in cool, dry place']
  },
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    category: 'Digestive Health',
    price: 21.99,
    description: 'Reduces stomach acid production for acid reflux and ulcer treatment.',
    dosage: '20mg capsules',
    manufacturer: 'GastroMed',
    requiresPrescription: false,
    inStock: true,
    stockCount: 76,
    image: 'https://images.pexels.com/photos/3683100/pexels-photo-3683100.jpeg',
    rating: 4.4,
    reviews: 167,
    uses: ['Acid reflux', 'Heartburn', 'Stomach ulcers', 'GERD'],
    sideEffects: ['Headache', 'Nausea', 'Diarrhea'],
    precautions: ['Take before meals', 'May affect absorption of some nutrients']
  },
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine HCl',
    category: 'Allergy Relief',
    price: 14.99,
    discountPrice: 11.99,
    description: 'Non-drowsy antihistamine for allergy relief.',
    dosage: '10mg tablets',
    manufacturer: 'AllergyFree Co.',
    requiresPrescription: false,
    inStock: true,
    stockCount: 134,
    image: 'https://images.pexels.com/photos/3683085/pexels-photo-3683085.jpeg',
    rating: 4.3,
    reviews: 203,
    uses: ['Hay fever', 'Allergic rhinitis', 'Hives', 'Itchy eyes'],
    sideEffects: ['Drowsiness (rare)', 'Dry mouth', 'Fatigue'],
    precautions: ['May cause drowsiness in some individuals', 'Avoid alcohol']
  },
  {
    name: 'Lisinopril 10mg',
    genericName: 'Lisinopril',
    category: 'Cardiovascular',
    price: 28.99,
    description: 'ACE inhibitor for high blood pressure and heart conditions.',
    dosage: '10mg tablets',
    manufacturer: 'CardioHealth',
    requiresPrescription: true,
    inStock: true,
    stockCount: 45,
    image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
    rating: 4.5,
    reviews: 112,
    uses: ['High blood pressure', 'Heart failure', 'Post-heart attack'],
    sideEffects: ['Dry cough', 'Dizziness', 'Fatigue'],
    precautions: ['Monitor blood pressure regularly', 'Avoid potassium supplements']
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    category: 'Pain Relief',
    price: 8.99,
    description: 'Anti-inflammatory pain reliever for headaches, muscle pain, and fever.',
    dosage: '400mg tablets',
    manufacturer: 'PainRelief Inc.',
    requiresPrescription: false,
    inStock: true,
    stockCount: 120,
    image: 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg',
    rating: 4.2,
    reviews: 189,
    uses: ['Pain relief', 'Inflammation reduction', 'Fever reduction'],
    sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness'],
    precautions: ['Take with food', 'Do not exceed recommended dose']
  },
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin',
    category: 'Diabetes Care',
    price: 15.99,
    description: 'Oral diabetes medicine that helps control blood sugar levels.',
    dosage: '500mg tablets',
    manufacturer: 'DiabetesCare Ltd.',
    requiresPrescription: true,
    inStock: true,
    stockCount: 67,
    image: 'https://images.pexels.com/photos/3683089/pexels-photo-3683089.jpeg',
    rating: 4.1,
    reviews: 145,
    uses: ['Type 2 diabetes', 'Blood sugar control', 'PCOS'],
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
    precautions: ['Take with meals', 'Monitor blood sugar regularly']
  }
];

export const seedFirebaseMedicines = async () => {
  try {
    console.log('Starting Firebase medicines seeding...');
    
    const medicinesRef = collection(db, 'medicines');
    
    // Clear existing medicines
    const existingDocs = await getDocs(medicinesRef);
    const deletePromises = existingDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`Cleared ${existingDocs.size} existing medicines`);
    
    // Add new medicines
    const addPromises = sampleMedicines.map(medicine => addDoc(medicinesRef, medicine));
    const results = await Promise.all(addPromises);
    
    console.log(`Successfully added ${results.length} medicines to Firebase`);
    console.log('Firebase medicines seeding completed!');
    
    return results;
  } catch (error) {
    console.error('Error seeding Firebase medicines:', error);
    throw error;
  }
};

// Function to check if medicines exist
export const checkMedicinesExist = async (): Promise<boolean> => {
  try {
    const medicinesRef = collection(db, 'medicines');
    const querySnapshot = await getDocs(medicinesRef);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking medicines:', error);
    return false;
  }
}; 