import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, Shield, Zap, Heart, Truck, Clock, Award, ArrowRight,
  Star, MapPin, Activity, ShoppingCart, ChevronRight, ShieldCheck, 
  CheckCircle, Store, HeartPulse
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import images from assets folder
import pharmacyHeroImg from '../assets/pharmacy1.jpg';
import logoImg from '/src/assets/Aidfidelis logo background.png';

// Use public folder for images
const homeImageUrl = '/images/home.jpg';
const cartImageUrl = '/images/cart.jpg';

import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const LandingPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoadingPharmacies(true);
        const pharmaciesRef = collection(db, 'pharmacies');
        const querySnapshot = await getDocs(pharmaciesRef);
        
        const pharmacyList = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || data.pharmacyName || 'Partner Pharmacy',
            location: data.location || data.address || data.region || 'Ghana',
            image: data.image || data.logo || 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg',
            rating: data.rating || 4.8,
            timing: data.timing || data.hours || 'Open 24/7',
            riders: data.riders || '5 mins dispatch',
            ...data
          };
        });

        setPharmacies(pharmacyList.slice(0, 4));
      } catch (error) {
        console.error('Error fetching partner pharmacies:', error);
      } finally {
        setLoadingPharmacies(false);
      }
    };

    fetchPharmacies();
  }, []);

  const stats = [
    { icon: <ShieldCheck className="h-6 w-6" />, value: "100%", label: "Licensed Partners" },
    { icon: <MapPin className="h-6 w-6" />, value: "Ghana", label: "Launch Coverage" },
    { icon: <Clock className="h-6 w-6" />, value: "< 45 Mins", label: "Average Delivery" },
    { icon: <Award className="h-6 w-6" />, value: "Secured", label: "Insured Logistics" }
  ];

  const testimonials = [
    {
      name: "Kwame Mensah",
      role: "Accra Resident",
      content: "I compared prices between three shops and ordered from the cheapest one near me. AidFidelis delivered it in under 30 minutes. Exceptional service.",
      rating: 5
    },
    {
      name: "Dr. Akosua Boateng",
      role: "Pharmacist, Kumasi",
      content: "Listing our pharmacy on AidFidelis has helped us reach thousands of local customers we couldn't serve before. The platform is incredibly robust.",
      rating: 5
    },
    {
      name: "Ama Serwaa",
      role: "Parent",
      content: "No more driving around looking for specialized medications. I just search on the app, pick a nearby pharmacy, and it arrives directly at my door.",
      rating: 5
    }
  ];

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans scroll-smooth antialiased text-slate-900 overflow-x-hidden">
      
      {/* CSS For Custom Floating Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Premium Glassmorphism Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 transition-transform hover:scale-105">
                <img src={logoImg} alt="AidFidelis Logo" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">AidFidelis</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 font-bold text-sm">
              <a href="#features" className="text-slate-500 hover:text-violet-600 transition-colors tracking-wide">Platform</a>
              <a href="#about" className="text-slate-500 hover:text-violet-600 transition-colors tracking-wide">Network</a>
              <a href="#testimonials" className="text-slate-500 hover:text-violet-600 transition-colors tracking-wide">Reviews</a>
              <Link to="/login" className="text-slate-900 hover:text-violet-600 transition-colors tracking-wide">Sign In</Link>
              <Link to="/register" className="bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-500 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Clean Interactive Hero Section (Search Bar Removed) */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-40 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-violet-900/40 to-transparent skew-x-12 transform origin-top-right"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] rounded-full bg-violet-500/10 blur-[150px] mix-blend-screen"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">
            
            <div data-aos="fade-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                Digital Healthcare Infrastructure
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                Premium Pharmacy Care, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">
                  Delivered Instantly.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
                Search and order from fully licensed local pharmacies in your neighborhood. Compare pricing, verify stock, and receive secure dispatch delivery in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-violet-600 text-white px-8 py-4 rounded-2xl font-extrabold hover:bg-violet-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1"
                >
                  Create an Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1"
                >
                  Access Dashboard
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block h-[500px] w-full" data-aos="fade-left">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 rounded-[3rem] transform rotate-3 blur-2xl"></div>
              
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-float">
                <img
                  src={pharmacyHeroImg}
                  alt="Modern Pharmacy Integration"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Overlapping Stats Section with Smooth Transitions */}
      <section className="-mt-16 relative z-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-6 md:p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgb(16,185,129,0.18)] group" 
                data-aos="fade-up" 
                data-aos-delay={index * 150}
              >
                <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-violet-600 shadow-inner group-hover:bg-violet-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Replaced Clunky Dispatch Boxes with an Appealing Health & Safety Guarantee Banner */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-violet-950 text-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8" data-aos="fade-up">
            <div className="flex items-center gap-6">
              <div className="bg-violet-500/20 p-4 rounded-2xl text-violet-400 border border-violet-500/30 shrink-0">
                <HeartPulse className="h-10 w-10 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Patient Safety Guarantee</span>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">Your Health, Verified & Protected</h3>
                <p className="text-slate-300 text-sm font-medium mt-1">Every prescription is authenticated by certified pharmacists before dispatch to ensure absolute dosage accuracy.</p>
              </div>
            </div>
            <Link to="/register" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all shrink-0 hover:-translate-y-0.5">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features - Feature 1 */}
      <section id="features" className="py-24 bg-[#F8FAFC] relative overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold uppercase tracking-widest mb-6">
                <Activity className="h-3.5 w-3.5" /> Direct Access
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Consolidated Regional <br />Pharmacy Network.</h2>
              <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
                AidFidelis connects you directly to the live inventory of licensed pharmacies near you, establishing a secure, fast, and completely digital healthcare sourcing pipeline.
              </p>
              <div className="space-y-4">
                {[
                  "Execute instant stock searches across multiple local vendors",
                  "Compare pricing and logistics fees in real-time",
                  "Utilize on-demand dispatch riders for rapid delivery",
                  "Certified clinical pharmacists authenticate all orders"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-100 transition-all hover:bg-violet-50/50 hover:border-violet-100 shadow-sm">
                    <div className="bg-violet-50 shadow-sm p-1.5 rounded-lg shrink-0">
                      <CheckCircle className="h-5 w-5 text-violet-600" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative" data-aos="fade-left">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 rounded-[2.5rem] transform rotate-3 blur-xl"></div>
              <img
                src={homeImageUrl}
                alt="Modern pharmacy interior"
                className="relative rounded-[2.5rem] shadow-2xl w-full h-[550px] object-cover border border-slate-200"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features - Feature 2 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="relative" data-aos="fade-right">
              <div className="absolute inset-0 bg-gradient-to-tl from-violet-500/10 to-blue-500/10 rounded-[2.5rem] transform -rotate-3 blur-xl"></div>
              <img
                src={cartImageUrl}
                alt="Shopping cart experience"
                className="relative rounded-[2.5rem] shadow-2xl w-full h-[550px] object-cover border border-slate-200"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <div data-aos="fade-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-6">
                <ShoppingCart className="h-3.5 w-3.5" /> Unified Checkout
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Streamlined <br />Multi-Vendor Ordering.</h2>
              <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
                Procure medications from your preferred local facility with absolute confidence. Our intuitive marketplace interface enables seamless catalog navigation, transparent pricing comparison, and secure payment processing.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Zap />, text: "Live catalog inventory" },
                  { icon: <Shield />, text: "Encrypted transactions" },
                  { icon: <Pill />, text: "Secure script routing" },
                  { icon: <Star />, text: "Vendor rating system" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="text-violet-600 bg-white p-2 rounded-xl shrink-0 shadow-sm">{React.cloneElement(item.icon, { className: 'h-5 w-5' })}</div>
                    <span className="font-bold text-slate-700 text-sm leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pharmacies Showcase */}
      <section className="py-24 bg-[#F8FAFC] border-y border-slate-200/60" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Verified Partners</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Connecting you exclusively with fully licensed, FDA-approved pharmacies across the region.
            </p>
          </div>
          
          {loadingPharmacies ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
            </div>
          ) : pharmacies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {pharmacies.map((pharmacy, index) => (
                <div
                  key={pharmacy.id}
                  className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="relative h-48 bg-slate-200 overflow-hidden">
                    <img
                      src={pharmacy.image}
                      alt={pharmacy.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => { e.currentTarget.src = 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-violet-700 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="h-4 w-4" />
                      Verified
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-white relative">
                    <div className="absolute -top-8 left-6 bg-violet-500 text-white p-2.5 rounded-xl shadow-lg border-2 border-white">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="pt-4">
                      <h3 className="font-extrabold text-xl text-slate-900 mb-2 tracking-tight group-hover:text-violet-600 transition-colors line-clamp-1">{pharmacy.name}</h3>
                      <div className="flex items-center text-slate-500 text-sm mb-5 font-medium gap-1.5">
                        <MapPin className="h-4 w-4 text-violet-500 shrink-0" />
                        <span className="line-clamp-1">{pharmacy.location}</span>
                      </div>
                      <div className="flex gap-2 mb-6">
                        <span className="bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-violet-100">{pharmacy.timing}</span>
                        <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200">{pharmacy.riders || 'Delivery'}</span>
                      </div>
                    </div>
                    <Link
                      to="/register"
                      className="w-full bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-bold border border-slate-200 hover:border-slate-800"
                    >
                      View Full Catalog <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-2xl mx-auto">
              <Pill className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Network Syncing</h3>
              <p className="text-slate-500 font-medium">Establishing live connections to local healthcare facilities.</p>
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-violet-600 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Access Complete Marketplace
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white" data-aos="fade-up">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">System FAQ</h2>
            <p className="text-lg text-slate-500 font-medium">Core operational guidelines for the AidFidelis marketplace.</p>
          </div>
          <div className="grid gap-6">
            {[
              {
                q: "How does the AidFidelis marketplace function?",
                a: "The platform operates as a centralized digital interface. You input a required medication, the system maps available inventory across verified local pharmacies, you select your preferred vendor based on pricing or proximity, and an assigned dispatch rider handles the logistics directly to your location."
              },
              {
                q: "What are the verification standards for listed pharmacies?",
                a: "Our compliance protocols are absolute. We exclusively integrate physical pharmacies that maintain active, verifiable certifications from the FDA Ghana and the National Pharmacy Council."
              },
              {
                q: "What is the protocol for prescription-only medications?",
                a: "For restricted inventory, you are required to upload a digital capture of your clinical prescription during checkout. The licensed pharmacist operating at the dispensing facility must authenticate the document before the transaction is cleared for dispatch."
              },
              {
                q: "What are the expected logistics timeframes?",
                a: "Because the routing algorithms prioritize facilities within your immediate geographic perimeter, our active dispatch fleet maintains an average delivery completion time of 30 to 45 minutes."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-aos="fade-up" data-aos-delay={idx * 100}>
                <h3 className="font-extrabold text-lg text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-900 border-t border-slate-800" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Verified Experiences</h2>
            <p className="text-lg text-slate-400 font-medium">Feedback from active users across the regional network.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-3xl border border-slate-700 relative hover:border-violet-500/50 transition-colors duration-300 group"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-violet-500 to-indigo-400 rounded-b-full"></div>
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-violet-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-8 font-medium leading-relaxed group-hover:text-white transition-colors">"{testimonial.content}"</p>
                <div className="flex items-center gap-4 border-t border-slate-700/50 pt-6 mt-auto">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-black text-violet-400 shadow-inner">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-white">{testimonial.name}</div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[80%] bg-violet-50 blur-[150px] rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Ready for Premium Healthcare?</h2>
          <p className="text-xl mb-10 text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Initialize your profile to securely access verified local pharmacies and activate lightning-fast clinical delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-violet-600 text-white px-10 py-5 rounded-2xl font-extrabold hover:bg-violet-500 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              Establish Your Profile
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-[#0B1221] text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white p-1.5 rounded-xl">
                  <img src={logoImg} alt="AidFidelis Logo" className="h-10 w-10 object-contain" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">AidFidelis</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                Ghana's trusted digital pharmacy infrastructure. Integrating localized clinical inventory with secure, rapid dispatch protocols.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-extrabold uppercase tracking-widest text-sm mb-6">Platform Architecture</h3>
              <ul className="space-y-4">
                <li><a href="#features" className="text-slate-400 hover:text-violet-400 transition-colors font-medium">System Features</a></li>
                <li><a href="#about" className="text-slate-400 hover:text-violet-400 transition-colors font-medium">Partner Network</a></li>
                <li><a href="#testimonials" className="text-slate-400 hover:text-violet-400 transition-colors font-medium">User Reviews</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-extrabold uppercase tracking-widest text-sm mb-6">Operations & Support</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-violet-400 transition-colors font-medium">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-violet-400 transition-colors font-medium">Contact Routing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-violet-400 transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-violet-400 transition-colors font-medium">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-extrabold uppercase tracking-widest text-sm mb-6">Compliance & Security</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="h-5 w-5 text-violet-500" />
                  <span className="text-slate-400 font-medium text-sm">FDA Licensed Facilities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-violet-500" />
                  <span className="text-slate-400 font-medium text-sm">Quality Assured Sourcing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-violet-500" />
                  <span className="text-slate-400 font-medium text-sm">Monitored Dispatch Grid</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-16 pt-8 text-center md:flex md:justify-between md:items-center">
            <p className="text-slate-500 font-medium text-sm mb-4 md:mb-0">
              © 2026 AidFidelis. All rights reserved.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Registered Healthcare Infrastructure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;