import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHandover, deleteHandover } from "../services/api";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import "bootstrap/dist/css/bootstrap.min.css";

export default function HandoverDetails() {
  const [handover, setHandover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchHandover = useCallback(async () => {
    try {
      const res = await getHandover(id);
      setHandover(res.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHandover();
  }, [fetchHandover]);

  const handleDelete = async () => {
    if (window.confirm("Delete this handover report?")) {
      await deleteHandover(id);
      navigate("/dashboard");
    }
  };

  const canAddTask = user?.role === "Admin" || user?.role === "Supervisor";

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

  if (!handover) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "#fff5eb" }}
      >
        <p className="text-muted">Handover not found</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: "#fff5eb" }}>
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
            <span className="text-white fw-bold">Handover Details</span>
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
          <div className="col-12">
            {/* Handover Info Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="fw-bold" style={{ color: "#e65100" }}>
                      Handover Report #{handover.id}
                    </h2>
                    <p className="text-muted mb-1">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(handover.date).toLocaleString()} |{" "}
                      {handover.shiftName} Shift
                    </p>
                    {handover.unitName && (
                      <p className="text-muted">
                        <i className="bi bi-building me-1"></i>
                        Unit: {handover.unitName}
                      </p>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <span
                      className={`badge ${handover.status === "Submitted" ? "bg-success" : "bg-warning"} p-2`}
                    >
                      {handover.status}
                    </span>
                    {user?.role === "Admin" && (
                      <button
                        onClick={handleDelete}
                        className="btn btn-outline-danger btn-sm rounded-pill"
                      >
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="fw-semibold" style={{ color: "#e65100" }}>
                    Summary
                  </h5>
                  <p className="text-muted bg-light p-3 rounded-3">
                    {handover.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0" style={{ color: "#e65100" }}>
                    <i className="bi bi-list-check me-2"></i>Tasks
                  </h4>
                  {canAddTask && (
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="btn btn-danger rounded-pill px-4"
                      style={{
                        background: "linear-gradient(90deg, #ff9800, #e65100)",
                        border: "none",
                      }}
                    >
                      <i className="bi bi-plus-circle me-2"></i>Add Task
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body p-4">
                <TaskList handoverId={handover.id} refresh={refreshTasks} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          handoverId={handover.id}
          onTaskAdded={() => {
            setRefreshTasks((prev) => prev + 1);
            setShowTaskForm(false);
          }}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}
