import React from 'react';
import { Heart, Shield, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const quickActions = [
    {
      icon: <Heart className="h-6 w-6 text-green-600" />,
      title: 'AI Health Check',
      description: 'Get instant symptom analysis',
      link: '/symptom-checker',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      icon: <Shield className="h-6 w-6 text-green-700" />,
      title: 'Upload Prescription',
      description: 'Quick prescription upload',
      link: '/upload-prescription',
      color: 'bg-green-100 hover:bg-green-200'
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: 'Order History',
      description: 'Track your orders',
      link: '/order-history',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-teal-600" />,
      title: 'Health Insights',
      description: 'View your health trends',
      link: '/health-insights',
      color: 'bg-teal-50 hover:bg-teal-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <Link key={i} to={action.link} className={`${action.color} p-4 rounded-lg transition-all duration-200 transform hover:scale-105`}>
            <div className="flex flex-col items-center text-center">
              {action.icon}
              <h3 className="font-semibold text-gray-800 mt-2 text-sm">{action.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
