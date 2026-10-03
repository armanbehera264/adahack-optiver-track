import { forwardRef } from 'react';

// Header component
export function Header({ children, className = '' }) {
  return (
    <header className={`border-b border-carbon-deep px-4 py-3 ${className}`}>
      {children}
    </header>
  );
}

// Checkbox with stamp styling
export const Checkbox = forwardRef(function Checkbox({
  checked,
  onChange,
  variant = 'stamp', // 'stamp' | 'void'
  className = '',
  ...props
}, ref) {
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`checkbox-stamp ${variant === 'void' ? 'checkbox-void' : ''} ${className}`}
      {...props}
    />
  );
});

// Select with perforated styling
export const Select = forwardRef(function Select({
  value,
  onChange,
  options,
  className = '',
  ...props
}, ref) {
  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      className={`select-perforated ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

// Slider with inline value display
export const Slider = forwardRef(function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  format = v => v.toFixed(2),
  className = '',
  ...props
}, ref) {
  return (
    <div className="live-slider-feedback" data-value={format(value)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`slider-track w-full ${className}`}
        {...props}
      />
    </div>
  );
});

// Primary button
export const Button = forwardRef(function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

// Field label + value pair
export function Field({ label, value, children, className = '' }) {
  return (
    <div className={className}>
      <label className="field-label">{label}</label>
      {children || <span className="field-value">{value}</span>}
    </div>
  );
}

// Summary metric block
export function SummaryBlock({ label, value, unit = '', className = '' }) {
  return (
    <div className={`summary-block ${className}`}>
      <div className="summary-label">{label}</div>
      <div className="summary-value">
        {value}
        {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
      </div>
    </div>
  );
}

// Concentration heatmap bar
export function HeatmapBar({ share, cap, label, className = '' }) {
  const pct = Math.min(100, (share / (cap || 1)) * 100);
  const isBreach = share > (cap || 1);
  const isWarn = share > (cap || 1) * 0.8;

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs-mono text-coupon-ink w-20 truncate pr-2">{label}</span>
      <div className="flex-1 h-2 rounded overflow-hidden relative" style={{ background: 'var(--coupon-rule)' }}>
        <div
          className={`heatmap-bar ${isBreach ? 'bg-coupon-void' : isWarn ? 'bg-coupon-amber' : 'bg-coupon-verified'}`}
          style={{ width: `${pct}%` }}
        />
        {cap && (
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${Math.min(100, (cap / (share / (pct / 100)))) * 100}%`,
              background: 'var(--coupon-header)'
            }}
          />
        )}
      </div>
      <span className={`font-mono text-xs-mono ${isBreach ? 'text-coupon-void' : isWarn ? 'text-coupon-amber' : 'text-coupon-verified'}`}>
        {(share * 100).toFixed(1)}%
      </span>
    </div>
  );
}

// Stamp component
export function Stamp({ status, className = '', animated = false }) {
  const statusConfig = {
    verified: { label: 'SETTLED', className: 'stamp-verified' },
    void: { label: 'VOID', className: 'stamp-void' },
    pending: { label: 'PENDING', className: 'stamp-pending' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`${config.className} ${animated ? 'stamp-animation' : ''} ${className}`}
    >
      {config.label}
    </span>
  );
}

// Model selector tabs
export function ModelSelector({ activeModel, onChange, variants }) {
  return (
    <div className="flex gap-1" role="tablist">
      {variants.map(v => (
        <button
          key={v.id}
          role="tab"
          aria-selected={activeModel === v.id}
          onClick={() => onChange(v.id)}
          className={`model-selector ${activeModel === v.id ? 'active' : ''}`}
          title={v.description}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

// Carbon rule divider
export function CarbonRule({ className = '', vertical = false }) {
  return (
    <div
      className={`${vertical ? 'h-full w-px' : 'w-full h-px'} ${className}`}
      style={{ background: 'var(--coupon-rule)' }}
    />
  );
}