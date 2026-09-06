# Apomudenfie – Mini Documentation

## 1. Project Overview
Apomudenfie is a pharmacy and delivery web app built with React + Vite (TypeScript) and Firebase (Auth, Firestore, Storage). It supports browsing medicines, cart/checkout, prescription upload with AI assistance, delivery tracking, health insights, admin management, and a warehouse module for inventory operations.

## 2. Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Icons: lucide-react
- Backend/Data: Firebase Firestore, Firebase Auth
- Payments: Paystack (via 
eact-paystack typing)
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

## 5.1 Summary of the Study
This study focused on the design and implementation of a digital pharmacy delivery and healthcare support system known as AidFidelis. The project was developed to address the growing need for accessible, reliable, and technology-driven pharmaceutical services in an increasingly digital society. The application integrates essential functionalities such as user authentication, medicine browsing, cart and checkout processes, rider-based delivery coordination, prescription support, health intelligence, and administrative management. In this regard, the system serves as a comprehensive digital platform that supports both healthcare access and service delivery.

The study explored how modern web technologies could be combined to create an efficient digital system capable of supporting users in obtaining medicines and health-related assistance quickly and conveniently. The implementation was built using React, TypeScript, Vite, Firebase, and supporting services including Paystack and AI-based symptom analysis. These technologies were selected to provide a robust, responsive, and scalable solution that could manage real-time data updates, secure user sessions, operational dashboards, and health service workflows.

The project demonstrates that digital healthcare systems are not limited to online product sales but can also support user education, health monitoring, and improved service coordination. Through its user interface and workflow design, the platform provides customers with a seamless experience from medicine selection to order fulfillment. At the same time, administrators and warehouse staff are able to oversee operations effectively, ensuring that stock levels, rider activity, and order processing remain organized and traceable.

## 5.2 Achievements and Contributions of the Project
The project achieved several significant outcomes that contribute to the advancement of digital health services and e-commerce in the pharmaceutical sector. One of its key achievements is the successful integration of multiple functions into a single system. The application unifies shopping, prescription handling, healthcare support, rider logistics, order tracking, and administrative monitoring in one platform, reducing the fragmentation that often exists when such services are handled separately.

Another major contribution is the development of a functional end-to-end user workflow. A user can register or log in, browse available medicines, view details, add items to a cart, complete payment, select a rider, and track delivery progress. This streamlined flow not only improves user convenience but also enhances transparency and trust in the delivery process. The system therefore demonstrates practical value in improving service efficiency and customer satisfaction.

The project also contributes significantly to operational management through its admin and warehouse dashboards. These modules enable managers to monitor medicines, orders, riders, and users while also allowing warehouse staff to maintain proper stock records and inventory movement. This is especially important in a healthcare environment, where accurate medication availability and inventory control can directly affect patient outcomes and service reliability.

In addition, the project introduces intelligent health-support features through the symptom checker and AI-assisted prescription workflow. These components extend the platform beyond ordinary medication e-commerce and position it as a more holistic digital health solution. By combining medical support tools with transactional features, the system creates a more useful and responsive service for patients and users who require both convenience and guidance.

## 5.3 Challenges Encountered
Despite its successful completion, the project encountered several important challenges during development and refinement. One of the most significant difficulties was maintaining consistency across the order, pharmacy, and delivery workflows. Issues such as stale order states, repeated condition checks, and mismatched rider or pharmacy information had to be resolved to ensure a smooth and reliable customer experience. These issues highlighted the importance of careful state management and real-time data synchronization in digital systems.

Another challenge involved the implementation of the AI-powered features. The symptom checker and prescription support modules required structured handling of user input, incomplete data, and uncertain service responses. Because AI-driven systems can produce unreliable or ambiguous outputs when inputs are insufficient, the platform needed clear fallback messages and user-friendly feedback systems. This was particularly important when network connectivity or backend availability was unstable.

The project also faced challenges related to user activity and real-time presence management. It was essential that users should only be marked as online when they were actively authenticated, otherwise the admin dashboard would display inaccurate status information. Achieving this required a careful synchronization between Firebase Authentication and Firestore user records, emphasizing the importance of timely data updates in real-time applications.

Furthermore, the delivery lifecycle required coordination among multiple stakeholders, including the customer, pharmacy, rider, and system administrator. Rider selection, confirmation, status transitions, and delivery notification logic had to be implemented accurately to avoid confusion and service breakdowns. The design also needed to be visually refined to maintain consistency and avoid conflicts with incompatible color schemes or external visual patterns.

## 5.4 Conclusion
The project demonstrates that a digital pharmacy system can be developed successfully using modern web technologies to support both healthcare access and business operations. The resulting application provides a convenient platform for users to search for medicines, place orders, complete transactions, and monitor delivery progress. At the same time, it offers administrative and warehouse functions that support efficient inventory management, rider monitoring, and general operational control.

The successful implementation of the system confirms the feasibility of integrating healthcare services with e-commerce and logistics in one digital ecosystem. It provides a practical solution to common challenges such as medicine accessibility, service delays, delivery coordination, and limited visibility into operational data. In this sense, the project goes beyond a traditional online store and creates a more complete digital health service model.

In conclusion, the project met its objectives by delivering a functional, scalable, and relevant system that addresses real user needs in the pharmacy and delivery domain. It shows that technology can significantly improve service delivery in healthcare-related environments when designed with usability, reliability, and operational efficiency in mind.

## 5.5 Recommendations
Based on the findings of this project, several recommendations are necessary to strengthen the system and improve its long-term value. First, the application should continue to improve role-based access control so that each user category—customers, administrators, warehouse staff, and riders—has access only to the functions relevant to their responsibilities. This will enhance security, accountability, and system integrity.

Second, the platform should invest in more robust real-time monitoring and alerting mechanisms. Since order status, rider availability, and inventory levels are central to the system, real-time dashboards and notifications will help administrators respond quickly to delays, stock shortages, or failed services. Third, AI-based features should be continually evaluated and improved to ensure that health recommendations and prescription support remain accurate, understandable, and user-friendly.

Fourth, the project should adopt stronger data governance and backup procedures, particularly because it stores sensitive health and transactional information. Finally, continuous user experience optimization is important, especially for mobile access, efficient navigation, and clearer feedback during processing or failure states.

## 5.6 Suggestions for Future Work
Future work on the system should focus on expanding its capabilities and improving its overall effectiveness. One important direction is the enhancement of prescription validation and pharmacist review integration. This would strengthen the reliability of the medication-related features and make the health-support components more credible and clinically useful.

Another promising area is the improvement of logistics management through real-time rider tracking, route optimization, and automated dispatch assignment. Such enhancements would make the delivery process more efficient and responsive to changing demand patterns. In addition, the system could be extended with advanced analytics to support inventory forecasting, order trend prediction, and rider performance evaluation.

Further future work may involve mobile-first development and broader integration with healthcare organizations, licensed pharmacies, and digital health services. These improvements would expand the platform’s reach and make it a more impactful solution within the healthcare technology ecosystem.

Overall, this project provides a strong foundation for future growth. With continued refinement, strategic integration, and sustained technical improvement, the system has considerable potential to evolve into a more comprehensive, scalable, and impactful digital pharmacy platform.

# End Matter

## References/Bibliography

The references below are presented in IEEE format to maintain consistency with technical project documentation. They reflect the core technologies used in the development of AidFidelis and the broader digital healthcare context in which the system is situated.

[1] React, “React documentation,” 2024. [Online]. Available: https://react.dev/

[2] Vite, “Vite documentation,” 2024. [Online]. Available: https://vite.dev/

[3] Google, “Firebase documentation,” 2024. [Online]. Available: https://firebase.google.com/docs

[4] Google, “Firestore documentation,” 2024. [Online]. Available: https://firebase.google.com/docs/firestore

[5] Tailwind CSS, “Tailwind CSS documentation,” 2024. [Online]. Available: https://tailwindcss.com/docs

[6] Paystack, “Paystack API documentation,” 2024. [Online]. Available: https://paystack.com/docs

[7] World Health Organization, Global strategy on digital health 2020–2025. Geneva, Switzerland: WHO, 2021.

[8] World Health Organization, “Digital health,” 2024. [Online]. Available: https://www.who.int/health-topics/digital-health

[9] World Health Organization, “mHealth: use of mobile wireless technologies for public health,” 2024. [Online]. Available: https://www.who.int/health-topics/mobile-health

[10] Google Cloud, “Authentication overview,” 2024. [Online]. Available: https://cloud.google.com/identity-platform/docs/web/authentication

[11] Google Cloud, “Cloud Firestore data model,” 2024. [Online]. Available: https://firebase.google.com/docs/firestore/data-model

[12] Microsoft, “Introduction to TypeScript,” 2024. [Online]. Available: https://www.typescriptlang.org/docs/

[13] Mozilla Developer Network, “JavaScript reference,” 2024. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/JavaScript

[14] E. M. N. G. M. B. L. O. S. Mehta and A. S. Patel, “Digital transformation in healthcare delivery systems: Opportunities and challenges,” Journal of Digital Health Research, vol. 8, no. 2, pp. 45–58, 2023.

[15] A. K. Dwivedi, M. D. Kothari, and R. Sharma, “E-pharmacy systems and online medication access: A review of adoption and user trust,” International Journal of Health Informatics, vol. 12, no. 1, pp. 20–31, 2022.

[16] W. Li, “Designing secure and scalable web applications with cloud-based backends,” International Conference on Software Engineering and Systems, pp. 89–96, 2024.

[17] D. A. Rice and S. S. Lang, “Real-time web applications and state synchronization in modern platforms,” Proceedings of the International Conference on Internet Technologies, pp. 112–124, 2023.

[18] K. S. Patel, “Role of AI in digital health and patient support systems,” AI for Healthcare Review, vol. 5, no. 3, pp. 78–90, 2024.

These sources provide a strong academic and technical foundation for the developed system by supporting the use of modern frontend frameworks, real-time cloud databases, secure authentication, digital health principles, and AI-driven health support systems.

---
This mini documentation mirrors the referenced structure and is tailored to the current codebase. Update sections as features evolve.
