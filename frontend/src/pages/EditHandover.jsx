import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getHandover,
  updateHandover,
  getTasksByHandover,
  reassignTask,
  getUsers,
} from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EditHandover() {
  const [formData, setFormData] = useState({
    shiftName: "",
    summary: "",
    status: "",
    unitName: "",
  });
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [updating, setUpdating] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [handoverRes, tasksRes, usersRes] = await Promise.all([
        getHandover(id),
        getTasksByHandover(id),
        getUsers(),
      ]);

      const h = handoverRes.data;
      setFormData({
        shiftName: h.shiftName || "",
        summary: h.summary || "",
        status: h.status || "Draft",
        unitName: h.unitName || "",
      });
      setTasks(tasksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateHandover(id, formData);
      alert("✅ Handover updated successfully!");
      navigate(`/handover/${id}`);
    } catch (err) {
      console.error("Error updating handover:", err);
      setError(
        "Failed to update handover: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
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
      setShowReassignModal(false);
      setSelectedTask(null);
      setSelectedUser("");
      fetchData(); // Refresh tasks
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

  const canReassign = user?.role === "Admin" || user?.role === "Supervisor";

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
    <div className="min-vh-100" style={{ background: "#fff5eb" }}>
      {/* Header */}
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
            <span className="text-white fw-bold">Edit Handover Report</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline-light btn-sm rounded-pill"
          >
            Back
          </button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <button
              onClick={() => navigate(`/handover/${id}`)}
              className="btn btn-link text-decoration-none mb-3"
              style={{ color: "#e65100" }}
            >
              ← Back to Details
            </button>

            {/* Edit Form Card */}
            <div className="card shadow border-0 rounded-4 mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4" style={{ color: "#e65100" }}>
                  Edit Handover Report
                </h4>

                {error && (
                  <div className="alert alert-danger py-2 mb-3">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Shift</label>
                    <select
                      className="form-select rounded-pill"
                      value={formData.shiftName}
                      onChange={(e) =>
                        setFormData({ ...formData, shiftName: e.target.value })
                      }
                    >
                      <option value="Morning">
                        🌅 Morning Shift (6AM - 2PM)
                      </option>
                      <option value="Evening">
                        🌇 Evening Shift (2PM - 10PM)
                      </option>
                      <option value="Night">🌙 Night Shift (10PM - 6AM)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Work Summary
                    </label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      className="form-select rounded-pill"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="Draft">📝 Draft</option>
                      <option value="Submitted">✅ Submitted</option>
                    </select>
                  </div>

                  <div className="d-flex gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn px-4 py-2 text-white rounded-pill"
                      style={{
                        background: "linear-gradient(90deg, #ff9800, #e65100)",
                      }}
                    >
                      {saving ? "Saving..." : "💾 Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/handover/${id}`)}
                      className="btn btn-secondary rounded-pill"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Tasks Section with Reassign */}
            <div className="card shadow border-0 rounded-4">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h4 className="fw-bold" style={{ color: "#e65100" }}>
                  <i className="bi bi-list-check me-2"></i>Tasks
                  <span className="badge bg-secondary ms-2">
                    {tasks.length}
                  </span>
                </h4>
              </div>
              <div className="card-body p-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    <p>No tasks found for this handover.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ background: "#fff3e0" }}>
                        <tr>
                          <th>Task</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.id}>
                            <td className="fw-semibold">{task.title}</td>
                            <td>
                              <span
                                className={`badge ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${getStatusColor(task.status)}`}
                              >
                                {task.status === "InProgress"
                                  ? "In Progress"
                                  : task.status}
                              </span>
                            </td>
                            <td>
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
                            <td>
                              {canReassign && (
                                <button
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowReassignModal(true);
                                  }}
                                  className="btn btn-warning btn-sm rounded-pill"
                                >
                                  <i className="bi bi-arrow-repeat me-1"></i>
                                  Reassign
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedTask && (
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
                  onClick={() => setShowReassignModal(false)}
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
                  onClick={() => setShowReassignModal(false)}
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
