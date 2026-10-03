You are an expert full-stack React and UI/UX engineer. Build a responsive, production-ready front-end dashboard using Vite, React, and Tailwind CSS for the **Correlation Budget Portfolio Model** (a quantitative carbon credit procurement and optimization tool).

### 1. Data Filtering & Governance Panel
Create a dedicated sidebar or top filter bar allowing users to refine the project database before optimization:
*   **Country & Developer Lists:** Multi-select dropdowns or tag-based inputs with explicit **Whitelist / Blacklist** toggle modes for countries and developers.
*   **Minimum Credit Rating:** A dropdown selector mapping to the model's ratings (AAA, AA, A, BBB, BB, B, CCC, Unrated) to filter out projects below a selected quality threshold.
*   **Project Cap Adjustment:** A numeric input for the single-project purchase limit (e.g., default 10,000 tonnes).

### 2. Optimization Parameter Control Center
Provide interactive UI controls (sliders, number inputs, and dropdowns) for the core model parameters defined in the correlation budget framework:
*   **Target Expected Delivery:** Slider/input for minimum expected delivered tonnes (e.g., default 100,000–130,000 tonnes).
*   **Correlation Budget Limit ($C_{max}$):** Slider for maximum allowable aggregate correlation score.
*   **Policy Weights ($\alpha_f$):** Sliders or configuration inputs for Developer ($0.50$), Country ($0.30$), Project Type ($0.25$), and Registry ($0.15$) HHI weights.
*   **Time-Decaying Shock Parameters:** 
    *   Shock Deltas ($\delta_g$) for developers, countries, registries, and types (percentage point sliders).
    *   Half-life days slider (default 180 days) for time-decaying risk adjustments ($\lambda$).

### 3. Results & Portfolio Visualization Dashboard
Once filters and parameters are applied, run/simulate the optimization logic client-side and display:
*   **Summary Cards:** Total Acquisition Cost, Achieved Expected Delivery, Final Correlation Score ($C$), and Effective Number of Constituents (Inverse HHI).
*   **Concentration Breakdown Table:** Group-level delivery shares and HHI metrics across developers, countries, types, and registries.
*   **Comparative Analysis View:** A side-by-side comparison table evaluating the Cost Baseline vs. Correlation Budget vs. Time-Aware model outputs (as outlined in the model specification).

### 4. Technical Guidelines
*   Use modular component architecture (e.g., `FilterPanel.tsx`, `ControlSliders.tsx`, `ResultsDashboard.tsx`, `ComparisonTable.tsx`).
*   Ensure clean state management using React Hooks (`useState`, `useMemo` for filtering and calculation performance).
*   Style cleanly with Tailwind CSS (use modern card layouts, subtle shadows, slate/indigo color palettes, and clear visual hierarchy).