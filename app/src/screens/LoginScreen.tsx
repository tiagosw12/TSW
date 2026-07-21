import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";

export function LoginScreen() {
  const { signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    const result =
      mode === "signIn" ? await signInWithPassword(email, password) : await signUp(email, password);

    if (result) {
      setError(result);
    } else if (mode === "signUp") {
      setInfo("Conta criada. Verifique seu e-mail para confirmar o acesso.");
    }
    setSubmitting(false);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__mark">
          <svg viewBox="0 0 120 32" className="auth-card__ecg" aria-hidden="true">
            <polyline points="0,16 30,16 38,4 46,28 54,16 120,16" />
          </svg>
        </div>
        <h1 className="auth-card__title">Ficha de Estudos</h1>
        <p className="auth-card__subtitle">
          {mode === "signIn" ? "Entre para ver sua fila de prioridade." : "Crie sua conta para começar."}
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label className="form__field">
            <span>E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="form__field">
            <span>Senha</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="form__error">{error}</p>}
          {info && <p className="form__info">{info}</p>}

          <button type="submit" className="button button--primary" disabled={submitting}>
            {mode === "signIn" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          className="button button--link"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signIn" ? "Ainda não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
