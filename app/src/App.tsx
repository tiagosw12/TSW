import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { SubjectsProvasScreen } from "./screens/SubjectsProvasScreen";
import { SubjectDetailScreen } from "./screens/SubjectDetailScreen";
import { ExamDetailScreen } from "./screens/ExamDetailScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { AppShell } from "./components/AppShell";

export function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="splash">carregando…</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginScreen />} />
      <Route element={session ? <AppShell /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/calendario" element={<CalendarScreen />} />
        <Route path="/materias" element={<SubjectsProvasScreen />} />
        <Route path="/materias/subject/:subjectId" element={<SubjectDetailScreen />} />
        <Route path="/materias/prova/:examId" element={<ExamDetailScreen />} />
        <Route path="/perfil" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
