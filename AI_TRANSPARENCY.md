# AI Co-Creation & Transparency Notice

## Overview

**Strategy Engine** was developed using a **human-in-the-loop AI pair programming methodology**. This document provides full disclosure regarding how artificial intelligence was utilized throughout the design, algorithmic development, refactoring, and testing of this codebase.

---

## AI Collaboration & Tooling

* **AI Agentic Platform:** Google DeepMind Antigravity AI Agentic Coding Platform.
* **Underlying Foundation Models:** Gemini advanced reasoning models.
* **Development Workflow:** Interactive human-guided pair programming, where human maintainers define requirements, approve architecture, review code edits, and steer design decisions, while the AI assistant generates implementations, refactors code, and authors automated test suites.

---

## Areas of AI Contribution

1. **Algorithmic Simulation Engine (`src/lib/engine/`):**
   * Month-by-month mortgage amortization calculations.
   * Bi-weekly 26-period payment math.
   * Lognormal Box-Muller random return sampling for Monte Carlo stress testing.
   * Multi-bucket tax drag and itemized Mortgage Interest Deduction (MID) / SALT tax shield math.

2. **Automated Test Suites (`src/**/__tests__/`):**
   * Comprehensive unit and integration tests using Vitest.
   * Edge case verification (e.g. loans exceeding $750k principal cap, sequence of return risk, custom SALT caps).

3. **User Interface Components & Styling (`src/components/`):**
   * React 19 component structures and parameter panel controls.
   * Minimalist Scandinavian design system styling and responsive layouts.

4. **Documentation & Governance Assets:**
   * Architecture summaries, JSDoc API comments, `README.md`, `CONTRIBUTING.md`, and open-source governance templates.

---

## Verification & Quality Assurance Standards

To guarantee mathematical correctness, security, and stability, **no AI-generated code is merged without verification**:

* **Automated Testing:** All algorithmic code is verified against a 100% passing Vitest test suite (`npm test`).
* **Static Analysis & Linting:** Code is audited via static analysis (`npm run lint`).
* **Production Build Validation:** Every pull request verifies zero-error production bundle compilation (`npm run build`).
* **Human Oversight:** Human maintainers review code logic, test coverage, and design choices prior to merging into the main branch.

---

## License & Intellectual Property Compliance

* All AI suggestions were evaluated to ensure compliance with permissive open-source standards.
* The codebase is licensed under the [Apache License 2.0](LICENSE).
