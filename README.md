# Strategy Engine: Paydown vs. Invest Calculator

## Overview
Strategy Engine is a fluid, single-page React application designed to mathematically compare the long-term financial impacts of aggressive mortgage paydown strategies versus compounding market investments. It provides a comprehensive, period-by-period simulation of net worth trajectory, factoring in real estate appreciation, variable interest rates, and flexible contribution schedules.

## Main Goals
1. **Apples-to-Apples Financial Comparison:** To provide a mathematically rigorous comparison between debt reduction and investment growth, accounting for standard compounding mismatches.
2. **True Net Worth Tracking:** To calculate and visualize holistic net worth by dynamically treating the mortgage as a decreasing liability against appreciating assets (real estate and market portfolios).
3. **Real-World Flexibility:** To accommodate complex, real-world financial scenarios including Adjustable Rate Mortgages (ARMs), bi-weekly accelerated payments, and multi-tiered yield projections.
4. **Snowball Mechanics:** To accurately model the "snowball effect" by optionally diverting freed-up cash flow directly into the investment portfolio once the primary debt is zeroed out.

## Key Features
* **Heavy Simulation Engine:** Calculates amortization and compounding growth on a monthly basis, rolling up into highly readable yearly aggregates.
* **Dynamic Schedules:** Add limitless extra payment or investment strategies, triggered by exact calendar start dates.
* **Advanced Mortgage Logic:** Supports 26-period bi-weekly payments and future interest rate adjustments (ARMs).
* **Multi-Tiered Forecasting:** Concurrently simulates Low, Medium, and High market yields and real estate appreciation rates.
* **Scenario Management:** Save, load, and delete specific configurations directly to local browser storage.
* **Minimalist UI/UX:** A fluid, edge-to-edge Scandinavian design system utilizing high-contrast typography and sharp, brutalist geometries.

---

## Architecture

The application is built as a client-side Single Page Application (SPA), emphasizing performance and strict separation of presentation from computational logic.

### Tech Stack
* **Framework:** React 18 
* **Build Tool:** Vite (for rapid HMR and optimized production bundling)
* **Data Visualization:** Recharts (React components built on D3 for lightweight, responsive SVG charts)
* **Styling:** Bootstrap 5 (heavily overridden with custom CSS for a bespoke, borderless, fluid grid system)

### State Management & Performance
The architecture relies on React hooks to manage complex concurrent states without unnecessary re-renders:
* `useState`: Manages all form inputs, dynamic arrays (strategies/rates), and UI toggles.
* `useMemo`: Acts as the barrier between the UI and the heavy mathematical engine. The 300+ month `for` loop that calculates periodic interest, principal reduction, and compounding growth only executes when specific financial dependencies change, keeping the UI instantly responsive.
* `useEffect`: Handles the initial hydration of saved scenarios from the browser's `localStorage` API upon component mount.

### Algorithmic Engine
The core of the application is a pure JavaScript simulation loop. It steps through the timeline month-by-month to accurately handle compounding mismatches (e.g., standard US mortgages compound monthly, while bi-weekly payments alter the principal intra-month). It calculates base standard payments using the standard amortized loan formula:

$$M = P \frac{r(1+r)^n}{(1+r)^n - 1}$$

The engine continually checks the principal balance, intercepts the final payoff month to prevent negative balances, and redirects residual funds into the investment accumulators.

---

## Installation & Setup

```bash
npm install
npm run dev
```

Navigate to the local host URL provided in your terminal (typically http://localhost:5173).



## Legal & Financial Disclaimer
This application is for educational and informational purposes only. It does not constitute financial, investment, legal, or tax advice. Projections are inherently hypothetical, based entirely on user inputs and assumed constant rates of return, which are not guaranteed. Actual market conditions, variable interest rates, inflation, and tax implications will vary over time and may significantly alter these figures. Consult with a qualified, licensed financial advisor before making financial decisions.