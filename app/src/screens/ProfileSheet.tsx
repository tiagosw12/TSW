import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Sheet } from "../components/Sheet";

export function ProfileSheet({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuth();
  const { choice, setChoice } = useTheme();

  return (
    <Sheet title="Perfil" onClose={onClose}>
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

      <button className="button button--danger" onClick={signOut}>
        Sair
      </button>
    </Sheet>
  );
}
