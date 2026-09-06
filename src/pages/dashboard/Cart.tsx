import React from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import CartComponent from '../../components/Cart';
import { CartItem, User } from '../../types';

interface CartProps {
  user: User;
  cartItems: CartItem[];
  onUpdateQuantity: (medicineId: string, quantity: number) => void;
  onRemoveItem: (medicineId: string) => void;
  onLogout: () => void;
}

const Cart: React.FC<CartProps> = ({
  user,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onLogout
}) => {
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user}
        cartItemsCount={cartItemsCount}
        onSearch={() => {}}
        onLogout={onLogout}
      />
      
      <main>
        <CartComponent 
          cartItems={cartItems}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
        />
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Cart;