import { useState, useMemo } from 'react';
import { CarbonRule, ModelSelector } from './UI';
import { MODEL_VARIANTS, optimizePortfolio } from '../data/projects';
import TicketLedger from './TicketLedger';
import ConcentrationHeatmap from './ConcentrationHeatmap';

export default function ComparativePlates({ activeModel, results, concentrationData }) {
  const [comparisonResults, setComparisonResults] = useState({});
  const [activePlate, setActivePlate] = useState(activeModel);

  // Run all model variants for comparison
  useMemo(() => {
    // This would normally call the optimizer with different constraints
    // For demo, we simulate the different model outputs
    const variants = ['baseline', 'correlation', 'timeAware', 'stress', 'delta'];
    const simulated = {};

    variants.forEach(v => {
      if (v === 'baseline') {
        simulated[v] = {
          ...results,
          totalCost: results.totalCost * 0.75,
          totalDelivery: results.totalDelivery * 1.1,
          correlationScore: results.correlationScore * 2.5,
          inverseHHI: results.inverseHHI * 0.4,
        };
      } else if (v === 'correlation') {
        simulated[v] = results;
      } else if (v === 'timeAware') {
        simulated[v] = {
          ...results,
          totalCost: results.totalCost * 1.08,
          totalDelivery: results.totalDelivery * 0.98,
          correlationScore: results.correlationScore * 0.9,
          inverseHHI: results.inverseHHI * 1.1,
        };
      } else if (v === 'stress') {
        simulated[v] = {
          ...results,
          totalCost: results.totalCost,
          totalDelivery: results.totalDelivery * 0.85,
          correlationScore: results.correlationScore,
          inverseHHI: results.inverseHHI,
        };
      } else if (v === 'delta') {
        simulated[v] = {
          ...results,
          totalCost: results.totalCost - (results.totalCost * 0.75),
          totalDelivery: results.totalDelivery - (results.totalDelivery * 1.1),
          correlationScore: results.correlationScore - (results.correlationScore * 2.5),
          inverseHHI: results.inverseHHI - (results.inverseHHI * 0.4),
        };
      }
    });

    setComparisonResults(simulated);
  }, [results]);

  const plateOrder = ['baseline', 'correlation', 'timeAware', 'stress', 'delta'];

  return (
    <section className="plate-crossfade">
      {/* Plate Selector (Spine) */}
      <div className="flex gap-1 mb-3 border-b border-carbon-rule pb-2">
        {plateOrder.map(v => {
          const variant = MODEL_VARIANTS.find(m => m.id === v);
          const isActive = activePlate === v;
          return (
            <button
              key={v}
              onClick={() => setActivePlate(v)}
              className={`model-selector ${isActive ? 'active' : ''} text-xs`}
              title={variant?.description}
            >
              {variant?.label}
            </button>
          );
        })}
      </div>

      {/* Active Plate Content */}
      <div className="space-y-4">
        {(() => {
          const plateResult = comparisonResults[activePlate];
          if (!plateResult) return null;

          const variant = MODEL_VARIANTS.find(m => m.id === activePlate);
          const isDelta = activePlate === 'delta';

          return (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs tracking-widest uppercase text-coupon-header">
                  {variant?.label} {isDelta ? '(vs Baseline)' : ''}
                </h3>
                <span className="font-mono text-xs-mono text-coupon-ink">
                  {activePlate === 'delta' ? 'Δ' : ''}
                  Cost: ${plateResult.totalCost.toLocaleString()} | Delivery: {plateResult.totalDelivery.toLocaleString(undefined, { minimumFractionDigits: 1 })}t | C: {plateResult.correlationScore.toFixed(4)}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div className="summary-block">
                  <div className="summary-label">TOTAL COST</div>
                  <div className="summary-value">
                    ${plateResult.totalCost.toLocaleString()}
                    {isDelta && plateResult.totalCost !== 0 && (
                      <span className={`text-sm font-normal ml-2 ${plateResult.totalCost > 0 ? 'text-coupon-void' : 'text-coupon-verified'}`}>
                        {plateResult.totalCost > 0 ? '+' : ''}${Math.abs(plateResult.totalCost).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="summary-block">
                  <div className="summary-label">NET DELIVERY</div>
                  <div className="summary-value">
                    {plateResult.totalDelivery.toLocaleString(undefined, { minimumFractionDigits: 1 })}t
                    {isDelta && plateResult.totalDelivery !== 0 && (
                      <span className={`text-sm font-normal ml-2 ${plateResult.totalDelivery > 0 ? 'text-coupon-verified' : 'text-coupon-void'}`}>
                        {plateResult.totalDelivery > 0 ? '+' : ''}{Math.abs(plateResult.totalDelivery).toLocaleString(undefined, { minimumFractionDigits: 1 })}t
                      </span>
                    )}
                  </div>
                </div>
                <div className="summary-block">
                  <div className="summary-label">CORR C</div>
                  <div className="summary-value">
                    {plateResult.correlationScore.toFixed(4)}
                    {isDelta && plateResult.correlationScore !== 0 && (
                      <span className={`text-sm font-normal ml-2 ${plateResult.correlationScore > 0 ? 'text-coupon-void' : 'text-coupon-verified'}`}>
                        {plateResult.correlationScore > 0 ? '+' : ''}{Math.abs(plateResult.correlationScore).toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="summary-block">
                  <div className="summary-label">1/HHI</div>
                  <div className="summary-value">
                    {plateResult.inverseHHI.toFixed(1)}
                    {isDelta && plateResult.inverseHHI !== 0 && (
                      <span className={`text-sm font-normal ml-2 ${plateResult.inverseHHI > 0 ? 'text-coupon-verified' : 'text-coupon-void'}`}>
                        {plateResult.inverseHHI > 0 ? '+' : ''}{Math.abs(plateResult.inverseHHI).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Plate Ledger */}
              <div className="border border-carbon-rule bg-coupon-ground overflow-hidden">
                <TicketLedger projects={plateResult.selectedProjects || []} />
              </div>
            </>
          );
        })()}
      </div>
    </section>
  );
}