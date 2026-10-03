# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + Tailwind CSS

## Users

Primary: Carbon portfolio managers selecting credit portfolios under budget and correlation constraints. They need to filter projects, tune optimization parameters, and visualize the resulting portfolio with concentration metrics and stress-test results.

## Product Purpose

A quantitative dashboard for the Correlation Budget Portfolio Model — a method that minimizes carbon credit acquisition cost while preserving expected delivery and limiting dependence on shared countries, developers, registries, and project types. The tool replaces ad-hoc diversification with an auditable correlation budget (C = 0.50·HHI_developer + 0.30·HHI_country + 0.25·HHI_type + 0.15·HHI_registry) and validates portfolios through scenario simulation.

Success means: a portfolio meeting ≥100,000 tonnes expected delivery, C ≤ 0.15, within a $1M budget, with transparent concentration breakdowns and shock resilience.

## Positioning

The only carbon credit procurement tool that uses Herfindahl-Hirschman concentration as an auditable proxy for correlation risk, with time-decaying group shock adjustments — turning qualitative "don't put all eggs in one basket" warnings into measurable, enforceable portfolio controls.

## Operating Context

- Workflow: Load project database → Filter by country/developer/rating → Set optimization parameters (target delivery, C_max, policy weights, shock deltas, half-life) → Run optimization → Review portfolio summary, concentration tables, comparative analysis (Cost Baseline vs Correlation Budget vs Time-Aware) → Stress-test top concentration groups
- Data source: Excel workbook with CREDITS sheet (4,355 projects across 111 countries, 1,570 developers, 6 registries, 76 project types)
- Optimization engine: OR-Tools SCIP/CBC linear programming (Python backend), results surfaced to frontend
- Rituals: Pre-trade parameter tuning, post-optimization stress review, regulatory/audit documentation of concentration limits

## Capabilities and Constraints

- Project filtering: whitelist/blacklist countries and developers; minimum credit rating (AAA→Unrated); project purchase cap (default 10,000t)
- Optimization parameters: target delivery (100k–130k tonnes), C_max (default 0.15), policy weights α (developer 0.50, country 0.30, type 0.25, registry 0.15), shock deltas per factor, half-life (default 180 days)
- Outputs: summary cards (cost, delivery, C, inverse HHI), concentration tables by factor, comparative analysis (3 model variants), stress-test results (100% group shock)
- Constraints: $1M budget hard limit; per-project cap; delivery ≥ target × reserve; C ≤ C_max; individual group caps (developer 10%, country 20%, type 25%, registry 35%)
- Time-decaying shocks: p_adjusted = 1 - (1-p_i) × ∏[1 - shock_group(t)], shock_g(t) = baseline + δ·exp(-λ·days)

## Brand Commitments

No pre-existing brand identity. The visual world will be established in DESIGN.md via new-work.

## Evidence on Hand

- Python optimizer (`portfolio_optimizer.py`) with full model implementation
- Methodology document (`correlation_budget_portfolio_model.md`)
- Synthetic dataset (4,355 projects) in `carbon_credits_challenge - Data.xlsx`
- Frontend specification (`frontend.md`) defining 4 panel areas and component architecture

## Product Principles

1. **Transparency over trust** — Every constraint and risk adjustment is visible, auditable, and explainable to a regulator
2. **Actionable concentration** — HHI metrics and group shares drive decisions, not abstract correlation matrices
3. **Adaptive not reactive** — Time-decaying shocks respond to new failures without over-penalizing history
4. **Cost-aware diversification** — Cheapest portfolio meeting risk limits, not cheapest portfolio period
5. **Scenario-validated** — No portfolio ships without stress-test evidence

## Accessibility & Inclusion

- WCAG 2.1 AA for all interactive controls (sliders, dropdowns, tables)
- Keyboard navigation for parameter tuning and result inspection
- Color-blind safe palettes for concentration heatmaps and stress-test indicators
- Screen-reader accessible data tables with proper headers and scope