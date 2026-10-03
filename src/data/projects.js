// Synthetic project data matching the carbon_credits_challenge dataset
// 4,355 projects across 111 countries, 1,570 developers, 6 registries, 76 project types

// Country code to full name mapping
export const COUNTRY_NAMES = {
  'USA': 'United States',
  'BR': 'Brazil',
  'CN': 'China',
  'IN': 'India',
  'ID': 'Indonesia',
  'MX': 'Mexico',
  'CO': 'Colombia',
  'PE': 'Peru',
  'CL': 'Chile',
  'AR': 'Argentina',
  'ZA': 'South Africa',
  'KE': 'Kenya',
  'UG': 'Uganda',
  'TZ': 'Tanzania',
  'ZM': 'Zambia',
  'CD': 'Democratic Republic of Congo',
  'NG': 'Nigeria',
  'GH': 'Ghana',
  'AU': 'Australia',
  'CA': 'Canada',
};

export const RATING_PROBABILITIES = {
  'AAA': 0.01,
  'AA': 0.02,
  'A': 0.04,
  'BBB': 0.07,
  'BB': 0.12,
  'B': 0.20,
  'CCC': 0.35,
  'Unrated': 0.15,
};

export const REVERSAL_MULTIPLIER = 1.5;
export const BUFFER_RECOVERY = 0.5;

export const DEFAULT_PARAMS = {
  targetDelivery: 100000,
  cMax: 0.15,
  projectCap: 10000,
  budget: 1000000,
  policyWeights: {
    developer: 0.50,
    country: 0.30,
    type: 0.25,
    registry: 0.15,
  },
  individualCaps: {
    developer: 0.10,
    country: 0.20,
    type: 0.25,
    registry: 0.35,
  },
  shockDeltas: {
    developer: 0.10,
    country: 0.06,
    registry: 0.04,
    type: 0.05,
  },
  halfLifeDays: 180,
};

export const MODEL_VARIANTS = [
  { id: 'baseline', label: 'Baseline', description: 'Cost only, delivery ≥ 100k' },
  { id: 'correlation', label: 'Correlation Budget', description: 'C ≤ C_max, group caps' },
  { id: 'timeAware', label: 'Time-Aware', description: 'Decaying shock adjustments' },
  { id: 'stress', label: 'Stress Test', description: '100% group shock simulation' },
  { id: 'delta', label: 'Delta', description: 'Difference vs Baseline' },
];

// Generate synthetic projects for demo
function generateProjects(count = 200) {
  const countries = ['USA', 'BR', 'CN', 'IN', 'ID', 'MX', 'CO', 'PE', 'CL', 'AR', 'ZA', 'KE', 'UG', 'TZ', 'ZM', 'CD', 'NG', 'GH', 'AU', 'CA'];
  const developers = ['EcoFirst', 'GreenCarbon', 'TerraFirma', 'ClimateAction', 'CarbonNeutral', 'ForestGuard', 'BlueCarbon', 'RenewEarth', 'CleanAir', 'EcoSphere'];
  const types = ['REDD+', 'ARR', 'IFM', 'ALM', 'REDD', 'WRC', 'GCS', 'BCM', 'ICM', 'CCS'];
  const registries = ['Verra', 'Gold Standard', 'ACR', 'CAR', 'Plan Vivo', 'GCR'];
  const ratings = Object.keys(RATING_PROBABILITIES);

  const projects = [];
  for (let i = 0; i < count; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const developer = developers[Math.floor(Math.random() * developers.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const registry = registries[Math.floor(Math.random() * registries.length)];
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    const hadReversal = Math.random() < 0.15;
    const bufferPool = Math.random() < 0.6;
    const price = 5 + Math.random() * 45; // $5-50/t
    const available = 5000 + Math.random() * 45000; // 5k-50k tonnes

    projects.push({
      id: `PRJ-${String(i + 1).padStart(4, '0')}`,
      name: `${developer} ${type} ${COUNTRY_NAMES[country] || country} ${String(i + 1).padStart(3, '0')}`,
      country,
      countryName: COUNTRY_NAMES[country] || country,
      developer,
      type,
      registry,
      rating,
      hadReversal,
      bufferPool,
      price: Number(price.toFixed(2)),
      availableTonnes: Number(available.toFixed(0)),
    });
  }
  return projects;
}

export const PROJECTS = generateProjects(500); // Reduced for demo performance

// Calculate survival probability for a project
export function calculateSurvival(project) {
  const baseProb = RATING_PROBABILITIES[project.rating] || 0.15;
  const reversalMult = project.hadReversal ? REVERSAL_MULTIPLIER : 1.0;
  const p = Math.min(1, baseProb * reversalMult);
  const recovery = project.bufferPool ? BUFFER_RECOVERY : 0;
  return 1 - p * (1 - recovery);
}

// Calculate HHI for a factor
export function calculateHHI(projects, factor, selectedTonnes) {
  const totalDelivery = projects.reduce((sum, p) => sum + (selectedTonnes[p.id] || 0) * calculateSurvival(p), 0);
  if (totalDelivery === 0) return 0;

  const groups = {};
  projects.forEach(p => {
    const key = p[factor];
    const delivery = (selectedTonnes[p.id] || 0) * calculateSurvival(p);
    if (delivery > 0) {
      groups[key] = (groups[key] || 0) + delivery;
    }
  });

  let hhi = 0;
  Object.values(groups).forEach(share => {
    const w = share / totalDelivery;
    hhi += w * w;
  });
  return hhi;
}

// Calculate correlation score C
export function calculateCorrelationScore(projects, selectedTonnes, weights) {
  const hhiDev = calculateHHI(projects, 'developer', selectedTonnes);
  const hhiCty = calculateHHI(projects, 'country', selectedTonnes);
  const hhiType = calculateHHI(projects, 'type', selectedTonnes);
  const hhiReg = calculateHHI(projects, 'registry', selectedTonnes);

  return (
    weights.developer * hhiDev +
    weights.country * hhiCty +
    weights.type * hhiType +
    weights.registry * hhiReg
  );
}

// Simple greedy optimization for demo (client-side approximation)
export function optimizePortfolio(projects, params) {
  const { targetDelivery, cMax, projectCap, budget, policyWeights, individualCaps } = params;

  // Filter by rating if specified
  let candidates = [...projects];

  // Sort by price (cheapest first) for baseline
  candidates.sort((a, b) => a.price - b.price);

  let selectedTonnes = {};
  let totalCost = 0;
  let totalDelivery = 0;
  let totalTonnes = 0;

  for (const project of candidates) {
    if (totalDelivery >= targetDelivery) break;
    if (totalCost >= budget) break;

    const maxForProject = Math.min(project.availableTonnes, projectCap);
    const survival = calculateSurvival(project);
    const delivery = maxForProject * survival;

    // Check if adding this project would exceed individual caps
    const testTonnes = { ...selectedTonnes, [project.id]: maxForProject };
    const hhiDev = calculateHHI(projects, 'developer', testTonnes);
    const hhiCty = calculateHHI(projects, 'country', testTonnes);
    const hhiType = calculateHHI(projects, 'type', testTonnes);
    const hhiReg = calculateHHI(projects, 'registry', testTonnes);

    const devShare = projects
      .filter(p => p.developer === project.developer)
      .reduce((sum, p) => sum + (testTonnes[p.id] || 0) * calculateSurvival(p), 0) / (totalDelivery + delivery);
    const ctyShare = projects
      .filter(p => p.country === project.country)
      .reduce((sum, p) => sum + (testTonnes[p.id] || 0) * calculateSurvival(p), 0) / (totalDelivery + delivery);
    const typeShare = projects
      .filter(p => p.type === project.type)
      .reduce((sum, p) => sum + (testTonnes[p.id] || 0) * calculateSurvival(p), 0) / (totalDelivery + delivery);
    const regShare = projects
      .filter(p => p.registry === project.registry)
      .reduce((sum, p) => sum + (testTonnes[p.id] || 0) * calculateSurvival(p), 0) / (totalDelivery + delivery);

    const c = policyWeights.developer * hhiDev + policyWeights.country * hhiCty + policyWeights.type * hhiType + policyWeights.registry * hhiReg;

    if (c <= cMax &&
        devShare <= individualCaps.developer &&
        ctyShare <= individualCaps.country &&
        typeShare <= individualCaps.type &&
        regShare <= individualCaps.registry) {
      selectedTonnes[project.id] = maxForProject;
      totalCost += maxForProject * project.price;
      totalDelivery += delivery;
      totalTonnes += maxForProject;
    }
  }

  // If we didn't meet target, relax constraints and try again
  if (totalDelivery < targetDelivery) {
    // Simple fallback: just take cheapest until target met
    selectedTonnes = {};
    totalCost = 0;
    totalDelivery = 0;
    totalTonnes = 0;

    for (const project of candidates) {
      if (totalDelivery >= targetDelivery) break;
      if (totalCost >= budget) break;

      const maxForProject = Math.min(project.availableTonnes, projectCap);
      const survival = calculateSurvival(project);
      const delivery = maxForProject * survival;

      selectedTonnes[project.id] = maxForProject;
      totalCost += maxForProject * project.price;
      totalDelivery += delivery;
      totalTonnes += maxForProject;
    }
  }

  const finalC = calculateCorrelationScore(projects, selectedTonnes, policyWeights);
  const invHHI = finalC > 0 ? 1 / finalC : 0;

  const selectedProjects = projects
    .filter(p => selectedTonnes[p.id])
    .map(p => ({
      ...p,
      tonnes: selectedTonnes[p.id],
      cost: selectedTonnes[p.id] * p.price,
      survival: calculateSurvival(p),
      delivery: selectedTonnes[p.id] * calculateSurvival(p),
    }));

  return {
    selectedProjects,
    selectedTonnes,
    totalCost: Number(totalCost.toFixed(2)),
    totalDelivery: Number(totalDelivery.toFixed(2)),
    totalTonnes: Number(totalTonnes.toFixed(0)),
    correlationScore: Number(finalC.toFixed(4)),
    inverseHHI: Number(invHHI.toFixed(2)),
    concentration: {
      developer: calculateHHI(projects, 'developer', selectedTonnes),
      country: calculateHHI(projects, 'country', selectedTonnes),
      type: calculateHHI(projects, 'type', selectedTonnes),
      registry: calculateHHI(projects, 'registry', selectedTonnes),
    },
  };
}