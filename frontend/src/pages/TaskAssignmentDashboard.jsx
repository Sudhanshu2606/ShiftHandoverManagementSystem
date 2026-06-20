import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAllTasks,
  getUsers,
  reassignTask,
  updateTaskStatus,
} from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TaskAssignmentDashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [updating, setUpdating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        getAllTasks(),
        getUsers(),
      ]);
      setTasks(tasksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedTask || !selectedUser) {
      alert("Please select a task and employee");
      return;
    }

    setUpdating(true);
    try {
      await reassignTask(selectedTask.id, parseInt(selectedUser));
      alert("✅ Task reassigned successfully!");
      setShowAssignModal(false);
      setSelectedTask(null);
      setSelectedUser("");
      fetchData();
    } catch (err) {
      console.error("Reassign error:", err);
      alert(
        "❌ Failed to reassign task: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setUpdating(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      alert("✅ Task status updated successfully!");
      fetchData();
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

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status !== "Completed").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    highPriority: tasks.filter(
      (t) => t.priority === "High" && t.status !== "Completed",
    ).length,
  };

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
              <span className="navbar-brand text-white fw-bold">
                Task Assignment Dashboard
              </span>
              <small className="text-white-50 d-block">
                {user?.role === "Admin"
                  ? "Admin - Full access"
                  : `Supervisor - ${user?.shiftAssigned} shift tasks`}
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
            Task Assignment Dashboard
          </h2>
          <p className="text-muted">Manage and assign tasks to employees</p>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Total Tasks</h6>
                <h2 className="fw-bold text-primary mb-0">{stats.total}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Pending Tasks</h6>
                <h2 className="fw-bold text-warning mb-0">{stats.pending}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Completed Tasks</h6>
                <h2 className="fw-bold text-success mb-0">{stats.completed}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">High Priority</h6>
                <h2 className="fw-bold text-danger mb-0">
                  {stats.highPriority}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4 pb-0">
            <h4 className="fw-bold" style={{ color: "#e65100" }}>
              All Tasks
            </h4>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: "#fff3e0" }}>
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Created By</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr key="no-data">
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-4 py-3 fw-semibold">{task.title}</td>
                        <td className="px-4 py-3">
                          {task.assignedUser ? (
                            <span className="badge bg-info text-dark">
                              {task.assignedUser.name}
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {task.createdByUser?.name || "Admin"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`badge ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="form-select form-select-sm"
                            style={{ width: "130px" }}
                            value={task.status}
                            onChange={(e) =>
                              handleUpdateStatus(task.id, e.target.value)
                            }
                            disabled={updating}
                          >
                            <option value="Pending">Pending</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowAssignModal(true);
                            }}
                            className="btn btn-warning btn-sm rounded-pill"
                            disabled={updating}
                          >
                            <i className="bi bi-arrow-repeat me-1"></i>Reassign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-info bg-opacity-10 rounded-3 border border-info">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-info-circle-fill text-info"></i>
            <small className="text-muted">
              <strong>Admin:</strong> Can reassign any task |
              <strong>Supervisor:</strong> Can reassign tasks only to their
              shift employees
            </small>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {showAssignModal && selectedTask && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div
                className="modal-header border-0 rounded-top-4"
                style={{
                  background: "linear-gradient(90deg, #ff9800, #e65100)",
                }}
              >
                <h5 className="modal-title fw-bold text-white">
                  Reassign Task
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Task</label>
                  <p className="bg-light p-2 rounded">{selectedTask.title}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Current Assignee
                  </label>
                  <p className="text-muted">
                    {selectedTask.assignedUser?.name || "Not assigned"}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Assign To</label>
                  <select
                    className="form-select rounded-pill"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">-- Select Employee --</option>
                    {users
                      .filter(
                        (u) =>
                          u.id !== selectedTask.assignedTo &&
                          (user?.role === "Admin" ||
                            u.shiftAssigned === user?.shiftAssigned),
                      )
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role} - {u.department})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0 pb-4 pe-4">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn rounded-pill px-4 text-white"
                  style={{
                    background: "linear-gradient(90deg, #ff9800, #e65100)",
                  }}
                  onClick={handleReassign}
                  disabled={updating}
                >
                  {updating ? "Reassigning..." : "Confirm Reassign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
