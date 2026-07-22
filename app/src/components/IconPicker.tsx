import { useState } from "react";
import { SUBJECT_ICONS, iconForKey } from "../lib/subjectIcons";

export function IconPicker({
  value,
  onChange,
  tier = "neutral",
}: {
  value: string;
  onChange: (key: string) => void;
  tier?: "critical" | "moderate" | "low" | "neutral";
}) {
  const [open, setOpen] = useState(false);
  const Icon = iconForKey(value);

  return (
    <div className="icon-picker">
      <button
        type="button"
        className={`subject-icon subject-icon--${tier} icon-picker__trigger`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Escolher ícone da matéria"
        aria-expanded={open}
      >
        <Icon size={20} strokeWidth={2.25} color="#fff" />
      </button>

      {open && (
        <div className="icon-picker__grid">
          {SUBJECT_ICONS.map(({ key, label, Icon: OptionIcon }) => (
            <button
              type="button"
              key={key}
              className={`icon-picker__option ${key === value ? "icon-picker__option--active" : ""}`}
              title={label}
              aria-label={label}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
            >
              <OptionIcon size={18} strokeWidth={2.25} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
