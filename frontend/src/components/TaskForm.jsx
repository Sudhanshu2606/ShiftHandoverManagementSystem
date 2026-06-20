import { useState, useEffect } from "react";
import { getUsers, createTask } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TaskForm({ handoverId, onTaskAdded, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignedTo: "",
    dueDate: new Date().toISOString().split("T")[0],
    handoverId: handoverId,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
        dueDate: formData.dueDate,
        handoverId: handoverId,
        status: "Pending",
      });
      onTaskAdded();
      onClose();
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4">
          <div
            className="modal-header border-0 rounded-top-4"
            style={{ background: "linear-gradient(90deg, #ff9800, #e65100)" }}
          >
            <h5 className="modal-title fw-bold text-white">
              <i className="bi bi-plus-circle me-2"></i>Add New Task
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Task Title */}
              <div className="mb-3">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#e65100" }}
                >
                  Task Title *
                </label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#e65100" }}
                >
                  Description
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the task in detail..."
                />
              </div>

              {/* Priority & Due Date */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label
                    className="form-label fw-semibold"
                    style={{ color: "#e65100" }}
                  >
                    Priority
                  </label>
                  <select
                    className="form-select rounded-pill"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="High">🔴 High - Urgent</option>
                    <option value="Medium">🟡 Medium - Normal</option>
                    <option value="Low">🟢 Low - Later</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label fw-semibold"
                    style={{ color: "#e65100" }}
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="form-control rounded-pill"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* ASSIGN TO DROPDOWN */}
              <div className="mb-3">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#e65100" }}
                >
                  <i className="bi bi-person-badge me-1"></i>Assign To
                </label>
                <select
                  className="form-select rounded-pill"
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                >
                  <option value="">-- Select Employee --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role} - {u.department})
                    </option>
                  ))}
                </select>
                <small className="text-muted d-block mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Select the employee who will work on this task
                </small>
              </div>
            </div>

            <div className="modal-footer border-0 pb-4 pe-4">
              <button
                type="button"
                className="btn btn-secondary rounded-pill"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn rounded-pill px-4 text-white"
                style={{
                  background: "linear-gradient(90deg, #ff9800, #e65100)",
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>Add Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
