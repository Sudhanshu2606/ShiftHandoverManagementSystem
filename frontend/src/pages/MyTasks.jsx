import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyTasks, updateTaskStatus } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getMyTasks();
      console.log("My tasks response:", res.data);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      alert("✅ Task status updated successfully!");
      fetchTasks();
    } catch (err) {
      console.error("Status update error:", err);
      alert(
        "❌ Failed to update status: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getPriorityColor = (p) => {
    if (p === "High") return "bg-danger text-white";
    if (p === "Medium") return "bg-warning text-dark";
    return "bg-success text-white";
  };

  const getStatusColor = (s) => {
    if (s === "Completed") return "bg-success text-white";
    if (s === "InProgress") return "bg-primary text-white";
    return "bg-secondary text-white";
  };

  const pendingTasks = tasks.filter((t) => t.status !== "Completed").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const highPriorityTasks = tasks.filter(
    (t) => t.priority === "High" && t.status !== "Completed",
  ).length;

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "#fff5eb" }}
      >
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff5eb", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        className="navbar shadow-sm"
        style={{ background: "linear-gradient(90deg, #ff9800, #e65100)" }}
      >
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center gap-3">
            <img
              src="/iocl-logo.png"
              alt="IOCL"
              style={{
                height: "40px",
                background: "white",
                padding: "5px",
                borderRadius: "10px",
              }}
            />
            <div>
              <span className="navbar-brand text-white fw-bold">My Tasks</span>
              <small className="text-white-50 d-block">
                {user?.name} ({user?.role})
              </small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-outline-light btn-sm rounded-pill"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm rounded-pill"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-link text-decoration-none mb-3"
          style={{ color: "#e65100" }}
        >
          ← Back to Dashboard
        </button>

        {/* Title */}
        <div className="mb-4">
          <h2 className="fw-bold" style={{ color: "#e65100" }}>
            My Tasks
          </h2>
          <p className="text-muted">Tasks assigned to you</p>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Pending Tasks</h6>
                <h2 className="fw-bold text-warning mb-0">{pendingTasks}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Completed Tasks</h6>
                <h2 className="fw-bold text-success mb-0">{completedTasks}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">High Priority</h6>
                <h2 className="fw-bold text-danger mb-0">
                  {highPriorityTasks}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4 pb-0">
            <h4 className="fw-bold" style={{ color: "#e65100" }}>
              Tasks Assigned to Me
            </h4>
          </div>
          <div className="card-body p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                <p>No tasks assigned to you yet.</p>
                <p className="small text-muted">
                  Check back later or contact your supervisor.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-3 p-3 mb-3 shadow-sm"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <h5 className="fw-bold mb-0">{task.title}</h5>
                          <span
                            className={`badge ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`badge ${getStatusColor(task.status)}`}
                          >
                            {task.status === "InProgress"
                              ? "In Progress"
                              : task.status}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-muted mb-2">{task.description}</p>
                        )}
                        <div className="d-flex flex-wrap gap-3 text-muted small">
                          {task.handover && (
                            <span>
                              <i className="bi bi-building me-1"></i>
                              {task.handover.unitName || "General"}
                            </span>
                          )}
                          {task.dueDate && (
                            <span>
                              <i className="bi bi-calendar me-1"></i>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.createdByUser && (
                            <span>
                              <i className="bi bi-person me-1"></i>
                              Created by: {task.createdByUser.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {task.status !== "Completed" && (
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "140px" }}
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value)
                          }
                          disabled={updating}
                        >
                          <option value="Pending">📋 Pending</option>
                          <option value="InProgress">🔄 In Progress</option>
                          <option value="Completed">✅ Completed</option>
                        </select>
                      )}
                      {task.status === "Completed" && (
                        <span className="badge bg-success p-2">
                          ✅ Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-info bg-opacity-10 rounded-3 border border-info">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-info-circle-fill text-info"></i>
            <small className="text-muted">
              <strong>Note:</strong> You can only see tasks assigned to you.
              {user?.role === "Admin" && " As Admin, you can see all tasks."}
              {user?.role === "Supervisor" &&
                ` As Supervisor, you can see tasks assigned to your shift (${user?.shiftAssigned}).`}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
