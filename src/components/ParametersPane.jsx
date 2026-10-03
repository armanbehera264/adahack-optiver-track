import { useState } from 'react';
import { Checkbox, Select, Slider, Button, Field, CarbonRule } from './UI';
import { COUNTRY_NAMES } from '../data/projects';

const RATING_OPTIONS = [
  { value: 'AAA', label: 'AAA' },
  { value: 'AA', label: 'AA' },
  { value: 'A', label: 'A' },
  { value: 'BBB', label: 'BBB' },
  { value: 'BB', label: 'BB' },
  { value: 'B', label: 'B' },
  { value: 'CCC', label: 'CCC' },
  { value: 'Unrated', label: 'Unrated' },
];

export default function ParametersPane({
  filters,
  setFilters,
  params,
  setParams,
  allCountries,
  allDevelopers,
  allRatings,
  isOptimizing,
  onOptimize,
  filteredCount,
}) {
  const [countrySearch, setCountrySearch] = useState('');
  const [developerSearch, setDeveloperSearch] = useState('');

  const filteredCountries = allCountries.filter(c =>
    (COUNTRY_NAMES[c] || c).toLowerCase().includes(countrySearch.toLowerCase())
  );
  const filteredDevelopers = allDevelopers.filter(d =>
    d.toLowerCase().includes(developerSearch.toLowerCase())
  );

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const values = current.values.includes(value)
        ? current.values.filter(v => v !== value)
        : [...current.values, value];
      return { ...prev, [type]: { ...current, values } };
    });
  };

  const setFilterMode = (type, mode) => {
    setFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], mode, values: [] },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xs tracking-widest uppercase text-coupon-header">
            Filters
          </h2>
          <span className="font-mono text-xs-mono text-coupon-ink">
            {filteredCount} projects
          </span>
        </div>

        {/* Country Filter */}
        <Field label="Countries">
          <div className="flex gap-2 mb-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={filters.countries.mode === 'whitelist'}
                onChange={() => setFilterMode('countries', 'whitelist')}
              />
              <span className="font-mono text-xs-mono text-coupon-ink">Whitelist</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={filters.countries.mode === 'blacklist'}
                onChange={() => setFilterMode('countries', 'blacklist')}
                variant="void"
              />
              <span className="font-mono text-xs-mono text-coupon-ink">Blacklist</span>
            </label>
          </div>
          <input
            type="text"
            placeholder="Filter countries..."
            value={countrySearch}
            onChange={e => setCountrySearch(e.target.value)}
            className="select-perforated w-full mb-2"
          />
          <div className="flex flex-wrap gap-1.5 max-h-96 overflow-y-auto scrollbar-thin">
            {filteredCountries.map(country => (
              <label
                key={country}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-coupon-ground rounded cursor-pointer hover:bg-coupon-ground/80 transition-colors"
              >
                <Checkbox
                  checked={filters.countries.values.includes(country)}
                  onChange={() => toggleFilter('countries', country)}
                />
                <span className="font-mono text-xs-mono text-coupon-ink">{COUNTRY_NAMES[country] || country}</span>
              </label>
            ))}
          </div>
          {filters.countries.values.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.countries.values.map(v => (
                <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-coupon-ground rounded text-xs-mono">
                  {COUNTRY_NAMES[v] || v}
                  <button
                    onClick={() => toggleFilter('countries', v)}
                    className="text-coupon-ink hover:text-coupon-void"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <CarbonRule className="my-4" />

        {/* Developer Filter */}
        <Field label="Developers">
          <div className="flex gap-2 mb-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={filters.developers.mode === 'whitelist'}
                onChange={() => setFilterMode('developers', 'whitelist')}
              />
              <span className="font-mono text-xs-mono text-coupon-ink">Whitelist</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={filters.developers.mode === 'blacklist'}
                onChange={() => setFilterMode('developers', 'blacklist')}
                variant="void"
              />
              <span className="font-mono text-xs-mono text-coupon-ink">Blacklist</span>
            </label>
          </div>
          <input
            type="text"
            placeholder="Filter developers..."
            value={developerSearch}
            onChange={e => setDeveloperSearch(e.target.value)}
            className="select-perforated w-full mb-2"
          />
          <div className="flex flex-wrap gap-1.5 max-h-96 overflow-y-auto scrollbar-thin">
            {filteredDevelopers.map(dev => (
              <label
                key={dev}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-coupon-ground rounded cursor-pointer hover:bg-coupon-ground/80 transition-colors"
              >
                <Checkbox
                  checked={filters.developers.values.includes(dev)}
                  onChange={() => toggleFilter('developers', dev)}
                />
                <span className="font-mono text-xs-mono text-coupon-ink">{dev}</span>
              </label>
            ))}
          </div>
          {filters.developers.values.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.developers.values.map(v => (
                <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-coupon-ground rounded text-xs-mono">
                  {v}
                  <button
                    onClick={() => toggleFilter('developers', v)}
                    className="text-coupon-ink hover:text-coupon-void"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <CarbonRule className="my-4" />

        {/* Rating Filter */}
        <Field label="Minimum Credit Rating">
          <Select
            value={filters.minRating}
            onChange={e => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
            options={RATING_OPTIONS}
          />
        </Field>
      </section>

      {/* Model Parameters */}
      <section>
        <h2 className="font-display text-xs tracking-widest uppercase text-coupon-header mb-3">
          Model Parameters
        </h2>

        <Field label="Max per Project (tonnes)">
          <input
            type="number"
            value={params.projectCap}
            onChange={e => setParams(prev => ({ ...prev, projectCap: Number(e.target.value) }))}
            className="select-perforated w-full"
            min="1000"
            max="100000"
            step="1000"
          />
        </Field>

        <CarbonRule className="my-3" />

        <Field label="Target Delivery (tonnes)">
          <input
            type="number"
            value={params.targetDelivery}
            onChange={e => setParams(prev => ({ ...prev, targetDelivery: Number(e.target.value) }))}
            className="select-perforated w-full"
            min="50000"
            max="200000"
            step="5000"
          />
        </Field>

        <CarbonRule className="my-3" />

        <Field label="Concentration Limit (C_max)">
          <Slider
            value={params.cMax}
            onChange={v => setParams(prev => ({ ...prev, cMax: v }))}
            min={0.05}
            max={0.30}
            step={0.01}
            format={v => v.toFixed(2)}
          />
          <div className="flex justify-between text-xs-mono text-coupon-header mt-1">
            <span>0.05</span>
            <span>0.30</span>
          </div>
        </Field>

        <CarbonRule className="my-3" />

        {/* Policy Weights */}
        <div className="space-y-3">
          <Field label="Developer Weight (α_dev)">
            <Slider
              value={params.policyWeights.developer}
              onChange={v => setParams(prev => ({ ...prev, policyWeights: { ...prev.policyWeights, developer: v } }))}
              min={0}
              max={1}
              step={0.05}
            />
          </Field>
          <Field label="Country Weight (α_cty)">
            <Slider
              value={params.policyWeights.country}
              onChange={v => setParams(prev => ({ ...prev, policyWeights: { ...prev.policyWeights, country: v } }))}
              min={0}
              max={1}
              step={0.05}
            />
          </Field>
          <Field label="Type Weight (α_type)">
            <Slider
              value={params.policyWeights.type}
              onChange={v => setParams(prev => ({ ...prev, policyWeights: { ...prev.policyWeights, type: v } }))}
              min={0}
              max={1}
              step={0.05}
            />
          </Field>
          <Field label="Registry Weight (α_reg)">
            <Slider
              value={params.policyWeights.registry}
              onChange={v => setParams(prev => ({ ...prev, policyWeights: { ...prev.policyWeights, registry: v } }))}
              min={0}
              max={1}
              step={0.05}
            />
          </Field>
        </div>

        <CarbonRule className="my-4" />

        {/* Individual Caps */}
        <h3 className="font-display text-xs tracking-widest uppercase text-coupon-header mb-2">
          Individual Group Caps
        </h3>
        <div className="space-y-3">
          <Field label="Developer Cap">
            <Slider
              value={params.individualCaps.developer}
              onChange={v => setParams(prev => ({ ...prev, individualCaps: { ...prev.individualCaps, developer: v } }))}
              min={0.05}
              max={0.50}
              step={0.01}
              format={v => (v * 100).toFixed(0) + '%'}
            />
          </Field>
          <Field label="Country Cap">
            <Slider
              value={params.individualCaps.country}
              onChange={v => setParams(prev => ({ ...prev, individualCaps: { ...prev.individualCaps, country: v } }))}
              min={0.05}
              max={0.50}
              step={0.01}
              format={v => (v * 100).toFixed(0) + '%'}
            />
          </Field>
          <Field label="Type Cap">
            <Slider
              value={params.individualCaps.type}
              onChange={v => setParams(prev => ({ ...prev, individualCaps: { ...prev.individualCaps, type: v } }))}
              min={0.05}
              max={0.50}
              step={0.01}
              format={v => (v * 100).toFixed(0) + '%'}
            />
          </Field>
          <Field label="Registry Cap">
            <Slider
              value={params.individualCaps.registry}
              onChange={v => setParams(prev => ({ ...prev, individualCaps: { ...prev.individualCaps, registry: v } }))}
              min={0.05}
              max={0.50}
              step={0.01}
              format={v => (v * 100).toFixed(0) + '%'}
            />
          </Field>
        </div>
      </section>

      {/* Shock Parameters */}
      <section>
        <h2 className="font-display text-xs tracking-widest uppercase text-coupon-header mb-3">
          Shock Parameters
        </h2>

        <div className="space-y-3">
          <Field label="Developer Shock Uplift (pp)">
            <Slider
              value={params.shockDeltas.developer}
              onChange={v => setParams(prev => ({ ...prev, shockDeltas: { ...prev.shockDeltas, developer: v } }))}
              min={0}
              max={0.30}
              step={0.01}
              format={v => (v * 100).toFixed(0) + 'pp'}
            />
          </Field>
          <Field label="Country Shock Uplift (pp)">
            <Slider
              value={params.shockDeltas.country}
              onChange={v => setParams(prev => ({ ...prev, shockDeltas: { ...prev.shockDeltas, country: v } }))}
              min={0}
              max={0.30}
              step={0.01}
              format={v => (v * 100).toFixed(0) + 'pp'}
            />
          </Field>
          <Field label="Registry Shock Uplift (pp)">
            <Slider
              value={params.shockDeltas.registry}
              onChange={v => setParams(prev => ({ ...prev, shockDeltas: { ...prev.shockDeltas, registry: v } }))}
              min={0}
              max={0.30}
              step={0.01}
              format={v => (v * 100).toFixed(0) + 'pp'}
            />
          </Field>
          <Field label="Type Shock Uplift (pp)">
            <Slider
              value={params.shockDeltas.type}
              onChange={v => setParams(prev => ({ ...prev, shockDeltas: { ...prev.shockDeltas, type: v } }))}
              min={0}
              max={0.30}
              step={0.01}
              format={v => (v * 100).toFixed(0) + 'pp'}
            />
          </Field>
          <Field label="Half-Life (days)">
            <Slider
              value={params.halfLifeDays}
              onChange={v => setParams(prev => ({ ...prev, halfLifeDays: v }))}
              min={30}
              max={720}
              step={30}
              format={v => v + 'd'}
            />
          </Field>
        </div>
      </section>

      {/* Run Button */}
      <Button onClick={onOptimize} disabled={isOptimizing} className="w-full">
        {isOptimizing ? 'OPTIMIZING...' : 'RUN OPTIMIZATION'}
      </Button>
    </div>
  );
}