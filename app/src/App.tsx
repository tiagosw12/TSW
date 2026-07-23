import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CalendarScreen } from "./screens/CalendarScreen";

export function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="splash">carregando…</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginScreen />} />
      <Route path="/" element={session ? <HomeScreen /> : <Navigate to="/login" replace />} />
      <Route path="/calendario" element={session ? <CalendarScreen /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
