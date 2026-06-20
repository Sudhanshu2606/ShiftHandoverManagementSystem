import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Operator",
    department: "",
    employeeId: "",
    shiftAssigned: "Morning",
    batch: "General",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only Admin can access
  if (!user || user?.role !== "Admin") {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await register(formData);
      setMessage(`✅ Employee ${formData.name} added successfully!`);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Operator",
        department: "",
        employeeId: "",
        shiftAssigned: "Morning",
        batch: "General",
      });
      // Refresh after 2 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError("❌ Failed to add employee. Email might already exist.");
      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const quickAdd = (type) => {
    if (type === "A") {
      setFormData({
        name: "Rajesh Kumar",
        email: "rajesh.kumar@iocl.com",
        password: "Super@123",
        role: "Supervisor",
        department: "Operations",
        employeeId: "IOCL/A/001",
        shiftAssigned: "Morning",
        batch: "A",
      });
    } else if (type === "B") {
      setFormData({
        name: "Vikram Singh",
        email: "vikram.singh@iocl.com",
        password: "Super@123",
        role: "Operator",
        department: "DCU",
        employeeId: "IOCL/B/001",
        shiftAssigned: "Morning",
        batch: "B",
      });
    } else if (type === "C") {
      setFormData({
        name: "Sunil Mehta",
        email: "sunil.mehta@iocl.com",
        password: "Super@123",
        role: "Operator",
        department: "Laboratory",
        employeeId: "IOCL/C/001",
        shiftAssigned: "General",
        batch: "C",
      });
    } else if (type === "General") {
      setFormData({
        name: "Ramesh Chand",
        email: "ramesh.c@iocl.com",
        password: "Op@123",
        role: "Worker",
        department: "CDU",
        employeeId: "IOCL/G/001",
        shiftAssigned: "Morning",
        batch: "General",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-orange-700 to-red-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl w-10 h-10 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">IOCL</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Add New Employee</h1>
            <p className="text-sm text-orange-200">
              Register new employee to the system
            </p>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-orange-600 mb-4 hover:underline flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Register New Employee
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Fill in the details below to add a new employee
          </p>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter employee full name"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="employee@iocl.com"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Admin@123 / Super@123 / Op@123"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Suggested: Admin@123 for Admins, Super@123 for
                Supervisors/Operators, Op@123 for Workers
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Admin">👑 Admin</option>
                <option value="Supervisor">👔 Supervisor</option>
                <option value="Operator">🔧 Operator</option>
                <option value="Worker">🛠️ Worker</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Department / Unit
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., CDU, RFCCU, Management, HR, Laboratory"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., IOCL/A/001"
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: IOCL/BATCH/XXX (e.g., IOCL/A/001, IOCL/G/025)
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Shift Assigned
              </label>
              <select
                value={formData.shiftAssigned}
                onChange={(e) =>
                  setFormData({ ...formData, shiftAssigned: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Morning">🌅 Morning (6:00 AM - 2:00 PM)</option>
                <option value="Evening">🌇 Evening (2:00 PM - 10:00 PM)</option>
                <option value="Night">🌙 Night (10:00 PM - 6:00 AM)</option>
                <option value="General">📋 General (Day Shift)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Batch
              </label>
              <select
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="A">Batch A - Officers (Management)</option>
                <option value="B">Batch B - Officers (Operations)</option>
                <option value="C">Batch C - Officers (Technical)</option>
                <option value="General">General - Workers (Field Staff)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding Employee...
                </span>
              ) : (
                "+ Add Employee"
              )}
            </button>
          </form>
        </div>

        {/* Quick Add Templates */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Quick Add Templates (Batch-wise)
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Click on any template to auto-fill the form, then click "Add
            Employee"
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => quickAdd("A")}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-sm font-medium transition-all"
            >
              📋 Batch A<br />
              <span className="text-xs">Officer (Management)</span>
            </button>
            <button
              type="button"
              onClick={() => quickAdd("B")}
              className="bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg text-sm font-medium transition-all"
            >
              ⚙️ Batch B<br />
              <span className="text-xs">Officer (Operations)</span>
            </button>
            <button
              type="button"
              onClick={() => quickAdd("C")}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-sm font-medium transition-all"
            >
              🔬 Batch C<br />
              <span className="text-xs">Officer (Technical)</span>
            </button>
            <button
              type="button"
              onClick={() => quickAdd("General")}
              className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-3 rounded-lg text-sm font-medium transition-all"
            >
              🛠️ General
              <br />
              <span className="text-xs">Worker (Field)</span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-orange-500 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-orange-800">
                Employee Registration Guidelines
              </p>
              <p className="text-xs text-orange-600 mt-1">
                • Admin role: Full system access, can add/edit/delete any data
                <br />
                • Supervisor role: Can manage handovers for their shift
                <br />
                • Operator role: Can view and update tasks
                <br />
                • Worker role: Limited access, can view assigned tasks only
                <br />• Email must be unique for each employee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
