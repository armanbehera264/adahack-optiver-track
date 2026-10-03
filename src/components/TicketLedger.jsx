import { CarbonRule } from './UI';

const COLUMNS = [
  { key: 'id', header: 'ID', width: 'w-16' },
  { key: 'name', header: 'PROJECT', width: 'w-48 truncate' },
  { key: 'country', header: 'COUNTRY', width: 'w-40' },
  { key: 'developer', header: 'DEV', width: 'w-24 truncate' },
  { key: 'type', header: 'TYPE', width: 'w-14' },
  { key: 'registry', header: 'REG', width: 'w-20 truncate' },
  { key: 'tonnes', header: 'TONNES', width: 'w-20', align: 'right' },
  { key: 'price', header: 'PX', width: 'w-16', align: 'right' },
  { key: 'survival', header: 'SURV', width: 'w-14', align: 'right' },
  { key: 'cost', header: 'COST', width: 'w-24', align: 'right' },
];

export default function TicketLedger({ projects }) {
  return (
    <div className="font-mono text-base-mono">
      {/* Header Row */}
      <div className="grid grid-cols-[80px_192px_160px_96px_56px_80px_80px_64px_56px_96px] gap-2 px-3 py-2 bg-coupon-ground sticky top=0 border-b border-carbon-deep z-10 font-display text-xs tracking-wider uppercase text-coupon-header">
        {COLUMNS.map(col => (
          <div key={col.key} className={`${col.width} ${col.align || ''} truncate`}>
            {col.header}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      <div className="divide-y divide-carbon-rule">
        {projects.map((project, index) => (
          <TicketRow key={project.id} project={project} index={index} />
        ))}

        {/* Total Row */}
        <div className="grid grid-cols-[80px_192px_160px_96px_56px_80px_80px_64px_56px_96px] gap-2 px-3 py-3 bg-coupon-ground border-t-2 border-carbon-deep font-display text-xs tracking-wider uppercase text-coupon-header">
          <div className="w-16" />
          <div className="w-48 truncate font-semibold">TOTAL</div>
          <div className="w-12" />
          <div className="w-24" />
          <div className="w-14" />
          <div className="w-20" />
          <div className="w-20 text-right font-mono text-base-mono">
            {projects.reduce((sum, p) => sum + p.tonnes, 0).toLocaleString()}
          </div>
          <div className="w-16" />
          <div className="w-14" />
          <div className="w-24 text-right font-mono text-base-mono font-semibold">
            ${projects.reduce((sum, p) => sum + p.cost, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketRow({ project, index }) {
  const survivalPct = (project.survival * 100).toFixed(1);
  const delivery = project.tonnes * project.survival;

  // Determine row background based on concentration risk
  const isHighConcentration = project.survival < 0.7;

  return (
    <div
      className={`ticket-row grid grid-cols-[80px_192px_160px_96px_56px_80px_80px_64px_56px_96px] gap-2 ${isHighConcentration ? 'bg-coupon-void/5' : ''}`}
      style={{
        backgroundImage: index % 2 === 0
          ? 'linear-gradient(90deg, transparent 99%, var(--coupon-rule) 100%)'
          : 'none',
      }}
    >
      <div className="w-16 text-coupon-ink font-medium">{project.id}</div>
      <div className="w-48 truncate text-coupon-carbon" title={project.name}>
        {project.name}
      </div>
      <div className="w-40 truncate text-coupon-header font-medium" title={project.countryName}>{project.countryName}</div>
      <div className="w-24 truncate text-coupon-ink">{project.developer}</div>
      <div className="w-14 text-coupon-header">{project.type}</div>
      <div className="w-20 truncate text-coupon-ink">{project.registry}</div>
      <div className="w-20 text-right text-coupon-ink">{project.tonnes.toLocaleString()}</div>
      <div className="w-16 text-right text-coupon-ink">${project.price.toFixed(2)}</div>
      <div className={`w-14 text-right ${project.survival >= 0.9 ? 'text-coupon-verified' : project.survival >= 0.7 ? 'text-coupon-amber' : 'text-coupon-void'}`}>
        {survivalPct}%
      </div>
      <div className="w-24 text-right text-coupon-ink font-medium">
        ${project.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}