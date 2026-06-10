import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, 
  Shield, 
  Zap, 
  Heart, 
  Truck, 
  Clock, 
  Award, 
  ArrowRight,
  Star,
  Users,
  Activity,
  ShoppingCart
} from 'lucide-react';
// Import images
import pharmacyHeroImg from '../assets/pharmacy1.jpg';

// Use public folder for images
const homeImageUrl = '/images/home.jpg';
const cartImageUrl = '/images/cart.jpg';
const prescriptionImageUrl = '/images/prescription.jpg';
const pharmacyImageUrl = '/images/pharmacy1.jpg';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { db } from '../firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { Medicine } from '../types';

// Ghanaian color palette

// Simple pharmacy hero slider component


const LandingPage: React.FC = () => {
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);

  // Fetch featured medicines from Firebase
  useEffect(() => {
    const fetchFeaturedMedicines = async () => {
      try {
        setLoadingMedicines(true);
        const medicinesRef = collection(db, 'medicines');
        
        // Try with orderBy first, fallback to simple query
        let querySnapshot;
        try {
          const q = query(
            medicinesRef,
            orderBy('rating', 'desc'),
            limit(8)
          );
          querySnapshot = await getDocs(q);
        } catch (orderByError) {
          console.log('OrderBy failed, trying without orderBy:', orderByError);
          // Fallback: get all medicines and sort manually
          const q = query(medicinesRef, limit(8));
          querySnapshot = await getDocs(q);
        }
        
        const medicines = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Medicine[];
        
        // Sort manually if orderBy failed
        medicines.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        console.log('Featured medicines fetched:', medicines);
        medicines.forEach(med => {
          console.log(`Medicine: ${med.name}, Image: ${med.image}`);
        });
        
        setFeaturedMedicines(medicines);
      } catch (error) {
        console.error('Error fetching featured medicines:', error);
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchFeaturedMedicines();
  }, []);

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-400" />, // gold/yellow
      title: "AI Symptom Checker",
      description: "Get instant health insights tailored for Ghanaians, powered by advanced AI and local expertise."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "NHIS & Licensed Care",
      description: "NHIS accepted. All medicines are FDA Ghana approved and handled by licensed pharmacists."
    },
    {
      icon: <Truck className="h-8 w-8 text-red-600" />,
      title: "Fast Local Delivery",
      description: "Same-day delivery in Accra, Kumasi, and more. Trusted by thousands of Ghanaian families."
    },
    {
      icon: <Heart className="h-8 w-8 text-black" />,
      title: "Community Support",
      description: "24/7 support in English and Twi. Your health, our priority—right here in Ghana."
    }
  ];

  const stats = [
    { icon: <Users className="h-6 w-6" />, value: "20K+", label: "Ghanaian Customers" },
    { icon: <Pill className="h-6 w-6" />, value: "5K+", label: "Medicines Stocked" },
    { icon: <Activity className="h-6 w-6" />, value: "99.9%", label: "Uptime" },
    { icon: <Award className="h-6 w-6" />, value: "4.9/5", label: "Local Rating" }
  ];

  const testimonials = [
    {
      name: "Kwame Mensah",
      role: "Accra Resident",
      content: "Apomudenfie delivered my medicine the same day! The AI checker even explained my symptoms in Twi.",
      rating: 5
    },
    {
      name: "Dr. Akosua Boateng",
      role: "Pharmacist, Kumasi",
      content: "I trust Apomudenfie for my patients. Their NHIS integration and local expertise are unmatched.",
      rating: 5
    },
    {
      name: "Ama Serwaa",
      role: "Mother of 3",
      content: "Ordering for my family is so easy. I love the Ghanaian touch and the friendly support!",
      rating: 5
    }
  ];

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 80 });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans scroll-smooth">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              {/* Subtle Ghanaian accent color for logo */}
              <div className="bg-green-700 p-2 rounded-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-700 tracking-wide">Apomudenfie</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-green-700 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-green-700 transition-colors">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-green-700 transition-colors">Reviews</a>
              <Link to="/register" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-all duration-200 shadow font-semibold">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with static background image */}
      <section className="relative h-[600px] md:h-[750px] w-full flex items-center justify-center border-b border-gray-100 overflow-hidden" data-aos="fade-up">
        {/* Static pharmacy background image */}
        <img
          src={pharmacyHeroImg}
          alt="Pharmacy background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          draggable={false}
          onError={(e) => {
            console.error('Failed to load pharmacy hero image:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20 w-full max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fade-in-up">
            Welcome to <span className="text-green-300">Apomudenfie</span>
            <span className="block text-lg md:text-2xl font-medium text-white mt-2">Your Ghanaian E-Pharmacy</span>
          </h1>
          <div className="flex justify-center animate-fade-in-up mb-8">
            <div className="bg-green-700/70 rounded-xl px-6 py-4 shadow-lg max-w-xl w-full">
              <p className="text-lg md:text-xl text-white leading-relaxed">
                Trusted by Ghanaians for genuine medicines, fast delivery, and AI-powered health checks. NHIS accepted. Experience healthcare with a local touch.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link
              to="/register"
              className="bg-green-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800 transition-all duration-200 flex items-center justify-center gap-2 shadow"
            >
              Start Your Health Journey
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-aos="zoom-in" data-aos-delay={index * 100}>
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-green-900 mb-2">{stat.value}</div>
                <div className="text-gray-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Image Section */}
      <section className="py-20 bg-white" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-right">
              <h2 className="text-4xl font-bold text-green-900 mb-6">Your Health, Our Priority</h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Experience healthcare reimagined for Ghana. Our modern pharmacy combines traditional care with cutting-edge technology, ensuring you receive the best medicines and expert advice right at your doorstep.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Same-day delivery in major cities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">NHIS accepted for eligible medicines</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">24/7 customer support in English & Twi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">AI-powered health symptom checker</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2" data-aos="fade-left">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl transform rotate-3"></div>
                <img
                  src={homeImageUrl}
                  alt="Modern pharmacy interior"
                  className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                  onError={(e) => {
                    console.error('Failed to load home image:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-4 -right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg">
                  <span className="font-semibold">Trusted by 20K+ Ghanaians</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping Experience Section */}
      <section className="py-20 bg-gray-50" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-1" data-aos="fade-right">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl transform -rotate-3"></div>
                <img
                  src={cartImageUrl}
                  alt="Shopping cart experience"
                  className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                  onError={(e) => {
                    console.error('Failed to load cart image:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-4 -left-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg">
                  <span className="font-semibold">Easy Shopping</span>
                </div>
              </div>
            </div>
            <div className="order-2" data-aos="fade-left">
              <h2 className="text-4xl font-bold text-green-900 mb-6">Seamless Shopping Experience</h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Shop for medicines with confidence. Our intuitive platform makes it easy to browse, compare, and order your medications with secure payment options and real-time order tracking.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Secure payment with Paystack integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Real-time order tracking and updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Prescription upload and verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Mobile-responsive design for all devices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prescription Upload Section */}
      <section className="py-20 bg-white" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-right">
              <h2 className="text-4xl font-bold text-green-900 mb-6">Easy Prescription Upload</h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Upload your prescriptions securely and get expert verification from licensed pharmacists. Our streamlined process ensures your prescription medicines are dispensed safely and efficiently.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Secure prescription upload and storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Expert pharmacist verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Quick approval process</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Digital prescription management</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2" data-aos="fade-left">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl transform rotate-3"></div>
                <img
                  src={prescriptionImageUrl}
                  alt="Prescription upload interface"
                  className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                  onError={(e) => {
                    console.error('Failed to load prescription image:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute -bottom-4 -right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg">
                  <span className="font-semibold">Secure Upload</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-b border-gray-100" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-900 mb-4">Why Choose Apomudenfie?</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Combining Ghanaian values, technology, and trusted healthcare for your family.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-4">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gray-50 border-b border-gray-100" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-green-900 mb-4 animate-slide-in-up">About Apomudenfie</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto animate-fade-in-up">
              Apomudenfie is Ghana's trusted e-pharmacy, dedicated to making healthcare accessible, affordable, and reliable for all. Our mission is to empower Ghanaians with genuine medicines, expert advice, and innovative technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center" data-aos="flip-left" data-aos-delay="100">
              <Shield className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-lg text-green-900 mb-2">Licensed & Secure</h3>
              <p className="text-gray-600 text-center">All medicines are FDA Ghana approved and handled by licensed pharmacists.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center" data-aos="flip-left" data-aos-delay="200">
              <Heart className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="font-semibold text-lg text-green-900 mb-2">Community Focused</h3>
              <p className="text-gray-600 text-center">We support Ghanaians in English and Twi, with 24/7 care and local expertise.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center" data-aos="flip-left" data-aos-delay="300">
              <Zap className="h-10 w-10 text-yellow-400 mb-4" />
              <h3 className="font-semibold text-lg text-green-900 mb-2">Innovative Technology</h3>
              <p className="text-gray-600 text-center">AI-powered health checks and seamless online ordering for your convenience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-20 bg-white border-b border-gray-100" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-green-900 mb-4 animate-slide-in-up">Popular Categories</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto animate-fade-in-up">Browse our most popular medicine categories, trusted by thousands of Ghanaians.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300" data-aos="zoom-in" data-aos-delay="100">
              <Pill className="h-10 w-10 text-blue-600 mb-3" />
              <span className="font-semibold text-green-900">Pain Relief</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300" data-aos="zoom-in" data-aos-delay="200">
              <Shield className="h-10 w-10 text-green-600 mb-3" />
              <span className="font-semibold text-green-900">Antibiotics</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300" data-aos="zoom-in" data-aos-delay="300">
              <Heart className="h-10 w-10 text-red-500 mb-3" />
              <span className="font-semibold text-green-900">Vitamins</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300" data-aos="zoom-in" data-aos-delay="400">
              <Truck className="h-10 w-10 text-yellow-500 mb-3" />
              <span className="font-semibold text-green-900">Wellness</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Medicines Section */}
      <section className="py-20 bg-gray-50 border-b border-gray-100" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-green-900 mb-4 animate-slide-in-up">Featured Medicines</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto animate-fade-in-up">Discover our most popular and highly-rated medicines, trusted by thousands of Ghanaians.</p>
          </div>
          
          {loadingMedicines ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading featured medicines...</p>
              </div>
            </div>
          ) : featuredMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredMedicines.map((medicine, index) => (
                <div
                  key={medicine.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="relative">
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg';
                      }}
                    />
                    {medicine.discountPrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                        {Math.round(((medicine.price - medicine.discountPrice) / medicine.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-green-900 mb-2 line-clamp-2">{medicine.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{medicine.description}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(medicine.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">({medicine.reviews || 0})</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {medicine.discountPrice ? (
                          <>
                            <span className="text-lg font-bold text-green-600">₵{medicine.discountPrice}</span>
                            <span className="text-sm text-gray-500 line-through">₵{medicine.price}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-green-600">₵{medicine.price}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {medicine.category}
                      </span>
                    </div>
                    
                    <Link
                      to="/register"
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No medicines available</h3>
              <p className="text-gray-500">Check back soon for our latest medicine offerings</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Browse All Medicines
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 border-b border-gray-100" data-aos="fade-up">
        <div className="max-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-green-900 mb-4 animate-slide-in-up">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto animate-fade-in-up">Find answers to common questions about Apomudenfie's services, delivery, and more.</p>
          </div>
          <div className="space-y-6 mt-8">
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="100">
              <h3 className="font-semibold text-green-800 mb-2">How do I order medicines?</h3>
              <p className="text-gray-700">Simply register, search for your medicine, add to cart, and checkout. Our team will verify and deliver to your doorstep.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="200">
              <h3 className="font-semibold text-green-800 mb-2">Is Apomudenfie licensed?</h3>
              <p className="text-gray-700">Yes, we are fully licensed by the FDA Ghana and all medicines are sourced from trusted suppliers.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="300">
              <h3 className="font-semibold text-green-800 mb-2">Do you accept NHIS?</h3>
              <p className="text-gray-700">Yes, we accept NHIS for eligible medicines and services. Contact support for more info.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="400">
              <h3 className="font-semibold text-green-800 mb-2">How fast is delivery?</h3>
              <p className="text-gray-700">We offer same-day delivery in Accra, Kumasi, and other major cities. Track your order in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white border-t border-b border-gray-100" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-900 mb-4">What Ghanaians Say</h2>
            <p className="text-xl text-gray-700">Trusted by families and professionals across Ghana</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-600"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-green-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Ready to Experience Ghanaian Healthcare?</h2>
          <p className="text-xl mb-8 text-yellow-100">
            Join thousands of Ghanaians who trust Apomudenfie for their health needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow"
            >
              Get Started Today
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-green-700 p-2 rounded-lg">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Apomudenfie</span>
              </div>
              <p className="text-gray-400">
                Your trusted Ghanaian e-pharmacy, providing quality medicines and AI-powered health guidance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Trust Indicators</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400">FDA Ghana Licensed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-400">Quality Assured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-400" />
                  <span className="text-gray-400">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Apomudenfie. All rights reserved. Licensed Ghana Pharmacy - FDA #GH123456
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;