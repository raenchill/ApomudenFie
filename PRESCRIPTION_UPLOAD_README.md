# Prescription Upload Feature

## Overview
The prescription upload feature allows users to scan their prescription receipts and automatically identify available medications in the pharmacy database. The system uses OCR (Optical Character Recognition) technology to extract drug names from prescription images and matches them against the available inventory.

## Features

### 🖼️ Image Upload
- **Drag & Drop Interface**: Users can drag and drop prescription images directly onto the upload area
- **File Browser**: Traditional file selection through a file browser
- **Image Preview**: Real-time preview of uploaded prescription images
- **File Validation**: Supports JPEG, PNG, and WebP formats with 5MB size limit

### 🔍 OCR Scanning
- **Real OCR Processing**: Uses Tesseract.js for actual text extraction from prescription images
- **Progress Tracking**: Real-time progress indicator showing scanning steps:
  - Initializing OCR (10%)
  - Processing image (30%)
  - Extracting text (60%)
  - Analyzing medications (90%)
  - Finalizing results (100%)
- **Raw Text Display**: Option to view the raw OCR text for transparency and debugging

### 💊 Drug Matching
- **Intelligent Matching**: Sophisticated algorithm that matches scanned drug names with database entries
- **Multiple Matching Strategies**:
  - Exact name matching
  - Generic name matching
  - Partial word matching
  - Fuzzy matching for similar names
- **Confidence Scoring**: Each match includes a confidence percentage (70-95%)

### 🛒 Cart Integration
- **One-Click Add to Cart**: Available medications can be added directly to the shopping cart
- **Success Notifications**: Toast notifications confirm when items are added to cart
- **Real-time Updates**: Cart count updates immediately when items are added

### 📊 Results Display
- **Available Medications**: 
  - Shows matched medications with images, descriptions, and pricing
  - Displays confidence scores for each match
  - Shows original scanned text for transparency
  - Includes stock availability information
- **Unavailable Medications**:
  - Lists medications not found in the database
  - Provides search alternatives for unavailable drugs
  - Contact support option for assistance

## Technical Implementation

### Components
- `PrescriptionUpload.tsx`: Main component handling the upload and scanning process
- `ScannedDrug` interface: Defines the structure for scanned drug data
- Integration with existing cart system via `onAddToCart` prop

### OCR Implementation
Uses Tesseract.js for client-side OCR processing:
- **Real-time Processing**: Extracts actual text from uploaded prescription images
- **No External Dependencies**: Works entirely in the browser without API calls
- **Privacy-First**: No data sent to external servers
- **Offline Capable**: Can work without internet connection after initial load

### Drug Matching Algorithm
1. **Normalization**: Converts drug names to lowercase and trims whitespace
2. **Exact Matching**: Looks for exact matches in medicine names and generic names
3. **Partial Matching**: Searches for partial matches using word-by-word comparison
4. **Confidence Calculation**: Assigns confidence scores based on match quality

### UI/UX Features
- **Professional Design**: Modern, clean interface with gradient backgrounds
- **Responsive Layout**: Works on desktop and mobile devices
- **Loading Animations**: Engaging loading states with progress indicators
- **Error Handling**: Clear error messages for invalid files or failed scans
- **Success Feedback**: Toast notifications for successful actions

## Usage

1. **Upload Prescription**: Drag and drop or select a prescription image
2. **Scan Image**: Click "Scan Prescription" to process the image
3. **Review Results**: View available and unavailable medications
4. **Add to Cart**: Click "Add to Cart" for desired medications
5. **Search Alternatives**: Use search function for unavailable drugs

## Future Enhancements

- **Real OCR Integration**: Connect to actual OCR APIs for production use
- **Prescription History**: Save scanned prescriptions for future reference
- **Batch Processing**: Handle multiple prescriptions at once
- **Prescription Validation**: Verify prescription authenticity
- **Dosage Information**: Extract and display dosage instructions
- **Refill Reminders**: Set up automatic refill reminders based on prescriptions

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Tesseract.js (for OCR)
- Lucide React (for icons)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+ 