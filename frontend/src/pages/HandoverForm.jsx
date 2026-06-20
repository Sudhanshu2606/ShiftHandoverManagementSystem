import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHandover } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { refineryUnits } from "../constants/refineryUnits";
import "bootstrap/dist/css/bootstrap.min.css";

export default function HandoverForm() {
  const [formData, setFormData] = useState({
    shiftName: "Morning",
    summary: "",
    status: "Draft",
    unit: "",
    unitName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUnitChange = (e) => {
    const unitId = e.target.value;
    const selectedUnit = refineryUnits.find((u) => u.id === unitId);
    setFormData({
      ...formData,
      unit: unitId,
      unitName: selectedUnit?.name || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.unit) {
      setError("Please select a unit");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        shiftName: formData.shiftName,
        summary: formData.summary,
        status: formData.status,
        unit: formData.unit,
        unitName: formData.unitName,
        createdBy: user?.id || 1,
        date: new Date().toISOString(),
      };
      console.log("Sending payload:", payload);

      const response = await createHandover(payload);
      console.log("Response:", response.data);

      navigate("/dashboard");
    } catch (err) {
      console.error("Error:", err);
      setError(
        "Failed to create handover report: " +
          (err.response?.data || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: "#fff5eb" }}>
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
            <span className="text-white fw-bold">Create Handover Report</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline-light btn-sm rounded-pill"
          >
            Cancel
          </button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger py-2 mb-3">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Unit Selection */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: "#e65100" }}
                    >
                      Select Unit *
                    </label>
                    <select
                      className="form-select rounded-pill"
                      value={formData.unit}
                      onChange={handleUnitChange}
                      required
                    >
                      <option value="">-- Select Refinery Unit --</option>
                      {refineryUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.capacity})
                        </option>
                      ))}
                    </select>
                    {formData.unitName && (
                      <small className="text-success d-block mt-1">
                        ✅ Selected: {formData.unitName}
                      </small>
                    )}
                  </div>

                  {/* Shift Selection */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: "#e65100" }}
                    >
                      Shift
                    </label>
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

                  {/* Summary */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: "#e65100" }}
                    >
                      Work Summary
                    </label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      placeholder="Describe work done, pending tasks, equipment status..."
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold"
                      style={{ color: "#e65100" }}
                    >
                      Status
                    </label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="draft"
                          checked={formData.status === "Draft"}
                          onChange={() =>
                            setFormData({ ...formData, status: "Draft" })
                          }
                        />
                        <label className="form-check-label" htmlFor="draft">
                          📝 Draft
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="submitted"
                          checked={formData.status === "Submitted"}
                          onChange={() =>
                            setFormData({ ...formData, status: "Submitted" })
                          }
                        />
                        <label className="form-check-label" htmlFor="submitted">
                          ✅ Submitted
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 py-2 fw-bold text-white border-0"
                    style={{
                      background: "linear-gradient(90deg, #ff9800, #e65100)",
                      borderRadius: "10px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>Create Handover
                        Report
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
