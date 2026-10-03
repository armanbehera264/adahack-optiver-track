"""
Correlation Budget Portfolio Optimizer for Carbon Credits
Based on the methodology from correlation_budget_portfolio.md

This implements:
1. Base failure probability calculation from risk ratings
2. Survival probability with buffer pool recovery
3. Correlation budget via HHI concentration measures (country, developer, registry, project_type)
4. Portfolio optimization with cost minimization subject to delivery and correlation constraints
5. Time-decaying shock mechanism for recent failures
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from ortools.linear_solver import pywraplp
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# Configuration Constants (from document)
# ============================================================================

# Base failure probabilities by risk rating
RATING_PROB = {
    'AAA': 0.01,
    'AA': 0.02,
    'A': 0.04,
    'BBB': 0.07,
    'BB': 0.12,
    'B': 0.20,
    'CCC': 0.35,
}

DEFAULT_UNRATED_PROB = 0.15
REVERSAL_MULTIPLIER = 1.5
BUFFER_POOL_RECOVERY = 0.50

# Correlation budget weights (alpha values from document)
CORRELATION_WEIGHTS = {
    'developer': 0.50,
    'country': 0.30,
    'project_type': 0.25,
    'registry': 0.15,
}

# Default optimization parameters
DEFAULT_BUDGET = 1_000_000  # $1M budget
DEFAULT_TARGET_TONNES = 100_000
DEFAULT_RESERVE_MULTIPLIER = 1.00  # 100% reserve = 100,000 tonnes
DEFAULT_PROJECT_CAP = 10_000  # Max tonnes per project
DEFAULT_C_MAX = 0.15  # Max correlation score


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class Project:
    """Represents a single carbon credit project with all computed fields"""
    credit_id: str
    project_name: str
    registry: str
    country: str
    developer: str
    project_type: str
    available_tonnes: float
    price_usd_per_t: float
    risk_rating: str
    has_buffer_pool: bool
    had_reversal: bool
    vintage_year: int

    # Computed fields
    base_failure_prob: float = 0.0
    failure_prob: float = 0.0
    recovery: float = 0.0
    survival: float = 0.0

    def __post_init__(self):
        self.compute_probabilities()

    def compute_probabilities(self):
        """Calculate base failure probability, adjusted failure prob, and survival"""
        # Base probability from rating
        base = RATING_PROB.get(self.risk_rating, DEFAULT_UNRATED_PROB)
        self.base_failure_prob = base

        # Apply reversal multiplier
        if self.had_reversal:
            base = min(1.0, base * REVERSAL_MULTIPLIER)
        self.failure_prob = base

        # Buffer pool recovery
        self.recovery = BUFFER_POOL_RECOVERY if self.has_buffer_pool else 0.0

        # Survival probability
        self.survival = 1.0 - self.failure_prob * (1.0 - self.recovery)


@dataclass
class PortfolioResult:
    """Results from portfolio optimization"""
    selected_projects: List[Tuple[Project, float]]  # (project, tonnes)
    total_cost: float
    total_tonnes_purchased: float
    expected_delivery: float
    correlation_score: float
    hhi_by_factor: Dict[str, float]
    group_concentrations: Dict[str, Dict[str, float]]  # factor -> {group: share}
    solver_status: str


# ============================================================================
# Core Calculation Functions
# ============================================================================

def load_projects(excel_path: str) -> List[Project]:
    """Load projects from Excel file and create Project objects"""
    df = pd.read_excel(excel_path, sheet_name='CREDITS')

    projects = []
    for _, row in df.iterrows():
        project = Project(
            credit_id=row['credit_id'],
            project_name=row['project_name'],
            registry=row['registry'],
            country=row['country'],
            developer=row['developer'],
            project_type=row['project_type'],
            available_tonnes=float(row['available_tonnes']),
            price_usd_per_t=float(row['price_usd_per_t']),
            risk_rating=row['risk_rating'] if pd.notna(row['risk_rating']) else 'Unrated',
            has_buffer_pool=row['has_buffer_pool'] == 'Yes',
            had_reversal=row['had_reversal'] == 'Yes',
            vintage_year=int(row['vintage_year']) if pd.notna(row['vintage_year']) else 0,
        )
        projects.append(project)

    return projects


def calculate_hhi(weights: Dict[str, float]) -> float:
    """Calculate Herfindahl-Hirschman Index from group weights"""
    return sum(w * w for w in weights.values())


def calculate_group_shares(
    selected: List[Tuple[Project, float]],
    factor: str
) -> Dict[str, float]:
    """Calculate delivery-weighted shares for each group in a factor"""
    # Total expected delivery
    total_delivery = sum(p.survival * tonnes for p, tonnes in selected)

    if total_delivery == 0:
        return {}

    # Group by factor
    group_delivery = {}
    for project, tonnes in selected:
        group_value = getattr(project, factor)
        delivery = project.survival * tonnes
        group_delivery[group_value] = group_delivery.get(group_value, 0) + delivery

    # Convert to shares
    return {g: d / total_delivery for g, d in group_delivery.items()}


def calculate_correlation_score(
    selected: List[Tuple[Project, float]]
) -> Tuple[float, Dict[str, float]]:
    """
    Calculate the combined correlation score C and individual HHIs
    C = 0.50 * HHI_developer + 0.30 * HHI_country + 0.25 * HHI_type + 0.15 * HHI_registry
    """
    factors = ['developer', 'country', 'project_type', 'registry']
    hhi_values = {}

    for factor in factors:
        shares = calculate_group_shares(selected, factor)
        hhi_values[factor] = calculate_hhi(shares)

    # Weighted combination
    c = sum(CORRELATION_WEIGHTS[f] * hhi_values[f] for f in factors)

    return c, hhi_values


# ============================================================================
# Optimization Model (using OR-Tools)
# ============================================================================

def optimize_portfolio(
    projects: List[Project],
    budget: float = DEFAULT_BUDGET,
    target_tonnes: float = DEFAULT_TARGET_TONNES,
    reserve_multiplier: float = DEFAULT_RESERVE_MULTIPLIER,
    project_cap: float = DEFAULT_PROJECT_CAP,
    c_max: float = DEFAULT_C_MAX,
    individual_caps: Optional[Dict[str, float]] = None,
    verbose: bool = True,
    use_penalty_method: bool = False,
    penalty_weight: float = 1000.0
) -> PortfolioResult:
    """
    Optimize portfolio using linear programming with correlation budget constraints.

    Objective: Minimize total cost
    Subject to:
    - Budget constraint
    - Expected delivery >= target * reserve_multiplier
    - Correlation score C <= c_max (approximated via group concentration limits)
    - Individual group concentration caps (optional)
    - Per-project purchase cap

    If use_penalty_method=True, adds correlation score as penalty to objective
    instead of hard constraints.
    """

    # Default individual caps per factor from the document (guardrails)
    # Developer: 10%, Country: 20%, Project type: 25%, Registry: 35%
    default_individual_caps = {
        'developer': 0.10,
        'country': 0.20,
        'project_type': 0.25,
        'registry': 0.35,
    }
    if individual_caps:
        default_individual_caps.update(individual_caps)
    individual_caps = default_individual_caps

    if verbose:
        print(f"Optimizing portfolio with {len(projects)} projects...")
        print(f"  Budget: ${budget:,.0f}")
        print(f"  Target tonnes: {target_tonnes:,.0f}")
        print(f"  Reserve target: {target_tonnes * reserve_multiplier:,.0f} tonnes")
        print(f"  Project cap: {project_cap:,.0f} tonnes")
        print(f"  Max correlation score (C_max): {c_max}")
        print(f"  Individual caps: {individual_caps}")

    # Filter feasible projects (positive survival, within budget)
    feasible_projects = [
        p for p in projects
        if p.survival > 0 and p.price_usd_per_t > 0 and p.available_tonnes > 0
    ]

    if verbose:
        print(f"  Feasible projects: {len(feasible_projects)}")

    # Create solver
    solver = pywraplp.Solver.CreateSolver('SCIP')
    if not solver:
        solver = pywraplp.Solver.CreateSolver('CBC')
    if not solver:
        raise RuntimeError("No LP solver available")

    # Decision variables: tonnes to purchase from each project
    x = {}
    for i, project in enumerate(feasible_projects):
        max_purchase = min(project.available_tonnes, project_cap)
        x[i] = solver.NumVar(0, max_purchase, f"x_{i}")

    # Objective: minimize cost
    objective = solver.Objective()
    for i, project in enumerate(feasible_projects):
        objective.SetCoefficient(x[i], project.price_usd_per_t)
    objective.SetMinimization()

    # Budget constraint
    budget_constraint = solver.Constraint(0, budget)
    for i, project in enumerate(feasible_projects):
        budget_constraint.SetCoefficient(x[i], project.price_usd_per_t)

    # Expected delivery constraint (with reserve)
    reserve_target = target_tonnes * reserve_multiplier
    delivery_constraint = solver.Constraint(reserve_target, solver.infinity())
    for i, project in enumerate(feasible_projects):
        delivery_constraint.SetCoefficient(x[i], project.survival)

    # Solve initial LP without correlation constraints
    status = solver.Solve()

    if status != pywraplp.Solver.OPTIMAL:
        raise RuntimeError(f"Initial optimization failed: status {status}")

    # Extract initial solution
    selected = []
    for i in x:
        val = x[i].solution_value()
        if val > 1e-6:
            selected.append((feasible_projects[i], val))

    # Check correlation score
    c, hhi = calculate_correlation_score(selected)

    if verbose:
        print(f"\nInitial solution (no correlation constraints):")
        print(f"  Cost: ${objective.Value():,.2f}")
        print(f"  Expected delivery: {sum(p.survival * t for p, t in selected):,.1f} tonnes")
        print(f"  Correlation score C: {c:.4f}")
        for f, h in hhi.items():
            print(f"  HHI_{f}: {h:.4f}")

    # If correlation score exceeds C_max, iteratively add group concentration constraints
    # using the document's guardrail caps as starting points
    max_iterations = 15
    iteration = 0

    # Track effective caps that get tightened
    effective_caps = individual_caps.copy()

    while c > c_max and iteration < max_iterations:
        iteration += 1
        if verbose:
            print(f"\n  Iteration {iteration}: C = {c:.4f} > {c_max}, tightening constraints...")

        # Calculate contribution of each factor to C
        contributions = {f: CORRELATION_WEIGHTS[f] * hhi.get(f, 0) for f in ['developer', 'country', 'project_type', 'registry']}

        # Sort factors by contribution (descending)
        sorted_factors = sorted(contributions.items(), key=lambda x: x[1], reverse=True)

        # Tighten caps for top contributing factors
        for factor, contrib in sorted_factors:
            if contrib < 0.01:  # Skip negligible contributions
                continue

            shares = calculate_group_shares(selected, factor)
            if not shares:
                continue

            # Get current effective cap
            current_cap = effective_caps.get(factor, individual_caps.get(factor, 0.3))

            # Tighten by 10% each iteration
            new_cap = current_cap * 0.9
            effective_caps[factor] = new_cap

            if verbose:
                print(f"    Tightening {factor} cap from {current_cap:.3f} to {new_cap:.3f} (contribution: {contrib:.4f})")

            # Add constraint with new tighter cap
            total_delivery_est = sum(p.survival * t for p, t in selected)
            for group, share in shares.items():
                if share > new_cap:
                    max_group_delivery = new_cap * total_delivery_est
                    group_indices = [
                        i for i, p in enumerate(feasible_projects)
                        if getattr(p, factor) == group
                    ]
                    if group_indices:
                        constr = solver.Constraint(0, max_group_delivery)
                        for i in group_indices:
                            constr.SetCoefficient(x[i], feasible_projects[i].survival)

        # Re-solve
        status = solver.Solve()

        if status != pywraplp.Solver.OPTIMAL:
            if verbose:
                print(f"  Optimization failed at iteration {iteration}")
            break

        # Extract new solution
        selected = []
        for i in x:
            val = x[i].solution_value()
            if val > 1e-6:
                selected.append((feasible_projects[i], val))

        c, hhi = calculate_correlation_score(selected)

        if verbose:
            print(f"  New C: {c:.4f}, Cost: ${objective.Value():,.2f}")

    # Final results
    total_cost = objective.Value()
    total_tonnes = sum(t for _, t in selected)
    expected_delivery = sum(p.survival * t for p, t in selected)

    # Calculate final group concentrations for reporting
    group_concentrations = {}
    for factor in ['developer', 'country', 'project_type', 'registry']:
        group_concentrations[factor] = calculate_group_shares(selected, factor)

    status_str = {
        pywraplp.Solver.OPTIMAL: 'OPTIMAL',
        pywraplp.Solver.FEASIBLE: 'FEASIBLE',
        pywraplp.Solver.INFEASIBLE: 'INFEASIBLE',
        pywraplp.Solver.UNBOUNDED: 'UNBOUNDED',
        pywraplp.Solver.ABNORMAL: 'ABNORMAL',
        pywraplp.Solver.NOT_SOLVED: 'NOT_SOLVED',
    }.get(status, f'UNKNOWN({status})')

    return PortfolioResult(
        selected_projects=selected,
        total_cost=total_cost,
        total_tonnes_purchased=total_tonnes,
        expected_delivery=expected_delivery,
        correlation_score=c,
        hhi_by_factor=hhi,
        group_concentrations=group_concentrations,
        solver_status=status_str
    )


# ============================================================================
# Time-Decaying Shock Mechanism
# ============================================================================

@dataclass
class ShockEvent:
    """A recorded failure event for a group"""
    factor: str  # 'country', 'developer', 'registry', 'project_type'
    group: str
    days_since: int
    baseline_shock: float = 0.05  # baseline group shock probability
    delta_shock: float = 0.20     # immediate additional risk
    half_life_days: float = 90.0  # half-life for decay


def apply_time_decaying_shocks(
    projects: List[Project],
    shock_events: List[ShockEvent]
) -> List[Project]:
    """
    Apply time-decaying shocks to project failure probabilities.

    p_i_adjusted(t) = 1 - (1 - p_i) * product_f [1 - shock_group(i,f)(t)]

    where shock_g(t) = baseline_g + delta_g * exp(-lambda * days_since_failure_g)
    """
    # Calculate shock for each factor-group combination
    shock_by_factor_group = {}

    for event in shock_events:
        key = (event.factor, event.group)
        lambda_decay = np.log(2) / event.half_life_days
        shock = event.baseline_shock + event.delta_shock * np.exp(-lambda_decay * event.days_since)
        shock_by_factor_group[key] = min(1.0, shock)

    # Create adjusted projects
    adjusted_projects = []
    for project in projects:
        # Calculate combined group shock for this project
        combined_survival = 1.0
        for factor in ['country', 'developer', 'registry', 'project_type']:
            key = (factor, getattr(project, factor))
            if key in shock_by_factor_group:
                combined_survival *= (1.0 - shock_by_factor_group[key])

        # Adjusted failure probability
        p_adjusted = 1.0 - (1.0 - project.failure_prob) * combined_survival
        p_adjusted = min(1.0, p_adjusted)

        # Adjusted survival
        survival_adjusted = 1.0 - p_adjusted * (1.0 - project.recovery)

        # Create new project with adjusted probabilities
        adjusted = Project(
            credit_id=project.credit_id,
            project_name=project.project_name,
            registry=project.registry,
            country=project.country,
            developer=project.developer,
            project_type=project.project_type,
            available_tonnes=project.available_tonnes,
            price_usd_per_t=project.price_usd_per_t,
            risk_rating=project.risk_rating,
            has_buffer_pool=project.has_buffer_pool,
            had_reversal=project.had_reversal,
            vintage_year=project.vintage_year,
        )
        adjusted.failure_prob = p_adjusted
        adjusted.survival = survival_adjusted
        adjusted_projects.append(adjusted)

    return adjusted_projects


# ============================================================================
# Scenario Testing / Simulation
# ============================================================================

def simulate_shock_scenario(
    selected: List[Tuple[Project, float]],
    shock_factor: str,
    shock_group: str,
    shock_magnitude: float = 1.0  # 1.0 = total failure of group
) -> Dict:
    """Simulate a shock to a specific group and measure portfolio impact"""

    total_delivery = sum(p.survival * t for p, t in selected)
    group_delivery = sum(
        p.survival * t for p, t in selected
        if getattr(p, shock_factor) == shock_group
    )
    other_delivery = total_delivery - group_delivery

    # After shock
    shocked_delivery = other_delivery + group_delivery * (1.0 - shock_magnitude)

    return {
        'factor': shock_factor,
        'group': shock_group,
        'pre_shock_delivery': total_delivery,
        'group_delivery_at_risk': group_delivery,
        'group_share': group_delivery / total_delivery if total_delivery > 0 else 0,
        'post_shock_delivery': shocked_delivery,
        'delivery_loss': total_delivery - shocked_delivery,
        'loss_percentage': (total_delivery - shocked_delivery) / total_delivery if total_delivery > 0 else 0
    }


def run_stress_tests(
    selected: List[Tuple[Project, float]],
    top_n_groups: int = 5
) -> pd.DataFrame:
    """Run stress tests on top concentration groups across all factors"""
    results = []

    for factor in ['developer', 'country', 'project_type', 'registry']:
        shares = calculate_group_shares(selected, factor)
        # Sort by share descending
        top_groups = sorted(shares.items(), key=lambda x: x[1], reverse=True)[:top_n_groups]

        for group, share in top_groups:
            result = simulate_shock_scenario(selected, factor, group, shock_magnitude=1.0)
            results.append(result)

    return pd.DataFrame(results)


# ============================================================================
# Main Entry Point
# ============================================================================

def run_optimization(
    data_path: str = "carbon_credits_challenge - Data.xlsx",
    budget: float = DEFAULT_BUDGET,
    target_tonnes: float = DEFAULT_TARGET_TONNES,
    reserve_multiplier: float = DEFAULT_RESERVE_MULTIPLIER,
    project_cap: float = DEFAULT_PROJECT_CAP,
    c_max: float = DEFAULT_C_MAX,
    individual_caps: Optional[Dict[str, float]] = None,
    shock_events: Optional[List[ShockEvent]] = None,
    verbose: bool = True
) -> PortfolioResult:
    """
    Main entry point to run the full portfolio optimization pipeline.
    """
    # Load projects
    projects = load_projects(data_path)

    # Apply shocks if provided
    if shock_events:
        projects = apply_time_decaying_shocks(projects, shock_events)
        if verbose:
            print(f"Applied {len(shock_events)} shock events")

    # Run optimization
    result = optimize_portfolio(
        projects=projects,
        budget=budget,
        target_tonnes=target_tonnes,
        reserve_multiplier=reserve_multiplier,
        project_cap=project_cap,
        c_max=c_max,
        individual_caps=individual_caps,
        verbose=verbose
    )

    return result


def print_portfolio_summary(result: PortfolioResult, top_n: int = 20):
    """Print a formatted summary of the portfolio"""
    print("\n" + "=" * 80)
    print("PORTFOLIO OPTIMIZATION RESULTS")
    print("=" * 80)

    print(f"\nSolver Status: {result.solver_status}")
    print(f"Total Cost: ${result.total_cost:,.2f}")
    print(f"Total Tonnes Purchased: {result.total_tonnes_purchased:,.1f}")
    print(f"Expected Delivery: {result.expected_delivery:,.1f} tonnes")
    print(f"Correlation Score (C): {result.correlation_score:.4f}")

    print("\nHHI by Factor:")
    for factor, hhi in result.hhi_by_factor.items():
        weight = CORRELATION_WEIGHTS.get(factor, 0)
        print(f"  {factor:15s}: {hhi:.4f} (weight: {weight})")

    print(f"\nTop {top_n} Projects by Tonnes:")
    print(f"{'Credit ID':<12} {'Project Name':<40} {'Country':<20} {'Tonnes':>10} {'Price':>8} {'Survival':>8}")
    print("-" * 100)

    sorted_selected = sorted(result.selected_projects, key=lambda x: x[1], reverse=True)
    for project, tonnes in sorted_selected[:top_n]:
        print(f"{project.credit_id:<12} {project.project_name[:38]:<40} {project.country[:18]:<20} "
              f"{tonnes:>10,.1f} ${project.price_usd_per_t:>7.2f} {project.survival:>7.3f}")

    print(f"\nTotal projects selected: {len(result.selected_projects)}")

    # Top concentrations
    print("\nTop Concentrations by Factor:")
    for factor in ['developer', 'country', 'project_type', 'registry']:
        shares = result.group_concentrations.get(factor, {})
        if shares:
            top = sorted(shares.items(), key=lambda x: x[1], reverse=True)[:3]
            print(f"  {factor}:")
            for group, share in top:
                print(f"    {group[:40]:<40} {share:.2%}")


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    # Run base optimization with reserve_multiplier = 1.0 to target ~100,000 tonnes
    result = run_optimization(
        data_path="carbon_credits_challenge - Data.xlsx",
        budget=1_000_000,
        target_tonnes=100_000,
        reserve_multiplier=1.00,
        project_cap=10_000,
        c_max=0.15,
        verbose=False  # Suppress iteration output
    )

    print_portfolio_summary(result)