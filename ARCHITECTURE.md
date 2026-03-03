# AuctionHub Platform - Architecture Guide

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     AuctionHub Platform                         │
├─────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────────────────────┐
│  │              Frontend (Next.js 16 + React 19)            │
│  └──────────────────────────────────────────────────────────┘
│         │                                                    │
│    ┌────┴─────────────────────────────────────────┐    ┌───┴─────┐
│    │        Page Layer                            │    │ Utility │
│    ├────────────────────────────────────────────────    │ Layers  │
│    │ • Auth Pages (Login/Register)              │    ├─────────┤
│    │ • Buyer Dashboard                          │    │API Client
│    │ • Seller Dashboard                         │    │Auth Ctx │
│    │ • Admin Dashboard                          │    │Utilities
│    │ • Auction Details                          │    │Config  │
│    │ • Live Events                              │    └─────────┘
│    │ • Product Pages                            │
│    └────────────────────────────────────────────────
│         │
│    ┌────┴──────────────────────────────────────┐
│    │     Component Layer (shadcn + Custom)     │
│    ├──────────────────────────────────────────────
│    │ • Header/Navigation                       │
│    │ • Product Grid                            │
│    │ • Bid Form                                │
│    │ • Auction Timer                           │
│    │ • Live Feed                               │
│    │ • Analytics Cards                         │
│    │ • Form Components                         │
│    │ • Dialog/Modal Components                 │
│    └──────────────────────────────────────────────
│         │
│    ┌────┴──────────────────────────────────────┐
│    │        State Management Layer              │
│    ├──────────────────────────────────────────────
│    │ • React Context (Auth)                    │
│    │ • Component State                         │
│    │ • localStorage (Watchlist)                │
│    │ • Real-time Polling Logic                 │
│    └──────────────────────────────────────────────
│         │
└─────────┴──────────────────────────────────────────────────────
           │
    ┌──────┴──────────────────────────────────────┐
    │    Backend API Layer (localhost:5000)       │
    ├────────────────────────────────────────────────
    │  /users          - Auth & User Management   │
    │  /products       - Product CRUD             │
    │  /auctions       - Auction Management       │
    │  /bids           - Bid System               │
    │  /events         - Live Events              │
    │  /categories     - Category Management      │
    │  /analytics      - Platform Analytics       │
    │  /orders         - Order Management         │
    └────────────────────────────────────────────────
           │
    ┌──────┴──────────────────────────────────────┐
    │         Database Layer                      │
    ├────────────────────────────────────────────────
    │ • Users & Authentication                   │
    │ • Products & Auctions                      │
    │ • Bids & Transactions                      │
    │ • Categories                               │
    │ • Events                                   │
    │ • Analytics Data                           │
    └────────────────────────────────────────────────
```

---

## 🔀 Data Flow Architecture

### Authentication Flow
```
User Input (Login/Register)
    ↓
Form Validation
    ↓
API Call (POST /users/login or /users)
    ↓
Backend Validation
    ↓
Token Generated
    ↓
Token Stored (localStorage)
    ↓
Auth Context Updated
    ↓
Redirect to Dashboard
    ↓
Protected Routes Available
```

### Bidding Flow
```
User Enters Bid Amount
    ↓
Form Validation (must exceed highest)
    ↓
API Call (POST /bids)
    ↓
Backend Validation & Storage
    ↓
Success Response
    ↓
Component State Updated
    ↓
UI Re-renders
    ↓
Next Poll (3 seconds)
    ↓
Fetch Updated Bid History (GET /bids/auction/:id)
    ↓
Detect Outbid Scenario
    ↓
Display Latest Bids
```

### Live Event Bidding Flow
```
User Joins Event
    ↓
Load Event Details (GET /events/:id)
    ↓
Display Current Product
    ↓
Start Polling Interval (3 seconds)
    ↓
Poll for Bid Updates (GET /bids/auction/:id)
    ↓
Update Live Bid Feed
    ↓
User Places Bid
    ↓
Validate & Submit
    ↓
Continue Polling
    ↓
(Repeat Until Event Ends)
```

---

## 📦 Module Architecture

### Core Modules

#### 1. Authentication Module
```
lib/auth-context.tsx
├── AuthContext (React Context)
├── AuthProvider (Context Provider)
├── useAuth() (Custom Hook)
├── Functions:
│   ├── login(email, password)
│   ├── register(name, email, password, userType)
│   ├── logout()
│   └── isAuthenticated (boolean)
└── State:
    ├── user (User | null)
    ├── loading (boolean)
    ├── error (string | null)
    └── isAuthenticated (boolean)
```

#### 2. API Module
```
lib/api.ts
├── apiCall() - Base API function
├── productAPI
│   ├── getAll()
│   ├── getById()
│   ├── create()
│   ├── update()
│   └── delete()
├── auctionAPI
│   ├── getAll()
│   ├── getById()
│   ├── create()
│   └── updateStatus()
├── bidAPI
│   ├── place()
│   ├── getByAuction()
│   └── getByUser()
├── eventAPI
│   ├── getAll()
│   ├── getById()
│   ├── create()
│   ├── addProduct()
│   └── updateStatus()
├── categoryAPI
│   ├── getAll()
│   ├── getById()
│   ├── create()
│   ├── update()
│   └── delete()
├── userAPI
├── analyticsAPI
└── orderAPI
```

#### 3. Component Module
```
components/
├── auth/
│   └── auth-page.tsx (Login/Register UI)
├── header.tsx (Navigation)
├── products/
│   └── product-grid.tsx (Product Display)
└── ui/ (shadcn/ui Components)
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── badge.tsx
    ├── tabs.tsx
    ├── dialog.tsx
    └── ... (50+ components)
```

#### 4. Page Module
```
app/(protected)/
├── buyer/
│   └── dashboard/ (Buyer Dashboard)
├── seller/
│   ├── dashboard/ (Seller Dashboard)
│   ├── products/
│   │   └── create/ (Product Creation)
│   ├── events/ (Event Management)
│   └── auctions/ (Auction Details)
├── admin/
│   └── dashboard/ (Admin Dashboard)
├── auction/
│   └── [id]/ (Auction Details & Bidding)
└── events/
    ├── (Event Discovery)
    └── [id]/ (Live Event Room)
```

---

## 🔌 Integration Points

### Frontend ↔ Backend Integration

```
Frontend API Calls
    ↓
lib/api.ts (Middleware)
    ├── Add Authorization Header
    ├── Add Content-Type Header
    ├── Handle Error Responses
    └── Parse JSON
    ↓
Backend API Endpoints
    ↓
Response (JSON)
    ↓
Frontend Processing
    ├── Update State
    ├── Update UI
    └── Handle Errors
```

### Real-Time Update Flow

```
Component Mount
    ↓
Start Polling Interval (3 seconds)
    ↓
Call API Endpoint
    ├── GET /bids/auction/:id
    ├── GET /events/:id/live-status
    └── GET /products/:id
    ↓
Process Response
    ├── Compare with Previous State
    ├── Detect Changes
    └── Update Component State
    ↓
React Re-render
    ↓
Display Updated UI
    ↓
Component Unmount
    ↓
Clear Polling Interval
```

---

## 🎯 State Management Architecture

### Authentication State (Global)
```
AuthContext
├── user: User | null
├── isAuthenticated: boolean
├── loading: boolean
├── error: string | null
└── functions:
    ├── login()
    ├── register()
    └── logout()
```

### Component State (Local)

#### Buyer Dashboard
```
State:
├── products: Product[]
├── auctions: Auction[]
├── categories: Category[]
├── watchlist: string[] (localStorage)
├── searchTerm: string
├── selectedCategory: string
└── loading: boolean
```

#### Auction Details Page
```
State:
├── product: Product | null
├── auction: Auction | null
├── bids: Bid[]
├── bidAmount: string
├── timeRemaining: string
├── loading: boolean
├── placing: boolean
└── error: string | null
```

#### Live Event Page
```
State:
├── event: Event | null
├── eventProducts: EventProduct[]
├── currentProductIndex: number
├── currentBids: Bid[]
├── bidAmount: string
├── loading: boolean
└── placing: boolean
```

---

## 🔐 Security Architecture

### Authentication Layer
```
User Credentials
    ↓
Register/Login Request
    ↓
Backend Validation & Password Hashing
    ↓
Token Generation
    ↓
Token Storage (localStorage)
    ↓
API Requests
    ↓
Authorization: Bearer {token} Header
    ↓
Backend Verification
    ↓
Authorized/Denied Response
```

### Access Control
```
Protected Routes (app/(protected)/)
    ↓
Auth Guard Check
    ├── If authenticated: Allow
    └── If not authenticated: Redirect to /
    ↓
Role-Based Redirect
    ├── Buyer → /buyer/dashboard
    ├── Seller → /seller/dashboard
    └── Admin → /admin/dashboard
```

### Data Protection
```
API Requests
    ├── CORS Protection (Backend)
    ├── Bearer Token Validation
    ├── Rate Limiting (Recommended)
    └── Input Sanitization
```

---

## 📊 Database Schema Mapping

### Users Table
```
users
├── id: string (Primary Key)
├── name: string
├── email: string (Unique)
├── password: string (Hashed)
├── userType: BUYER | SELLER | ADMIN
├── avatar?: string
└── createdAt: timestamp
```

### Products Table
```
products
├── id: string (Primary Key)
├── title: string
├── description: string
├── image?: string
├── startingPrice: number
├── categoryId: string (Foreign Key)
├── status: ACTIVE | INACTIVE
├── sellerId: string (Foreign Key)
└── createdAt: timestamp
```

### Auctions Table
```
auctions
├── id: string (Primary Key)
├── productId: string (Foreign Key)
├── startTime: timestamp
├── endTime: timestamp
├── status: ACTIVE | UPCOMING | ENDED
└── createdAt: timestamp
```

### Bids Table
```
bids
├── id: string (Primary Key)
├── amount: number
├── userId: string (Foreign Key)
├── auctionId: string (Foreign Key)
└── createdAt: timestamp
```

### Events Table
```
events
├── id: string (Primary Key)
├── title: string
├── description?: string
├── date: date
├── startTime: string
├── status: ACTIVE | UPCOMING | ENDED
└── createdAt: timestamp
```

---

## 🚀 Deployment Architecture

### Development Environment
```
Local Machine
    ↓
npm run dev
    ↓
Next.js Dev Server (Port 3000)
    ↓
Backend API (Port 5000)
    ↓
Browser Testing
```

### Production Environment
```
Source Code (GitHub)
    ↓
Vercel Deployment
    ↓
Build Process (npm run build)
    ↓
Production Server
    ↓
CDN Distribution
    ↓
Global User Access
```

### Environment Configuration
```
Development
├── API: https://auction-platform-backend-uvjo.onrender.com
├── Frontend: http://localhost:3000
└── Auth: localStorage

Production
├── API: https://api.auctionedhub.com
├── Frontend: https://auctionedhub.com
└── Auth: Secure Cookies (Recommended)
```

---

## 🔄 Real-Time Architecture

### Polling-Based Real-Time (Current)
```
┌─────────────────────────────────────┐
│   Component Mount                   │
└────────────────┬────────────────────┘
                 │
        ┌────────▼─────────┐
        │ Start Interval   │
        │ 3 seconds        │
        └────────┬─────────┘
                 │
        ┌────────▼──────────────┐
        │ Fetch Latest Data     │
        │ GET /bids/auction/:id │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ Update Component      │
        │ State                 │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ Re-render UI          │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ User Sees Updates     │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ Wait 3 Seconds        │
        └────────┬──────────────┘
                 │
            ┌────┴───┐
            │ Repeat? │
            └─────────┘
```

### WebSocket-Based Real-Time (Future)
```
┌──────────────────────────────────┐
│   WebSocket Connection Established│
└────────────────┬─────────────────┘
                 │
        ┌────────▼────────────────┐
        │ Server: New Bid         │
        │ Sent to Connected Users │
        └────────┬────────────────┘
                 │
        ┌────────▼────────────────┐
        │ Client: Receive Message │
        │ < 100ms latency        │
        └────────┬────────────────┘
                 │
        ┌────────▼────────────────┐
        │ Update Component State  │
        │ & Re-render Instantly   │
        └────────┬────────────────┘
                 │
        ┌────────▼────────────────┐
        │ User Sees Real-Time     │
        │ Updates (< 100ms)       │
        └────────────────────────┘
```

---

## 📈 Scalability Architecture

### Current (MVP)
```
Users → Frontend → API Server → Database
             ↑                      ↑
        Polling-based        Single Instance
        Real-time (3s)
```

### Recommended (Scale)
```
Users → CDN → Frontend → Load Balancer → API Servers
                            ↓
                        Redis Cache
                            ↓
                        Database Cluster
                            ↓
                        WebSocket Server
```

---

## 🔍 Monitoring & Logging Architecture

### Frontend Monitoring
```
Browser Console Logs
    ↓
Error Boundaries
    ↓
API Error Handling
    ↓
User-Facing Errors
```

### Backend Monitoring (Recommended)
```
API Server Logs
    ├── Request/Response Times
    ├── Error Rates
    └── Database Queries
    ↓
Performance Metrics
    ├── Throughput
    ├── Latency
    └── Error Rate
    ↓
Alerts & Notifications
```

---

## 🎓 Technology Stack Details

### Frontend Stack
```
Framework: Next.js 16
  ├── Features: App Router, Server Actions
  ├── Build: Turbopack (fast bundling)
  └── Deploy: Vercel Ready

UI Layer: React 19
  ├── Hooks: useState, useEffect, useContext
  ├── Features: Server Components (optional)
  └── State: Context API

Styling: Tailwind CSS
  ├── Utility: class-based styling
  ├── Responsive: mobile-first
  └── Dark: built-in dark mode

Components: shadcn/ui + Radix UI
  ├── Accessible: WCAG compliant
  ├── Headless: unstyled + styled variants
  └── 50+ components available

Utilities:
  ├── TypeScript: Full type safety
  ├── Date-fns: Date manipulation
  ├── Lucide React: Icon library
  └── Zod: Data validation (if used)
```

---

## 🚦 Request/Response Cycle

### Typical API Request
```
1. User Action (Click Bid Button)
   ↓
2. Form Validation
   ↓
3. API Call (POST /bids)
   {
     "amount": 500,
     "auctionId": "auction-123"
   }
   ↓
4. Request Headers
   {
     "Authorization": "Bearer token123",
     "Content-Type": "application/json"
   }
   ↓
5. Server Processing
   ├── Auth Validation
   ├── Business Logic
   ├── Database Update
   └── Response Generation
   ↓
6. Response (JSON)
   {
     "success": true,
     "bidId": "bid-456",
     "timestamp": "2025-02-05T10:30:00Z"
   }
   ↓
7. Frontend Processing
   ├── Parse JSON
   ├── Update State
   ├── Show Success Message
   └── Trigger Bid History Refresh
   ↓
8. UI Update
   ├── Re-render Component
   ├── Show New Bid
   └── Update Highest Bid
   ↓
9. User Feedback
   ├── Success Toast
   ├── Updated Bid History
   └── New Highest Bid Display
```

---

## 🔗 Cross-Module Communication

### Module Dependencies
```
Pages
    ├── Depends on: Components, Hooks, API
    └── Provides: User Interfaces

Components
    ├── Depends on: UI, Auth, Utils
    └── Provides: Reusable UI Parts

Context (Auth)
    ├── Depends on: API
    └── Provides: Auth State & Functions

API Module
    ├── Depends on: Fetch, localStorage
    └── Provides: Backend Communication
```

---

**Architecture Version**: 1.0
**Last Updated**: 2025-02-05
**Status**: Production Ready
**Scalability**: Medium (with recommendations)
