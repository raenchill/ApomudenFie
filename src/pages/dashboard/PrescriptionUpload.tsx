import React, { useState, useRef, useEffect } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import { User, Medicine } from '../../types';
import { medicineService } from '../../services/medicineService';
import { checkMedicinesExist, seedFirebaseMedicines } from '../../utils/seedFirebaseMedicines';
import { createWorker } from 'tesseract.js';
import { aiPrescriptionService } from '../../services/aiPrescriptionService';
import { Brain, Zap } from 'lucide-react';

interface PrescriptionUploadProps {
  user: User;
  onAddToCart: (medicine: Medicine) => void;
}

interface ScannedDrug {
  name: string;
  confidence: number;
  matchedMedicine?: Medicine;
  isAvailable: boolean;
}

const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({ user, onAddToCart }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedDrugs, setScannedDrugs] = useState<ScannedDrug[]>([]);
  const [rawOcrText, setRawOcrText] = useState<string>('');
  const [showRawText, setShowRawText] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualDrugName, setManualDrugName] = useState('');
  const [manualDrugs, setManualDrugs] = useState<string[]>([]);
  const [searchingDatabase, setSearchingDatabase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSeedingDatabase, setIsSeedingDatabase] = useState(false);
  const [showAIDebug, setShowAIDebug] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check and seed Firebase database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const medicinesExist = await checkMedicinesExist();
        if (!medicinesExist) {
          console.log('No medicines found in Firebase, seeding database...');
          setIsSeedingDatabase(true);
          await seedFirebaseMedicines();
          console.log('Firebase database seeded successfully');
        }
        
        // Test AI module functionality
        console.log('Testing AI Prescription Module...');
        await aiPrescriptionService.testAIWithSampleText();
      } catch (error) {
        console.error('Error initializing database:', error);
        setError('Failed to initialize database. Please refresh the page.');
      } finally {
        setIsSeedingDatabase(false);
      }
    };

    initializeDatabase();
  }, []);

  // Common drug names and keywords to look for in OCR results
  const drugKeywords = [
    'paracetamol', 'acetaminophen', 'amoxicillin', 'vitamin d3', 'omeprazole', 'cetirizine', 'lisinopril',
    'ibuprofen', 'aspirin', 'metformin', 'atorvastatin', 'amlodipine', 'losartan',
    'hydrochlorothiazide', 'metoprolol', 'pantoprazole', 'simvastatin', 'loratadine',
    'diphenhydramine', 'naproxen', 'diclofenac', 'tramadol', 'codeine',
    'morphine', 'fentanyl', 'oxycodone', 'hydrocodone', 'methadone', 'buprenorphine',
    'naloxone', 'naltrexone', 'suboxone', 'subutex', 'penicillin', 'cephalexin',
    'azithromycin', 'doxycycline', 'ciprofloxacin', 'levofloxacin', 'clindamycin',
    'erythromycin', 'tetracycline', 'minocycline', 'rifampin', 'isoniazid',
    'prednisone', 'dexamethasone', 'hydrocortisone', 'methylprednisolone',
    'insulin', 'glipizide', 'glyburide', 'metformin', 'sitagliptin', 'empagliflozin',
    'atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lovastatin',
    'amlodipine', 'nifedipine', 'diltiazem', 'verapamil', 'propranolol', 'atenolol',
    'carvedilol', 'bisoprolol', 'losartan', 'valsartan', 'irbesartan', 'olmesartan',
    'enalapril', 'ramipril', 'quinapril', 'perindopril', 'trandolapril',
    'omeprazole', 'pantoprazole', 'lansoprazole', 'rabeprazole', 'esomeprazole',
    'ranitidine', 'famotidine', 'cimetidine', 'nizatidine',
    'cetirizine', 'loratadine', 'fexofenadine', 'desloratadine', 'levocetirizine',
    'diphenhydramine', 'chlorpheniramine', 'brompheniramine', 'clemastine',
    'montelukast', 'zafirlukast', 'zileuton', 'theophylline', 'albuterol',
    'salmeterol', 'formoterol', 'tiotropium', 'ipratropium', 'budesonide',
    'fluticasone', 'mometasone', 'ciclesonide', 'beclomethasone',
    'tramadol', 'codeine', 'morphine', 'fentanyl', 'oxycodone', 'hydrocodone',
    'methadone', 'buprenorphine', 'naloxone', 'naltrexone', 'suboxone', 'subutex',
    'acetaminophen', 'aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'celecoxib',
    'meloxicam', 'indomethacin', 'ketorolac', 'etodolac', 'nabumetone',
    'gabapentin', 'pregabalin', 'carbamazepine', 'phenytoin', 'lamotrigine',
    'levetiracetam', 'topiramate', 'valproic acid', 'divalproex', 'zonisamide',
    'sertraline', 'fluoxetine', 'paroxetine', 'escitalopram', 'citalopram',
    'venlafaxine', 'duloxetine', 'bupropion', 'mirtazapine', 'trazodone',
    'alprazolam', 'lorazepam', 'diazepam', 'clonazepam', 'temazepam',
    'zolpidem', 'zaleplon', 'eszopiclone', 'ramelteon', 'suvorexant',
    'lisinopril', 'enalapril', 'ramipril', 'quinapril', 'perindopril',
    'captopril', 'benazepril', 'fosinopril', 'moexipril', 'trandolapril'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setError(null);
    setScannedDrugs([]);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Check image dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        setError('Image is too small. Please upload a larger, clearer image (minimum 100x100 pixels)');
        return;
      }
      
      if (img.width > 4000 || img.height > 4000) {
        setError('Image is too large. Please upload a smaller image (maximum 4000x4000 pixels)');
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    };
    
    img.onerror = () => {
      setError('Failed to load image. Please try a different file.');
    };
    
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const performAIPrescriptionScan = async (imageFile: File): Promise<string[]> => {
    const worker = await createWorker('eng');
    
    try {
      // Update progress for initialization
      setScanProgress(10);
      
      // Configure worker for better accuracy with medical text
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()-/\\ mgmcgmlunitsIU ',
        preserve_interword_spaces: '1'
      });
      
      setScanProgress(20);
      
      // Recognize text from the image
      setScanProgress(30);
      let { data: { text } } = await worker.recognize(imageFile);
      
      console.log('OCR raw result:', text);
      
      setScanProgress(50);
      
      // Store raw OCR text for debugging
      setRawOcrText(text);
      
      // Use AI-powered prescription analysis
      setScanProgress(70);
      console.log('Starting AI analysis...');
      
      const aiResult = await aiPrescriptionService.analyzePrescriptionText(text);
      console.log('AI analysis result:', aiResult);
      
      // Store AI analysis result for debugging
      setAiAnalysisResult(aiResult);
      
      setScanProgress(90);
      
      await worker.terminate();
      setScanProgress(100);
      
      return aiResult.extractedDrugs;
    } catch (error) {
      await worker.terminate();
      console.error('AI Prescription Scan Error:', error);
      throw error;
    }
  };

  const assessTextQuality = (text: string): { isPoor: boolean; reason: string } => {
    const cleanText = text.trim();
    
    // Check if text is too short
    if (cleanText.length < 10) {
      return { isPoor: true, reason: 'Text too short' };
    }
    
    // Check if text contains mostly symbols or random characters
    const letters = cleanText.replace(/[^a-zA-Z]/g, '');
    const lettersRatio = letters.length / cleanText.length;
    
    if (lettersRatio < 0.3) {
      return { isPoor: true, reason: 'Too many symbols/random characters' };
    }
    
    // Check if text has too many repeated characters
    const repeatedChars = cleanText.match(/(.)\1{3,}/g);
    if (repeatedChars && repeatedChars.length > 2) {
      return { isPoor: true, reason: 'Too many repeated characters' };
    }
    
    // Check if text has too many equals signs or other OCR artifacts
    const equalsCount = (cleanText.match(/=/g) || []).length;
    if (equalsCount > cleanText.length * 0.1) {
      return { isPoor: true, reason: 'Too many OCR artifacts' };
    }
    
    // Check if text has meaningful words
    const words = cleanText.split(/\s+/).filter(word => word.length > 2);
    const meaningfulWords = words.filter(word => /[a-zA-Z]{3,}/.test(word));
    
    if (meaningfulWords.length < 2) {
      return { isPoor: true, reason: 'No meaningful words found' };
    }
    
    return { isPoor: false, reason: 'Text quality acceptable' };
  };

  const extractDrugNamesFromText = (text: string): string[] => {
    const foundDrugs: string[] = [];
    
    // Clean and normalize text
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('Cleaned text for drug extraction:', cleanText);
    
    // Strategy 1: Direct keyword matching
    for (const keyword of drugKeywords) {
      if (cleanText.includes(keyword) && !foundDrugs.includes(keyword)) {
        foundDrugs.push(keyword);
        console.log('Found drug via direct match:', keyword);
      }
    }
    
    // Strategy 2: Brand name variations
    const drugVariations = {
      'paracetamol': ['acetaminophen', 'tylenol', 'panadol'],
      'ibuprofen': ['advil', 'motrin', 'brufen'],
      'aspirin': ['acetylsalicylic acid', 'asa'],
      'amoxicillin': ['amoxil', 'trimox'],
      'omeprazole': ['prilosec', 'losec'],
      'cetirizine': ['zyrtec'],
      'loratadine': ['claritin'],
      'fexofenadine': ['allegra'],
      'montelukast': ['singulair'],
      'albuterol': ['ventolin', 'proventil', 'salbutamol'],
      'metformin': ['glucophage'],
      'atorvastatin': ['lipitor'],
      'simvastatin': ['zocor'],
      'amlodipine': ['norvasc'],
      'losartan': ['cozaar'],
      'lisinopril': ['zestril', 'prinivil']
    };
    
    for (const [mainDrug, variations] of Object.entries(drugVariations)) {
      if (cleanText.includes(mainDrug) && !foundDrugs.includes(mainDrug)) {
        foundDrugs.push(mainDrug);
        console.log('Found drug via main name:', mainDrug);
      }
      for (const variation of variations) {
        if (cleanText.includes(variation) && !foundDrugs.includes(mainDrug)) {
          foundDrugs.push(mainDrug);
          console.log('Found drug via variation:', variation, '->', mainDrug);
          break;
        }
      }
    }
    
    // Strategy 3: Prescription patterns with dosage
    const prescriptionPatterns = [
      // Drug Name + Dosage (e.g., "Paracetamol 500mg")
      /([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*(?:tablets?|capsules?|mg|mcg|g|ml|units?|iu|meq|mmol|injection|suspension|syrup|cream|ointment|gel|drops|inhaler|patch|suppository)/gi,
      // RX: Drug Name
      /(?:rx|prescription|medication|drug)\s*:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi,
      // Take/Use + Drug Name
      /(?:take|use|apply|inject|inhale|administer)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi,
      // Drug Name + Instructions
      /([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(?:once|twice|three times|daily|weekly|monthly|as needed|prn)/gi,
      // Standalone drug names (3+ letters)
      /\b([a-zA-Z]{4,}(?:\s+[a-zA-Z]{3,})*)\b/g
    ];
    
    for (const pattern of prescriptionPatterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Extract the drug name part
          let extracted = match;
          
          // Remove common prefixes and suffixes
          extracted = extracted.replace(/^(?:rx|prescription|medication|drug)\s*:?\s*/i, '');
          extracted = extracted.replace(/^(?:take|use|apply|inject|inhale|administer)\s+/i, '');
          extracted = extracted.replace(/\s+(?:tablets?|capsules?|mg|mcg|g|ml|units?|iu|meq|mmol|injection|suspension|syrup|cream|ointment|gel|drops|inhaler|patch|suppository).*$/i, '');
          extracted = extracted.replace(/\s+(?:once|twice|three times|daily|weekly|monthly|as needed|prn).*$/i, '');
          
          extracted = extracted.trim();
          
          if (extracted && extracted.length > 3 && extracted.length < 50) {
            // Check if it's a known drug or looks like a drug name
            const isKnownDrug = drugKeywords.some(keyword => 
              keyword.includes(extracted.toLowerCase()) || 
              extracted.toLowerCase().includes(keyword) ||
              extracted.toLowerCase().split(' ').some(word => 
                keyword.includes(word) || 
                (word.length > 3 && drugKeywords.some(k => k.includes(word)))
              )
            );
            
            if (isKnownDrug && !foundDrugs.includes(extracted.toLowerCase())) {
              foundDrugs.push(extracted.toLowerCase());
              console.log('Found drug via pattern match:', extracted);
            }
          }
        }
      }
    }
    
    // Strategy 4: Word-by-word analysis for potential drug names
    const words = cleanText.split(/\s+/).filter(word => word.length > 3);
    for (const word of words) {
      // Check if word matches any drug keyword
      const matchingDrugs = drugKeywords.filter(keyword => 
        keyword.includes(word) || 
        word.includes(keyword) ||
        keyword.split(' ').some(part => part.includes(word) || word.includes(part))
      );
      
      for (const drug of matchingDrugs) {
        if (!foundDrugs.includes(drug)) {
          foundDrugs.push(drug);
          console.log('Found drug via word analysis:', word, '->', drug);
        }
      }
    }
    
    // Remove duplicates and limit results
    const uniqueDrugs = [...new Set(foundDrugs)];
    console.log('Final extracted drugs:', uniqueDrugs);
    return uniqueDrugs.slice(0, 10); // Limit to 10 drugs max
  };

  const matchDrugsWithDatabase = async (scannedDrugNames: string[]): Promise<ScannedDrug[]> => {
    try {
      // Search for medicines in the database
      const searchResults = await medicineService.searchMedicines(scannedDrugNames);
      
      return searchResults.map(result => {
        const matchedMedicine = result.foundMedicines[0]; // Take the first match
        const normalizedDrugName = result.searchedName.toLowerCase().trim();
        
        // Calculate confidence based on match quality
        let confidence = 0.7; // Base confidence
        if (matchedMedicine) {
          if (matchedMedicine.name.toLowerCase().includes(normalizedDrugName) || 
              normalizedDrugName.includes(matchedMedicine.name.toLowerCase())) {
            confidence = 0.95; // High confidence for exact matches
          } else if (matchedMedicine.genericName.toLowerCase().includes(normalizedDrugName) ||
                     normalizedDrugName.includes(matchedMedicine.genericName.toLowerCase())) {
            confidence = 0.85; // Good confidence for generic name matches
          } else {
            confidence = 0.75; // Lower confidence for partial matches
          }
        }

        return {
          name: result.searchedName,
          confidence: confidence,
          matchedMedicine: matchedMedicine || undefined,
          isAvailable: !!matchedMedicine
        };
      });
    } catch (error) {
      console.error('Error matching drugs with database:', error);
      // Show error to user
      setError('Failed to connect to Firebase database. Please check your internet connection and try again.');
      // Fallback to empty results if API fails
      return scannedDrugNames.map(drugName => ({
        name: drugName,
        confidence: 0,
        matchedMedicine: undefined,
        isAvailable: false
      }));
    }
  };

  const handleScanPrescription = async () => {
    if (!file) {
      setError('Please select a prescription image first');
      return;
    }

    setScanning(true);
    setError(null);
    setScanProgress(0);

    try {
      // Perform AI-powered prescription scanning
      const scannedDrugNames = await performAIPrescriptionScan(file);
      
      // Search database for matched drugs
      setSearchingDatabase(true);
      const matchedDrugs = await matchDrugsWithDatabase(scannedDrugNames);
      setScannedDrugs(matchedDrugs);
      
      // Save prescription data to Firebase for tracking
      await savePrescriptionToFirebase(file, scannedDrugNames, matchedDrugs);
      
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to scan prescription. Please ensure the image is clear, well-lit, and contains readable text. Try taking a new photo in better lighting.');
    } finally {
      setScanning(false);
      setSearchingDatabase(false);
      setScanProgress(0);
    }
  };

  const handleAddToCart = (medicine: Medicine) => {
    onAddToCart(medicine);
    setSuccessMessage(`${medicine.name} added to cart successfully!`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleAddManualDrug = () => {
    if (manualDrugName.trim() && !manualDrugs.includes(manualDrugName.trim())) {
      setManualDrugs([...manualDrugs, manualDrugName.trim()]);
      setManualDrugName('');
    }
  };

  const handleSearchManualDrugs = async () => {
    if (manualDrugs.length === 0) {
      setError('Please add at least one drug name to search');
      return;
    }

    setSearchingDatabase(true);
    setError(null);

    try {
      const matchedDrugs = await matchDrugsWithDatabase(manualDrugs);
      setScannedDrugs(matchedDrugs);
      setShowManualEntry(false);
      setManualDrugs([]);
    } catch (err) {
      console.error('Manual search error:', err);
      setError('Failed to search for drugs. Please try again.');
    } finally {
      setSearchingDatabase(false);
    }
  };

  const handleRemoveManualDrug = (index: number) => {
    setManualDrugs(manualDrugs.filter((_, i) => i !== index));
  };

  const extractPotentialDrugsFromPoorText = (text: string): string[] => {
    // Extract potential drug names from poor OCR text
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && word.length < 20);
    
    const potentialDrugs: string[] = [];
    
    // Look for words that might be drug names
    for (const word of words) {
      // Check if word contains common drug name patterns
      if (drugKeywords.some(keyword => 
        keyword.includes(word) || 
        word.includes(keyword) ||
        keyword.split(' ').some(part => part.includes(word) || word.includes(part))
      )) {
        potentialDrugs.push(word);
      }
    }
    
    // Remove duplicates and limit to 5 suggestions
    return [...new Set(potentialDrugs)].slice(0, 5);
  };

  // Save prescription data to Firebase for tracking
  const savePrescriptionToFirebase = async (file: File, scannedDrugNames: string[], matchedDrugs: ScannedDrug[]) => {
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../../firebase');
      
      const prescriptionData = {
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date(),
        scannedDrugNames: scannedDrugNames,
        matchedDrugs: matchedDrugs.map(drug => ({
          name: drug.name,
          isAvailable: drug.isAvailable,
          confidence: drug.confidence,
          matchedMedicine: drug.matchedMedicine ? {
            id: drug.matchedMedicine.id,
            name: drug.matchedMedicine.name,
            price: drug.matchedMedicine.price
          } : null
        })),
        status: 'processed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const prescriptionsRef = collection(db, 'prescriptions');
      await addDoc(prescriptionsRef, prescriptionData);
      
      console.log('Prescription data saved to Firebase');
    } catch (error) {
      console.warn('Failed to save prescription data to Firebase:', error);
      // Don't throw error as this is not critical for the main functionality
    }
  };

  const availableDrugs = scannedDrugs.filter(drug => drug.isAvailable);
  const unavailableDrugs = scannedDrugs.filter(drug => !drug.isAvailable);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50">
      <DashboardHeader user={user} cartItemsCount={0} onSearch={() => {}} onLogout={() => {}} />
      
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            AI Prescription Scanner
          </h1>
          <p className="text-lg text-gray-600">Upload your prescription and our AI will intelligently identify available medications</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Upload Prescription
            </h2>
            
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Prescription preview" 
                    className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-md"
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setScannedDrugs([]);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Drop your prescription here</p>
                    <p className="text-gray-500 mb-4">or click to browse files</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Choose File
            </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Supports: JPEG, PNG, WebP (Max 5MB)</p>
                  
                  {/* Tips for better OCR */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips for better results:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Ensure good lighting - avoid shadows and glare</li>
                      <li>• Keep the prescription flat and well-focused</li>
                      <li>• Use high resolution images (minimum 100x100 pixels)</li>
                      <li>• Printed text works better than handwriting</li>
                      <li>• Make sure all text is clearly visible</li>
                      <li>• Avoid blurry or low-contrast images</li>
                      <li>• Ensure text is not too small or compressed</li>
                      <li>• Use natural lighting rather than flash when possible</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {file && (
              <button
                onClick={handleScanPrescription}
                disabled={scanning}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-violet-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {scanning ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Scanning Prescription...
                  </div>
                ) : (
                  'Scan Prescription'
                )}
              </button>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            
            {scannedDrugs.length === 0 && !scanning && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">Upload and scan a prescription to see results</p>
              </div>
            )}

            {scanning && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-100 to-violet-100 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 border-3 border-violet-600 border-b-transparent rounded-full animate-spin" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-blue-600 font-medium text-lg mb-2">AI-powered prescription analysis...</p>
                <p className="text-gray-500 text-sm mb-4">Using advanced AI technology to identify medications</p>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Progress Steps */}
                <div className="text-xs text-gray-500 space-y-1">
                  {scanProgress >= 10 && <div>✓ Initializing AI engine</div>}
                  {scanProgress >= 20 && <div>✓ Configuring text recognition</div>}
                  {scanProgress >= 30 && <div>✓ Processing image text</div>}
                  {scanProgress >= 50 && <div>✓ Running AI analysis</div>}
                  {scanProgress >= 70 && <div>✓ Extracting medications</div>}
                  {scanProgress >= 90 && <div>✓ Finalizing results</div>}
                </div>
                
                <div className="flex justify-center gap-1 mt-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}

            {isSeedingDatabase && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-blue-600 font-medium text-lg mb-2">Initializing database...</p>
                <p className="text-gray-500 text-sm">Setting up medication database for first use</p>
              </div>
            )}

            {searchingDatabase && !scanning && !isSeedingDatabase && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-violet-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-violet-600 font-medium text-lg mb-2">Searching database...</p>
                <p className="text-gray-500 text-sm">Checking medication availability in our pharmacy</p>
              </div>
            )}

            {scannedDrugs.length > 0 && !scanning && (
              <div className="space-y-6">
                {/* Raw OCR Text Toggle */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Scan Results</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Found {scannedDrugs.length} medications
                    </div>
                    <button
                      onClick={() => setShowRawText(!showRawText)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showRawText ? 'Hide' : 'Show'} Raw Text
                    </button>
                  </div>
                </div>
                
                {/* AI Analysis Success Summary */}
                {scannedDrugs.length > 0 && (
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-violet-600" />
                      <h4 className="text-sm font-semibold text-violet-800">AI Analysis Successful!</h4>
                    </div>
                    <p className="text-violet-700 text-sm">
                      Successfully extracted {scannedDrugs.length} medication{scannedDrugs.length > 1 ? 's' : ''} from your prescription using AI-powered analysis.
                    </p>
                  </div>
                )}

                {/* Raw OCR Text Display */}
                {showRawText && rawOcrText && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Raw OCR Text:</h4>
                    <div className="text-xs text-gray-600 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{rawOcrText}</pre>
                    </div>
                  </div>
                )}

                {/* AI Debug Information */}
                {aiAnalysisResult && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Analysis Details
                      </h4>
                      <button
                        onClick={() => setShowAIDebug(!showAIDebug)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        {showAIDebug ? 'Hide' : 'Show'} Details
                      </button>
                    </div>
                    
                    <div className="text-xs text-purple-700 space-y-1">
                      <div>Confidence: {aiAnalysisResult.confidence}%</div>
                      <div>Text Quality: {aiAnalysisResult.analysis.textQuality}</div>
                      <div>Patterns Found: {aiAnalysisResult.analysis.patterns.join(', ') || 'None'}</div>
                    </div>

                    {showAIDebug && (
                      <div className="mt-3 text-xs text-purple-600 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                        <div className="font-semibold mb-1">AI Analysis:</div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(aiAnalysisResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                {/* No Drugs Found Message */}
                {scannedDrugs.length === 0 && rawOcrText && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">No medications detected</h4>
                        <p className="text-yellow-700 text-sm mb-3">
                          We couldn't identify any medications in your prescription. This could be due to:
                        </p>
                        <ul className="text-yellow-700 text-sm space-y-1 mb-4">
                          <li>• Image quality or lighting issues</li>
                          <li>• Handwritten text (OCR works best with printed text)</li>
                          <li>• Medications not in our database</li>
                          <li>• Text orientation or formatting</li>
                        </ul>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setFile(null);
                              setPreviewUrl(null);
                              setScannedDrugs([]);
                              setRawOcrText('');
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                          >
                            Try Different Image
                          </button>
                          <button 
                            onClick={() => {
                              // TODO: Implement manual search
                              console.log('Manual search');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Search Manually
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                                {/* Poor OCR Results Message */}
                {rawOcrText && assessTextQuality(rawOcrText).isPoor && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-800 mb-1">Image quality too poor for OCR</h4>
                        <p className="text-red-700 text-sm mb-2">
                          Issue detected: {assessTextQuality(rawOcrText).reason}
                        </p>
                        <p className="text-red-700 text-sm mb-3">
                          The OCR couldn't read text clearly from your image. You can:
                        </p>
                        <ul className="text-red-700 text-sm space-y-1 mb-4">
                          <li>• Enter multiple medications manually below</li>
                          <li>• Take a photo in better lighting</li>
                          <li>• Ensure the text is clearly visible and not blurry</li>
                          <li>• Use a higher resolution image</li>
                          <li>• Make sure the prescription is flat and well-lit</li>
                        </ul>

                        {/* Suggested Medicines from Poor OCR */}
                        {(() => {
                          const suggestedDrugs = extractPotentialDrugsFromPoorText(rawOcrText);
                          return suggestedDrugs.length > 0 ? (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-yellow-800 text-sm font-medium mb-2">
                                💡 Potential medicines detected (click to add):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {suggestedDrugs.map((drug, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      if (!manualDrugs.includes(drug)) {
                                        setManualDrugs([...manualDrugs, drug]);
                                      }
                                    }}
                                    disabled={manualDrugs.includes(drug)}
                                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {drug}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}

                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setFile(null);
                              setPreviewUrl(null);
                              setScannedDrugs([]);
                              setRawOcrText('');
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Upload Better Image
                          </button>
                          <button 
                            onClick={() => {
                              setShowManualEntry(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Enter Manually
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Drugs Found Message */}
                {scannedDrugs.length === 0 && rawOcrText && !assessTextQuality(rawOcrText).isPoor && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">No medications detected</h4>
                        <p className="text-yellow-700 text-sm mb-3">
                          We couldn't identify any medications in your prescription. This could be due to:
                        </p>
                        <ul className="text-yellow-700 text-sm space-y-1 mb-4">
                          <li>• Image quality or lighting issues</li>
                          <li>• Handwritten text (OCR works best with printed text)</li>
                          <li>• Medications not in our database</li>
                          <li>• Text orientation or formatting</li>
                        </ul>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setFile(null);
                              setPreviewUrl(null);
                              setScannedDrugs([]);
                              setRawOcrText('');
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                          >
                            Try Different Image
                          </button>
                          <button 
                            onClick={() => {
                              // TODO: Implement manual search
                              console.log('Manual search');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Search Manually
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Available Drugs */}
                {availableDrugs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-violet-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Available Medications ({availableDrugs.length})
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      These medications were found in your prescription and are available in our database:
                    </p>
                    <div className="space-y-4">
                      {availableDrugs.map((drug, index) => (
                        <div key={index} className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <img 
                              src={drug.matchedMedicine!.image} 
                              alt={drug.matchedMedicine!.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800">{drug.matchedMedicine!.name}</h4>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                                  <span className="text-xs text-violet-600 font-medium">
                                    {Math.round(drug.confidence * 100)}% match
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mb-1">
                                Scanned as: <span className="font-medium">{drug.name}</span>
                              </p>
                              <p className="text-sm text-gray-600 mb-2">{drug.matchedMedicine!.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <span className="text-lg font-bold text-violet-600">
                                    GH₵ {drug.matchedMedicine!.discountPrice || drug.matchedMedicine!.price}
                                  </span>
                                  {drug.matchedMedicine!.discountPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      GH₵ {drug.matchedMedicine!.price}
                                    </span>
                                  )}
                                  <span className="text-sm text-violet-600 font-medium">
                                    In Stock ({drug.matchedMedicine!.stockCount})
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleAddToCart(drug.matchedMedicine!)}
                                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unavailable Drugs */}
                {unavailableDrugs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Not Available ({unavailableDrugs.length})
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      These medications were found in your prescription but are not currently in our inventory:
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-1">Some medications not found</h4>
                          <p className="text-orange-700 text-sm">
                            We couldn't find the following medications in our inventory. 
                            Please contact our support team for assistance.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {unavailableDrugs.map((drug, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                            <span className="font-medium text-gray-700">{drug.name}</span>
                            <span className="text-sm text-orange-600 font-medium">Not Available</span>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                        Contact Support
                      </button>
                      
                      {/* Manual Search for Unavailable Drugs */}
                      <div className="mt-4 pt-4 border-t border-orange-200">
                        <h5 className="text-sm font-semibold text-orange-800 mb-3">Search for alternatives:</h5>
                        <div className="space-y-2">
                          {unavailableDrugs.map((drug, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm text-gray-700 flex-1">{drug.name}</span>
                              <button 
                                onClick={() => {
                                  // TODO: Implement search functionality
                                  console.log('Searching for:', drug.name);
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                              >
                                Search
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Total medications found:</span>
                    <span className="font-semibold text-blue-800">{scannedDrugs.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-violet-700">Available:</span>
                    <span className="font-semibold text-violet-800">{availableDrugs.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-orange-700">Not available:</span>
                    <span className="font-semibold text-orange-800">{unavailableDrugs.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-violet-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Manual Drug Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Medications Manually</h3>
            <p className="text-gray-600 mb-4">
              Since OCR couldn't read your prescription clearly, you can enter multiple medication names manually.
            </p>
            
            <div className="space-y-4">
              {/* Add Medicine Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Medication
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualDrugName}
                    onChange={(e) => setManualDrugName(e.target.value)}
                    placeholder="e.g., Paracetamol, Amoxicillin"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && manualDrugName.trim()) {
                        handleAddManualDrug();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddManualDrug}
                    disabled={!manualDrugName.trim()}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* List of Added Medicines */}
              {manualDrugs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Added Medications ({manualDrugs.length})
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {manualDrugs.map((drug, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">{drug}</span>
                        <button
                          onClick={() => handleRemoveManualDrug(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Add Common Medicines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Add Common Medicines
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Omeprazole', 'Cetirizine', 'Vitamin D3'].map((drug) => (
                    <button
                      key={drug}
                      onClick={() => {
                        if (!manualDrugs.includes(drug)) {
                          setManualDrugs([...manualDrugs, drug]);
                        }
                      }}
                      disabled={manualDrugs.includes(drug)}
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {drug}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={async () => {
                    if (manualDrugs.length > 0) {
                      setSearchingDatabase(true);
                      try {
                        const matchedDrugs = await matchDrugsWithDatabase(manualDrugs);
                        setScannedDrugs(matchedDrugs);
                        setShowManualEntry(false);
                        setManualDrugs([]);
                        setManualDrugName('');
                      } catch (error) {
                        console.error('Error searching for medicines:', error);
                        setError('Failed to search database. Please try again.');
                      } finally {
                        setSearchingDatabase(false);
                      }
                    }
                  }}
                  disabled={manualDrugs.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Search All ({manualDrugs.length})
                </button>
                <button
                  onClick={() => {
                    setShowManualEntry(false);
                    setManualDrugs([]);
                    setManualDrugName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DashboardFooter />
    </div>
  );
};

export default PrescriptionUpload; 