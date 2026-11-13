# 🎓 PaisaPilot — Complete Hackathon Defense & Explanation Guide

> **Created specifically for Shreya Singh**  
> B.Tech CSE (AI & ML), 2nd Year | Solo Full-Stack & AI Developer  
> Hackathon: **Arthaton 2026 — AI Finance Hackathon**

---

## Table of Contents
1. [Elevator Pitch (30-Second Summary)](#1-elevator-pitch)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Application Workflow](#4-application-workflow)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [REST APIs](#7-rest-apis)
8. [Database Schema & Relationships](#8-database-schema--relationships)
9. [SQL & Prisma ORM Usage](#9-sql--prisma-orm-usage)
10. [CRUD Operations in Action](#10-crud-operations-in-action)
11. [Financial Mathematics & Formulas](#11-financial-mathematics--formulas)
12. [AI Integration & Prompt Engineering](#12-ai-integration--prompt-engineering)
13. [How AI Accesses Financial Context](#13-how-ai-accesses-financial-context)
14. [How Hallucinations Are Eliminated](#14-how-hallucinations-are-eliminated)
15. [Deterministic Fallback Engine](#15-deterministic-fallback-engine)
16. [Likely Judge Questions & Winning Answers](#16-likely-judge-questions--winning-answers)
17. [Limitations & Future Roadmap](#17-limitations--future-roadmap)

---

## 1. Elevator Pitch
> *"Good morning, esteemed judges! I am Shreya Singh, a 2nd year Computer Science (AI & ML) student. I built **PaisaPilot: Your Money, Your Decisions, Your AI Financial Companion**.*  
>  
> *Indian college students and young professionals face a unique challenge: frequent micro-spends through UPI like Zomato, Swiggy, and metro recharges quietly drain their stipends before month-end. Generic AI chatbots cannot help because they hallucinate and don't know your bank balance.*  
>  
> *PaisaPilot solves this by combining a robust PostgreSQL relational database and Express REST API with a context-grounded AI assistant. The AI never guesses numbers—it queries actual transaction records and generates transparent, educational advice. And if internet or cloud APIs fail, my deterministic JavaScript fallback ensures the app never crashes. Let me give you a live demonstration."*

---

## 2. Problem Statement
- **The UPI Illusion**: Instant mobile payments make spending frictionless, masking how fast pocket allowances and internship stipends deplete.
- **Budget Blindness**: Most college students do not know what percentage of their money goes toward discretionary desires (eating out, shopping) versus fixed necessities (hostel rent, study books, bus passes).
- **The AI Hallucination Danger**: If a user asks a generic LLM *"How much did I spend on food this month?"*, the AI makes up fictional numbers because it lacks grounded database integration.

---

## 3. Proposed Solution
PaisaPilot gives students:
1. **Automated categorization**: Typing *"Zomato"* or *"Uber"* automatically tags the right category using an intelligent heuristic catalog.
2. **Proactive Budgeting**: Live progress indicators warn when spending exceeds 80% and flag red alerts when overspent.
3. **Context-Grounded Financial Intelligence**: An AI assistant that knows the user's real income, expense breakdown, and budget limits.
4. **Actionable Advice**: It doesn't just say *"spend less"*; it generates a concrete playbook, such as how to save an exact ₹2,000 next month.

---

## 4. Application Workflow
```
[User Action]
     │
     ├── 1. Records Transaction (e.g., "Zomato dinner ₹420")
     │        │
     │        └──► Frontend auto-detects "Food & Dining"
     │        └──► Sends POST request to /api/transactions
     │        └──► Express Controller validates input
     │        └──► Prisma ORM inserts row into PostgreSQL
     │
     ├── 2. Views Dashboard
     │        │
     │        └──► Frontend calls GET /api/analytics/dashboard
     │        └──► SQL aggregates: SUM(income), SUM(expense), balance
     │        └──► Computes savings rate: ((Income - Expense) / Income) * 100
     │        └──► Recharts renders Trends Area Chart & Category Donut
     │
     └── 3. Chats with AI Assistant
              │
              └──► User asks: "Am I exceeding my monthly budget?"
              └──► aiService queries current month transactions & budgets
              └──► Constructs Ground Truth Context
              └──► Generates grounded response (Gemini API or Deterministic Engine)
              └──► Returns response with verified data badges
```

---

## 5. Frontend Architecture
- **Framework**: React 18 (using Vite for ultra-fast bundling).
- **Language**: Pure JavaScript and JSX (No TypeScript, so every hook and component is straightforward to explain).
- **State Management**: React Hooks (`useState` for local form & filter states, `useEffect` for data fetching lifecycles, `useRef` for auto-scrolling chat).
- **Data Fetching**: Pure browser `Fetch API` encapsulated in a clean client module (`client/src/services/api.js`).
- **Data Visualization**: `Recharts` for reactive SVG Area and Pie charts.
- **Icons**: `Lucide React` for clean, professional FinTech icons.
- **Styling**: Pure CSS3 (`index.css`) with CSS custom properties (variables) featuring a Deep Navy (`#0B132B`) and Emerald Green (`#10B981`) color palette.

---

## 6. Backend Architecture
The backend follows the standard **Layered / MVC Service Architecture**:

```
server/
 ├── src/
 │    ├── config/       -> Prisma Client singleton (db.js)
 │    ├── routes/       -> Express routers defining HTTP endpoints
 │    ├── controllers/  -> Request validation & HTTP status responses
 │    ├── services/     -> Business logic & database operations
 │    │    ├── transactionService.js
 │    │    ├── budgetService.js
 │    │    ├── analyticsService.js
 │    │    ├── categorizationService.js
 │    │    └── aiService.js
 │    ├── middleware/   -> Centralized error handling
 │    └── server.js     -> Express initialization & static client hosting
 └── prisma/
      ├── schema.prisma -> Relational database schema
      └── seed.js       -> Realistic student synthetic demo data
```

---

## 7. REST APIs
All endpoints return standard JSON responses with `{ success: true, data: ... }` or `{ success: false, error: ... }`:

- `GET /api/health`: Health status & active AI engine.
- `GET /api/transactions`: Retrieves transactions with filters for `type`, `categoryId`, `search`, and date bounds.
- `POST /api/transactions`: Creates transaction with automatic categorization.
- `PUT /api/transactions/:id`: Updates an existing transaction.
- `DELETE /api/transactions/:id`: Deletes a transaction.
- `GET /api/transactions/predict-category?title=...`: Live keyword classifier.
- `GET /api/budgets`: Returns category limits, spent amounts, remaining balance, and utilization percentages.
- `POST /api/budgets`: Upserts a category budget ceiling.
- `GET /api/analytics/dashboard`: Computes summary KPIs and chart series.
- `POST /api/ai/ask`: Sends question to PaisaPilot AI assistant.

---

## 8. Database Schema & Relationships
PaisaPilot uses PostgreSQL configured with 4 core relational models in `prisma/schema.prisma`:

1. **User Model**:
   - `id` (UUID, Primary Key)
   - `name`, `email` (Unique), `monthlyIncome` (Float)
   - Relationships: One-to-Many with `Transaction` and `Budget`.

2. **Category Model**:
   - `id` (UUID, Primary Key)
   - `name` (Unique), `type` (EXPENSE or INCOME), `icon`, `color`, `keywords`
   - Relationships: One-to-Many with `Transaction` and `Budget`.

3. **Transaction Model**:
   - `id` (UUID, Primary Key)
   - `userId` (Foreign Key referencing `User.id` with `onDelete: Cascade`)
   - `categoryId` (Foreign Key referencing `Category.id` with `onDelete: Restrict`)
   - `amount` (Float), `type` (EXPENSE | INCOME), `title`, `date`, `paymentMethod`
   - Indexes on `[userId, date]` and `[categoryId]` for high-speed query performance.

4. **Budget Model**:
   - `id` (UUID, Primary Key)
   - `userId` (Foreign Key referencing `User.id`)
   - `categoryId` (Foreign Key referencing `Category.id` with `onDelete: Cascade`)
   - `amount` (Float), `month` (Int 1-12), `year` (Int)
   - **Composite Unique Constraint**: `@@unique([userId, categoryId, month, year])` ensures a user cannot have duplicate budgets for the same category in the same month.

---

## 9. SQL & Prisma ORM Usage
In college, we study SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, `GROUP BY`).
Prisma ORM abstracts raw SQL into type-safe JavaScript methods while executing optimal SQL queries under the hood:

```javascript
// Example from transactionService.js: Fetching with dynamic filters
const transactions = await prisma.transaction.findMany({
  where: {
    userId,
    type: filters.type,
    date: { gte: new Date(startDate), lte: new Date(endDate) }
  },
  include: { category: true }, // Equivalent to an SQL INNER JOIN
  orderBy: { date: 'desc' }
});
```

---

## 10. CRUD Operations in Action
- **Create**: User submits modal ➔ `prisma.transaction.create({ data })`.
- **Read**: Dashboard or Ledger loads ➔ `prisma.transaction.findMany(...)`.
- **Update**: User edits amount or title ➔ `prisma.transaction.update({ where: { id }, data })`.
- **Delete**: User clicks trash icon ➔ `prisma.transaction.delete({ where: { id } })`.

---

## 11. Financial Mathematics & Formulas
All metrics displayed on screen are calculated in real time:

1. **Remaining Balance**:
   $$\text{Remaining Balance} = \sum \text{Income} - \sum \text{Expenses}$$

2. **Savings Percentage**:
   $$\text{Savings Rate (\%)} = \left(\frac{\text{Total Income} - \text{Total Expenses}}{\text{Total Income}}\right) \times 100$$

3. **Budget Utilization Percentage**:
   $$\text{Utilization (\%)} = \left(\frac{\text{Actual Category Spent}}{\text{Category Budget Limit}}\right) \times 100$$
   - Status rules:
     - If $\text{Utilization} > 100\% \implies \text{OVERSPENT}$ (Red alert)
     - If $\text{Utilization} \ge 80\% \implies \text{WARNING}$ (Amber alert)
     - Else $\implies \text{ON\_TRACK}$ (Emerald green)

4. **Month-over-Month Growth**:
   $$\text{Expense Delta (\%)} = \left(\frac{\text{Current Month Expenses} - \text{Previous Month Expenses}}{\text{Previous Month Expenses}}\right) \times 100$$

---

## 12. AI Integration & Prompt Engineering
When a user asks a question, `aiService.js` constructs a **Strictly Grounded Prompt**:

```text
You are PaisaPilot, a friendly, educational AI financial assistant for Indian college students.
You must STRICTLY adhere to the Ground Truth Financial Context provided below.
DO NOT hallucinate, invent, or assume any transactions or figures not provided in this context.
Provide friendly, actionable, educational advice formatted in clean Markdown.

GROUND TRUTH FINANCIAL CONTEXT FOR NOVEMBER 2026:
- Total Monthly Income: INR 37000
- Total Monthly Expenses: INR 25886
- Net Remaining Balance: INR 11114
- Savings Rate: 30%
- Total Budgeted: INR 25500
- Overspent Budgets: [{"category": "Housing & Utilities", "spent": 8089, "limit": 8000}, ...]
- Category Spending Breakdown: [...]
- Recent Transactions: [...]

USER QUESTION: "Am I exceeding my monthly budget?"
```

---

## 13. How AI Accesses Financial Context
The AI does not connect directly to the database or run raw SQL (which would be unsafe and vulnerable to prompt injection).
Instead:
1. `analyticsService.js` and `budgetService.js` execute verified database queries.
2. The JavaScript server aggregates the exact figures.
3. The server formats these verified numbers into a clean **Ground Truth Context** object.
4. The context is injected into the LLM system prompt as the sole source of truth.

---

## 14. How Hallucinations Are Eliminated
1. **Context Boundary**: The AI is forbidden by system instructions from generating financial figures not present in the Ground Truth Context.
2. **Deterministic Validation**: The backend parses and attaches the actual calculated `dataPoints` directly to the API response alongside the generated text.
3. **Transparent UI Badges**: The frontend displays verified data point chips (e.g., `Overspent Categories: 2 | Total Budget: ₹25,500`) directly underneath the AI message.

---

## 15. Deterministic Fallback Engine
What happens if the internet goes down or the Gemini API quota is exhausted during a judge demo?
**PaisaPilot never fails.**
`aiService.js` contains a complete rule-based deterministic engine:
- If `GEMINI_API_KEY` is absent or the API fails, it catches the error and executes `generateDeterministicResponse(query, context)`.
- It identifies user intent using natural language patterns (e.g., checking for *"most"*, *"food"*, *"budget"*, *"save 2000"*, *"compare"*).
- It extracts the exact values from the database context and constructs a structured, markdown-formatted response with actionable suggestions and grounded metric badges.

---

## 16. Likely Judge Questions & Winning Answers

### Q1: *"Why did you use Prisma ORM instead of writing raw SQL queries?"*
> **Answer**: *"Prisma ORM provides type-safety, automatic connection pooling, migration management, and prevents SQL injection vulnerabilities through parameterized queries. It maps directly to our relational schema in `schema.prisma` while still allowing us to inspect the underlying SQL execution."*

### Q2: *"How do you prevent the AI from giving dangerous financial advice?"*
> **Answer**: *"PaisaPilot is designed as an educational companion, not a financial advisor. Every AI message includes an explicit disclaimer. Furthermore, the AI is restricted by prompt boundaries to only analyze historical transactions and budget limits; it never makes stock market predictions or guarantees returns."*

### Q3: *"How does your Smart Categorization work? Is it a heavy machine learning model?"*
> **Answer**: *"No, we purposely did not use a heavy ML model that would add latency and cost. We engineered an efficient heuristic keyword classification engine in `categorizationService.js`. As the user types, it matches merchant tokens (like Zomato, Uber, Blinkit) against our category keyword dictionary in under 5 milliseconds. Users always retain full control to override the category with one click."*

### Q4: *"Can the AI access transactions from another user?"*
> **Answer**: *"No. Every database query in `transactionService.js` and `aiService.js` explicitly scopes queries with `where: { userId }`. Data isolation is enforced at the service level."*

### Q5: *"Why did you choose React with Vite and Express instead of Next.js?"*
> **Answer**: *"As a 2nd year CSE AI & ML student, separating the React client from the Express REST API represents the fundamental client-server architecture we study in college. It provides a clean separation of concerns: Express handles business logic and database transactions, while React handles component lifecycles and state. Next.js combines both layers, which obscures how REST APIs and HTTP requests work."*

---

## 17. Limitations & Future Roadmap
1. **Bank SMS Scraping**: Next step is building an Android companion service to parse transactional UPI SMS messages into PaisaPilot via webhooks.
2. **Multi-User Auth**: Implementing JWT (JSON Web Tokens) and bcrypt password hashing for multi-tenant college campus deployments.
3. **Split Expenses**: Adding a feature for hostel roommates to split Zomato orders and mess bills directly in PaisaPilot.
