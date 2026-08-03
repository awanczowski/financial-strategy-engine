# Strategy Engine: Paydown vs. Invest Calculator

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-v1.10.0-black.svg)](package.json)
[![AI-Co-Created](https://img.shields.io/badge/Codebase-AI--Co--Created-8A2BE2.svg)](AI_TRANSPARENCY.md)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen.svg)](.github/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19.0-blue)](package.json)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple)](package.json)
[![Test Suite](https://img.shields.io/badge/Tests-43_Passed-success)](src/components/__tests__/)

## Overview
Strategy Engine is a fluid, single-page React application designed to mathematically compare the long-term financial impacts of aggressive mortgage paydown strategies versus compounding market investments. It provides a comprehensive, period-by-period simulation of net worth trajectory, factoring in real estate appreciation, variable interest rates, flexible contribution schedules, multi-bucket tax treatment, refinance events, Social Security decumulation floors, and a robust retirement withdrawal phase.

Additionally, it features an advanced **Monte Carlo Simulation** to stress-test portfolios against sequence-of-return risk, providing statistical probabilities of success rather than straight-line averages.

## Main Goals
1. **Apples-to-Apples Financial Comparison:** Provide a mathematically rigorous comparison between debt reduction and investment growth, accounting for standard compounding mismatches.
2. **True Net Worth Tracking:** Calculate and visualize holistic net worth by dynamically treating the mortgage as a decreasing liability against appreciating real estate and liquid assets.
3. **Refinance & Rate Adjustment Engine:** Model future Adjustable Rate Mortgage (ARM) shifts and explicit Mortgage Refinance events, calculating closing cost roll-ins, updated monthly obligations, and exact interest breakeven timelines.
4. **Multi-Bucket Tax Drag & Tax Shield Modeling:** Differentiate between Taxable Brokerage, Pre-Tax (401k/IRA), and Roth (Tax-Free) accounts during accumulation and decumulation. Account for dividend yield tax drag, pre-tax retirement withdrawal gross-ups, state income tax, property tax, and itemized Mortgage Interest Deduction (MID) / SALT tax shields.
5. **Social Security & Pension Income Modeling:** Incorporate independent Self and Spouse Social Security income streams, claim start dates, and annual COLA adjustments to offset portfolio decumulation withdrawals dollar-for-dollar.
6. **Real (Inflation-Adjusted) vs. Nominal Analysis:** Toggle between nominal future dollars and discounted real dollars (today's purchasing power).
7. **Statistical Stress Testing:** Execute thousands of randomized market simulations using lognormal distributions to measure portfolio survival probabilities across 55-year horizons with Social Security cash flows included.

## Key Features

### Dark Mode & Neutral Monochrome Design System
* **Dark Mode Toggle:** Smooth theme switcher in sticky top Navbar with flat SVG sun/moon indicators.
* **Theme Persistence:** Stores user theme selection (`light` / `dark`) in `localStorage` and `StrategyContext`.
* **Adapting Charts & UI Elements:** Dynamic Recharts background, tooltips, axis, and gridline adaptations for seamless low-light visualization.

### Coast FIRE Target Engine & Milestone Tracking
* **Coast FIRE Nest Egg Calculation:** Compute exact target retirement nest egg based on target retirement age, annual expenses, safe withdrawal rate (SWR), and expected investment return during the coast phase.
* **Dashboard Milestone Cards:** Real-time visual progress indicators displaying current portfolio vs. target egg, target year, Coast FIRE status, and reach milestone year.
* **Interactive UI Controls:** Focused inputs inside Wealth & Investing parameter tab, with scenario Base64 URL sharing and JSON backup support.

### Segmented Parameter Controls & Decluttered UI
* **Tabbed Parameter Navigation:** Switch between focused input cards: Real Estate & Mortgage (default), Wealth & Investing, Retirement & Social Security, Tax & Jurisdiction, and All Controls (vertically stacked full-width layout).
* **Minimalist Aesthetics:** Icon-free minimalist typography paired with uniform black step badges (`Step 1` through `Step 4`).
* **Important Timeline Dates Summary Box:** Summary dashboard card displaying computed Simulation Start, stacked Refinance Dates, ARM Rate Shifts, period-by-period Calendar Payoff Date (`YYYY-MM-DD`), Retirement Start, Social Security Claims, and Horizon End Date.

### Mortgage & Amortization Engine
* **Flexible Extra Payments:** Schedule one-off or recurring extra principal payments with custom start dates and frequencies (Monthly, Quarterly, Semi-Annual, Annual).
* **Bi-Weekly Accelerated Payments:** Model 26-period bi-weekly payment schedules.
* **Rate Adjustments & Refinance Triggers:** Schedule future interest rate changes (ARMs) or full Refinance events. Refinance modeling calculates updated base payments, monthly payment delta, monthly interest savings, and exact breakeven month/year timelines.
* **Freed Cash-Flow Redirection:** Automatically redirect freed mortgage payments into investment accumulators once debt is fully paid off.
* **Locked Header & Filterable Amortization Schedule:** Sticky table header (`top: 0`) and locked Year column (`left: 0`) with column preset view toggles (All Columns, Debt & Payoff, Wealth & Portfolio, Retirement Income) and compact `0.8rem` font size.

### Multi-Bucket Wealth & Tax Engine
* **Multi-Bucket Account Classification:** Assign ongoing contributions to **Taxable Brokerage**, **Pre-Tax (401k/IRA)**, or **Tax-Free (Roth IRA)** account buckets.
* **Accumulation Tax Drag:** Account for annual dividend yield tax drag on taxable brokerage holdings.
* **Retirement Decumulation Waterfall:** Pull withdrawals sequentially from Taxable -> Pre-Tax -> Roth. Pre-tax withdrawals automatically gross up based on effective retirement tax rates ($W_{\text{gross}} = \frac{W_{\text{net}}}{1 - r}$).
* **Itemized MID & SALT Tax Shield Engine:** Model Mortgage Interest Deduction (MID) with pro-rata scaling for loans exceeding the $750,000 IRS principal cap. Deduct itemized State and Local Taxes (SALT) with preset or custom caps ($10k TCJA, $20k proposal, single, unlimited, or custom dollar cap), annual property tax, state income tax, and custom itemized deductions (charitable/medical).
* **Regional Jurisdiction Presets:** Built-in regional presets for New York (NY State + NYC), California (CA State), and Texas / Florida (No State Tax).

### Social Security & Pension Income Engine
* **Self & Spouse Benefit Modeling:** Configure independent monthly benefits ($/month), claim start dates (YYYY-MM), and annual Cost of Living Adjustment (COLA) percentages for Self and Spouse.
* **Inflation-Preserved COLA Compounding:** Inputs in today's dollars (matching ssa.gov statements) compound from base date through retirement to maintain real purchasing power.
* **Portfolio Withdrawal Offsets:** Social Security income offsets required retirement portfolio decumulation dollar-for-dollar; excess Social Security is automatically reinvested.

### Guided Onboarding & Interactive Tutorial
* **Step-by-Step Interactive Walkthrough:** A 9-step guided tutorial overlay (`OnboardingModal`) walking new users through core philosophy, mortgage inputs, refinance triggers, multi-bucket wealth allocation, tax strategy engine, Social Security decumulation, real vs. nominal inflation discounting, Monte Carlo stress testing, and scenario sharing.
* **First-Visit Auto-Prompt:** Automatically offers onboarding on first visit (persisted via `localStorage`), with a "Guided Tour" button in the Navbar for on-demand replaying.
* **Contextual Info Tooltips:** Inline minimalist info icons across parameter controls providing contextual financial guidance on hover.

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
* **Framework:** React 19
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

## AI Transparency & Co-Creation

This codebase was developed via **human-in-the-loop AI pair programming** using Google DeepMind's Antigravity AI agentic coding system and Gemini models. All AI-generated algorithms, components, and test suites are verified through automated Vitest test suites (`npm test`), static linting (`npm run lint`), and production build compilation (`npm run build`).

For full details regarding AI development methodology and standards, see [AI_TRANSPARENCY.md](AI_TRANSPARENCY.md) and [NOTICE](NOTICE).

---

## Contributing & Governance

Contributions are welcome! Please review our community guidelines before submitting pull requests:
* **[Contributing Guidelines](CONTRIBUTING.md)**: Setup instructions, coding standards, and PR workflows.
* **[Code of Conduct](CODE_OF_CONDUCT.md)**: Contributor Covenant v2.1 community standards.
* **[Security Policy](SECURITY.md)**: Responsible disclosure instructions.
* **[AI Transparency Notice](AI_TRANSPARENCY.md)**: AI co-creation and verification standards.

---

## Legal & Financial Disclaimer
This application is for educational and informational purposes only. It does not constitute financial, investment, legal, or tax advice. Projections are inherently hypothetical, based entirely on user inputs and assumed constant rates of return, which are not guaranteed. Actual market conditions, variable interest rates, inflation, and tax implications will vary over time and may significantly alter these figures. Consult with a qualified, licensed financial advisor before making financial decisions.

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.