import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import WeeklyGuide from "./pages/WeeklyGuide";
import Symptoms from "./pages/Symptoms";
import Appointments from "./pages/Appointments";
import Reports from "./pages/Reports";
import Medicine from "./pages/Medicine";
import Water from "./pages/Water";
import Weight from "./pages/Weight";
import KickCounter from "./pages/KickCounter";
import Contractions from "./pages/Contractions";
import DailyChecklist from "./pages/DailyChecklist";
import Trackers from "./pages/Trackers";
import Settings from "./pages/Settings";
import Reminders from "./pages/Reminders";

import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import ReminderEngine from "./components/ReminderEngine";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  return (
    <BrowserRouter>
      <div style={{ paddingBottom: "80px" }}>
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

          <Route
            path="/medicine"
            element={
              <ProtectedRoute>
                <Medicine />
              </ProtectedRoute>
            }
          />

          <Route
            path="/water"
            element={
              <ProtectedRoute>
                <Water />
              </ProtectedRoute>
            }
          />

          <Route
            path="/weight"
            element={
              <ProtectedRoute>
                <Weight />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kicks"
            element={
              <ProtectedRoute>
                <KickCounter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contractions"
            element={
              <ProtectedRoute>
                <Contractions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checklist"
            element={
              <ProtectedRoute>
                <DailyChecklist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trackers"
            element={
              <ProtectedRoute>
                <Trackers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {user && <ReminderEngine />}
      {user && <BottomNav />}
    </BrowserRouter>
  );
}