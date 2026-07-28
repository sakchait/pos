# Enterprise Point-of-Sale (POS) System with AI Smart Upsell

A modern, hybrid enterprise Point-of-Sale (POS) system featuring an offline-first React frontend with IndexedDB, an Express proxy middleware, a C# .NET 10.0 Clean Architecture backend, and an intelligent upselling recommendation system powered by the Gemini AI model.

---

## 🏗️ Architecture Overview

The application is split into two major component layers:

```
                  ┌──────────────────────────────────────────────┐
                  │                 Web Browser                  │
                  │  ┌───────────────┐        ┌───────────────┐  │
                  │  │   React App   │───────>│   Dexie.js    │  │
                  │  │ (UI & Layout) │        │ (Local DB)    │  │
                  │  └───────────────┘        └───────────────┘  │
                  └─────────┬────────────────────────────────────┘
                            │ (HTTP / API Calls)
                            ▼
                  ┌──────────────────────────────────────────────┐
                  │            Express Proxy Server              │
                  │  ┌───────────────┐        ┌───────────────┐  │
                  │  │ Mock Local    │        │  Gemini AI    │  │
                  │  │ Database APIs │        │  Integration  │  │
                  │  └───────────────┘        └───────────────┘  │
                  └─────────┬────────────────────────────────────┘
                            │ (Proxy External API Calls)
                            ▼
                  ┌──────────────────────────────────────────────┐
                  │            C# .NET 10.0 Backend              │
                  │        (Clean Architecture / Web API)        │
                  │  ┌────────────────────────────────────────┐  │
                  │  │ Pos.Api (Presentation Endpoints)       │  │
                  │  └──────────────────┬─────────────────────┘  │
                  │                     ▼                        │
                  │  ┌────────────────────────────────────────┐  │
                  │  │ Pos.Application (CQRS / Business Logic)│  │
                  │  └──────────────────┬─────────────────────┘  │
                  │                     ▼                        │
                  │  ┌────────────────────────────────────────┐  │
                  │  │ Pos.Infrastructure (EF Core / Services)│  │
                  │  └──────────────────┬─────────────────────┘  │
                  │                     ▼                        │
                  │  ┌────────────────────────────────────────┐  │
                  │  │ Pos.Domain (Entities & Core Abstraction│  │
                  │  └────────────────────────────────────────┘  │
                  └──────────────────────────────────────────────┘
```

1. **Front-End (`/front-end`)**:
   - **User Interface**: React 19, Vite, TypeScript, and Tailwind CSS.
   - **Local Storage / Offline Mode**: Dexie.js (wrapper for IndexedDB) providing full offline cashier capability.
   - **Express Server**: Acts as a developer server, a mock database server for offline capability, and a proxy to relay requests to the C# backend and Google's Gemini API.
   - **AI Integrations**: Uses `@google/genai` to connect to `gemini-3.6-flash` for cashier upselling recommendations.
   - **Animations**: Fluid transitions using Framer Motion (via `motion` package).

2. **Back-End (`/back-end`)**:
   - A C# .NET 10.0 Web API structured using **Clean Architecture** patterns:
     - **`Pos.Domain`**: Core entities, composite keys, database schemas, and default seed data.
     - **`Pos.Application`**: Business rules, CQRS commands, queries, and repositories.
     - **`Pos.Infrastructure`**: Implementation of database contexts (EF Core + SQL Server), anti-fraud analyzers, costing services, reporting algorithms, and synchronizations.
     - **`Pos.Api`**: API controllers, Swagger documentation, and key-based security middleware (`x-functions-key`).

---

## ✨ Key Features

- **🛒 Cashier POS Terminal**: Real-time cart management, pricing calculations, itemized lists, coupon application, and multi-method payments (Cash/Card/QR).
- **💡 AI-Powered Smart Upsell**: Dynamically suggests high-margin items or pairings and drafts a persuasive 1-sentence sales script for the cashier using Gemini AI based on customer history, current cart items, and loyalty points.
- **🎟️ Promotion & Coupon Engine**: Highly configurable rules including validity periods, usage counters, minimum order subtotal constraints, product exclusions, and maximum discount caps.
- **👥 Member Loyalty Program**: Phone/No customer lookup, member levels, and dynamic loyalty points accrual.
- **🔑 Role-Based Access Control (RBAC)**: Manage granular route and button permissions for standard roles (Admin, Cashier, Manager, Accountant, Vendor, etc.) dynamically.
- **🕒 Shift & Cash Management**: Open/close shifts, record cash drawer drops, trace manual drawer logs, generate shift schedules, and process coworker shift swap requests.
- **📦 Inventory & Supply Chain**: Multi-warehouse inventory tracking, FIFO costing analyzer, purchase order creation/approvals, and stock batch management.
- **📊 Business Intelligence & Audits**: Detailed reports for attendance, leave summaries, double-shift audits, holiday pay, and full system change logs for audits.

---

## 🛠️ Detailed Architecture & Technical Implementation

### 1. Frontend Offline-First & Synced Store
- **Dexie.js Persistence**: Completed transactions are written to the local IndexedDB table (`db.orders`) before being queued for synchronization. This maintains chronological transaction counting even when browser state is cleared.
- **REST API Mapping Layer**:
  - Client mappers in `apiService.ts` automatically convert backend C# camelCase and PascalCase DTOs into standard camelCase frontend interfaces.
  - Automatically transforms stock intake structures (`qtyReceived` ➔ `initialQuantity`, `qtyRemaining` ➔ `remainingQuantity`) and creates default 1-year product expiries for C# model validation.

### 2. VAT-Inclusive Financial Rules
- Follows strict Thai revenue VAT regulations (7% standard rate).
- In VAT-inclusive mode, subtotal calculations and sync payloads are split dynamically to store value excluding VAT:
  $$\text{SubTotal} = \text{GrandTotal} - \text{VatAmount}$$
  $$\text{VatAmount} = \text{GrandTotal} - \frac{\text{GrandTotal}}{1.07}$$

### 3. Order Number & Duplicate Handling
- **Generation Timing**: Order numbers (`S[YY][MM][DD][StoreCode][TerminalId]-[Sequence]`) are computed prior to payment checkout, preventing HMAC anti-tamper signature validation errors.
- **Idempotency Check**: Unique transaction GUIDs are checked first on the server to prevent duplicates from double-submissions or retries.
- **Sequence Collision Handler**: If a new GUID transaction encounters a collision on the `OrderNo` sequence (e.g. if the local store count resets), the backend auto-resolves the duplicate by appending a sequence suffix (e.g. `-1`, `-2`) to let the transaction succeed without unique index constraint crashes.

### 4. Database Category Entity (EF Core)
- Products are linked via the SQL Server database Category entity (`Category.cs`) rather than hardcoded string types.
- Product controllers use Entity Framework's `.Include(p => p.Category)` to dynamically construct category structures.

### 5. Branch Restocking Page
- Enforces dynamic access control on the `/restocking` route for `BranchManager`, `StockClerk`, and `Admin`.
- The Branch Restocking view allows managers to request POs from suppliers and perform direct stock intake, incrementing local stock levels and generating new FIFO `StockBatch` lot entries.

---

## 📂 Project Directory Structure

```
pos/
├── back-end/
│   ├── Application/          # Application Core & Repo Abstractions
│   ├── Domain/               # Database schemas, Migrations, Entities
│   ├── Infrastructure/       # Services (FIFO, Reports, Sync, Anti-fraud)
│   ├── Presentation.Api/     # ASP.NET Core API Controllers & Program.cs
│   └── pos.slnx              # Modern XML Solution File
├── front-end/
│   ├── src/
│   │   ├── components/       # Component Library (pos, admin, shifts, vendor, reports)
│   │   ├── db/               # Dexie.js DB config and offline rules
│   │   ├── services/         # API abstraction (local vs backend toggle)
│   │   ├── types/            # TypeScript POS structures
│   │   └── App.tsx           # Main Application Container
│   ├── server.ts             # Express Server & Proxy API
│   ├── package.json          # Node dependencies and scripts
│   └── .env.example          # Sample environment configurations
├── LICENSE                   # MIT License
└── README.md                 # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or later)
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- SQL Server (if connecting to the live database backend)

---

### 1. Setting up the Back-End

1. **Navigate to the backend directory:**
   ```bash
   cd back-end
   ```

2. **Restore dependencies & build:**
   ```bash
   dotnet restore
   dotnet build
   ```

3. **Configure the Database Connection String:**
   Open `appsettings.json` and enter your SQL Server details under `ConnectionStrings.DefaultConnection`.
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=PosDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

4. **Run Entity Framework Migrations (Optional):**
   ```bash
   dotnet ef database update --project Domain/Pos.Domain.csproj --startup-project Presentation.Api/Pos.Api.csproj
   ```

5. **Start the API Server:**
   ```bash
   dotnet run --project Presentation.Api/Pos.Api.csproj
   ```
   The backend API documentation will be available via Swashbuckle Swagger at:
   - `https://localhost:62491/swagger` (or the port specified in your launching profile)

---

### 2. Setting up the Front-End

1. **Navigate to the frontend directory:**
   ```bash
   cd ../front-end
   ```

2. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Configure the following variables in `.env`:
   - `VITE_USE_SERVICES`: Set to `true` to connect to the C# Backend, or `false` to run offline using Dexie DB and local mock APIs.
   - `GEMINI_API_KEY`: Provide a valid Gemini API key for smart AI suggestions.
   - `BACKEND_URL`: URL of the running .NET API (default: `https://localhost:62491`).

3. **Install Dependencies:**
   ```bash
   npm install
   # or using Bun
   bun install
   ```

4. **Start the Express & Vite Development Server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🤖 Configuring Gemini AI for Smart Upsell

The smart upsell assistant leverages the Google Gemini model (`gemini-3.6-flash`) to generate intelligent product proposals and natural cashier prompts. 

1. Acquire an API key from [Google AI Studio](https://aistudio.google.com/).
2. In your `/front-end/.env` file, replace `"MY_GEMINI_API_KEY"` with your key:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
3. If no API key is specified, the application will transparently fall back to local rule-based recommendations so the cashier workflow is never disrupted.

---

## 🛡️ Default Access & PINs
- **Default Manager PIN:** `1234` or `9999` (Used for approving restricted operations like opening the cash drawer without purchase).
- **Default Database Admin:** 
  - **Username:** `admin`
  - **Password:** `Admin@1234`

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
