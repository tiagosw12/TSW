import { BookMarked, CalendarDays, CircleUserRound, ListChecks, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

function tabClass({ isActive }: { isActive: boolean }) {
  return `tab-bar__item ${isActive ? "tab-bar__item--active" : ""}`;
}

export function TabBar({ onAddClick }: { onAddClick: () => void }) {
  return (
    <nav className="tab-bar">
      <NavLink to="/" end className={tabClass}>
        <ListChecks size={22} strokeWidth={1.75} />
        <span>Fila</span>
      </NavLink>
      <NavLink to="/calendario" className={tabClass}>
        <CalendarDays size={22} strokeWidth={1.75} />
        <span>Calendário</span>
      </NavLink>
      <button className="tab-bar__add" onClick={onAddClick} aria-label="Adicionar">
        <Plus size={26} strokeWidth={2} />
      </button>
      <NavLink to="/materias" className={tabClass}>
        <BookMarked size={22} strokeWidth={1.75} />
        <span>Matérias</span>
      </NavLink>
      <NavLink to="/perfil" className={tabClass}>
        <CircleUserRound size={22} strokeWidth={1.75} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
}
