export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  discountPrice?: number;
  description: string;
  dosage: string;
  manufacturer: string;
  requiresPrescription: boolean;
  prescriptionInstructions?: string;
  inStock: boolean;
  stockCount: number;
  image: string;
  rating: number;
  reviews: number;
  uses: string[];
  sideEffects: string[];
  precautions: string[];
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
  // For backward compatibility and direct access
  id?: string;
  name?: string;
  category?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePic?: string;
  prescriptions: Prescription[];
  isNewUser?: boolean; // Track if this is a new user (just registered)
}

export interface Prescription {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
  medicines: string[];
}

export interface SymptomAnalysis {
  symptoms: string[];
  possibleConditions: (string | {
    condition: string;
    description?: string;
    riskLevel?: string;
    matchingSymptoms?: string[];
  })[];
  recommendations: Recommendation[];
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  disclaimer: string;
  generalAdvice?: {
    recommendedActions?: string[];
    lifestyleConsiderations?: string[];
    whenToSeekMedicalAttention?: string[];
  };
}

export interface Recommendation {
  type: 'otc' | 'prescription' | 'lifestyle' | 'consult';
  title: string;
  description: string;
  medicines?: Medicine[];
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: string;
  paymentMethod?: string;
}