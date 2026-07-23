import { ICON_REGISTRY } from "../lib/iconRegistry";

export function IconPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (key: string) => void;
}) {
  return (
    <div className="icon-picker">
      {ICON_REGISTRY.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          className={`icon-picker__option ${value === key ? "icon-picker__option--active" : ""}`}
          onClick={() => onChange(key)}
          aria-label={label}
          title={label}
        >
          <Icon size={20} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}
