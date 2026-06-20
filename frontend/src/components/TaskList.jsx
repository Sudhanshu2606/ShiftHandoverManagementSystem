import { useState, useEffect, useCallback } from "react";
import {
  getTasksByHandover,
  updateTaskStatus,
  deleteTask,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TaskList({ handoverId, refresh }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasksByHandover(handoverId);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [handoverId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refresh]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(taskId);
      fetchTasks();
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

  const canUpdate =
    user?.role === "Admin" ||
    user?.role === "Supervisor" ||
    user?.role === "Operator";
  const canDelete = user?.role === "Admin";

  if (loading) return <div className="text-center py-4">Loading tasks...</div>;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
        <p>No tasks added yet.</p>
        {(user?.role === "Admin" || user?.role === "Supervisor") && (
          <p className="small">Click "Add Task" to create one.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="border rounded-3 p-3 mb-3 shadow-sm">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <h5 className="fw-bold mb-0">{task.title}</h5>
                <span className={`badge ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`badge ${getStatusColor(task.status)}`}>
                  {task.status === "InProgress" ? "In Progress" : task.status}
                </span>
              </div>
              {task.description && (
                <p className="text-muted mb-2">{task.description}</p>
              )}
              {task.assignedUser && (
                <p className="small text-muted mb-1">
                  <i className="bi bi-person me-1"></i>Assigned to:{" "}
                  {task.assignedUser.name}
                </p>
              )}
              {task.dueDate && (
                <p className="small text-muted">
                  <i className="bi bi-calendar me-1"></i>Due:{" "}
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="d-flex gap-2 ms-3">
              {canUpdate && task.status !== "Completed" && (
                <select
                  className="form-select form-select-sm"
                  style={{ width: "130px" }}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="Pending">📋 Pending</option>
                  <option value="InProgress">🔄 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(task.id)}
                  className="btn btn-outline-danger btn-sm rounded-pill"
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
