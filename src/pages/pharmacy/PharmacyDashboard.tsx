import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Package, ShoppingCart, TrendingUp, TrendingDown, 
  Plus, LogOut, DollarSign, BarChart3, Layers, ShieldCheck, 
  ArrowUpRight, AlertCircle, Trash2, Edit2, Loader2, Camera, Image as ImageIcon, Calendar, FileText, AlertTriangle, CheckCircle, X, BellRing
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface PharmacyDashboardProps {
  pharmacyUser?: any;
  onLogout?: () => void;
}

const PharmacyDashboard: React.FC<PharmacyDashboardProps> = ({ pharmacyUser, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stocks' | 'orders' | 'add-drug'>('overview');
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedPharmacyImage, setResolvedPharmacyImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const [drugName, setDrugName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [drugClass, setDrugClass] = useState('');
  const [productType, setProductType] = useState<'medicine' | 'health_product'>('medicine');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [otcEligible, setOtcEligible] = useState(false);
  const [drugCategory, setDrugCategory] = useState('Painkillers');
  const [drugDosage, setDrugDosage] = useState('');
  const [drugForm, setDrugForm] = useState('Tablets');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [drugPrice, setDrugPrice] = useState('');
  const [drugStock, setDrugStock] = useState('');
  const [drugImage, setDrugImage] = useState<string | null>(null);
  const [submittingDrug, setSubmittingDrug] = useState(false);
  const [formError, setFormError] = useState('');

  // FIXED: Bulletproof Pharmacy Name Resolution that survives page refreshes
  const [pharmacyName, setPharmacyName] = useState(() => {
    return pharmacyUser?.name || localStorage.getItem('approvedPharmacyName') || '';
  });

  useEffect(() => {
    if (pharmacyUser?.name && pharmacyUser.name !== pharmacyName) {
      setPharmacyName(pharmacyUser.name);
      localStorage.setItem('approvedPharmacyName', pharmacyUser.name);
    }
  }, [pharmacyUser]);

  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  
  const unconfirmedOrders = orders.filter(o => o.status === 'awaiting_vendor_confirmation');
  const hasUnconfirmedOrders = unconfirmedOrders.length > 0;

  useEffect(() => {
    audio.loop = true;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  useEffect(() => {
    if (hasUnconfirmedOrders && activeTab !== 'orders') {
      audio.play().catch(e => console.log("Browser autoplay blocked audio until user clicks.", e));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [hasUnconfirmedOrders, activeTab, audio]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPharmacyProducts = async () => {
    if (!pharmacyName) {
      setLoading(false);
      return;
    }

    const timeoutTimer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    try {
      setLoading(true);
      const pharmQuery = query(collection(db, 'pharmacies'), where('name', '==', pharmacyName));
      const pharmSnap = await getDocs(pharmQuery);
      if (!pharmSnap.empty) {
        const pharmData = pharmSnap.docs[0].data();
        if (pharmData.image) setResolvedPharmacyImage(pharmData.image);
      }

      const prodQuery = query(collection(db, 'medicines'), where('pharmacyName', '==', pharmacyName));
      const prodSnap = await getDocs(prodQuery);
      const prodList = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prodList);
      
    } catch (err) {
      console.error('Error fetching pharmacy dashboard products:', err);
    } finally {
      clearTimeout(timeoutTimer);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pharmacyName) return;
    
    const orderQuery = query(collection(db, 'orders'), where('pharmacyName', '==', pharmacyName));
    const unsubscribe = onSnapshot(orderQuery, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      orderList.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setOrders(orderList);
    }, (err) => console.error("Error subscribing to orders:", err));

    return () => unsubscribe();
  }, [pharmacyName]);

  useEffect(() => {
    if (pharmacyName) {
      fetchPharmacyProducts();
    }
  }, [pharmacyName]);

  const pharmacyImg = pharmacyUser?.image || resolvedPharmacyImage || null;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        try {
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
          } else {
            if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) { reject(e); }
      };
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrugImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setDrugImage(compressed);
      } catch (err) {
        console.error('Image compression issue:', err);
        setDrugImage(URL.createObjectURL(file));
      }
    }
  };

  const handleAddDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !drugName.trim() ||
      !genericName.trim() ||
      !activeIngredient.trim() ||
      !drugClass.trim() ||
      !drugDosage.trim() ||
      !batchNumber.trim() ||
      !expiryDate ||
      !drugPrice ||
      !drugStock
    ) {
      setFormError(
        'Please fill in all required medicine identity, classification, dosage, batch, price and stock fields.'
      );
      return;
    }

    if (otcEligible && prescriptionRequired) {
      setFormError(
        'A medicine cannot be marked both OTC eligible and prescription required. Please correct the classification.'
      );
      return;
    }

    if (!drugImage) {
      setFormError('Product Image is required. Please upload an image from your device before publishing.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (expiryDate <= today) {
      setFormError('Expiry date must be in the future. Expired drugs cannot be listed.');
      return;
    }

    setSubmittingDrug(true);
    try {
      const parsedPrice = parseFloat(drugPrice);
      const parsedStock = parseInt(drugStock, 10);

      const normalizedMedicineName = genericName
        .trim()
        .toLowerCase()
        .replace(/[_/+\\-]+/g, ' ')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      await addDoc(collection(db, 'medicines'), {
        // Display / inventory identity
        name: drugName.trim(),
        normalizedName: normalizedMedicineName,
        genericName: genericName.trim(),
        activeIngredient: activeIngredient.trim(),
        drugClass: drugClass.trim(),
        productType: productType,

        // Regulatory / AI-routing metadata submitted by pharmacy.
        // These remain pending until Admin approves the product.
        prescriptionRequired: prescriptionRequired,
        otcEligible: otcEligible,
        classificationReviewStatus: 'pending_admin_review',
        approvedForMapping: false,

        // Existing catalog fields
        category: drugCategory,
        dosage: drugDosage.trim(),
        form: drugForm,
        batchNumber: batchNumber.trim().toUpperCase(),
        expiryDate: expiryDate,
        manufacturingDate: manufacturingDate || null,
        price: parsedPrice,
        adminPrice: parsedPrice,
        stock: parsedStock,
        inStock: parsedStock > 0,

        // Pharmacy ownership
        pharmacyName: pharmacyName,
        pharmacyId: pharmacyUser?.id || pharmacyUser?.pharmacyId || null,

        image: drugImage,

        // Admin moderation
        isApproved: false,
        isRejected: false,
        rejectionReason: '',

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setDrugName('');
      setGenericName('');
      setActiveIngredient('');
      setDrugClass('');
      setProductType('medicine');
      setPrescriptionRequired(false);
      setOtcEligible(false);
      setDrugDosage('');
      setBatchNumber('');
      setExpiryDate('');
      setManufacturingDate('');
      setDrugPrice('');
      setDrugStock('');
      setDrugImage(null);
      showToast('Drug specification submitted to Admin for quality audit and price markup review.');
      setActiveTab('products');
      fetchPharmacyProducts();
    } catch (err) {
      console.error('Failed to add drug:', err);
      setFormError('Error adding drug to inventory.');
    } finally {
      setSubmittingDrug(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from your inventory?')) return;
    try {
      await deleteDoc(doc(db, 'medicines', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'searching_riders' });
      showToast('Payment verified successfully! System is now searching for a rider.', 'success');
    } catch (error) {
      console.error("Error verifying payment:", error);
      showToast('Failed to confirm payment. Please try again.', 'info');
    }
  };

  // FIXED: Revenue and order calculations. Only count completed/arrived orders.
  const totalStockCount = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  
  const completedOrdersList = orders.filter(o => ['completed', 'arrived', 'delivered'].includes(o.status));
  const totalRevenue = completedOrdersList.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
  
  const productSalesCount: { [key: string]: number } = {};
  completedOrdersList.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const name = item.medicine?.name || item.name || 'Unknown Drug';
        productSalesCount[name] = (productSalesCount[name] || 0) + (item.quantity || 1);
      });
    }
  });

  const sortedSales = Object.entries(productSalesCount).sort((a, b) => b[1] - a[1]);
  const bestSeller = sortedSales.length > 0 ? sortedSales[0][0] : 'No sales yet';
  const worstSeller = sortedSales.length > 1 ? sortedSales[sortedSales.length - 1][0] : 'N/A';

  const handleLogoutAction = () => {
    localStorage.removeItem('approvedPharmacyName');
    if (onLogout) {
      onLogout();
    } else {
      navigate('/pharmacy-login');
    }
  };

  if (loading || !pharmacyName) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-violet-700" />
        <p className="text-xs font-semibold text-gray-500">Loading Pharmacy Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4" /></div>
          <span>{toastMessage.text}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {hasUnconfirmedOrders && activeTab !== 'orders' && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-600 transition-colors shadow-md z-40" onClick={() => setActiveTab('orders')}>
          <BellRing className="w-4 h-4 animate-bounce" />
          <span className="text-xs font-bold uppercase tracking-wider">Urgent: {unconfirmedOrders.length} Order(s) Awaiting Payment Verification! Click to view.</span>
        </div>
      )}

      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 shadow-inner flex items-center justify-center">
            {pharmacyImg ? <img src={pharmacyImg} alt="Pharmacy Store" className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6 text-gray-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-gray-900 tracking-tight">{pharmacyName}</h1>
              <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Approved Partner
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Storefront Operations & Inventory Hub</p>
          </div>
        </div>
        <button type="button" onClick={handleLogoutAction} className="flex items-center gap-2 text-xs font-bold text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-xl transition-colors border border-red-100 cursor-pointer">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-2 overflow-x-auto relative">
        {[
          { key: 'overview', label: 'Dashboard Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { key: 'products', label: 'My Products', icon: <Package className="w-4 h-4" /> },
          { key: 'stocks', label: 'Stocks & Inventory', icon: <Layers className="w-4 h-4" /> },
          { key: 'orders', label: 'Customer Orders', icon: <ShoppingCart className="w-4 h-4" /> },
          { key: 'add-drug', label: '+ Add New Drug', icon: <Plus className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer relative ${activeTab === tab.key ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'}`}
          >
            {tab.icon} {tab.label}
            {tab.key === 'orders' && hasUnconfirmedOrders && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto w-full p-6 space-y-6 flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Revenue</span>
                <h3 className="text-2xl font-black text-violet-700">₵{totalRevenue.toFixed(2)}</h3>
                <p className="text-[11px] text-gray-400 font-medium">Accumulated store sales</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Orders Logged</span>
                <h3 className="text-2xl font-black text-gray-900">{orders.length}</h3>
                <p className="text-[11px] text-gray-400 font-medium">Customer fulfillments</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Inventory Stock Units</span>
                <h3 className="text-2xl font-black text-gray-900">{totalStockCount}</h3>
                <p className="text-[11px] text-gray-400 font-medium">Across {products.length} products</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Active Products</span>
                <h3 className="text-2xl font-black text-gray-900">{products.length}</h3>
                <p className="text-[11px] text-gray-400 font-medium">Store catalog items</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
                <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-600" /> Sales Performance</h4>
                <div className="h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-4">
                  <BarChart3 className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-600">Store trajectory metrics active</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Sales trends reflect completed customer fulfillments.</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="font-extrabold text-gray-900 text-sm">Catalog Highlights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-violet-700 block">Best Selling Product</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{bestSeller}</p>
                  </div>
                  <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-red-600 block">Worst Selling Product</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{worstSeller}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-base">Your Store Products</h3>
              <button onClick={() => setActiveTab('add-drug')} className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add New Drug
              </button>
            </div>
            {products.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs font-medium space-y-2">
                <Package className="w-10 h-10 mx-auto text-gray-300" />
                <p>No products added to your store catalog yet.</p>
                <button onClick={() => setActiveTab('add-drug')} className="text-violet-600 font-bold hover:underline cursor-pointer">Click here to add your first drug</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4 items-center">
                    {prod.image ? <img src={prod.image} alt={prod.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0" /> : <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0"><ImageIcon className="w-6 h-6" /></div>}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">
                        {prod.name} {prod.dosage && <span className="text-xs text-gray-400 font-normal">({prod.dosage})</span>}
                      </h4>
                      {prod.genericName && prod.genericName !== prod.name && (
                        <p className="text-[10px] text-blue-600 font-semibold truncate">
                          Generic: {prod.genericName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {prod.category} {prod.batchNumber && `• Batch: ${prod.batchNumber}`}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-xs font-extrabold text-violet-700">₵{Number(prod.adminPrice !== undefined ? prod.adminPrice : prod.price).toFixed(2)}</span>
                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">Stock: {prod.stock}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {prod.expiryDate && <p className="text-[10px] text-amber-700 font-semibold">Exp: {prod.expiryDate}</p>}
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${prod.isApproved ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{prod.isApproved ? 'Approved' : 'Pending'}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stocks' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="font-bold text-gray-900 text-base">Stocks & Expiry Audit</h3>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase text-[10px]">
                    <th className="p-4">Product</th><th className="p-4">Batch</th><th className="p-4">Expiry Date</th><th className="p-4">Unit Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => {
                    const isExpired = p.expiryDate && p.expiryDate <= new Date().toISOString().split('T')[0];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold text-gray-800">{p.name} <span className="text-gray-400 font-normal text-[11px]">({p.dosage || 'Standard'})</span></td>
                        <td className="p-4 font-mono font-semibold text-gray-600">{p.batchNumber || 'N/A'}</td>
                        <td className="p-4 font-mono text-gray-600"><span className={isExpired ? 'text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded' : ''}>{p.expiryDate || 'N/A'} {isExpired && ' (EXPIRED)'}</span></td>
                        <td className="p-4 font-mono font-bold text-gray-900">₵{Number(p.adminPrice !== undefined ? p.adminPrice : p.price).toFixed(2)}</td>
                        <td className="p-4 font-mono font-bold text-violet-700">{p.stock} units</td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isExpired ? 'bg-red-100 text-red-800' : Number(p.stock) > 5 ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700'}`}>{isExpired ? 'Expired' : Number(p.stock) > 5 ? 'In Stock' : 'Low Stock'}</span></td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <input type="number" min="0" defaultValue={p.stock} id={`stock-input-${p.id}`} className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-violet-500" />
                            <button onClick={async () => {
                              const inputEl = document.getElementById(`stock-input-${p.id}`) as HTMLInputElement;
                              const newStockVal = parseInt(inputEl?.value || '0', 10);
                              if (isNaN(newStockVal)) return;
                              try { await updateDoc(doc(db, 'medicines', p.id), { stock: newStockVal }); showToast(`Stock updated!`); fetchPharmacyProducts(); } catch (err) { showToast("Failed to update stock.", "info"); }
                            }} className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg cursor-pointer">Update</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="font-bold text-gray-900 text-base">Customer Orders Fulfillments</h3>
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs font-medium">No orders logged for your store yet.</div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between items-start gap-4">
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-gray-400">Order ID: {order.id}</span>
                        <h4 className="font-bold text-gray-900 text-sm">Receiver: {order.receiverName} ({order.receiverPhone})</h4>
                        <p className="text-xs text-gray-500">Destination: {order.deliveryAddress}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-mono text-sm font-black text-violet-700 block">₵{Number(order.totalPrice).toFixed(2)}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${order.status === 'awaiting_vendor_confirmation' ? 'bg-amber-100 text-amber-800' : order.status === 'searching_riders' ? 'bg-blue-50 text-blue-700' : order.status === 'completed' || order.status === 'arrived' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>{order.status || 'Processing'}</span>
                        </div>
                      </div>
                    </div>
                    {order.status === 'awaiting_vendor_confirmation' && (
                      <div className="w-full mt-2 p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3 shadow-inner">
                        <div className="flex items-center gap-2 text-amber-800 text-xs font-black uppercase tracking-wider"><AlertCircle className="w-4 h-4" /> Action Required: Verify Mobile Money Payment</div>
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                          Customer claims to have sent <strong className="font-mono text-amber-900 text-sm">₵{Number(order.totalPrice).toFixed(2)}</strong> to your Mobile Money account. Check your phone to ensure the reference matches:
                          <br/><br/>Sender Name: <strong className="font-mono text-amber-900 bg-amber-200 px-2 py-1 rounded text-sm tracking-widest">{order.senderMomoName || order.customerTransactionId || 'N/A'}</strong>
                        </p>
                        <button onClick={() => handleConfirmPayment(order.id)} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer uppercase tracking-wider"><CheckCircle className="w-4 h-4" /> Confirm Payment & Dispatch Rider</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-drug' && (
          <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Add Professional Drug Specification</h3>
              <p className="text-xs text-gray-400 mt-0.5">List a medication with strict regulatory dosage, batch, and expiry controls.</p>
            </div>
            {formError && <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {formError}</div>}
            <form onSubmit={handleAddDrug} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Product Image (JPEG / PNG)</label>
                <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                  {drugImage ? (
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img src={drugImage} alt="Drug Preview" className="w-full h-full object-cover" />
                      <label className="absolute bottom-1 right-1 bg-violet-600 text-white p-1 rounded-lg cursor-pointer shadow-md"><Camera className="w-3.5 h-3.5" /><input type="file" accept="image/*" className="hidden" onChange={handleDrugImageChange} /></label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-1.5 cursor-pointer text-gray-400 hover:text-violet-700 transition-colors py-2">
                      <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-xs font-bold tracking-wide">Upload Drug Image from Device</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleDrugImageChange} />
                    </label>
                  )}
                </div>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                <div>
                  <span className="text-xs font-extrabold text-blue-900 block">
                    Medicine Identity & AI Matching
                  </span>
                  <p className="text-[10px] text-blue-700 mt-1">
                    These fields help AidFidelis match reviewed condition rules to real pharmacy inventory.
                    Admin approval is still required before the product becomes active.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Brand / Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={drugName}
                      onChange={e => setDrugName(e.target.value)}
                      placeholder="e.g. Panadol"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Generic Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={genericName}
                      onChange={e => setGenericName(e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Active Ingredient *
                    </label>
                    <input
                      type="text"
                      required
                      value={activeIngredient}
                      onChange={e => setActiveIngredient(e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Drug Class *
                    </label>
                    <input
                      type="text"
                      required
                      value={drugClass}
                      onChange={e => setDrugClass(e.target.value)}
                      placeholder="e.g. Analgesic / Antipyretic"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Product Type *
                    </label>
                    <select
                      value={productType}
                      onChange={e => setProductType(e.target.value as 'medicine' | 'health_product')}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium bg-white"
                    >
                      <option value="medicine">Medicine</option>
                      <option value="health_product">Health Product</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                      Dosage & Strength *
                    </label>
                    <input
                      type="text"
                      required
                      value={drugDosage}
                      onChange={e => setDrugDosage(e.target.value)}
                      placeholder="e.g. 500mg or 250mg/5ml"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prescriptionRequired}
                      onChange={e => {
                        setPrescriptionRequired(e.target.checked);
                        if (e.target.checked) setOtcEligible(false);
                      }}
                      className="h-4 w-4 accent-violet-600"
                    />
                    <span>
                      <span className="block text-xs font-bold text-gray-800">Prescription Required</span>
                      <span className="block text-[10px] text-gray-500">Requires a valid prescription / clinical authorization.</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={otcEligible}
                      onChange={e => {
                        setOtcEligible(e.target.checked);
                        if (e.target.checked) setPrescriptionRequired(false);
                      }}
                      className="h-4 w-4 accent-violet-600"
                    />
                    <span>
                      <span className="block text-xs font-bold text-gray-800">OTC Eligible</span>
                      <span className="block text-[10px] text-gray-500">Submitted as a possible over-the-counter product.</span>
                    </span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Therapeutic Category *</label>
                  <select value={drugCategory} onChange={e => setDrugCategory(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white">
                    <option value="Painkillers">Painkillers & Analgesics</option><option value="Antibiotics">Antibiotics</option><option value="Vitamins">Vitamins & Supplements</option><option value="First Aid">First Aid & Care</option><option value="Chronic Care">Chronic Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Formulation Form *</label>
                  <select value={drugForm} onChange={e => setDrugForm(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white">
                    <option value="Tablets">Tablets</option><option value="Capsules">Capsules</option><option value="Syrup">Syrup / Suspension</option><option value="Injection">Injection</option><option value="Ointment">Ointment / Cream</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 space-y-4">
                <span className="text-xs font-extrabold text-violet-900 block">Regulatory Batch & Expiry Controls</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Batch Number *</label><input type="text" required value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="e.g. BT-99204" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white font-mono uppercase focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600" /></div>
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Manufacturing Date</label><input type="date" value={manufacturingDate} onChange={e => setManufacturingDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white font-mono focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600" /></div>
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Expiry Date * (Required)</label><input type="date" required value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium bg-white font-mono focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600" /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Unit Price (₵) *</label><input type="number" step="0.01" min="0.1" required value={drugPrice} onChange={e => setDrugPrice(e.target.value)} placeholder="25.00" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white" /></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Initial Stock Quantity *</label><input type="number" min="1" required value={drugStock} onChange={e => setDrugStock(e.target.value)} placeholder="50" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-600 bg-white" /></div>
              </div>
              <button type="submit" disabled={submittingDrug} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">{submittingDrug && <Loader2 className="h-4 w-4 animate-spin" />} Publish Regulated Drug to Catalog</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default PharmacyDashboard;