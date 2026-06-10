import { Medicine } from '../types';

// AI-powered prescription analysis service
export class AIPrescriptionService {
  private static instance: AIPrescriptionService;
  private drugDatabase: Set<string> = new Set();
  private drugPatterns: Map<string, string[]> = new Map();
  private medicalTerms: Set<string> = new Set();

  private constructor() {
    this.initializeDrugDatabase();
    this.initializePatterns();
    this.initializeMedicalTerms();
  }

  public static getInstance(): AIPrescriptionService {
    if (!AIPrescriptionService.instance) {
      AIPrescriptionService.instance = new AIPrescriptionService();
    }
    return AIPrescriptionService.instance;
  }

  private initializeDrugDatabase() {
    // Comprehensive drug database with common medications
    const drugs = [
      // Pain relievers
      'paracetamol', 'acetaminophen', 'tylenol', 'panadol', 'ibuprofen', 'advil', 'motrin', 'brufen',
      'aspirin', 'acetylsalicylic acid', 'asa', 'naproxen', 'aleve', 'diclofenac', 'voltaren',
      'celecoxib', 'celebrex', 'tramadol', 'ultram', 'codeine', 'morphine', 'oxycodone', 'oxycontin',
      
      // Antibiotics
      'amoxicillin', 'amoxil', 'trimox', 'penicillin', 'azithromycin', 'zithromax', 'doxycycline',
      'vibramycin', 'ciprofloxacin', 'cipro', 'levofloxacin', 'levaquin', 'clindamycin', 'cleocin',
      'metronidazole', 'flagyl', 'cephalexin', 'keflex', 'ceftriaxone', 'rocephin',
      
      // Cardiovascular
      'atorvastatin', 'lipitor', 'simvastatin', 'zocor', 'rosuvastatin', 'crestor', 'amlodipine',
      'norvasc', 'losartan', 'cozaar', 'lisinopril', 'zestril', 'prinivil', 'metoprolol', 'lopressor',
      'carvedilol', 'coreg', 'diltiazem', 'cardizem', 'verapamil', 'calan', 'digoxin', 'lanoxin',
      
      // Diabetes
      'metformin', 'glucophage', 'glipizide', 'glucotrol', 'glyburide', 'diabeta', 'insulin',
      'humalog', 'lantus', 'novolog', 'sitagliptin', 'januvia', 'empagliflozin', 'jardiance',
      
      // Respiratory
      'albuterol', 'ventolin', 'proventil', 'salbutamol', 'ipratropium', 'atrovent', 'fluticasone',
      'flovent', 'budesonide', 'pulmicort', 'montelukast', 'singulair', 'theophylline', 'theo-dur',
      
      // Gastrointestinal
      'omeprazole', 'prilosec', 'losec', 'esomeprazole', 'nexium', 'pantoprazole', 'protonix',
      'lansoprazole', 'prevacid', 'ranitidine', 'zantac', 'famotidine', 'pepcid', 'cimetidine',
      'tagamet', 'metoclopramide', 'reglan', 'ondansetron', 'zofran', 'loperamide', 'imodium',
      
      // Mental Health
      'sertraline', 'zoloft', 'fluoxetine', 'prozac', 'escitalopram', 'lexapro', 'paroxetine',
      'paxil', 'venlafaxine', 'effexor', 'bupropion', 'wellbutrin', 'duloxetine', 'cymbalta',
      'alprazolam', 'xanax', 'lorazepam', 'ativan', 'diazepam', 'valium', 'clonazepam', 'klonopin',
      
      // Allergy
      'cetirizine', 'zyrtec', 'loratadine', 'claritin', 'fexofenadine', 'allegra', 'diphenhydramine',
      'benadryl', 'chlorpheniramine', 'chlor-trimeton', 'pseudoephedrine', 'sudafed',
      
      // Vitamins and Supplements
      'vitamin d', 'vitamin d3', 'cholecalciferol', 'vitamin c', 'ascorbic acid', 'vitamin b12',
      'cyanocobalamin', 'folic acid', 'folate', 'iron', 'ferrous sulfate', 'calcium', 'calcium carbonate',
      'magnesium', 'magnesium oxide', 'zinc', 'zinc sulfate', 'omega 3', 'fish oil',
      
      // Topical
      'hydrocortisone', 'cortaid', 'betamethasone', 'diprolene', 'clotrimazole', 'lotrimin',
      'miconazole', 'monistat', 'ketoconazole', 'nizoral', 'terbinafine', 'lamisil',
      
      // Eye/Ear
      'tobramycin', 'tobrex', 'ciprofloxacin', 'ciloxan', 'ofloxacin', 'ocuflox', 'prednisolone',
      'pred forte', 'artificial tears', 'systane', 'refresh',
      
      // Women's Health
      'estradiol', 'estrace', 'progesterone', 'prometrium', 'levonorgestrel', 'plan b',
      'ethinyl estradiol', 'ortho tri cyclen', 'medroxyprogesterone', 'provera',
      
      // Men's Health
      'sildenafil', 'viagra', 'tadalafil', 'cialis', 'finasteride', 'propecia', 'testosterone',
      'androgel', 'dutasteride', 'avodart'
    ];

    drugs.forEach(drug => this.drugDatabase.add(drug.toLowerCase()));
  }

  private initializePatterns() {
    // Common prescription patterns and abbreviations
    this.drugPatterns.set('dosage', ['mg', 'mcg', 'g', 'ml', 'units', 'iu', 'meq', 'mmol']);
    this.drugPatterns.set('frequency', ['once', 'twice', 'three times', 'daily', 'weekly', 'monthly', 'as needed', 'prn']);
    this.drugPatterns.set('route', ['oral', 'topical', 'injection', 'inhalation', 'rectal', 'vaginal']);
    this.drugPatterns.set('form', ['tablet', 'capsule', 'liquid', 'cream', 'ointment', 'gel', 'drops', 'inhaler', 'patch']);
    this.drugPatterns.set('instructions', ['take', 'use', 'apply', 'inject', 'inhale', 'administer', 'swallow', 'chew']);
  }

  private initializeMedicalTerms() {
    // Medical terminology that might appear on prescriptions
    const terms = [
      'prescription', 'medication', 'drug', 'medicine', 'rx', 'sig', 'disp', 'refill',
      'pharmacy', 'pharmacist', 'doctor', 'physician', 'nurse', 'practitioner',
      'diagnosis', 'condition', 'symptoms', 'treatment', 'therapy', 'dose', 'dosage',
      'schedule', 'duration', 'course', 'cycle', 'regimen', 'protocol'
    ];
    terms.forEach(term => this.medicalTerms.add(term.toLowerCase()));
  }

  // AI-powered text analysis and drug extraction
  public async analyzePrescriptionText(text: string): Promise<{
    extractedDrugs: string[];
    confidence: number;
    analysis: {
      textQuality: 'excellent' | 'good' | 'fair' | 'poor';
      drugCount: number;
      patterns: string[];
      suggestions: string[];
    };
  }> {
    console.log('AI Analysis starting for text:', text.substring(0, 100) + '...');
    
    // Clean and normalize text
    const cleanText = this.preprocessText(text);
    console.log('Preprocessed text:', cleanText.substring(0, 100) + '...');

    // Extract potential drugs using multiple AI strategies
    const extractedDrugs = await this.extractDrugsWithAI(cleanText);
    console.log('AI extracted drugs:', extractedDrugs);

    // Post-process and validate results
    const validatedDrugs = this.validateAndFilterDrugs(extractedDrugs, cleanText);
    console.log('Validated drugs:', validatedDrugs);

    // Analyze text quality and patterns
    const analysis = this.analyzeTextQuality(cleanText, validatedDrugs);

    // Calculate confidence score
    const confidence = this.calculateConfidence(validatedDrugs, analysis);

    return {
      extractedDrugs: validatedDrugs,
      confidence,
      analysis
    };
  }

  private preprocessText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s\-\.]/g, ' ') // Remove special characters but keep hyphens and dots
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b\d+\.?\d*\s*(mg|mcg|g|ml|units?|iu|meq|mmol)\b/gi, ' $1 ') // Preserve dosage info
      .trim();
  }

  private async extractDrugsWithAI(cleanText: string): Promise<string[]> {
    const foundDrugs: Set<string> = new Set();
    
    // Strategy 1: Direct drug name matching with fuzzy matching
    const directMatches = this.findDirectMatches(cleanText);
    directMatches.forEach(drug => foundDrugs.add(drug));
    console.log('Direct matches found:', directMatches);

    // Strategy 2: Pattern-based extraction
    const patternMatches = this.extractByPatterns(cleanText);
    patternMatches.forEach(drug => foundDrugs.add(drug));
    console.log('Pattern matches found:', patternMatches);

    // Strategy 3: Contextual analysis
    const contextualMatches = this.extractByContext(cleanText);
    contextualMatches.forEach(drug => foundDrugs.add(drug));
    console.log('Contextual matches found:', contextualMatches);

    // Strategy 4: Word combination analysis
    const combinationMatches = this.extractByCombinations(cleanText);
    combinationMatches.forEach(drug => foundDrugs.add(drug));
    console.log('Combination matches found:', combinationMatches);

    // Strategy 5: Brand name detection
    const brandMatches = this.extractBrandNames(cleanText);
    brandMatches.forEach(drug => foundDrugs.add(drug));
    console.log('Brand matches found:', brandMatches);

    // Strategy 6: Enhanced fuzzy matching for OCR errors
    const fuzzyMatches = this.extractByFuzzyMatching(cleanText);
    fuzzyMatches.forEach(drug => foundDrugs.add(drug));
    console.log('Fuzzy matches found:', fuzzyMatches);

    // Strategy 7: Prescription-specific patterns
    const prescriptionMatches = this.extractByPrescriptionPatterns(cleanText);
    prescriptionMatches.forEach(drug => foundDrugs.add(drug));
    console.log('Prescription pattern matches found:', prescriptionMatches);

    return Array.from(foundDrugs);
  }

  private findDirectMatches(text: string): string[] {
    const matches: string[] = [];
    const words = text.split(/\s+/);
    
    // Check each word and word combination
    for (let i = 0; i < words.length; i++) {
      // Single word match
      if (this.drugDatabase.has(words[i])) {
        matches.push(words[i]);
      }
      
      // Two-word combination
      if (i < words.length - 1) {
        const twoWord = `${words[i]} ${words[i + 1]}`;
        if (this.drugDatabase.has(twoWord)) {
          matches.push(twoWord);
        }
      }
      
      // Three-word combination
      if (i < words.length - 2) {
        const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (this.drugDatabase.has(threeWord)) {
          matches.push(threeWord);
        }
      }
    }
    
    return matches;
  }

  private extractByPatterns(text: string): string[] {
    const matches: string[] = [];
    
    // Pattern 1: Drug name followed by dosage (more specific)
    const dosagePattern = /\b([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+\d+\.?\d*\s*(?:mg|mcg|g|ml|units?|iu|meq|mmol)\b/gi;
    let match;
    while ((match = dosagePattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 2: Drug name followed by form
    const formPattern = /\b([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(?:tablets?|capsules?|liquid|suspension|syrup|cream|ointment|gel|drops|inhaler|patch|suppository|injection)\b/gi;
    while ((match = formPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 3: RX: Drug name
    const rxPattern = /(?:rx|prescription|medication|drug)\s*:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi;
    while ((match = rxPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 4: Take/Use + Drug name
    const instructionPattern = /(?:take|use|apply|inject|inhale|administer|give)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi;
    while ((match = instructionPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 5: Drug name with frequency
    const frequencyPattern = /\b([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(?:once|twice|three times|daily|weekly|monthly|as needed|prn)\b/gi;
    while ((match = frequencyPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    return matches;
  }

  private extractByContext(text: string): string[] {
    const matches: string[] = [];
    const sentences = text.split(/[.!?]/);
    
    for (const sentence of sentences) {
      // Look for sentences containing medical terms
      const hasMedicalContext = Array.from(this.medicalTerms).some(term => 
        sentence.includes(term)
      );
      
      if (hasMedicalContext) {
        const words = sentence.split(/\s+/);
        for (const word of words) {
          if (word.length > 3 && this.isLikelyDrug(word)) {
            matches.push(word);
          }
        }
      }
    }
    
    return matches;
  }

  private extractByCombinations(text: string): string[] {
    const matches: string[] = [];
    const words = text.split(/\s+/).filter(word => word.length > 2);
    
    // Check for partial matches and combinations
    for (let i = 0; i < words.length; i++) {
      // Check if current word is part of a drug name
      const partialMatches = Array.from(this.drugDatabase).filter(drug => 
        drug.includes(words[i]) || words[i].includes(drug)
      );
      
      if (partialMatches.length > 0) {
        matches.push(...partialMatches);
      }
      
      // Check word combinations
      if (i < words.length - 1) {
        const combined = `${words[i]} ${words[i + 1]}`;
        const combinedMatches = Array.from(this.drugDatabase).filter(drug => 
          drug.includes(combined) || combined.includes(drug)
        );
        
        if (combinedMatches.length > 0) {
          matches.push(...combinedMatches);
        }
      }
    }
    
    return matches;
  }

  private extractBrandNames(text: string): string[] {
    const brandMappings: { [key: string]: string } = {
      'tylenol': 'paracetamol',
      'panadol': 'paracetamol',
      'advil': 'ibuprofen',
      'motrin': 'ibuprofen',
      'brufen': 'ibuprofen',
      'amoxil': 'amoxicillin',
      'trimox': 'amoxicillin',
      'zithromax': 'azithromycin',
      'vibramycin': 'doxycycline',
      'cipro': 'ciprofloxacin',
      'levaquin': 'levofloxacin',
      'cleocin': 'clindamycin',
      'flagyl': 'metronidazole',
      'keflex': 'cephalexin',
      'rocephin': 'ceftriaxone',
      'lipitor': 'atorvastatin',
      'zocor': 'simvastatin',
      'crestor': 'rosuvastatin',
      'norvasc': 'amlodipine',
      'cozaar': 'losartan',
      'zestril': 'lisinopril',
      'prinivil': 'lisinopril',
      'lopressor': 'metoprolol',
      'coreg': 'carvedilol',
      'cardizem': 'diltiazem',
      'calan': 'verapamil',
      'lanoxin': 'digoxin',
      'glucophage': 'metformin',
      'glucotrol': 'glipizide',
      'diabeta': 'glyburide',
      'humalog': 'insulin',
      'lantus': 'insulin',
      'novolog': 'insulin',
      'januvia': 'sitagliptin',
      'jardiance': 'empagliflozin',
      'ventolin': 'albuterol',
      'proventil': 'albuterol',
      'atrovent': 'ipratropium',
      'flovent': 'fluticasone',
      'pulmicort': 'budesonide',
      'singulair': 'montelukast',
      'theo-dur': 'theophylline',
      'prilosec': 'omeprazole',
      'losec': 'omeprazole',
      'nexium': 'esomeprazole',
      'protonix': 'pantoprazole',
      'prevacid': 'lansoprazole',
      'zantac': 'ranitidine',
      'pepcid': 'famotidine',
      'tagamet': 'cimetidine',
      'reglan': 'metoclopramide',
      'zofran': 'ondansetron',
      'imodium': 'loperamide',
      'zoloft': 'sertraline',
      'prozac': 'fluoxetine',
      'lexapro': 'escitalopram',
      'paxil': 'paroxetine',
      'effexor': 'venlafaxine',
      'wellbutrin': 'bupropion',
      'cymbalta': 'duloxetine',
      'xanax': 'alprazolam',
      'ativan': 'lorazepam',
      'valium': 'diazepam',
      'klonopin': 'clonazepam',
      'zyrtec': 'cetirizine',
      'claritin': 'loratadine',
      'allegra': 'fexofenadine',
      'benadryl': 'diphenhydramine',
      'chlor-trimeton': 'chlorpheniramine',
      'sudafed': 'pseudoephedrine',
      'cortaid': 'hydrocortisone',
      'diprolene': 'betamethasone',
      'lotrimin': 'clotrimazole',
      'monistat': 'miconazole',
      'nizoral': 'ketoconazole',
      'lamisil': 'terbinafine',
      'tobrex': 'tobramycin',
      'ciloxan': 'ciprofloxacin',
      'ocuflox': 'ofloxacin',
      'pred forte': 'prednisolone',
      'systane': 'artificial tears',
      'refresh': 'artificial tears',
      'estrace': 'estradiol',
      'prometrium': 'progesterone',
      'plan b': 'levonorgestrel',
      'ortho tri cyclen': 'ethinyl estradiol',
      'provera': 'medroxyprogesterone',
      'viagra': 'sildenafil',
      'cialis': 'tadalafil',
      'propecia': 'finasteride',
      'androgel': 'testosterone',
      'avodart': 'dutasteride'
    };
    
    const matches: string[] = [];
    const words = text.split(/\s+/);
    
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      if (brandMappings[lowerWord]) {
        matches.push(brandMappings[lowerWord]);
      }
    }
    
    return matches;
  }

  private isLikelyDrug(word: string): boolean {
    // Check if word is in drug database
    if (this.drugDatabase.has(word)) {
      return true;
    }
    
    // Check if word contains drug-like patterns
    const drugPatterns = [
      /^[a-z]+(?:ol|in|ine|ate|ide|one|il|am|en|al|ar|er|or|um|us|an|ic|al)$/i,
      /^[a-z]+(?:cillin|mycin|cycline|floxacin|azole|statin|pril|sartan|olol|pine|ine|ate)$/i
    ];
    
    return drugPatterns.some(pattern => pattern.test(word));
  }

  private validateAndFilterDrugs(drugs: string[], originalText: string): string[] {
    const validatedDrugs: string[] = [];
    const textWords = originalText.toLowerCase().split(/\s+/);
    
    for (const drug of drugs) {
      // Check if drug name appears in the original text
      const drugWords = drug.toLowerCase().split(/\s+/);
      const allWordsPresent = drugWords.every(word => 
        textWords.some(textWord => 
          textWord.includes(word) || word.includes(textWord) || 
          this.calculateSimilarity(textWord, word) > 0.7
        )
      );
      
      if (allWordsPresent) {
        // Additional validation: check if it's not a common non-drug word
        if (!this.isCommonNonDrugWord(drug)) {
          validatedDrugs.push(drug);
        }
      }
    }
    
    // Remove duplicates and sort by relevance
    const uniqueDrugs = [...new Set(validatedDrugs)];
    return this.sortByRelevance(uniqueDrugs, originalText);
  }

  private calculateSimilarity(word1: string, word2: string): number {
    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private isCommonNonDrugWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'can', 'must', 'shall', 'take', 'use', 'apply', 'give', 'prescribe',
      'tablet', 'capsule', 'liquid', 'cream', 'ointment', 'drops', 'inhaler',
      'mg', 'mcg', 'g', 'ml', 'units', 'iu', 'meq', 'mmol', 'daily', 'weekly',
      'monthly', 'once', 'twice', 'three', 'times', 'as', 'needed', 'prn'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }

  private sortByRelevance(drugs: string[], text: string): string[] {
    return drugs.sort((a, b) => {
      const scoreA = this.calculateDrugRelevanceScore(a, text);
      const scoreB = this.calculateDrugRelevanceScore(b, text);
      return scoreB - scoreA;
    });
  }

  private calculateDrugRelevanceScore(drug: string, text: string): number {
    let score = 0;
    const drugLower = drug.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower.includes(drugLower)) {
      score += 100;
    }
    
    // Partial match gets medium score
    const drugWords = drugLower.split(/\s+/);
    for (const word of drugWords) {
      if (textLower.includes(word)) {
        score += 50;
      }
    }
    
    // Brand name match gets bonus
    if (this.isBrandName(drugLower)) {
      score += 25;
    }
    
    // Common drug gets bonus
    if (this.isCommonDrug(drugLower)) {
      score += 15;
    }
    
    return score;
  }

  private isBrandName(drug: string): boolean {
    const brandNames = [
      'tylenol', 'advil', 'motrin', 'aspirin', 'amoxil', 'zithromax', 'cipro',
      'lipitor', 'zocor', 'norvasc', 'cozaar', 'zestril', 'glucophage',
      'ventolin', 'singulair', 'prilosec', 'zantac', 'zoloft', 'prozac',
      'xanax', 'valium', 'zyrtec', 'claritin', 'benadryl'
    ];
    
    return brandNames.includes(drug);
  }

  private isCommonDrug(drug: string): boolean {
    const commonDrugs = [
      'paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin', 'metformin',
      'atorvastatin', 'amlodipine', 'losartan', 'lisinopril', 'omeprazole',
      'cetirizine', 'albuterol', 'montelukast', 'sertraline', 'alprazolam'
    ];
    
    return commonDrugs.includes(drug);
  }

  private extractByFuzzyMatching(text: string): string[] {
    const matches: string[] = [];
    const words = text.split(/\s+/).filter(word => word.length > 2);
    
    for (const word of words) {
      // Find drugs with high similarity to the word
      for (const drug of this.drugDatabase) {
        const similarity = this.calculateSimilarity(word, drug);
        if (similarity > 0.8) {
          matches.push(drug);
        }
        
        // Check individual words in multi-word drugs
        const drugWords = drug.split(/\s+/);
        for (const drugWord of drugWords) {
          if (drugWord.length > 3) {
            const wordSimilarity = this.calculateSimilarity(word, drugWord);
            if (wordSimilarity > 0.85) {
              matches.push(drug);
              break;
            }
          }
        }
      }
    }
    
    return matches;
  }

  private extractByPrescriptionPatterns(text: string): string[] {
    const matches: string[] = [];
    
    // Pattern 1: "Rx:" followed by drug name
    const rxPattern = /rx\s*:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi;
    let match;
    while ((match = rxPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 2: "Sig:" (signature) followed by drug name
    const sigPattern = /sig\s*:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi;
    while ((match = sigPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 3: "Disp:" (dispense) followed by drug name
    const dispPattern = /disp\s*:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi;
    while ((match = dispPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 4: Drug name with dosage and frequency
    const dosagePattern = /([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+\d+\s*(?:mg|mcg|g|ml|units?|iu|meq|mmol)\s*(?:once|twice|three times|daily|weekly|monthly|as needed|prn)/gi;
    while ((match = dosagePattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    // Pattern 5: Drug name with quantity
    const quantityPattern = /([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+\d+\s*(?:tablets?|capsules?|bottles?|tubes?|packs?)/gi;
    while ((match = quantityPattern.exec(text)) !== null) {
      const drugName = match[1].toLowerCase().trim();
      if (this.isLikelyDrug(drugName)) {
        matches.push(drugName);
      }
    }
    
    return matches;
  }

  private analyzeTextQuality(text: string, extractedDrugs: string[]): {
    textQuality: 'excellent' | 'good' | 'fair' | 'poor';
    drugCount: number;
    patterns: string[];
    suggestions: string[];
  } {
    const words = text.split(/\s+/);
    const wordCount = words.length;
    const drugCount = extractedDrugs.length;
    
    // Analyze text quality
    let textQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    
    if (wordCount > 50 && drugCount > 3) {
      textQuality = 'excellent';
    } else if (wordCount > 20 && drugCount > 1) {
      textQuality = 'good';
    } else if (wordCount > 10 && drugCount > 0) {
      textQuality = 'fair';
    }
    
    // Find patterns in the text
    const patterns: string[] = [];
    for (const [patternType, patternList] of this.drugPatterns) {
      if (patternList.some(pattern => text.includes(pattern))) {
        patterns.push(patternType);
      }
    }
    
    // Generate suggestions
    const suggestions: string[] = [];
    if (drugCount === 0) {
      suggestions.push('No medications detected. Try uploading a clearer image.');
      suggestions.push('Ensure the prescription text is clearly visible and well-lit.');
    } else if (drugCount < 2) {
      suggestions.push('Only a few medications detected. Check if all text is visible.');
    }
    
    return {
      textQuality,
      drugCount,
      patterns,
      suggestions
    };
  }

  private calculateConfidence(extractedDrugs: string[], analysis: any): number {
    let confidence = 0;
    
    // Base confidence on number of drugs found
    if (extractedDrugs.length > 0) {
      confidence += 30;
    }
    
    // Add confidence for text quality
    switch (analysis.textQuality) {
      case 'excellent':
        confidence += 40;
        break;
      case 'good':
        confidence += 30;
        break;
      case 'fair':
        confidence += 20;
        break;
      case 'poor':
        confidence += 10;
        break;
    }
    
    // Add confidence for patterns found
    confidence += analysis.patterns.length * 5;
    
    // Cap at 100%
    return Math.min(confidence, 100);
  }

  // Public method to get drug suggestions for manual entry
  public getDrugSuggestions(partialText: string): string[] {
    const suggestions: string[] = [];
    const lowerText = partialText.toLowerCase();
    
    // Find drugs that contain the partial text
    for (const drug of this.drugDatabase) {
      if (drug.includes(lowerText) && suggestions.length < 10) {
        suggestions.push(drug);
      }
    }
    
    return suggestions;
  }

  // Public method to validate if a drug name is recognized
  public isRecognizedDrug(drugName: string): boolean {
    return this.drugDatabase.has(drugName.toLowerCase());
  }

  // Test method to verify AI module functionality
  public async testAIWithSampleText(): Promise<void> {
    const testCases = [
      {
        text: "Rx: Paracetamol 500mg tablets, take 1-2 tablets every 4-6 hours as needed for pain",
        expected: ["paracetamol"]
      },
      {
        text: "Amoxicillin 250mg capsules, take 1 capsule three times daily",
        expected: ["amoxicillin"]
      },
      {
        text: "Tylenol 500mg for headache, Advil 400mg for inflammation",
        expected: ["paracetamol", "ibuprofen"]
      },
      {
        text: "Prescription: Metformin 500mg twice daily, Atorvastatin 20mg once daily",
        expected: ["metformin", "atorvastatin"]
      },
      {
        text: "Take Omeprazole 20mg daily for acid reflux",
        expected: ["omeprazole"]
      }
    ];

    console.log("🧪 Testing AI Prescription Module...");
    
    for (const testCase of testCases) {
      console.log(`\n📝 Test case: "${testCase.text}"`);
      const result = await this.analyzePrescriptionText(testCase.text);
      console.log(`✅ Extracted: ${result.extractedDrugs.join(', ')}`);
      console.log(`🎯 Expected: ${testCase.expected.join(', ')}`);
      console.log(`📊 Confidence: ${result.confidence}%`);
      
      const accuracy = testCase.expected.filter(expected => 
        result.extractedDrugs.includes(expected)
      ).length / testCase.expected.length * 100;
      
      console.log(`🎯 Accuracy: ${accuracy}%`);
    }
    
    console.log("\n✅ AI Module testing completed!");
  }
}

// Export singleton instance
export const aiPrescriptionService = AIPrescriptionService.getInstance(); 