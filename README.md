# 🪙 PaisaPilot

> **Your Money. Your Decisions. Your AI Financial Companion.**  
> Built for **Arthaton 2026 — AI Finance Hackathon**  
> Developed by **Shreya Singh** ([@ShreyaSingh2606](https://github.com/ShreyaSingh2606))  
> Category: **AI / FinTech / Personal Finance Management**

---

## 📌 Problem Statement

Indian college students and young professionals face a unique financial dilemma in the digital age:
1. **Unconscious UPI Micro-Spending**: High-frequency micro-transactions via UPI (Zomato, Swiggy, campus canteen, rapid transit, Blinkit) bleed stipends and pocket allowances without immediate awareness.
2. **Month-End Budget Crunches**: Without proactive category tracking, students exhaust their funds 10–12 days before the month ends.
3. **Generic, Disconnected AI Tools**: Existing AI chatbots (like generic ChatGPT) hallucinate financial advice, give US-centric tips (e.g., 401k/Roth IRA), and have no connection to a student's actual bank or expense ledger.

---

## 💡 Proposed Solution: PaisaPilot

**PaisaPilot** is a full-stack, AI-powered financial management web application tailored for the Indian collegiate ecosystem. It bridges the gap between daily transactional reality and intelligent financial decision-making:
- **Real-Time PostgreSQL Ledger**: All transactions, income streams, and budgets persist with relational integrity via **Prisma ORM**.
- **Smart Expense Categorization**: Instant keyword-based merchant detection as you type (e.g. *Zomato* ➔ *Food & Dining*, *Uber* ➔ *Transportation*, *College fees* ➔ *Education*), with one-click user override.
- **Proactive Budget Radar**: Dynamic category-wise ceilings with color-coded utilization progress (warning at 80%, critical alert over 100%).
- **Context-Grounded Financial Copilot**: An AI assistant that computes exact metrics directly from the database and answers questions such as *"Where am I spending most of my money?"*, *"Am I exceeding my budget?"*, and *"How can I save ₹2,000 next month?"*.
- **Deterministic Offline Fallback**: Zero-failure architecture; if the external LLM API is unavailable or unconfigured, an internal JavaScript heuristic engine calculates 100% accurate, hallucination-free advice.

---

## 🛠️ Technology Stack

Strictly adheres to college CSE curriculum requirements: **100% pure JavaScript** without unnecessary complexity (no TypeScript, Next.js, or microservices).

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js (v18), JSX, React Hooks (`useState`, `useEffect`, `useRef`), Fetch API, CSS3 Modern Design System, Recharts, Lucide Icons, Vite |
| **Backend** | Node.js, Express.js (v5), RESTful Routing, Middleware, Controllers, Services |
| **Database** | PostgreSQL, Prisma ORM (v5.22), Relational Schema with Foreign Keys & Cascades |
| **AI Layer** | Google Gemini 1.5 Flash API + Grounded Prompt Engineering + Internal JavaScript Deterministic Financial Reasoning Engine |
| **Styling** | Custom FinTech UI (Deep Navy `#0B132B`, Emerald Green `#10B981`, Slate Neutrals) |

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React.js Client                        │
│   (Dashboard, Transactions, Budget Planner, AI Assistant)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Fetch API (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express.js Server                       │
│  Controllers ──► Services (Analytics, Categorization, AI)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│      Prisma ORM Client      │  │     PaisaPilot AI Engine   │
└──────────────┬──────────────┘  │ • Ground Truth Context     │
               │ SQL Queries     │ • Google Gemini LLM        │
               ▼                 │ • Deterministic Fallback   │
┌─────────────────────────────┐  └────────────────────────────┘
│     PostgreSQL Database     │
│ (Users, Categories, Txs,    │
│  Budgets)                   │
└─────────────────────────────┘
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **PostgreSQL** (v14+) running locally or hosted (e.g. Supabase / Neon / Render)

### 1. Clone the Repository
```bash
git clone https://github.com/ShreyaSingh2606/PaisaPilot.git
cd PaisaPilot
```

### 2. Configure Environment Variables
Create a `.env` file inside the `server/` directory:
```bash
cp server/.env.example server/.env
```

Ensure your `server/.env` contains your PostgreSQL connection string:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/paisapilot?schema=public"

# Optional: Add Google Gemini API Key if you want live cloud LLM integration.
# PaisaPilot includes a 100% working deterministic AI engine that runs offline without any key!
GEMINI_API_KEY=""
```

### 3. Setup Database & Seed Realistic Demo Data
```bash
# Push schema to PostgreSQL
cd server
npx prisma db push

# Seed realistic Indian college student transactions & budgets
npm run seed
cd ..
```

### 4. Run the Application
You can run development mode or single-command production mode:

#### Option A: Running Development Servers
```bash
# Terminal 1: Backend API (port 5001)
npm run server

# Terminal 2: React Frontend (port 3000)
npm run client
```

#### Option B: Build & Run Integrated Server
```bash
# Build React client and start Express server (serves both API & UI on port 5001)
npm run build
npm start
```
Open **[http://localhost:5001](http://localhost:5001)** in your browser!

---

## 📊 Application Features

### A. Financial Dashboard
- **Total Income, Total Expenses, Remaining Balance, and Savings Rate %** computed live from PostgreSQL.
- **Spending vs. Income Trajectory**: Interactive multi-month area chart.
- **Category Breakdown**: Interactive donut chart with color-coded spending proportions.
- **Recent Transactions Ledger**: Displays last 6 transactions with status badges and payment methods.
- **Budget Utilization Radar**: Real-time progress bar alerting when approaching limits.

### B. Expense & Income Management (CRUD)
- Full Create, Read, Update, Delete for all financial records.
- Live search by title and description.
- Multi-criteria filtering by category, type (Income/Expense), and custom date ranges.
- Formatted in Indian Rupee (`₹ INR`).

### C. Smart Expense Categorization
- Built-in heuristic engine checks merchant names and keywords in real time:
  - *Zomato, Swiggy, Canteen, Starbucks* ➔ **Food & Dining**
  - *Uber, Ola, Rapido, Metro, Petrol* ➔ **Transportation**
  - *Amazon, Blinkit, Zepto, Myntra* ➔ **Shopping & Essentials**
  - *Netflix, Spotify, PVR Cinema* ➔ **Entertainment & Leisure**
  - *Udemy, College fees, Books* ➔ **Education & Career**
  - *Airtel, Electricity, Hostel rent* ➔ **Housing & Utilities**
- Surfaces a live recommendation badge with a 1-click **Apply** button while typing.

### D. Budget Planner
- Monthly category limits with utilization percentages.
- **Three-tier visual status**:
  - 🟢 **On Track** (`< 80%` utilization)
  - 🟡 **Warning** (`80% - 100%` utilization)
  - 🔴 **Overspent** (`> 100%` utilization with exact overspent amount)
- Calculated directly against verified transaction records.

### E. Grounded AI Financial Assistant
- Answers real user questions:
  - *"Where am I spending most of my money?"*
  - *"How much did I spend on food this month?"*
  - *"Am I exceeding my monthly budget?"*
  - *"How can I save ₹2,000 next month?"*
  - *"Which category should I reduce spending in?"*
  - *"Compare my spending with the previous month."*
- **Strict Anti-Hallucination**: Financial context is assembled into a structured JSON payload by the backend and passed into the LLM prompt. The AI is instructed to only use verified numbers.
- **Deterministic Rule Engine**: Provides instant, explainable, and reproducible calculations even when offline.

### F. Financial Insights
- Identifies highest and lowest expense categories.
- Tracks month-over-month percentage deltas.
- Actionable ₹2,000 monthly savings playbook based on discretionary category spends.
- College 50/30/20 guideline breakdown.

---

## 📡 API Reference Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and active AI engine mode |
| `GET` | `/api/analytics/dashboard?month=&year=` | Live KPI summary, category breakdown, trends |
| `GET` | `/api/analytics/insights?month=&year=` | Dynamic heuristics and spending warnings |
| `GET` | `/api/transactions` | Query transactions with filters (`search`, `type`, `categoryId`, `startDate`, `endDate`) |
| `GET` | `/api/transactions/predict-category?title=&type=` | Smart keyword-based categorization |
| `POST` | `/api/transactions` | Create new income or expense transaction |
| `PUT` | `/api/transactions/:id` | Update transaction record |
| `DELETE`| `/api/transactions/:id` | Remove transaction record |
| `GET` | `/api/budgets?month=&year=` | Monthly category budgets and utilization % |
| `POST` | `/api/budgets` | Set or adjust category budget limit |
| `DELETE`| `/api/budgets/:id` | Remove category budget limit |
| `GET` | `/api/categories` | Retrieve available expense & income categories |
| `POST` | `/api/ai/ask` | Submit question to PaisaPilot AI Assistant |
| `GET` | `/api/ai/context` | View raw ground-truth financial context payload |

---

## 🧪 Testing and Verification

PaisaPilot includes a comprehensive verification test suite (`npm test`):
```bash
cd server
node test-endpoints.js
```
Verified Test Results:
- ✅ Database connection & default user verified.
- ✅ Smart Expense Categorization: 100% accuracy on test cases (Zomato, Uber, Amazon, Netflix, College fees).
- ✅ Dashboard Analytics: Validates mathematical consistency of income, expenses, balance, and savings rate.
- ✅ Budget Utilization: Detects overspending and warning thresholds accurately.
- ✅ Dynamic Insights: Successfully flags top categories, spending spikes, and savings strategies.
- ✅ AI Assistant: Accurately answers all 6 judge queries with grounded data badges.
- ✅ Transaction CRUD: Tests complete lifecycle (Create, Read, Update, Delete).

---

## ⚠️ Known Limitations & Future Roadmap

1. **SMS/UPI Auto-Sync**: Currently, transactions are entered via manual or smart-categorized input. Direct SMS scraping (via Android companion app) is planned for v2.
2. **Multi-User Authentication**: The current architecture is optimized for a single-user hackathon demo. Production deployment will add JWT-based authentication and multi-tenancy.
3. **Export Features**: Adding PDF/Excel export for college budget reports and tax receipts.

---

## 👩‍💻 Author & Acknowledgements

**Shreya Singh**  
- GitHub: [@ShreyaSingh2606](https://github.com/ShreyaSingh2606)  
- College: B.Tech CSE (AI & ML), 2nd Year  
- Event: Arthaton 2026 — AI Finance Hackathon
