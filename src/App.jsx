import { useState, useMemo, useEffect, useCallback } from 'react';
import { PROJECTS, DEFAULT_PARAMS, MODEL_VARIANTS, optimizePortfolio, calculateSurvival } from './data/projects';
import ParametersPane from './components/ParametersPane';
import ResultsPane from './components/ResultsPane';
import ModelSelector from './components/ModelSelector';
import ConcentrationHeatmap from './components/ConcentrationHeatmap';
import { Header, Checkbox, Select, Slider, Button } from './components/UI';

function App() {
  // Filters state
  const [filters, setFilters] = useState({
    countries: { mode: 'whitelist', values: [] },
    developers: { mode: 'whitelist', values: [] },
    minRating: 'BBB',
  });

  // Parameters state
  const [params, setParams] = useState({ ...DEFAULT_PARAMS });

  // Model variant state
  const [activeModel, setActiveModel] = useState('correlation');

  // Optimization results
  const [results, setResults] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [stampAnimation, setStampAnimation] = useState(false);

  // Get unique filter options
  const allCountries = useMemo(() => [...new Set(PROJECTS.map(p => p.country))].sort(), []);
  const allDevelopers = useMemo(() => [...new Set(PROJECTS.map(p => p.developer))].sort(), []);
  const allRatings = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'Unrated'];

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      // Country filter
      if (filters.countries.values.length > 0) {
        if (filters.countries.mode === 'whitelist' && !filters.countries.values.includes(p.country)) return false;
        if (filters.countries.mode === 'blacklist' && filters.countries.values.includes(p.country)) return false;
      }
      // Developer filter
      if (filters.developers.values.length > 0) {
        if (filters.developers.mode === 'whitelist' && !filters.developers.values.includes(p.developer)) return false;
        if (filters.developers.mode === 'blacklist' && filters.developers.values.includes(p.developer)) return false;
      }
      // Rating filter
      const ratingIndex = allRatings.indexOf(p.rating);
      const minRatingIndex = allRatings.indexOf(filters.minRating);
      if (ratingIndex > minRatingIndex) return false; // Higher index = lower rating
      return true;
    });
  }, [PROJECTS, filters, allRatings]);

  // Run optimization
  const runOptimization = useCallback(async () => {
    setIsOptimizing(true);
    setStampAnimation(false);

    // Simulate async optimization
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = optimizePortfolio(filteredProjects, params);
    setResults(result);
    setIsOptimizing(false);

    // Trigger stamp animation
    setTimeout(() => setStampAnimation(true), 100);
  }, [filteredProjects, params]);

  // Auto-run on param/filter change (debounced)
  useEffect(() => {
    const timer = setTimeout(runOptimization, 300);
    return () => clearTimeout(timer);
  }, [runOptimization]);

  // Get concentration data for heatmap
  const concentrationData = useMemo(() => {
    if (!results) return null;
    const { selectedProjects, concentration } = results;
    return {
      developer: Object.entries(
        selectedProjects.reduce((acc, p) => {
          acc[p.developer] = (acc[p.developer] || 0) + p.delivery;
          return acc;
        }, {})
      ).map(([name, delivery]) => ({ name, delivery, share: delivery / results.totalDelivery })).sort((a, b) => b.share - a.share).slice(0, 8),
      country: Object.entries(
        selectedProjects.reduce((acc, p) => {
          acc[p.country] = (acc[p.country] || 0) + p.delivery;
          return acc;
        }, {})
      ).map(([name, delivery]) => ({ name, delivery, share: delivery / results.totalDelivery })).sort((a, b) => b.share - a.share).slice(0, 8),
      type: Object.entries(
        selectedProjects.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + p.delivery;
          return acc;
        }, {})
      ).map(([name, delivery]) => ({ name, delivery, share: delivery / results.totalDelivery })).sort((a, b) => b.share - a.share).slice(0, 8),
      registry: Object.entries(
        selectedProjects.reduce((acc, p) => {
          acc[p.registry] = (acc[p.registry] || 0) + p.delivery;
          return acc;
        }, {})
      ).map(([name, delivery]) => ({ name, delivery, share: delivery / results.totalDelivery })).sort((a, b) => b.share - a.share).slice(0, 8),
      hhi: concentration,
    };
  }, [results]);

  return (
    <div className="min-h-screen bg-coupon-ground">
      {/* Header */}
      <header className="border-b border-carbon-deep bg-coupon-ground/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm tracking-widest uppercase text-coupon-header">
              FORM CB-PM
            </span>
            <span className="w-px h-6" style={{ background: 'var(--coupon-rule)' }} />
            <span className="font-mono text-xs text-coupon-ink">
              Correlation Budget Portfolio Model
            </span>
          </div>
          <ModelSelector
            activeModel={activeModel}
            onChange={setActiveModel}
            variants={MODEL_VARIANTS}
          />
          <div className="font-mono text-xs text-coupon-ink">
            As of {new Date().toLocaleString()}
          </div>
        </div>
      </header>

      {/* Main Two-Pane Layout */}
      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">
        {/* LEFT PANE: Parameters */}
        <aside className="lg:w-[380px] flex-shrink-0 p-4 border-r border-carbon-rule lg:border-r-0 lg:border-carbon-rule overflow-y-auto">
          <ParametersPane
            filters={filters}
            setFilters={setFilters}
            params={params}
            setParams={setParams}
            allCountries={allCountries}
            allDevelopers={allDevelopers}
            allRatings={allRatings}
            isOptimizing={isOptimizing}
            onOptimize={runOptimization}
            filteredCount={filteredProjects.length}
          />
        </aside>

        {/* RIGHT PANE: Results */}
        <section className="flex-1 flex flex-col min-w-0 p-4 overflow-hidden">
          <ResultsPane
            results={results}
            concentrationData={concentrationData}
            activeModel={activeModel}
            stampAnimation={stampAnimation}
            isOptimizing={isOptimizing}
            filteredCount={filteredProjects.length}
          />
        </section>
      </main>
    </div>
  );
}

export default App;