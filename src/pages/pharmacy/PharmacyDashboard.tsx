import React, { useEffect, useState, useMemo } from 'react';
import { onSnapshot, collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Image } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';

const PharmacyDashboard: React.FC = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pharmacyName, setPharmacyName] = useState<string | null>(null);
  const [pharmacyImage, setPharmacyImage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const FALLBACK_HIGH_RES = 'https://images.unsplash.com/photo-1580281657521-6e6f3b5f5b8f?auto=format&fit=crop&w=3840&q=80';

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      // redirect to login
      window.location.href = '/pharmacy/login';
      return;
    }

    // load pharmacy doc
    (async () => {
      try {
        const pd = await getDoc(doc(db, 'pharmacies', uid));
        if (pd.exists()) {
          const d = pd.data() as any;
          setPharmacyName(d.name || d.pharmacyName || 'My Pharmacy');
          setPharmacyImage(d.imageUrl || null);
        }
      } catch (err) {
        console.error('Could not load pharmacy doc', err);
      }
    })();

    // medicines listener
    const mq = query(collection(db, 'medicines'), where('pharmacyId', '==', uid));
    const unsubMed = onSnapshot(mq, snap => {
      const rows: any[] = [];
      snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
      setMedicines(rows);
      setLoading(false);
    });

    // orders listener
    const oq = query(collection(db, 'orders'), where('pharmacyId', '==', uid));
    const unsubOrders = onSnapshot(oq, snap => {
      const rows: any[] = [];
      snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
      setOrders(rows);
    });

    return () => {
      unsubMed();
      unsubOrders();
    };
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    const totalProducts = medicines.length;
    const totalStock = medicines.reduce((s, m) => s + (m.stock || 0), 0);
    const totalOrders = orders.length;
    const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    // best / worst selling by quantity across orders
    const productCounts: Record<string, number> = {};
    orders.forEach(o => {
      const items = o.items || [];
      items.forEach((it: any) => {
        const key = it.productId || it.id || it.name;
        productCounts[key] = (productCounts[key] || 0) + (it.quantity || 0);
      });
    });

    const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    const best = sortedProducts[0] ? { id: sortedProducts[0][0], qty: sortedProducts[0][1] } : null;
    const worst = sortedProducts.length > 0 ? { id: sortedProducts[sortedProducts.length - 1][0], qty: sortedProducts[sortedProducts.length - 1][1] } : null;

    return { totalProducts, totalStock, totalOrders, revenue, best, worst };
  }, [medicines, orders]);

  const salesSeries = useMemo(() => {
    const days = 14;
    const buckets = Array.from({ length: days }, () => 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    orders.forEach(o => {
      let d: Date = new Date();
      try {
        if (o.createdAt && typeof o.createdAt.toDate === 'function') d = o.createdAt.toDate();
        else if (o.createdAt && o.createdAt.seconds) d = new Date(o.createdAt.seconds * 1000);
        else d = new Date(o.createdAt || o.createdAtString || o._createdAt || Date.now());
        d.setHours(0, 0, 0, 0);
      } catch (err) {
        d = new Date(); d.setHours(0,0,0,0);
      }
      const diff = Math.floor((today.getTime() - d.getTime()) / (24 * 3600 * 1000));
      const idx = days - 1 - diff;
      if (idx >= 0 && idx < days) buckets[idx] += (o.totalAmount || 0);
    });

    return buckets;
  }, [orders]);

  const chartData = useMemo(() => {
    const days = salesSeries.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return salesSeries.map((val, i) => {
      const date = new Date(today.getTime() - (days - 1 - i) * 24 * 3600 * 1000);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      return { label, amount: Number(val) };
    });
  }, [salesSeries]);

  const totalSales14 = useMemo(() => chartData.reduce((s, d) => s + d.amount, 0), [chartData]);

  const exportCSV = () => {
    const rows: string[] = [];
    rows.push('Sales (last 14 days)');
    rows.push('Date,Amount');
    chartData.forEach(d => rows.push(`${d.label},${d.amount.toFixed(2)}`));
    rows.push('');
    rows.push('Best Selling,Qty');
    if (stats.best) rows.push(`${medicines.find(m => m.id === stats.best.id)?.name || stats.best.id},${stats.best.qty}`);
    else rows.push('-,0');
    rows.push('');
    rows.push('Worst Selling,Qty');
    if (stats.worst) rows.push(`${medicines.find(m => m.id === stats.worst.id)?.name || stats.worst.id},${stats.worst.qty}`);
    else rows.push('-,0');
    rows.push('');
    rows.push('Medicines');
    rows.push('Name,Price,Stock');
    medicines.forEach(m => rows.push(`${m.name},${Number(m.price || 0).toFixed(2)},${m.stock || 0}`));

    const csv = rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmacy_sales_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clearForm = () => { setName(''); setPrice(''); setStock(''); setEditingId(null); };
  const resetAddForm = () => {
    setName(''); setCategory(''); setPrice(''); setStock(''); setDescription('');
    setImageFile(null); setImagePreview(''); setRequiresPrescription(false); setPrescriptionInstructions(''); setEditingId(null);
  };

  const handleAddOrUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!name || !price || !description || !stock) {
      alert('Please fill required fields: name, price, description, stock');
      return;
    }

    if (!editingId && !imageFile) {
      alert('Please select an image for the medicine');
      return;
    }

    setIsSubmitting(true);
    let imageUrl = '';
    try {
      if (imageFile) {
        const reader = new FileReader();
        const p = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(imageFile);
        imageUrl = await p;
      }

      const docData: any = {
        name: name.trim(),
        genericName: name.trim(),
        category: category || 'General',
        price: Number(price) || 0,
        description: description.trim(),
        dosage: 'As prescribed',
        manufacturer: 'Generic',
        requiresPrescription: Boolean(requiresPrescription),
        prescriptionInstructions: requiresPrescription ? (prescriptionInstructions?.trim() || '') : '',
        inStock: Number(stock) > 0,
        stockCount: Number(stock),
        image: imageUrl || imagePreview || '',
        rating: 4.5,
        reviews: 0
      };

      if (editingId) {
        // update
        await updateDoc(doc(db, 'medicines', editingId), docData);
        setSuccessMessage(`${name} updated successfully`);
      } else {
        // create with pharmacyId
        await addDoc(collection(db, 'medicines'), { ...docData, pharmacyId: uid });
        setSuccessMessage(`${name} added successfully`);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      resetAddForm();
    } catch (err) {
      console.error('Save medicine error', err);
      alert('Could not save medicine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setName(m.name || '');
    setPrice(String(m.price ?? ''));
    setStock(String(m.stock ?? ''));
    setCategory(m.category || '');
    setDescription(m.description || '');
    setRequiresPrescription(Boolean(m.requiresPrescription));
    setPrescriptionInstructions(m.prescriptionInstructions || '');
    setImagePreview(m.image || FALLBACK_HIGH_RES);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this medicine?')) return;
    try { await deleteDoc(doc(db, 'medicines', id)); } catch (err) { console.error(err); alert('Delete failed'); }
  };

  return (
    <div className="p-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}
      <header className="mb-6 rounded overflow-hidden shadow-lg relative">
        <div className="h-40 md:h-56 w-full bg-gray-200" style={{ backgroundImage: `url(${pharmacyImage || FALLBACK_HIGH_RES})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="w-full h-full bg-gradient-to-br from-black/40 via-transparent to-black/25"></div>
        </div>
        <div className="absolute left-6 bottom-4 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-white/40 flex items-center justify-center border-2 border-white shadow">
            <img src={pharmacyImage || FALLBACK_HIGH_RES} alt="pharmacy" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_HIGH_RES; }} />
          </div>
          <div className="text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{pharmacyName || 'Pharmacy Dashboard'}</h1>
            <div className="text-sm opacity-90">Welcome back — manage your products and orders</div>
          </div>
        </div>
        <div className="absolute right-6 top-4">
          <button className="bg-white/80 text-gray-800 px-3 py-2 rounded-lg shadow hover:bg-white" onClick={() => setShowLogoutConfirm(true)}>
            Sign out
          </button>
        </div>
      </header>

      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 bg-white rounded shadow"> 
            <div className="text-sm text-gray-500">Products</div>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </div>
          <div className="p-4 bg-white rounded shadow"> 
            <div className="text-sm text-gray-500">Total Stock</div>
            <div className="text-2xl font-bold">{stats.totalStock}</div>
          </div>
          <div className="p-4 bg-white rounded shadow"> 
            <div className="text-sm text-gray-500">Orders</div>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </div>
          <div className="p-4 bg-white rounded shadow"> 
            <div className="text-sm text-gray-500">Revenue</div>
            <div className="text-2xl font-bold">GHS {stats.revenue.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="p-4 bg-white rounded shadow flex-1">
            <div className="text-sm text-gray-500">Best Selling</div>
            <div className="text-lg font-semibold">{stats.best ? (medicines.find(m => m.id === stats.best.id)?.name || stats.best.id) : '—'}</div>
            <div className="text-sm text-gray-500">Qty: {stats.best?.qty ?? 0}</div>
          </div>
          <div className="p-4 bg-white rounded shadow w-64">
            <div className="text-sm text-gray-500">Worst Selling</div>
            <div className="text-lg font-semibold">{stats.worst ? (medicines.find(m => m.id === stats.worst.id)?.name || stats.worst.id) : '—'}</div>
            <div className="text-sm text-gray-500">Qty: {stats.worst?.qty ?? 0}</div>
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow mb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500">Sales (last 14 days)</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border rounded" onClick={exportCSV}>Export CSV</button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div style={{ width: 240, height: 60 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" hide />
                  <Tooltip formatter={(v: any) => `₦${Number(v).toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-lg font-semibold">GHS {totalSales14.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total sales (14d)</div>
            </div>
          </div>
        </div>
        <h2 className="font-semibold mb-2">Add / Edit Medicine</h2>
        <form onSubmit={handleAddOrUpdate} className="mb-6">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter medicine name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Category</option>
                      <option value="Pain Relief">Pain Relief</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Vitamins">Vitamins</option>
                      <option value="Wellness">Wellness</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                    <input value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" type="number" step="0.01" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input value={stock} onChange={e => setStock(e.target.value)} placeholder="0" type="number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter medicine description" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={requiresPrescription} onChange={e => setRequiresPrescription(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Requires Prescription</span>
                  </label>
                </div>

                {requiresPrescription && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Instructions</label>
                    <textarea value={prescriptionInstructions} onChange={e => setPrescriptionInstructions(e.target.value)} placeholder="Enter prescription instructions" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                    <p className="text-xs text-gray-500 mt-1">These instructions will be shown to users after payment validation.</p>
                  </div>
                )}
              </div>

              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Image *</label>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setImageFile(f); if (f) setImagePreview(URL.createObjectURL(f)); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p className="text-xs text-gray-500 mt-1">Note: Images stored as data URLs in dev.</p>

                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">×</button>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <button type="submit" disabled={isSubmitting} className={`bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Medicine' : 'Add Medicine')}
                  </button>
                  <button type="button" onClick={resetAddForm} className="ml-3 px-4 py-2 border rounded">Clear</button>
                </div>
              </div>
            </div>
          </div>
        </form>

        <h3 className="font-semibold mb-2">Medicines</h3>
        {loading ? <div>Loading...</div> : medicines.length === 0 ? <div>No medicines yet.</div> : (
          <ul>
            {medicines.map(m => (
            <li key={m.id} className="border p-2 rounded mb-2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={m.image || FALLBACK_HIGH_RES} alt={m.name} className="w-16 h-16 object-cover rounded-md border" onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_HIGH_RES; }} />
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-sm text-gray-600">Price: GHS {Number(m.price || 0).toFixed(2)} — Stock: {m.stock}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => handleEdit(m)}>Edit</button>
                  <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(m.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Sign out</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to sign out? You will be returned to the login page.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={async () => { await signOut(auth); window.location.href = '/pharmacy/login'; }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Sign out</button>
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="font-semibold mb-2">Orders</h2>
        {orders.length === 0 ? <div>No orders yet.</div> : (
          <ul>
            {orders.map(o => (
              <li key={o.id} className="border p-2 rounded mb-2">
                <div className="font-semibold">Order #{o.id}</div>
                <div className="text-sm">Customer: {o.customerName || o.customerEmail}</div>
                <div className="text-sm">Status: {o.status}</div>
                {o.aiSummary && (
                  <div className="mt-2 p-2 bg-yellow-50 border">AI Summary: {o.aiSummary}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PharmacyDashboard;
