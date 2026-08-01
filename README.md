# Strategy Engine: Paydown vs. Invest Calculator

## Overview
Strategy Engine is a fluid, single-page React application designed to mathematically compare the long-term financial impacts of aggressive mortgage paydown strategies versus compounding market investments. It provides a comprehensive, period-by-period simulation of net worth trajectory, factoring in real estate appreciation, variable interest rates, flexible contribution schedules, multi-bucket tax treatment, refinance events, and a robust retirement withdrawal phase.

Additionally, it features an advanced **Monte Carlo Simulation** to stress-test portfolios against sequence-of-return risk, providing statistical probabilities of success rather than straight-line averages.

## Main Goals
1. **Apples-to-Apples Financial Comparison:** Provide a mathematically rigorous comparison between debt reduction and investment growth, accounting for standard compounding mismatches.
2. **True Net Worth Tracking:** Calculate and visualize holistic net worth by dynamically treating the mortgage as a decreasing liability against appreciating real estate and liquid assets.
3. **Refinance & Rate Adjustment Engine:** Model future Adjustable Rate Mortgage (ARM) shifts and explicit Mortgage Refinance events, calculating closing cost roll-ins, updated monthly obligations, and exact interest breakeven timelines.
4. **Multi-Bucket Tax Drag & Tax Shield Modeling:** Differentiate between Taxable Brokerage, Pre-Tax (401k/IRA), and Roth (Tax-Free) accounts during accumulation and decumulation. Account for dividend yield tax drag, pre-tax retirement withdrawal gross-ups, state income tax, property tax, and itemized Mortgage Interest Deduction (MID) / SALT tax shields.
5. **Real (Inflation-Adjusted) vs. Nominal Analysis:** Toggle between nominal future dollars and discounted real dollars (today's purchasing power).
6. **Statistical Stress Testing:** Execute thousands of randomized market simulations using lognormal distributions to measure portfolio survival probabilities across 55-year horizons.

## Key Features

### Mortgage & Amortization Engine
* **Flexible Extra Payments:** Schedule one-off or recurring extra principal payments with custom start dates and frequencies (Monthly, Quarterly, Semi-Annual, Annual).
* **Bi-Weekly Accelerated Payments:** Model 26-period bi-weekly payment schedules.
* **Rate Adjustments & Refinance Triggers:** Schedule future interest rate changes (ARMs) or full Refinance events. Refinance modeling calculates updated base payments, monthly payment delta, monthly interest savings, and exact breakeven month/year timelines.
* **Freed Cash-Flow Redirection:** Automatically redirect freed mortgage payments into investment accumulators once debt is fully paid off.

### Multi-Bucket Wealth & Tax Engine
* **Multi-Bucket Account Classification:** Assign ongoing contributions to **Taxable Brokerage**, **Pre-Tax (401k/IRA)**, or **Tax-Free (Roth IRA)** account buckets.
* **Accumulation Tax Drag:** Account for annual dividend yield tax drag on taxable brokerage holdings.
* **Retirement Decumulation Waterfall:** Pull withdrawals sequentially from Taxable -> Pre-Tax -> Roth. Pre-tax withdrawals automatically gross up based on effective retirement tax rates ($W_{\text{gross}} = \frac{W_{\text{net}}}{1 - r}$).
* **Itemized MID & SALT Tax Shield Engine:** Model Mortgage Interest Deduction (MID) with pro-rata scaling for loans exceeding the $750,000 IRS principal cap. Deduct itemized State and Local Taxes (SALT) with preset or custom caps ($10k TCJA, $20k proposal, single, unlimited, or custom dollar cap), annual property tax, state income tax, and custom itemized deductions (charitable/medical).
* **Regional Jurisdiction Presets:** Built-in regional presets for New York (NY State + NYC), California (CA State), and Texas / Florida (No State Tax).

### Display & Inflation Modes
* **Nominal vs. Real Dollars:** Toggle between future nominal values and discounted real present values (discounted at user-defined inflation rates).

### Monte Carlo Stress Testing
* **Stochastic Market Path Simulation:** Run 500 to 5,000 randomized market paths using Box-Muller Gaussian normal distributions (assuming configurable volatility, e.g. 15%) across your custom cash-flow timeline.
* **Percentile Return Cones:** View 10th (Bear), 25th, 50th (Median), 75th, and 90th (Bull) percentile trajectories alongside precise statistical success rates.
* **Fixed Withdrawal Lock-in:** Prevents withdrawal distortion during retirement by locking percentage withdrawals into fixed dollar amounts upon retirement start.

### Sharing, Backup & Session Persistence
* **URL Scenario Encoding:** Encode full strategy configurations into lightweight, shareable Base64 URLs.
* **JSON Backup & Import/Export:** Download complete scenario files (`.json`) or import saved strategies.
* **Active Session Persistence:** Auto-saves current configurations to browser `localStorage` to preserve progress upon refresh.

---

## Architecture

The application is built as a client-side Single Page Application (SPA) emphasizing performance and strict separation of presentation from computational logic.

### Tech Stack
* **Framework:** React 18
* **Build Tool:** Vite (for rapid HMR and optimized production bundling)
* **Data Visualization:** Recharts (React components built on D3 for lightweight, responsive SVG charts)
* **Styling:** Bootstrap 5 (overridden with custom minimalist Scandinavian design system)
* **Testing:** Vitest (unit & integration testing)

### State Management & Performance
* `StrategyContext`: Centralized React Context providing global financial parameters, session auto-saving, and simulation dispatching.
* `useMemo`: Acts as a computational barrier between presentation and simulation engines. The month-by-month deterministic loop (up to 660 months) only re-evaluates when relevant inputs change.
* `localStorage`: Persists active session state under `ACTIVE_SESSION_KEY`.

---

## Installation & Setup

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run unit and integration tests
npm test

# Build production bundle
npm run build
```

---

## Legal & Financial Disclaimer
This application is for educational and informational purposes only. It does not constitute financial, investment, legal, or tax advice. Projections are inherently hypothetical, based entirely on user inputs and assumed constant rates of return, which are not guaranteed. Actual market conditions, variable interest rates, inflation, and tax implications will vary over time and may significantly alter these figures. Consult with a qualified, licensed financial advisor before making financial decisions.