import type { ReactNode } from "react";

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__header">
          <h2 className="sheet__title">{title}</h2>
          <button className="sheet__close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
