import React from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardHome from '../../components/dashboard/DashboardHome';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import { Medicine, User } from '../../types';

interface DashboardProps {
  user: User;
  cartItemsCount: number;
  onSearch: (query: string) => void;
  onLogout: () => void;
  onAddToCart: (medicine: Medicine) => void;
  searchQuery: string;
  onUserUpdate?: (updatedUser: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  cartItemsCount,
  onSearch,
  onLogout,
  onAddToCart,
  searchQuery,
  onUserUpdate
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user}
        cartItemsCount={cartItemsCount}
        onSearch={onSearch}
        onLogout={onLogout}
      />
      
      <main>
        <DashboardHome 
          user={user}
          onAddToCart={onAddToCart}
          searchQuery={searchQuery}
          onUserUpdate={onUserUpdate}
        />
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;