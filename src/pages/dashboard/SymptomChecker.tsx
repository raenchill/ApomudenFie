import React from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import SymptomCheckerComponent from '../../components/SymptomChecker';
import { User } from '../../types';

interface SymptomCheckerProps {
  user: User;
  cartItemsCount: number;
  onLogout: () => void;
}

const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  user,
  cartItemsCount,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user}
        cartItemsCount={cartItemsCount}
        onSearch={() => {}}
        onLogout={onLogout}
      />
      
      <main>
        <SymptomCheckerComponent />
      </main>

      <DashboardFooter />
    </div>
  );
};

export default SymptomChecker;