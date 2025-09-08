import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import { User } from '../../types';
import { BarChart2, Activity, HeartPulse, ShoppingBag, Sun, ArrowUpRight, Download, Printer, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { healthInsightsService, HealthStat, ChartData, HealthActivity, HealthTip, MedicationAdherence } from '../../services/healthInsightsService';
import { fixExistingOrders } from '../../utils/fixOrderData';


interface HealthInsightsProps {
  user: User;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ user }) => {
  const [healthStats, setHealthStats] = useState<HealthStat[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentActivities, setRecentActivities] = useState<HealthActivity[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [medicationAdherence, setMedicationAdherence] = useState<MedicationAdherence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Load real-time data from Firebase
  useEffect(() => {
    const loadHealthInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading health insights for user:', user?.id);

        // Check if user has an ID
        if (!user?.id) {
          setError('User information not available. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Health Insights - User object:', user);
        console.log('Health Insights - User ID:', user.id);
        console.log('Health Insights - User ID type:', typeof user.id);

        // Automatically fix order data structure if needed (runs in background)
        try {
          console.log('Checking and fixing order data structure...');
          const fixedCount = await fixExistingOrders();
          if (fixedCount > 0) {
            console.log(`Fixed ${fixedCount} orders with data structure issues`);
          }
        } catch (fixError) {
          console.warn('Error fixing order data (non-critical):', fixError);
        }



        // Load all health insights data
        console.log('Fetching health insights data...');
        
        // Load data one by one to identify which one is failing
        console.log('1. Loading health stats...');
        const stats = await healthInsightsService.getHealthStats(user.id);
        console.log('Health stats loaded:', stats);
        
        console.log('2. Loading weekly data...');
        const weeklyData = await healthInsightsService.getWeeklyOrderData(user.id);
        console.log('Weekly data loaded:', weeklyData);
        
        console.log('3. Loading recent activities...');
        const activities = await healthInsightsService.getRecentActivities(user.id);
        console.log('Recent activities loaded:', activities);
        
        console.log('4. Loading health tips...');
        const tips = await healthInsightsService.getHealthTips();
        console.log('Health tips loaded:', tips);
        
        console.log('5. Loading medication adherence...');
        const adherence = await healthInsightsService.getMedicationAdherence(user.id);
        console.log('Medication adherence loaded:', adherence);

        console.log('Health insights data loaded:', {
          stats: stats.length,
          weeklyData: weeklyData.length,
          activities: activities.length,
          tips: tips.length,
          adherence: adherence.length
        });

        // Set data with fallbacks for empty results
        setHealthStats(stats.length > 0 ? stats : [
          { label: 'Total Orders', value: '0', icon: 'shopping-bag', color: 'blue', trend: 'stable' },
          { label: 'Health Score', value: '85%', icon: 'heart-pulse', color: 'green', trend: 'up' },
          { label: 'Last Check', value: 'Today', icon: 'activity', color: 'purple', trend: 'stable' },
          { label: 'Medications', value: '0', icon: 'pill', color: 'orange', trend: 'stable' }
        ]);
        
        setChartData(weeklyData.length > 0 ? weeklyData : [
          { day: 'Mon', orders: 0, amount: 0 },
          { day: 'Tue', orders: 0, amount: 0 },
          { day: 'Wed', orders: 0, amount: 0 },
          { day: 'Thu', orders: 0, amount: 0 },
          { day: 'Fri', orders: 0, amount: 0 },
          { day: 'Sat', orders: 0, amount: 0 },
          { day: 'Sun', orders: 0, amount: 0 }
        ]);
        
        setRecentActivities(activities.length > 0 ? activities : [
          {
            id: 'welcome-activity',
            type: 'order',
            title: 'Welcome to Health Insights',
            description: 'Start by uploading a prescription or placing an order to see your health data here.',
            timestamp: new Date(),
            status: 'completed'
          }
        ]);
        
        setHealthTips(tips.length > 0 ? tips : [
          {
            id: 'tip-1',
            title: 'Welcome to Your Health Dashboard',
            content: 'This is where you\'ll see your health insights once you start using the pharmacy services.',
            category: 'general',
            priority: 'high'
          }
        ]);
        
        setMedicationAdherence(adherence.length > 0 ? adherence : []);
      } catch (err) {
        console.error('Error loading health insights:', err);
        setError('Failed to load health insights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadHealthInsights();
  }, [user?.id]);

  // Helper function to render trend icon
  const renderTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  // Helper function to render stat icon
  const renderStatIcon = (iconName: string, color: string) => {
    const iconClass = `h-6 w-6 ${color.split(' ')[1]}`;
    switch (iconName) {
      case 'shopping-bag':
        return <ShoppingBag className={iconClass} />;
      case 'heart-pulse':
        return <HeartPulse className={iconClass} />;
      case 'activity':
        return <Activity className={iconClass} />;
      case 'bar-chart-2':
        return <BarChart2 className={iconClass} />;
      default:
        return <BarChart2 className={iconClass} />;
    }
  };




  // CSV export logic
  const handleExportCSV = () => {
    const statsRows = healthStats.map(stat => `${stat.label},${stat.value}`);
    const activityRows = recentActivities.map(activity => 
      `${activity.title} - ${activity.description}`
    );
    const csvContent = [
      'Health Insights',
      '',
      'Stats',
      ...statsRows,
      '',
      'Recent Activity',
      ...activityRows
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health-insights.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} cartItemsCount={0} onSearch={() => {}} onLogout={() => {}} />
      <main className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Health Insights</h1>

        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-green-600 font-medium text-lg mb-2">Loading your health insights...</p>
            <p className="text-gray-500 text-sm mb-4">Connecting to your health database and analyzing your data</p>
            <div className="max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 What we're analyzing:</h4>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Your medicine order history</li>
                <li>• Health activity patterns</li>
                <li>• Medication adherence</li>
                <li>• Personalized health tips</li>
              </ul>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-1">Error Loading Health Data</h4>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard'} 
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white border border-red-200 rounded-lg">
              <h5 className="text-sm font-semibold text-red-800 mb-2">🔧 Troubleshooting:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Make sure you're logged in properly</li>
                <li>• Try refreshing the page</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        )}

                {/* Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
          {/* No Data State */}
          {healthStats.length === 0 && chartData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Health Data Available</h3>
              <p className="text-gray-500 mb-4">
                We couldn't find any order history for your account. Health insights are generated from your medicine orders and health activities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => window.location.href = '/dashboard'} 
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Medicines
                </button>
                <button 
                  onClick={() => window.location.href = '/upload-prescription'} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Prescription
                </button>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 How to get health insights:</h4>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  <li>• Place orders for medicines</li>
                  <li>• Upload prescription receipts</li>
                  <li>• Use the symptom checker</li>
                  <li>• Complete your health profile</li>
                </ul>
              </div>
            </div>
          )}

          {/* Data Available */}
          {(healthStats.length > 0 || chartData.length > 0) && (
            <>
            {/* Success Indicator */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Health Insights Loaded Successfully</h4>
                  <p className="text-green-700 text-sm">
                    Your health data has been analyzed and insights are ready. 
                    {healthStats.length > 0 && ` Found ${healthStats.length} health metrics.`}
                    {chartData.length > 0 && ` Generated ${chartData.length} days of activity data.`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mb-8">
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors print:hidden">
            <Printer className="h-5 w-5" /> Print
          </button>
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden">
            <Download className="h-5 w-5" /> Export as CSV
          </button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {healthStats.map((stat, idx) => (
            <div key={idx} className={`rounded-xl p-6 flex items-center gap-4 shadow-md animate-fade-in-up ${stat.color}`} style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="flex-shrink-0">{renderStatIcon(stat.icon, stat.color)}</div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium opacity-80">{stat.label}</div>
              </div>
              {renderTrendIcon(stat.trend)}
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-5 w-5 text-green-700" />
            <span className="font-semibold text-green-700">Orders This Week</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: '#15803d', fontWeight: 600 }} />
                <YAxis tick={{ fill: '#15803d', fontWeight: 600 }} />
                <Tooltip contentStyle={{ background: '#f0fdf4', borderColor: '#22c55e', color: '#166534' }} />
                <Bar dataKey="orders" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Tips */}
        <div className="bg-green-50 rounded-xl shadow-md p-6 mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-green-700">Ghana Health Tips</span>
          </div>
          <ul className="list-disc pl-6 text-green-900 space-y-1">
            {healthTips.map((tip, idx) => (
              <li key={idx} className="mb-2">
                <span className="font-medium">{tip.title}:</span> {tip.content}
              </li>
            ))}
          </ul>
        </div>
        {/* Medication Adherence */}
        {medicationAdherence.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-10 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-green-700">Medication Adherence</span>
            </div>
            <div className="space-y-4">
              {medicationAdherence.map((medication, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{medication.medicationName}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      medication.adherenceRate >= 90 ? 'bg-green-100 text-green-800' :
                      medication.adherenceRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {medication.adherenceRate}% Adherence
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Dosage:</span> {medication.prescribedDosage}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {medication.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Last Taken:</span> {medication.lastTaken.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Missed Doses:</span> {medication.missedDoses}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-green-700">Recent Activity</span>
          </div>
          {recentActivities.length > 0 ? (
            <ul className="text-gray-700 space-y-2">
              {recentActivities.map((activity, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span>{activity.title}</span>
                  <span className={`text-sm ${
                    activity.status === 'completed' ? 'text-green-700' :
                    activity.status === 'processing' ? 'text-yellow-700' :
                    'text-gray-500'
                  }`}>
                    {activity.description}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
            </>
          )}
          </>
        )}
      </main>
      <DashboardFooter />
    </div>
  );
};

export default HealthInsights; 