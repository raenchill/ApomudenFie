import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { medicineService } from '../services/medicineService';
import { aiPrescriptionService } from '../services/aiPrescriptionService';

export const testPrescriptionUpload = async (userId: string) => {
  console.log('🧪 Testing Prescription Upload System...');
  
  try {
    // Test 1: Check if medicines collection exists and has data
    console.log('📋 Test 1: Checking medicines collection...');
    const medicinesRef = collection(db, 'medicines');
    const medicinesSnapshot = await getDocs(medicinesRef);
    console.log('Total medicines in database:', medicinesSnapshot.docs.length);
    
    if (medicinesSnapshot.docs.length === 0) {
      console.log('⚠️ No medicines found in database');
      return { success: false, message: 'No medicines in database' };
    }
    
    // Test 2: Test medicine search functionality
    console.log('🔍 Test 2: Testing medicine search...');
    const searchResults = await medicineService.searchMedicine('paracetamol');
    console.log('Search results for "paracetamol":', searchResults.length);
    
    // Test 3: Test AI prescription service
    console.log('🤖 Test 3: Testing AI prescription service...');
    const sampleText = 'Prescription: Paracetamol 500mg twice daily, Amoxicillin 250mg three times daily';
    const aiResults = await aiPrescriptionService.analyzePrescriptionText(sampleText);
    console.log('AI analysis results:', aiResults);
    
    // Test 4: Test prescription saving
    console.log('💾 Test 4: Testing prescription saving...');
    const testPrescription = {
      userId: userId,
      fileName: 'test-prescription.jpg',
      fileSize: 1024,
      fileType: 'image/jpeg',
      uploadDate: new Date(),
      scannedDrugNames: ['paracetamol', 'amoxicillin'],
      matchedDrugs: [
        {
          name: 'paracetamol',
          isAvailable: true,
          confidence: 0.95,
          matchedMedicine: {
            id: 'test-medicine-1',
            name: 'Paracetamol',
            price: 5.00
          }
        }
      ],
      status: 'processed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const prescriptionsRef = collection(db, 'prescriptions');
    const docRef = await addDoc(prescriptionsRef, testPrescription);
    console.log('✅ Test prescription saved with ID:', docRef.id);
    
    // Test 5: Check prescriptions collection
    console.log('📄 Test 5: Checking prescriptions collection...');
    const prescriptionsSnapshot = await getDocs(prescriptionsRef);
    console.log('Total prescriptions in database:', prescriptionsSnapshot.docs.length);
    
    console.log('✅ Prescription Upload System Test Completed Successfully');
    return { 
      success: true, 
      message: 'All systems working properly',
      data: {
        medicinesCount: medicinesSnapshot.docs.length,
        searchResultsCount: searchResults.length,
        aiAnalysisSuccess: !!aiResults,
        prescriptionsCount: prescriptionsSnapshot.docs.length
      }
    };
    
  } catch (error) {
    console.error('❌ Prescription Upload System Test Failed:', error);
    return { 
      success: false, 
      message: `Test failed: ${error}`,
      error: error
    };
  }
};

export const createSampleMedicines = async () => {
  console.log('📝 Creating sample medicines...');
  
  try {
    const medicinesRef = collection(db, 'medicines');
    
    const sampleMedicines = [
      {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        category: 'Pain Relief',
        dosage: '500mg',
        price: 5.00,
        description: 'Pain reliever and fever reducer',
        inStock: true,
        imageUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        category: 'Antibiotics',
        dosage: '250mg',
        price: 15.00,
        description: 'Antibiotic medication',
        inStock: true,
        imageUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        category: 'Pain Relief',
        dosage: '400mg',
        price: 8.00,
        description: 'Anti-inflammatory pain reliever',
        inStock: true,
        imageUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];
    
    for (const medicine of sampleMedicines) {
      await addDoc(medicinesRef, medicine);
    }
    
    console.log('✅ Sample medicines created successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create sample medicines:', error);
    return false;
  }
}; 