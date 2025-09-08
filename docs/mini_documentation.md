# Apomudenfie – Mini Documentation

## 1. Project Overview
Apomudenfie is a pharmacy and delivery web app built with React + Vite (TypeScript) and Firebase (Auth, Firestore, Storage). It supports browsing medicines, cart/checkout, prescription upload with AI assistance, delivery tracking, health insights, admin management, and a warehouse module for inventory operations.

## 2. Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Icons: lucide-react
- Backend/Data: Firebase Firestore, Firebase Auth
- Payments: Paystack (via eact-paystack typing)
- External APIs: Google Gemini AI for symptom checking

## 3. App Structure
- Entry: src/main.tsx, src/App.tsx
- Global styles: src/index.css, Tailwind config
- Firebase init: src/firebase.ts
- Types: src/types/index.ts
- Services: src/services/*
- Pages (user): src/pages/dashboard/* (Dashboard, Cart, Orders, Health Insights, Prescription Upload)
- Auth: src/pages/auth/* (Login, Register, Forgot/Reset Password)
- Admin: src/pages/admin/AdminDashboard.tsx
- Warehouse: src/pages/warehouse/* (Dashboard, Inventory, Add Item, Movements, History)
- Components: src/components/* (delivery, modals, UI)

## 4. Key Features
- User Auth: Register, login, password reset, session/activity tracking
- Medicines: Search/list/detail (Firestore), cart operations
- Orders: Create, list order history (Firestore)
- Prescription Upload: Upload and AI assist (src/services/aiPrescriptionService.ts)
- Health Insights: src/pages/dashboard/HealthInsights.tsx, service-backed
- Symptom Checker: Gemini AI-powered UI (src/components/SymptomChecker.tsx and dashboard page)
- Delivery: Rider selection, receiver details, real-time delivery progress
- Admin: Manage medicines, orders, riders, users
- Warehouse: Inventory management, stock movement logging, history, add items

## 5. Running Locally
1) Install dependencies
`ash
npm install
`
2) Setup environment
- Create a Firebase project; enable Auth and Firestore
- Add web app credentials in src/firebase.ts
- Optional: Paystack public key, Gemini API key (for symptom checker)
3) Start dev server
`ash
npm run dev
`

## 6. Environment & Config
- src/firebase.ts: Your Firebase config
- Firestore collections:
  - users
  - medicines (fields: name, genericName, category, price, discountPrice?, description, dosage, manufacturer, requiresPrescription, inStock, stockCount, image, rating, reviews, uses[], sideEffects[], precautions[])
  - orders
  - deliverers
  - stock_movements (medicineId, medicineName, type: 'in' | 'out', quantity, beforeCount, afterCount, note, createdAt)

## 7. Routing
- / Landing
- /login, /register, /forgot-password, /reset-password
- /dashboard main app (requires auth)
- /cart, /order-history, /health-insights, /upload-prescription
- /delivery, /receiver-details, /delivery-progress
- /admin Admin Dashboard (tabs: Medicines, Orders, Riders, Users, Warehouse)
- /warehouse Warehouse Dashboard (Inventory, Stock Movement, Add Item, History)
- /warehouse-setup One-time seeding/setup page

## 8. Admin & Warehouse
- Admin Dashboard: src/pages/admin/AdminDashboard.tsx
  - Stats (counts) and tabs for Medicines, Orders, Riders, Users, plus Warehouse tab
- Warehouse Dashboard: src/pages/warehouse/WarehouseDashboard.tsx
  - Inventory: InventoryManager.tsx – list and adjust stockCount
  - Stock Movement: StockMovementForm.tsx – log IN/OUT, updates medicines and writes to stock_movements
  - Add Item: AddInventoryForm.tsx – create medicine documents
  - History: InventoryHistory.tsx – movement logs (ordered by createdAt)

## 9. Data Seeding & Utilities
- Warehouse setup: src/pages/admin/WarehouseSetup.tsx + src/utils/runWarehouseSetup.ts
  - Seeds medicines if empty using src/utils/seedFirebaseMedicines.ts
  - Ensures stock_movements exists
- Other utilities: src/utils/* (fix data, test connections)

## 10. Styling & UI
- Tailwind CSS utility-first
- 3D, modern gradient accents (blue → green) added to Warehouse pages
- Icons: lucide-react

## 11. Notable Services
- src/services/medicineService.ts – Firestore reads for medicines
- src/services/healthInsightsService.ts – insights logic
- src/services/aiPrescriptionService.ts – AI prescription assistance
- src/services/geminiService.ts – Gemini AI for symptom checking

## 12. Typical Flows
- Checkout/Delivery:
  1) Add to cart → /delivery → select rider
  2) /receiver-details → confirm → /delivery-progress real-time
- Warehouse:
  1) /warehouse → Add Item (optional)
  2) Inventory – monitor counts
  3) Stock Movement – log IN/OUT
  4) History – audit trail

## 13. Deployment Notes
- Ensure Firebase rules secure reads/writes by role (admin vs user)
- Set environment variables (keys) via your hosting platform
- Build: 
pm run build → dist/

## 14. Future Enhancements
- Role-based access for /admin and /warehouse
- Advanced search and categories for medicines
- CSV import/export for warehouse
- Low-stock alerts and scheduled reports

## 15. Troubleshooting
- Missing collection errors: run /warehouse-setup
- BOM/encoding errors: recreate the file without BOM (VSCode UTF-8)
- Vite caching: stop server, remove 
ode_modules/.vite, restart

---
This mini documentation mirrors the referenced structure and is tailored to the current codebase. Update sections as features evolve.
