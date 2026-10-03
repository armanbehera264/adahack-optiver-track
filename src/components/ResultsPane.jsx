import { useMemo } from 'react';
import { SummaryBlock, HeatmapBar, Stamp, CarbonRule, ModelSelector } from './UI';
import ConcentrationHeatmap from './ConcentrationHeatmap';
import TicketLedger from './TicketLedger';
import ComparativePlates from './ComparativePlates';

export default function ResultsPane({
  results,
  concentrationData,
  activeModel,
  stampAnimation,
  isOptimizing,
  filteredCount,
}) {
  if (!results) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <span className="font-display text-lg tracking-wider text-coupon-header mb-4 block">
            AWAITING PARAMETERS
          </span>
          <p className="font-mono text-base-mono text-coupon-ink">
            Configure filters and parameters, then run optimization.
          </p>
          <p className="font-mono text-xs-mono text-coupon-ink mt-2">
            {filteredCount} projects available
          </p>
        </div>
      </div>
    );
  }

  const {
    selectedProjects,
    totalCost,
    totalDelivery,
    totalTonnes,
    correlationScore,
    inverseHHI,
    concentration,
  } = results;

  // Determine if delivery target met
  const deliveryMet = totalDelivery >= 100000;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <SummaryBlock
          label="TOTAL COST"
          value={`$${totalCost.toLocaleString()}`}
        />
        <SummaryBlock
          label="NET DELIVERY"
          value={totalDelivery.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          unit="t"
        />
        <SummaryBlock
          label="GROSS TONNES"
          value={totalTonnes.toLocaleString()}
          unit="t"
        />
        <SummaryBlock
          label="CORR C"
          value={correlationScore.toFixed(4)}
          unit={`1/HHI ${inverseHHI.toFixed(1)}`}
        />
      </div>

      {/* Status Stamp */}
      <div className="flex items-center justify-between mb-4">
        <Stamp status={deliveryMet ? 'verified' : 'void'} animated={stampAnimation} />
        <div className="flex items-center gap-4 font-mono text-xs-mono text-coupon-ink">
          <span>Projects: {selectedProjects.length}</span>
          <span>Avg Price: ${(totalCost / totalTonnes).toFixed(2)}/t</span>
          <span>Survival: {(totalDelivery / totalTonnes * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Main Content: Ticket Ledger + Concentration Heatmap */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Ticket Ledger */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-xs tracking-widest uppercase text-coupon-header">
              Ticket Ledger
            </h3>
            <span className="font-mono text-xs-mono text-coupon-ink">
              {selectedProjects.length} tickets
            </span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin border border-carbon-rule bg-coupon-ground">
            <TicketLedger projects={selectedProjects} />
          </div>
        </section>

        {/* Concentration Heatmap */}
        <aside className="lg:w-80 flex-shrink-0">
          <ConcentrationHeatmap data={concentrationData} />
        </aside>
      </div>

      {/* Comparative Plates (for non-baseline models) */}
      {activeModel !== 'baseline' && (
        <>
          <CarbonRule className="my-4" />
          <ComparativePlates
            activeModel={activeModel}
            results={results}
            concentrationData={concentrationData}
          />
        </>
      )}
    </div>
  );
}