# Apomudenfie Pharmacy Delivery Application - Flowchart Documentation

## Project Overview
Apomudenfie is a comprehensive pharmacy and delivery web application built with React, TypeScript, and Firebase. It provides medicine browsing, AI-powered health services, delivery tracking, and administrative management.

## Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Paystack
- **AI Services**: Mock AI analysis for symptom checking and prescription extraction

## Application Flowchart

`mermaid
flowchart TD
    %% Start
    START([User Visits Apomudenfie]) --> AUTH{User Authenticated?}
    
    %% Authentication Flow
    AUTH -->|No| LANDING[Landing Page]
    AUTH -->|Yes| DASHBOARD[User Dashboard]
    
    LANDING --> LOGIN_OPTIONS[Login/Register Options]
    LOGIN_OPTIONS --> LOGIN[Login Page]
    LOGIN_OPTIONS --> REGISTER[Register Page]
    LOGIN_OPTIONS --> FORGOT[Forgot Password]
    
    LOGIN --> LOGIN_CHECK{Login Success?}
    REGISTER --> REG_CHECK{Registration Success?}
    FORGOT --> RESET[Reset Password]
    
    LOGIN_CHECK -->|Yes| DASHBOARD
    LOGIN_CHECK -->|No| LOGIN
    REG_CHECK -->|Yes| DASHBOARD
    REG_CHECK -->|No| REGISTER
    RESET --> LOGIN
    
    %% Main Dashboard Features
    DASHBOARD --> ROLE_CHECK{User Role?}
    ROLE_CHECK -->|Regular User| USER_FEATURES[User Features]
    ROLE_CHECK -->|Admin| ADMIN_DASH[Admin Dashboard]
    ROLE_CHECK -->|Warehouse| WAREHOUSE_DASH[Warehouse Dashboard]
    
    %% User Features
    USER_FEATURES --> BROWSE[Browse Medicines]
    USER_FEATURES --> HEALTH[Health Insights]
    USER_FEATURES --> SYMPTOM[Symptom Checker]
    USER_FEATURES --> PRESCRIPTION[Prescription Upload]
    USER_FEATURES --> ORDERS[Order History]
    USER_FEATURES --> SETTINGS[Settings]
    
    %% Medicine Shopping Flow
    BROWSE --> CATALOG[Medicine Catalog]
    CATALOG --> SEARCH[Search & Filter]
    SEARCH --> DETAILS[Medicine Details]
    DETAILS --> ADD_CART[Add to Cart]
    ADD_CART --> CART[Cart Management]
    
    CART --> REVIEW[Review Cart Items]
    REVIEW --> CHECKOUT[Proceed to Checkout]
    CHECKOUT --> PAYMENT[Payment Processing]
    PAYMENT --> PAY_CHECK{Payment Success?}
    
    PAY_CHECK -->|Yes| DELIVERY[Delivery Selection]
    PAY_CHECK -->|No| PAYMENT
    
    DELIVERY --> RIDER[Select Rider]
    RIDER --> RECEIVER[Receiver Details]
    RECEIVER --> CONFIRM[Confirm Order]
    CONFIRM --> TRACK[Delivery Tracking]
    TRACK --> COMPLETE[Order Complete]
    COMPLETE --> RATE[Rate Rider]
    
    %% Health Services
    SYMPTOM --> ENTER_SYMP[Enter Symptoms]
    ENTER_SYMP --> AI_ANALYSIS[AI Analysis]
    AI_ANALYSIS --> RECOMMEND[Medical Recommendations]
    RECOMMEND --> MED_SUGGEST[Medicine Suggestions]
    
    PRESCRIPTION --> UPLOAD[Upload Prescription]
    UPLOAD --> AI_EXTRACT[AI Extract Medicines]
    AI_EXTRACT --> ADD_MED[Add to Cart]
    
    HEALTH --> HEALTH_DATA[Input Health Data]
    HEALTH_DATA --> INSIGHTS[Generate Insights]
    INSIGHTS --> PERSONAL[Personalized Recommendations]
    
    %% Admin Features
    ADMIN_DASH --> ADMIN_MED[Manage Medicines]
    ADMIN_DASH --> ADMIN_ORD[Manage Orders]
    ADMIN_DASH --> ADMIN_RID[Manage Riders]
    ADMIN_DASH --> ADMIN_USR[Manage Users]
    ADMIN_DASH --> ADMIN_WH[Warehouse Management]
    
    %% Warehouse Features
    WAREHOUSE_DASH --> INVENTORY[Inventory Management]
    WAREHOUSE_DASH --> STOCK_MOVE[Stock Movement]
    WAREHOUSE_DASH --> ADD_ITEM[Add New Items]
    WAREHOUSE_DASH --> HISTORY[Inventory History]
    
    %% Data Storage
    FIREBASE[Firebase Backend] --> FIRESTORE[Firestore Database]
    FIRESTORE --> COLLECTIONS[Database Collections]
    COLLECTIONS --> USERS_DB[Users Collection]
    COLLECTIONS --> MEDS_DB[Medicines Collection]
    COLLECTIONS --> ORDERS_DB[Orders Collection]
    COLLECTIONS --> RIDERS_DB[Riders Collection]
    COLLECTIONS --> STOCK_DB[Stock Movements]
    
    %% External Services
    PAYSTACK[Paystack Payment] --> PAYMENT
    AI_SERVICES[AI Services] --> AI_ANALYSIS
    AI_SERVICES --> AI_EXTRACT
    
    %% Styling for better visibility
    classDef startEnd fill:#2E7D32,stroke:#1B5E20,stroke-width:3px,color:#FFFFFF
    classDef process fill:#1976D2,stroke:#0D47A1,stroke-width:2px,color:#FFFFFF
    classDef decision fill:#F57C00,stroke:#E65100,stroke-width:2px,color:#FFFFFF
    classDef userFlow fill:#7B1FA2,stroke:#4A148C,stroke-width:2px,color:#FFFFFF
    classDef adminFlow fill:#D32F2F,stroke:#B71C1C,stroke-width:2px,color:#FFFFFF
    classDef dataFlow fill:#388E3C,stroke:#1B5E20,stroke-width:2px,color:#FFFFFF
    classDef external fill:#FF6F00,stroke:#E65100,stroke-width:2px,color:#FFFFFF
    
    class START,COMPLETE startEnd
    class LANDING,LOGIN,REGISTER,FORGOT,RESET,DASHBOARD,USER_FEATURES,ADMIN_DASH,WAREHOUSE_DASH process
    class AUTH,LOGIN_CHECK,REG_CHECK,PAY_CHECK,ROLE_CHECK decision
    class BROWSE,CATALOG,SEARCH,DETAILS,ADD_CART,CART,REVIEW,CHECKOUT,DELIVERY,RIDER,RECEIVER,CONFIRM,TRACK,RATE,SYMPTOM,ENTER_SYMP,AI_ANALYSIS,RECOMMEND,MED_SUGGEST,PRESCRIPTION,UPLOAD,AI_EXTRACT,ADD_MED,HEALTH,HEALTH_DATA,INSIGHTS,PERSONAL,ORDERS,SETTINGS userFlow
    class ADMIN_MED,ADMIN_ORD,ADMIN_RID,ADMIN_USR,ADMIN_WH,INVENTORY,STOCK_MOVE,ADD_ITEM,HISTORY adminFlow
    class FIREBASE,FIRESTORE,COLLECTIONS,USERS_DB,MEDS_DB,ORDERS_DB,RIDERS_DB,STOCK_DB dataFlow
    class PAYSTACK,AI_SERVICES external
`

## Detailed Flow Descriptions

### 1. Authentication Flow
- **Entry Point**: User visits the application
- **Authentication Check**: System verifies if user is logged in
- **Landing Page**: Non-authenticated users see landing page with login/register options
- **Login Process**: Users can login, register, or reset password
- **Dashboard Access**: Successful authentication leads to user dashboard

### 2. User Role Management
- **Role Check**: System determines user role (Regular User, Admin, Warehouse)
- **Regular Users**: Access to shopping and health features
- **Admins**: Access to management dashboard
- **Warehouse Staff**: Access to inventory management

### 3. Medicine Shopping Flow
- **Browse Catalog**: Users can search and filter medicines
- **Medicine Details**: View detailed information about medicines
- **Add to Cart**: Select medicines for purchase
- **Cart Management**: Review and modify cart items
- **Checkout Process**: Proceed to payment
- **Payment Processing**: Paystack integration for secure payments
- **Delivery Setup**: Select rider and provide receiver details
- **Order Tracking**: Real-time delivery progress monitoring
- **Order Completion**: Rate rider and complete order

### 4. Health Services
- **Symptom Checker**: AI-powered symptom analysis with medical recommendations
- **Prescription Upload**: Upload prescription images for AI extraction
- **Health Insights**: Personalized health recommendations based on user data

### 5. Administrative Features
- **Medicine Management**: Add, edit, and manage medicine catalog
- **Order Management**: Monitor and manage all orders
- **Rider Management**: Manage delivery personnel
- **User Management**: Administer user accounts
- **Warehouse Operations**: Inventory and stock management

### 6. Warehouse Management
- **Inventory Control**: Monitor stock levels and medicine availability
- **Stock Movements**: Log incoming and outgoing stock
- **Add Items**: Create new medicine entries
- **History Tracking**: Audit trail of all inventory changes

## Database Structure

### Firestore Collections
- **Users**: User profiles and authentication data
- **Medicines**: Medicine catalog with inventory information
- **Orders**: Order history and tracking data
- **Deliverers**: Rider information and availability
- **Stock Movements**: Inventory change logs

## External Integrations
- **Paystack**: Payment processing gateway
- **AI Services**: Mock AI for symptom analysis and prescription extraction
- **Firebase**: Authentication, database, and storage services

## Key Features
-  User authentication and role management
-  Medicine browsing and search functionality
-  Shopping cart and checkout process
-  Payment integration with Paystack
-  Delivery tracking and rider management
-  AI-powered health services
-  Administrative dashboard
-  Warehouse inventory management
-  Real-time order tracking
-  Responsive design for all devices

## Technical Implementation
- **Frontend**: React with TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and context
- **Routing**: React Router for navigation
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and building

This flowchart represents the complete user journey through the Apomudenfie pharmacy delivery application, from initial visit to order completion, including all administrative and warehouse management features.
