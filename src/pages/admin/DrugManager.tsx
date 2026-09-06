import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Package, ShieldCheck, Loader2, Trash2, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;

  // Structured medicine identity submitted by the pharmacy
  normalizedName?: string;
  genericName?: string;
  activeIngredient?: string;
  drugClass?: string;
  productType?: 'medicine' | 'health_product';
  prescriptionRequired?: boolean;
  otcEligible?: boolean;
  classificationReviewStatus?: string;
  approvedForMapping?: boolean;

  category: string;
  dosage: string;
  form: string;
  batchNumber: string;
  expiryDate: string;
  price: number;
  adminPrice?: number;
  stock: number;

  pharmacyId?: string | null;
  pharmacyName: string;
  image: string;

  isApproved?: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
}

const DrugManager: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [drugToReject, setDrugToReject] = useState<Medicine | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // State for Custom Delete Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [drugToDeleteId, setDrugToDeleteId] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // REAL-TIME LISTENER
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'medicines'), (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Medicine[];
      setMedicines(list);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to medicines:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleApproval = async (
    medicine: Medicine
  ) => {
    try {
      const newStatus = !medicine.isApproved;

      const isMedicine =
        (medicine.productType ?? 'medicine') === 'medicine';

      const hasRequiredMetadata =
        Boolean(medicine.genericName?.trim()) &&
        Boolean(medicine.activeIngredient?.trim()) &&
        Boolean(medicine.drugClass?.trim());

      const canBeUsedForAiMapping =
        newStatus &&
        isMedicine &&
        hasRequiredMetadata;

      let classificationReviewStatus = 'pending_admin_review';

      if (newStatus) {
        if (!isMedicine) {
          classificationReviewStatus = 'product_not_medicine';
        } else if (hasRequiredMetadata) {
          classificationReviewStatus = 'metadata_ready';
        } else {
          classificationReviewStatus = 'needs_metadata_review';
        }
      }

      await updateDoc(
        doc(db, 'medicines', medicine.id),
        {
          // Catalog approval
          isApproved: newStatus,
          isRejected: false,
          rejectionReason: '',

          // AI / symptom-checker mapping approval
          approvedForMapping: canBeUsedForAiMapping,
          classificationReviewStatus,

          updatedAt: serverTimestamp(),
        }
      );

      if (!newStatus) {
        showToast(
          `${medicine.name} has been removed from the live catalog.`
        );
        return;
      }

      if (!isMedicine) {
        showToast(
          `${medicine.name} is approved for the catalog as a health product, but it will not be used for AI medicine matching.`,
          'info'
        );
        return;
      }

      if (!hasRequiredMetadata) {
        showToast(
          `${medicine.name} is published, but its AI mapping is disabled until Generic Name, Active Ingredient and Drug Class are completed.`,
          'info'
        );
        return;
      }

      showToast(
        `${medicine.name} is approved and ready for AidFidelis AI/pharmacy matching.`
      );
    } catch (err: any) {
      showToast(
        `Failed to update status: ${err.message}`,
        'info'
      );
    }
  };

  const openRejectModal = (med: Medicine) => {
    setDrugToReject(med);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const executeRejectDrug = async () => {
    if (!drugToReject || !rejectionReason.trim()) {
      showToast('Please provide a reason for declining.', 'info');
      return;
    }

    try {
      await updateDoc(
        doc(db, 'medicines', drugToReject.id),
        {
          isApproved: false,
          isRejected: true,
          rejectionReason: rejectionReason.trim(),

          approvedForMapping: false,
          classificationReviewStatus: 'rejected',
          updatedAt: serverTimestamp(),
        }
      );
      showToast('Drug listing declined.');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'info');
    } finally {
      setShowRejectModal(false);
      setDrugToReject(null);
    }
  };

  // Custom Delete Handlers
  const confirmDeleteDrug = (id: string) => {
    setDrugToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const executeDeleteDrug = async () => {
    if (!drugToDeleteId) return;
    try {
      await deleteDoc(doc(db, 'medicines', drugToDeleteId));
      showToast('Drug record permanently deleted.');
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'info');
    } finally {
      setShowDeleteConfirm(false);
      setDrugToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDrugToDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="animate-spin h-6 w-6 text-violet-600" />
        <p className="text-xs font-semibold text-gray-400">Loading pharmacy drug submissions...</p>
      </div>
    );
  }

  const pendingMedicines = medicines.filter(m => !m.isApproved && !m.isRejected);
  const approvedMedicines = medicines.filter(m => m.isApproved);

  return (
    <div className="space-y-8 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="w-4 h-4 text-violet-400" />
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Delete Drug Specification?</h2>
              <p className="text-xs text-gray-500 mt-2 font-medium px-4">
                Are you sure you want to permanently delete this drug from the catalog? This action cannot be reversed.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer"
              >
                Cancel Action
              </button>
              <button
                type="button"
                onClick={executeDeleteDrug}
                className="px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Pending Drug Approvals</span>
          <h3 className="text-2xl font-black text-amber-700 mt-1">{pendingMedicines.length}</h3>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase text-violet-600 tracking-wider">Live Catalog Medicines</span>
          <h3 className="text-2xl font-black text-violet-700 mt-1">{approvedMedicines.length}</h3>
        </div>
      </div>

      {/* Pending Queue */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" /> Pending Drug Submissions
        </h4>

        {pendingMedicines.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-xs font-medium">
            No pending drug submissions awaiting review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMedicines.map(med => (
              <div key={med.id} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 bg-amber-50/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={med.image} alt={med.name} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-gray-900 text-sm">{med.name} ({med.dosage})</h5>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">Pending Review</span>
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 bg-violet-50 text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded border border-violet-200">
                        Store: {med.pharmacyName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleToggleApproval(med)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => openRejectModal(med)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl cursor-pointer" title="Decline">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-t border-amber-100 pt-3 text-xs text-gray-600">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                        AI Medicine Metadata
                      </span>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          med.classificationReviewStatus === 'metadata_ready'
                            ? 'bg-violet-100 text-violet-700'
                            : med.classificationReviewStatus === 'product_not_medicine'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {med.classificationReviewStatus || 'pending_admin_review'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400">Generic Name:</span>{' '}
                        <span className="font-bold text-gray-800">
                          {med.genericName || 'Missing'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">Active Ingredient:</span>{' '}
                        <span className="font-bold text-gray-800">
                          {med.activeIngredient || 'Missing'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">Drug Class:</span>{' '}
                        <span className="font-bold text-gray-800">
                          {med.drugClass || 'Missing'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">Product Type:</span>{' '}
                        <span className="font-bold text-gray-800">
                          {med.productType || 'medicine'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">Prescription:</span>{' '}
                        <span className="font-bold text-gray-800">
                          {med.prescriptionRequired ? 'Required' : 'Not marked required'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400">OTC Eligible:</span>{' '}
                        <span className="font-bold text-gray-800">
                          {med.otcEligible ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    {(
                      !med.genericName?.trim() ||
                      !med.activeIngredient?.trim() ||
                      !med.drugClass?.trim()
                    ) && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[10px] font-semibold text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        This product can still be published to the catalog, but AI medicine mapping will remain disabled until the missing metadata is completed.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-gray-400">Category:</span> <span className="font-bold text-gray-800">{med.category}</span></div>
                    <div><span className="text-gray-400">Form:</span> <span className="font-bold text-gray-800">{med.form}</span></div>
                    <div><span className="text-gray-400">Batch:</span> <span className="font-mono font-bold text-gray-800">{med.batchNumber}</span></div>
                    <div><span className="text-gray-400">Expiry:</span> <span className="font-mono font-bold text-red-600">{med.expiryDate}</span></div>
                    <div><span className="text-gray-400">Stock:</span> <span className="font-bold text-violet-700">{med.stock} units</span></div>
                    <div><span className="text-gray-400">Retail Price:</span> <span className="font-mono font-bold text-gray-800">₵{Number(med.price).toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Catalog */}
      <div className="space-y-3 pt-4">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-600" /> Live Approved Catalog Medicines
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedMedicines.map(med => (
            <div key={med.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={med.image} alt={med.name} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-gray-900 text-sm">{med.name} ({med.dosage})</h5>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">Published</span>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 bg-violet-50 text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded border border-violet-200">
                      Store: {med.pharmacyName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleToggleApproval(med)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-violet-50 border border-violet-200 text-violet-700 cursor-pointer">
                    <ShieldCheck className="h-3.5 w-3.5" /> Approved
                  </button>
                  <button onClick={() => confirmDeleteDrug(med.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl cursor-pointer" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-3 text-xs text-gray-600">
                {med.genericName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Generic Name:</span>
                    <span className="font-bold text-gray-800">{med.genericName}</span>
                  </div>
                )}

                {med.drugClass && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Drug Class:</span>
                    <span className="font-bold text-gray-800">{med.drugClass}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">AI / Pharmacy Mapping:</span>
                  <span
                    className={`font-black text-[10px] uppercase px-2 py-0.5 rounded ${
                      med.approvedForMapping
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {med.approvedForMapping ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Category / Form:</span>
                  <span className="font-bold text-gray-800">{med.category} ({med.form})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Batch & Expiry:</span>
                  <span className="font-mono text-gray-800">{med.batchNumber} • Exp: {med.expiryDate}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-2">
                  <span className="text-slate-500 font-bold">Active Retail Price:</span>
                  <span className="font-mono text-sm font-black text-violet-700">₵{Number(med.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && drugToReject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Decline Drug Specification</h2>
              <p className="text-xs text-slate-500 mt-1 mb-4 font-medium">Provide a reason for declining <strong>{drugToReject.name}</strong> from <strong>{drugToReject.pharmacyName}</strong>.</p>
              <textarea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Incorrect dosage strength." className="w-full rounded-xl border border-gray-200 p-3 text-xs font-medium bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setShowRejectModal(false)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-white font-bold text-xs cursor-pointer">Cancel</button>
              <button onClick={executeRejectDrug} className="px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs cursor-pointer shadow-md">Submit & Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugManager;