# Correlation Budget Portfolio Model
## A practical method for diversified carbon credit procurement under correlated failure risk

This document defines a correlation-budget approach for selecting a carbon credit portfolio. The method minimises acquisition cost while preserving expected delivery and limiting dependence on shared countries, developers, registries, and project types. It also introduces a time-decaying shock mechanism that raises risk after a recent group failure without treating that increase as permanent.

The key recommendation is to use concentration measures as an auditable proxy for correlation, then validate the final portfolio with scenario simulation. The available dataset states that failures are correlated across these fields but does not provide enough dated failure observations to estimate statistical correlations directly. Therefore, model weights and shock sizes must be presented as tested assumptions, not observed facts.

---

## 1. Purpose and decision variables

Each project $i$ has a purchase decision $x_i$, measured in tonnes. The selected amount cannot be negative, cannot exceed the credits available for that project, and should not exceed the portfolio's single-project purchase limit.

$$0 \le x_i \le \min(\text{available_tonnes}_i, \text{project_cap})$$

Before applying the model, confirm the project cap is feasible. A 10-tonne cap across 4,355 projects permits at most 43,550 tonnes and cannot meet a 100,000-tonne target. A 10,000-tonne cap is feasible and still prevents a portfolio from becoming a one-project bet.

The base financial objective is to minimise total acquisition cost.

$$\text{Minimise Cost} = \sum_i \text{price}_i x_i$$

---

## 2. Project failure and expected delivery

Use risk rating and recorded reversals to calculate the probability that a project fails. The ratings map to base probabilities: 
* AAA: $1\%$
* AA: $2\%$
* A: $4\%$
* BBB: $7\%$
* BB: $12\%$
* B: $20\%$
* CCC: $35\%$
* Unrated: $15\%$

$$p_i = \min(1, \text{rating\_probability}_i \times \text{reversal\_multiplier}_i)$$

The reversal multiplier is $1.5$ when `had_reversal` is Yes and $1$ otherwise. A buffer pool does not reduce the probability that an event occurs. It reduces the loss severity because the registry recovers $50\%$ of lost credits after a failure.

$$\text{recovery}_i = 0.50 \quad \text{if buffer pool is Yes, otherwise } 0$$

$$\text{survival}_i = 1 - p_i \times (1 - \text{recovery}_i)$$

$$\text{Expected delivery} = \sum_i x_i \times \text{survival}_i$$

A basic expected-delivery constraint is $\text{Expected delivery} \ge 100,000$ tonnes. In the correlation-budget model, use a modest reserve target above 100,000 tonnes so the portfolio can absorb a group shock.

---

## 3. Correlation as shared exposure

Two projects should be treated as dependent when they share a country, developer, registry, or project type. For example, a country-level policy event can affect several projects at once, while a developer failure can affect projects that otherwise appear geographically diverse. The model does not claim that all shared-field projects fail together. It recognises that their failures are less independent than projects with no shared exposure.

For pairwise analysis, a dependency score can be calculated for each project pair $i$ and $j$. Let $M_{ij,f}$ equal 1 when the two projects share factor $f$ and zero otherwise. Let $\alpha_f$ represent the assumed strength of that shared exposure.

$$\rho_{ij} = 1 - \prod_f (1 - \alpha_f \times M_{ij,f})$$

This formula remains between zero and one. It combines overlapping exposures without simply adding them past $100\%$. It is useful for simulation, but a complete pairwise matrix becomes large and difficult to explain. The portfolio optimiser should therefore use group concentration measures as its primary correlation control.

---

## 4. Concentration measures and the correlation budget

For each factor $f$, calculate the delivery-weighted share held by every group $g$. Country groups are countries, developer groups are developers, and so on. Use expected delivered tonnes rather than purchased tonnes when calculating weights, because a high-risk tonne should not count as fully reliable exposure.

$$W_{g,f} = \frac{\sum_{i \in g} x_i \times \text{survival}_i}{\text{Expected delivery}}$$

$$HHI_f = \sum_g (W_{g,f})^2$$

HHI is the probability that two randomly selected expected-delivery tonnes come from the same group. It is low when exposure is dispersed and high when exposure is concentrated. A single country holding all expected delivery has $HHI_{\text{country}} = 1$. Ten equally weighted countries have $HHI_{\text{country}} = 0.10$.

| Factor | What the HHI captures | Illustrative weight $\alpha$ | Useful guardrail |
| :--- | :--- | :--- | :--- |
| **Developer** | Shared operational and governance dependence | $0.50$ | No developer above $10\%$ of expected delivery |
| **Country** | Policy, weather, and country-level disruption | $0.30$ | No country above $20\%$ |
| **Project type** | Methodology and technology dependence | $0.25$ | No type above $25\%$ |
| **Registry** | Registry and methodology governance dependence | $0.15$ | No registry above $35\%$ |

Combine the four measures into one correlation budget. The $\alpha$ values are policy inputs. Start with the illustrative values above, then show sensitivity results for lower and higher settings.

$$\text{Correlation score } C = 0.50 HHI_{\text{developer}} + 0.30 HHI_{\text{country}} + 0.25 HHI_{\text{type}} + 0.15 HHI_{\text{registry}}$$

Require $C \le C_{\text{max}}$.

Use both the aggregate budget and individual guardrails. An aggregate score alone can conceal a dangerous concentration in one developer; individual caps alone can miss broad but repeated dependence. Together, they make the portfolio easier to defend.

---

## 5. Time decaying shocks

A recent failure provides new evidence that the affected group may be under stress. Model this as a temporary uplift to the group shock probability, not as a permanent penalty. This avoids overreacting to an old incident while allowing the model to respond immediately to a recent one.

$$\text{shock}_g(t) = \text{baseline}_g + \delta_g \times \exp[-\lambda \times \text{days\_since\_failure}_g]$$

$\text{baseline}_g$ is the normal group shock probability. $\delta_g$ is the immediate additional risk after a failure. The decay parameter $\lambda$ determines how quickly that uplift fades. An equivalent implementation can use a half-life: $\lambda = \ln(2) / \text{half\_life\_days}$.

| Input | Meaning | Illustrative starting value |
| :--- | :--- | :--- |
| **Developer shock uplift $\delta$** | Additional risk after a developer failure | $10$ percentage points |
| **Country shock uplift $\delta$** | Additional risk after a country event | $6$ percentage points |
| **Registry shock uplift $\delta$** | Additional risk after a registry event | $4$ percentage points |
| **Project type shock uplift $\delta$** | Additional risk after a type-wide event | $5$ percentage points |
| **Half-life** | Time for the uplift to halve | $180$ days |

If no failure has occurred, leave the base project probability unchanged. If a group had a failure, apply only its decayed uplift. Do not apply a past event twice: a project-level `had_reversal` adjustment belongs in $p_i$, while a recent group shock belongs in $\text{shock}_g(t)$. Keep a dated event log outside the source workbook, because the workbook only records whether a project has had a reversal, not when it happened.

$$p_{i,\text{adjusted}}(t) = 1 - (1 - p_i) \times \prod_f [1 - \text{shock}_{\text{group}(i,f)}(t)]$$

Use $p_{i,\text{adjusted}}(t)$ in the survival calculation whenever recent event data is available. This combines independent project risk with time-varying group risk without double counting probability by simple addition.

---

## 6. Optimisation workflow

* **Step 1.** Calculate base $p_i$, $\text{recovery}_i$, and $\text{survival}_i$ for every project. 
* **Step 2.** Apply a feasible per-project purchase cap. 
* **Step 3.** Select projects to minimise cost while meeting an expected-delivery reserve, such as $110,000$ to $130,000$ tonnes depending on the desired stress tolerance.
* **Step 4.** Calculate group delivery shares, each HHI, and the combined correlation score. 
* **Step 5.** Reject or penalise portfolios that exceed $C_{\text{max}}$ or an individual concentration cap. 
* **Step 6.** Recalculate adjusted probabilities when a recent failure is recorded in the event log. 
* **Step 7.** Test the candidate portfolio with simulated country, developer, registry, and project-type shocks.

A practical objective is to minimise cost plus a penalty for correlation, while retaining hard delivery and exposure constraints.

$$\text{Minimise } \sum_i \text{price}_i x_i + \gamma \times C$$

Alternatively, keep cost as the sole objective and enforce $C \le C_{\text{max}}$ as a hard constraint. The latter is easier to present because the team can state a clear maximum concentration-risk appetite.

---

## 7. Recommended comparison

| Portfolio | Constraints | Expected result | Role in the presentation |
| :--- | :--- | :--- | :--- |
| **Cost baseline** | Expected delivery $\ge 100,000$; project cap | Lowest cost but likely concentrated | Shows why price alone is insufficient |
| **Correlation budget** | Baseline plus HHI budget and group caps | Moderate cost with broad diversification | Recommended selection method |
| **Time-aware correlation budget** | Correlation budget plus decaying shock adjustments | Responds to recent incidents | Demonstrates adaptive risk management |
| **Scenario validation** | Simulated group and project shocks | Delivery probability and worst-case shortfall | Proof that the selected portfolio survives shocks |

---

## 8. Conclusion

The correlation budget turns a qualitative warning about shared failures into a measurable portfolio control. HHI measures make the method transparent, the group caps stop obvious concentrations, and the decaying-shock layer adapts the portfolio after new adverse information. The final choice should be the least-cost portfolio that meets the delivery reserve, concentration limits, and a scenario-tested reliability target.

### Data reference
Carbon Credits Challenge workbook, `README` and `CREDITS` sheets. The README defines the synthetic price and risk-rating fields, the base probability mapping, reversal multiplier, buffer-pool recovery rule, $\$1,000,000$ budget, and the warning that failures may be correlated by country, developer, registry, and project type.