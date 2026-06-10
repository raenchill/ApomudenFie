import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import runWarehouseSetup from '../../utils/runWarehouseSetup';

const WarehouseSetup: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await runWarehouseSetup();
      setResult({ success: res.success, message: res.message });
    } catch (e: any) {
      setResult({ success: false, message: e?.message || 'Setup failed' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Warehouse Setup</h1>
      <p className="text-gray-600 mb-6">Initialize Firestore collections and seed sample medicines if needed.</p>

      <button
        onClick={handleRun}
        disabled={running}
        className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {running && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
        Run Setup
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded-md flex items-start ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.success ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          <div>
            <div className="font-medium">{result.success ? 'Setup completed' : 'Setup failed'}</div>
            <div className="text-sm">{result.message}</div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>
          This will:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Ensure `medicines` collection exists; seed sample data if empty.</li>
          <li>Create `stock_movements` collection by adding a placeholder if empty.</li>
        </ul>
      </div>
    </div>
  );
};

export default WarehouseSetup; 