import { CarbonRule } from './UI';

export default function ModelSelector({ activeModel, onChange, variants }) {
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