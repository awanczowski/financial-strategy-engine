Here is the fully updated README.md incorporating the new two-column layout architecture and the advanced Monte Carlo sequence-of-return risk simulation.

You can copy and paste this directly into your project:

Markdown
# Strategy Engine: Paydown vs. Invest Calculator

## Overview
Strategy Engine is a fluid, single-page React application designed to mathematically compare the long-term financial impacts of aggressive mortgage paydown strategies versus compounding market investments. It provides a comprehensive, period-by-period simulation of net worth trajectory, factoring in real estate appreciation, variable interest rates, flexible contribution schedules, and a robust retirement withdrawal phase. 

Additionally, it features a built-in **Monte Carlo Simulation** to stress-test your portfolio against sequence of return risk, providing statistical probabilities of success rather than just deterministic straight-line averages.

## Main Goals
1. **Apples-to-Apples Financial Comparison:** To provide a mathematically rigorous comparison between debt reduction and investment growth, accounting for standard compounding mismatches.
2. **True Net Worth Tracking:** To calculate and visualize holistic net worth by dynamically treating the mortgage as a decreasing liability against appreciating assets.
3. **Real-World Flexibility:** To accommodate complex, real-world financial scenarios including Adjustable Rate Mortgages (ARMs), bi-weekly accelerated payments, and multi-tiered yield projections.
4. **Retirement Decumulation:** To seamlessly transition the simulation from the wealth accumulation phase into retirement, modeling percentage-based withdrawals, halted contributions, and adjusted conservative yields.
5. **Statistical Stress Testing:** To go beyond simple averages by running thousands of randomized market simulations, helping users understand their true probability of portfolio survival.

## Key Features
* **Heavy Simulation Engine:** Calculates amortization, compounding growth, and scheduled withdrawals on a monthly basis, rolling up into highly readable yearly aggregates.
* **Monte Carlo Analysis:** Runs 1,000 independent, randomized market paths across your specific cash-flow timeline (assuming 15% annualized volatility) to calculate your exact percentage chance of not outliving your money. Generates a mapped probability cone (10th, 50th, and 90th percentiles).
* **Retirement Phase Simulator:** Set a target retirement date to automatically trigger yearly portfolio withdrawals, shift to a distinct post-retirement growth rate, and optionally halt all ongoing wealth contributions.
* **Dynamic Schedules:** Add limitless extra payment or investment strategies, triggered by exact calendar start dates.
* **Advanced Mortgage Logic:** Supports 26-period bi-weekly payments and future interest rate adjustments (ARMs).
* **Multi-Tiered Forecasting:** Concurrently simulates Low, Medium, and High market yields and real estate appreciation rates.
* **Auto-Save & Memory:** Automatically caches your active session inputs to browser local storage so you never lose your configuration upon refresh.
* **Minimalist UI/UX:** A full-width, responsive Scandinavian design system utilizing a clean two-column control grid (Mortgage vs. Wealth) and sharp, brutalist geometries.

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
* `useMemo`: Acts as the barrier between the UI and the heavy mathematical engine. The 400+ month `for` loop that calculates periodic interest, principal reduction, compounding growth, and retirement withdrawals only executes when specific financial dependencies change, keeping the UI instantly responsive.
* `useEffect`: Handles the continuous auto-saving of the active session to the browser's `localStorage` API.

### Algorithmic Engine & Monte Carlo Math
The core of the application is a pure JavaScript simulation loop. 

#### Deterministic Path:

The core of the application is a pure JavaScript simulation loop. It steps through the timeline month-by-month to accurately handle compounding mismatches (e.g., standard US mortgages compound monthly, while bi-weekly payments alter the principal intra-month). It calculates base standard payments using the standard amortized loan formula:

$$M = P \frac{r(1+r)^n}{(1+r)^n - 1}$$

The engine continually checks the principal balance, intercepts the final payoff month to prevent negative balances, and redirects residual funds into the investment accumulators.

#### Stochastic Path (Monte Carlo)
When triggered, the engine extracts the exact net cash flows (contributions minus dynamic withdrawals) from the deterministic path. It then uses a **Box-Muller transform** algorithm to generate normally distributed random numbers, applying randomized monthly returns against the portfolio balance for 1,000 separate iterations per yield profile, accurately simulating sequence of return risk.

* **Zeno's Paradox of Withdrawals:** If a calculator simply pulls a flat percentage (e.g., 4%) from a declining portfolio balance every year, the portfolio mathematically can never reach $0. This creates a false 100% success rate in Monte Carlo simulations. *Strategy Engine* fixes this by converting your selected percentage into a fixed dollar amount based on the portfolio value on the exact day you retire, locking it in for the remainder of the simulation to allow for realistic portfolio depletion.
* **The Simulation Horizon Trap:** A 35-year simulation is great for wealth accumulation, but fails to stress-test a 30-year retirement. The engine defaults to a 55-year simulation span to ensure the decumulation phase is subjected to full long-term market volatility.
* **Illiquid Asset Isolation:** Your real estate equity is strictly walled off from your liquid assets. The Monte Carlo success/failure condition is mapped *exclusively* to your investment portfolio. A $2,000,000 paid-off home will not artificially save a $0 liquid portfolio from failing the stress test.
* **Sequence of Return Risk:** Straight-line averages (e.g., a constant 8% yield) lie. Withdrawing funds during a market downturn damages a portfolio exponentially more than withdrawing during a bull market. The Monte Carlo engine utilizes a Box-Muller transform to introduce random normal distribution (volatility), actively stress-testing the *order* of your returns, not just the average.

---

## Installation & Setup

```bash
npm install
npm run dev
```

Navigate to the local host URL provided in your terminal (typically http://localhost:5173).



## Legal & Financial Disclaimer
This application is for educational and informational purposes only. It does not constitute financial, investment, legal, or tax advice. Projections are inherently hypothetical, based entirely on user inputs and assumed constant rates of return, which are not guaranteed. Actual market conditions, variable interest rates, inflation, and tax implications will vary over time and may significantly alter these figures. Consult with a qualified, licensed financial advisor before making financial decisions.