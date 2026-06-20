import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login({ email, password });
      loginUser(
        {
          name: res.data.name,
          role: res.data.role,
          department: res.data.department,
          shiftAssigned: res.data.shiftAssigned,
        },
        res.data.token,
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: "linear-gradient(135deg, #fff5eb 0%, #ffe0b2 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div
              className="card shadow-lg border-0 rounded-4 overflow-hidden"
              style={{ background: "white" }}
            >
              {/* Logo Section */}
              <div className="d-flex flex-column align-items-center justify-content-center pt-4 pb-1">
                <img
                  src="/iocl-logo.png"
                  alt="Indian Oil Corporation Limited"
                  className="img-fluid"
                  style={{
                    height: "70px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/f/f8/Indian_Oil_Logo.svg";
                  }}
                />
                <h2 className="fw-bold mt-2 mb-0" style={{ color: "#e65100" }}>
                  Shift Handover
                </h2>
                <p className="text-muted small mb-1">Management System</p>
                <div className="d-flex justify-content-center gap-2 mb-1">
                  <div
                    style={{
                      width: "35px",
                      height: "2px",
                      background: "#ff9800",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "35px",
                      height: "2px",
                      background: "#e65100",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <div
                    style={{
                      width: "35px",
                      height: "2px",
                      background: "#ff9800",
                      borderRadius: "2px",
                    }}
                  ></div>
                </div>
                <p className="small text-muted">IOCL Panipat Refinery</p>
              </div>

              <div className="card-body p-4 pt-0">
                {error && (
                  <div
                    className="alert alert-danger py-2 text-center small mb-3"
                    role="alert"
                    style={{
                      background: "#ffebee",
                      borderColor: "#ffcdd2",
                      color: "#c62828",
                    }}
                  >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "#e65100" }}
                    >
                      Email Address
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text bg-white border-end-0"
                        style={{ borderColor: "#ffe0b2" }}
                      >
                        <i
                          className="bi bi-envelope"
                          style={{ color: "#ff9800" }}
                        ></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        style={{ borderColor: "#ffe0b2" }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold small"
                      style={{ color: "#e65100" }}
                    >
                      Password
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text bg-white border-end-0"
                        style={{ borderColor: "#ffe0b2" }}
                      >
                        <i
                          className="bi bi-lock"
                          style={{ color: "#ff9800" }}
                        ></i>
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0 ps-0"
                        style={{ borderColor: "#ffe0b2" }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 py-2 fw-bold text-white border-0 mb-2"
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
                          aria-hidden="true"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>Login
                      </>
                    )}
                  </button>
                </form>

                {/* Divider with icon */}
                <div className="d-flex align-items-center justify-content-center gap-2 my-2">
                  <div
                    style={{ flex: 1, height: "1px", background: "#ffe0b2" }}
                  ></div>
                  <i
                    className="bi bi-shield-check"
                    style={{ color: "#ff9800", fontSize: "14px" }}
                  ></i>
                  <div
                    style={{ flex: 1, height: "1px", background: "#ffe0b2" }}
                  ></div>
                </div>

                <div className="text-center">
                  <p className="small text-muted mb-0">
                    Authorized Personnel Only
                  </p>
                </div>
              </div>

              <div className="text-center pb-3">
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  © 2024 Indian Oil Corporation Limited
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
