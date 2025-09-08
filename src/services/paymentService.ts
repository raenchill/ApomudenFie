import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  reference?: string;
}

export interface PaymentData {
  reference: string;
  amount: number;
  currency: string;
  email: string;
  status: 'pending' | 'verified' | 'failed';
  cartItems: any[];
  userId?: string;
  createdAt: any;
  updatedAt: any;
}

class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Verify payment with backend
  async verifyPayment(reference: string, amount: number, email: string): Promise<PaymentVerificationResult> {
    try {
      console.log('Verifying payment with backend:', { reference, amount, email });
      
      // In a real app, this would make an API call to your backend
      // For now, we'll simulate the verification process
      
      // Simulate API call to backend
      const verificationResult = await this.simulateBackendVerification(reference, amount, email);
      
      // Save payment record to Firebase
      await this.savePaymentRecord({
        reference,
        amount,
        currency: 'GHS',
        email,
        status: verificationResult.success ? 'verified' : 'failed',
        cartItems: [],
        userId: 'user-id' // Get from auth context in real app
      });
      
      return verificationResult;
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'Payment verification failed. Please try again.'
      };
    }
  }

  // Simulate backend payment verification
  private async simulateBackendVerification(
    reference: string, 
    amount: number, 
    email: string
  ): Promise<PaymentVerificationResult> {
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we'll simulate different scenarios
    // In a real app, this would call your backend which would verify with Paystack
    
    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      return {
        success: true,
        message: 'Payment verified successfully',
        reference
      };
    } else {
      return {
        success: false,
        message: 'Payment verification failed. Please try again.'
      };
    }
  }

  // Save payment record to Firebase
  private async savePaymentRecord(paymentData: PaymentData): Promise<void> {
    try {
      const paymentsRef = collection(db, 'payments');
      await addDoc(paymentsRef, paymentData);
      console.log('Payment record saved to Firebase');
    } catch (error) {
      console.error('Error saving payment record:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(reference: string): Promise<PaymentVerificationResult> {
    try {
      // In a real app, this would query your backend or Firebase
      // For now, we'll simulate a successful status check
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: 'Payment status: Verified',
        reference
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        message: 'Failed to get payment status'
      };
    }
  }

  // Process payment with cart items
  async processPayment(
    reference: string, 
    amount: number, 
    email: string, 
    cartItems: any[]
  ): Promise<PaymentVerificationResult> {
    try {
      // Verify payment first
      const verificationResult = await this.verifyPayment(reference, amount, email);
      
      if (verificationResult.success) {
        // Save payment with cart items
        await this.savePaymentRecord({
          reference,
          amount,
          currency: 'GHS',
          email,
          status: 'verified',
          cartItems,
          userId: 'user-id' // Get from auth context in real app
        });
        
        // In a real app, you might also:
        // - Update inventory
        // - Create order record
        // - Send confirmation email
        // - Update user's order history
      }
      
      return verificationResult;
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        message: 'Payment processing failed'
      };
    }
  }
}

export const paymentService = PaymentService.getInstance();
