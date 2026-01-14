// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerification from "./pages/OTPVerification";

// Face Recognition Pages
import FaceEnroll from "./pages/FaceEnroll";
import FacePay from "./pages/FacePay";

// User Pages
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import History from "./pages/History";

// Admin
import AdminDashboard from "./pages/AdminDashboard";

/* ------------------------------------------
   Protected Routes – User must be logged in
------------------------------------------ */
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

/* ------------------------------------------
   MFA Route – Requires tempToken (after OTP)
------------------------------------------ */
function MFARoute({ children }) {
  const { tempToken } = useAuth();
  return tempToken ? children : <Navigate to="/login" replace />;
}

/* ------------------------------------------
   Dashboard Layout Wrapper
   (Good for Tailwind + MUI sidebars later)
------------------------------------------ */
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Placeholder for Sidebar / Header UI later */}
      <div className="max-w-5xl mx-auto py-6 px-4">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ---------------- AUTH ---------------- */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* OTP Step (requires tempToken) */}
      <Route
        path="/otp/verify"
        element={
          <MFARoute>
            <OTPVerification />
          </MFARoute>
        }
      />

      {/* ---------------- FACE ---------------- */}
      <Route
        path="/face-enroll"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FaceEnroll />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/face-pay"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FacePay />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ---------------- USER PAGES ---------------- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Payment />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <History />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ---------------- ADMIN ---------------- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
