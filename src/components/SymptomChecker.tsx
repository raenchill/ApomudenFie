import React, { useState } from 'react';
import { Loader2, Stethoscope, Pill, AlertTriangle, CheckCircle } from 'lucide-react';

interface SymptomAnalysis {
  possibleConditions: string[];
  recommendedMedicines: string[];
  severity: 'low' | 'medium' | 'high';
  advice: string;
  shouldSeeDoctor: boolean;
}

const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState<string>('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis based on symptoms
      const mockAnalysis = getMockAnalysis(symptoms.toLowerCase());
      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMockAnalysis = (symptomText: string): SymptomAnalysis => {
    // Mock analysis logic based on common symptoms
    const possibleConditions: string[] = [];
    const recommendedMedicines: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';
    let advice = '';
    let shouldSeeDoctor = false;

    // Analyze symptoms and provide mock recommendations
    if (symptomText.includes('fever') || symptomText.includes('temperature')) {
      possibleConditions.push('Viral Infection', 'Bacterial Infection');
      recommendedMedicines.push('Paracetamol', 'Ibuprofen');
      severity = 'medium';
      advice = 'Rest well and stay hydrated. Monitor your temperature regularly.';
    }

    if (symptomText.includes('cough') || symptomText.includes('throat')) {
      possibleConditions.push('Upper Respiratory Infection', 'Common Cold');
      recommendedMedicines.push('Cough Syrup', 'Throat Lozenges');
      severity = 'low';
      advice = 'Gargle with warm salt water and avoid cold drinks.';
    }

    if (symptomText.includes('headache') || symptomText.includes('head pain')) {
      possibleConditions.push('Tension Headache', 'Migraine');
      recommendedMedicines.push('Paracetamol', 'Ibuprofen');
      severity = 'low';
      advice = 'Rest in a dark, quiet room and apply a cold compress.';
    }

    if (symptomText.includes('stomach') || symptomText.includes('nausea') || symptomText.includes('vomit')) {
      possibleConditions.push('Gastroenteritis', 'Food Poisoning');
      recommendedMedicines.push('Antacids', 'Electrolyte Solution');
      severity = 'medium';
      advice = 'Avoid solid foods for a few hours and drink plenty of fluids.';
    }

    if (symptomText.includes('chest pain') || symptomText.includes('breathing')) {
      possibleConditions.push('Respiratory Issue', 'Cardiac Concern');
      recommendedMedicines.push('Consult Doctor Immediately');
      severity = 'high';
      advice = 'Seek immediate medical attention.';
      shouldSeeDoctor = true;
    }

    if (symptomText.includes('rash') || symptomText.includes('skin')) {
      possibleConditions.push('Allergic Reaction', 'Skin Infection');
      recommendedMedicines.push('Antihistamines', 'Topical Cream');
      severity = 'medium';
      advice = 'Avoid scratching and keep the area clean and dry.';
    }

    // Default response if no specific symptoms match
    if (possibleConditions.length === 0) {
      possibleConditions.push('General Symptoms');
      recommendedMedicines.push('General Pain Relief');
      advice = 'Monitor your symptoms and consult a healthcare professional if they persist or worsen.';
    }

    return {
      possibleConditions,
      recommendedMedicines,
      severity,
      advice,
      shouldSeeDoctor
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">AI Symptom Checker</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your symptoms
            </label>
            <textarea
              id="symptoms"
              placeholder="Enter your symptoms in detail (e.g., 'I have a fever, headache, and feel nauseous')"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          <button 
            onClick={analyzeSymptoms} 
            disabled={isAnalyzing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              'Analyze Symptoms'
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      </div>

      {analysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Pill className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">Analysis Results</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Severity:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getSeverityColor(analysis.severity)}`}>
                {getSeverityIcon(analysis.severity)}
                {analysis.severity.toUpperCase()}
              </span>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Possible Conditions:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.possibleConditions.map((condition, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommended Medicines:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendedMedicines.map((medicine, index) => (
                  <span key={index} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm">
                    {medicine}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Advice:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{analysis.advice}</p>
            </div>

            {analysis.shouldSeeDoctor && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <div>
                  <strong>Important:</strong> Based on your symptoms, we recommend consulting a healthcare professional immediately.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
