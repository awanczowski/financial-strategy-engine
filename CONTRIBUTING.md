# Contributing to Strategy Engine

Thank you for your interest in contributing to **Strategy Engine**! We welcome contributions from developers, financial modelers, UI designers, and financial enthusiasts.

Please take a moment to review this document before submitting bug reports, feature requests, or pull requests.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### 1. Reporting Bugs
Before creating a bug report, please check existing issues to avoid duplicates. When filing a bug report, use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
* Clear summary of the issue
* Step-by-step reproduction instructions
* Expected vs. actual behavior
* Browser version and operating system details

### 2. Suggesting Enhancements
Feature suggestions are highly encouraged! Please submit an issue using our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) detailing:
* Goal / financial modeling value of the proposed feature
* Proposed UX or engine mathematical specification
* Any potential breaking changes to serialized scenario URLs or storage format

### 3. Submitting Pull Requests

Follow this workflow to submit code changes:

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/financial-strategy-engine.git
   cd financial-strategy-engine
   ```

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or fix/your-fix-name
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Make Your Changes**:
   * Adhere to existing code formatting (2-space indentation, ES6 modules).
   * Ensure new financial engine math functions include unit tests in `src/lib/engine/__tests__/`.
   * Add JSDoc comments to exported functions.

5. **Run Tests & Verify Build**:
   ```bash
   # Run Vitest test suite
   npm test

   # Run production bundle build
   npm run build
   ```

6. **Commit & Push**:
   Write clear, imperative commit messages (e.g. `feat: add ARM loan interest rate adjustment engine`):
   ```bash
   git commit -m "feat: add ARM loan interest rate adjustment engine"
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**:
   Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) outlining changes, linked issues, and test verification results.

---

## Development Guidelines

* **Pure Math Separation:** Engine calculations in `src/lib/engine/` must remain pure functions independent of React context or UI state.
* **Backward Compatibility:** Updates to `shareSerializer.js` must maintain backward compatibility when decoding legacy Base64 share URLs or JSON files.
* **Performance:** Ensure heavy loops inside `runSimulationEngine` remain optimized and memoized in `StrategyContext.jsx`.

Thank you for helping build a better open-source financial engine!
