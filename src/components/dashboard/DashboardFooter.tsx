import React from 'react';
import { Pill, Phone, Mail, MapPin, Shield, Truck, Clock, Award } from 'lucide-react';

const DashboardFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Trust Indicators */}
      <div className="bg-green-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center animate-fade-in-up">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">FDA Ghana Licensed</h3>
              <p className="text-sm text-gray-600">All medicines FDA Ghana approved</p>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Same-Day Delivery</h3>
              <p className="text-sm text-gray-600">Accra, Kumasi & major cities</p>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">24/7 Support</h3>
              <p className="text-sm text-gray-600">English & Twi support</p>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">NHIS Accepted</h3>
              <p className="text-sm text-gray-600">National Health Insurance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="animate-fade-in-up">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600">Apomudenfie</span>
              </div>
              <p className="text-gray-400 mb-4">
                Ghana's trusted e-pharmacy with AI-powered health guidance. 
                Providing quality medicines and healthcare solutions with a local touch since 2020.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">+233 20 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">support@apomudenfie.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Accra, Ghana</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">AI Symptom Checker</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Upload Prescription</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Order History</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Account Settings</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-semibold mb-4">Medicine Categories</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Pain Relief</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Antibiotics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Vitamins & Supplements</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Malaria Treatment</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Diabetes Care</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-semibold mb-4">Support & Help</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">NHIS Information</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Apomudenfie. All rights reserved. FDA Ghana Licensed Pharmacy - License #PH-GH-2020-001
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Secured by SSL</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-green-600 rounded text-xs flex items-center justify-center font-bold text-white">VISA</div>
                <div className="w-8 h-5 bg-green-600 rounded text-xs flex items-center justify-center font-bold text-white">MC</div>
                <div className="w-8 h-5 bg-green-600 rounded text-xs flex items-center justify-center font-bold text-white">MP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;