import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import WeeklyGuide from "./pages/WeeklyGuide";
import ProtectedRoute from "./components/ProtectedRoute";
import Symptoms from "./pages/Symptoms";
import Appointments from "./pages/Appointments";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/setup" element={<ProtectedRoute>
          <ProfileSetup />
        </ProtectedRoute>
        }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/weekly-guide"
          element={
            <ProtectedRoute>
              <WeeklyGuide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/symptoms"
          element={
            <ProtectedRoute>
              <Symptoms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}