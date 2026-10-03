import { HeatmapBar, CarbonRule, Field } from './UI';

const FACTOR_CONFIG = {
  developer: { label: 'DEVELOPER', cap: 0.10, color: '#FF6B35' },
  country: { label: 'COUNTRY', cap: 0.20, color: '#00D4AA' },
  type: { label: 'TYPE', cap: 0.25, color: '#FFD600' },
  registry: { label: 'REGISTRY', cap: 0.35, color: '#BB86FC' },
};

export default function ConcentrationHeatmap({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xs tracking-widest uppercase text-coupon-header">
        Concentration Heatmap
      </h3>

      {Object.entries(FACTOR_CONFIG).map(([factor, config]) => (
        <section key={factor} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs tracking-wider uppercase text-coupon-header">
              {config.label}
            </span>
            <span className="font-mono text-xs-mono text-coupon-ink">
              HHI: {data.hhi[factor].toFixed(4)}
            </span>
          </div>

          <div className="space-y-1.5">
            {data[factor]?.map((group, idx) => (
              <HeatmapBar
                key={`${factor}-${group.name}`}
                share={group.share}
                cap={config.cap}
                label={group.name.length > 12 ? group.name.slice(0, 12) + '…' : group.name}
              />
            ))}
          </div>

          {factor !== 'registry' && <CarbonRule className="my-2" />}
        </section>
      ))}

      {/* HHI Summary */}
      <div className="pt-2 border-t border-carbon-deep">
        <h4 className="font-display text-xs tracking-widest uppercase text-coupon-header mb-2">
          HHI Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-2 text-center">
          {Object.entries(data.hhi).map(([factor, hhi]) => (
            <div key={factor} className="p-2 bg-coupon-ground border border-carbon-rule rounded">
              <div className="font-display text-xs tracking-wider uppercase text-coupon-header">
                {factor.toUpperCase()}
              </div>
              <div className="font-mono text-lg font-semibold text-coupon-ink">
                {hhi.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}