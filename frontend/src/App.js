import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HandoverDetails from "./pages/HandoverDetails";
import AddEmployee from "./pages/AddEmployee";
import MyTasks from "./pages/MyTasks";
import EditHandover from "./pages/EditHandover";
import "bootstrap/dist/css/bootstrap.min.css";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === "Admin" ? children : <Navigate to="/dashboard" />;
}

function SupervisorRoute({ children }) {
  const { user } = useAuth();
  return user?.role === "Admin" || user?.role === "Supervisor" ? (
    children
  ) : (
    <Navigate to="/dashboard" />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/handover/:id"
        element={
          <ProtectedRoute>
            <HandoverDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/handover/edit/:id"
        element={
          <SupervisorRoute>
            <EditHandover />
          </SupervisorRoute>
        }
      />
      <Route
        path="/add-employee"
        element={
          <AdminRoute>
            <AddEmployee />
          </AdminRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute>
            <MyTasks />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
