import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { choice, setChoice } = useTheme();

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <p className="home__eyebrow">conta</p>
          <h1 className="home__title">Perfil</h1>
        </div>
      </header>

      <div className="profile__avatar">{(user?.email?.[0] ?? "?").toUpperCase()}</div>
      <p className="profile__email">{user?.email}</p>

      <div className="form__field">
        <span>Aparência</span>
        <div className="segmented">
          {(["system", "dark", "light"] as const).map((option) => (
            <button
              key={option}
              className={`segmented__option ${choice === option ? "segmented__option--active" : ""}`}
              onClick={() => setChoice(option)}
            >
              {option === "system" ? "Sistema" : option === "dark" ? "Escuro" : "Claro"}
            </button>
          ))}
        </div>
      </div>

      <button className="button button--danger profile__signout" onClick={signOut}>
        Sair
      </button>
    </div>
  );
}
