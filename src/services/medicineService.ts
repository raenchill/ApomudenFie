import { Medicine } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, or } from 'firebase/firestore';

export const medicineService = {
  // Search for medicines in the database
  async searchMedicines(drugNames: string[]): Promise<Array<{
    searchedName: string;
    foundMedicines: Medicine[];
  }>> {
    try {
      const results = [];
      
      for (const drugName of drugNames) {
        const foundMedicines = await this.searchMedicine(drugName);
        results.push({
          searchedName: drugName,
          foundMedicines: foundMedicines
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error searching medicines:', error);
      throw error;
    }
  },

  // Search for a single medicine
  async searchMedicine(drugName: string): Promise<Medicine[]> {
    try {
      const medicinesRef = collection(db, 'medicines');
      const queryLower = drugName.toLowerCase();
      const firstWord = queryLower.split(' ')[0];
      
      // Get all medicines and filter client-side to avoid index requirements
      const querySnapshot = await getDocs(medicinesRef);
      const allResults = new Map<string, Medicine>();
      
      querySnapshot.forEach((doc) => {
        const medicine = { id: doc.id, ...doc.data() } as Medicine;
        
        // Check if the medicine matches our search criteria
        const nameMatch = medicine.name.toLowerCase().includes(queryLower) || 
                         medicine.genericName.toLowerCase().includes(queryLower) ||
                         medicine.name.toLowerCase().includes(firstWord) ||
                         medicine.genericName.toLowerCase().includes(firstWord);
        
        if (nameMatch && !allResults.has(doc.id)) {
          allResults.set(doc.id, medicine);
        }
      });
      
      return Array.from(allResults.values());
    } catch (error) {
      console.error('Error searching medicine:', error);
      throw error;
    }
  },

  // Get all medicines
  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const medicinesRef = collection(db, 'medicines');
      const querySnapshot = await getDocs(medicinesRef);
      
      const medicines: Medicine[] = [];
      querySnapshot.forEach((doc) => {
        medicines.push({ id: doc.id, ...doc.data() } as Medicine);
      });
      
      return medicines;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  }
}; 