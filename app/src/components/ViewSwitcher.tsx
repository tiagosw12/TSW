import { NavLink } from "react-router-dom";

export function ViewSwitcher() {
  return (
    <div className="segmented view-switcher">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `segmented__option ${isActive ? "segmented__option--active" : ""}`}
      >
        Fila de hoje
      </NavLink>
      <NavLink
        to="/calendario"
        className={({ isActive }) => `segmented__option ${isActive ? "segmented__option--active" : ""}`}
      >
        Calendário
      </NavLink>
    </div>
  );
}
