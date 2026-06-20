import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHandovers, deleteHandover, createHandover } from '../services/api';
import { refineryUnits, unitGroups } from '../constants/refineryUnits';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dashboard() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    shiftName: 'Morning',
    summary: '',
    status: 'Draft',
    unit: '',
    unitName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      const res = await getHandovers();
      setHandovers(res.data || []);
    } catch (err) {
      console.error('Error:', err);
      setHandovers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this handover report?')) {
      try {
        await deleteHandover(id);
        fetchHandovers();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateHandover = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedUnitData = refineryUnits.find(u => u.id === formData.unit);
      await createHandover({
        shiftName: formData.shiftName,
        summary: formData.summary,
        status: formData.status,
        unit: formData.unit,
        unitName: selectedUnitData?.name || formData.unit,
        createdBy: user?.id || 1,
        date: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData({ shiftName: 'Morning', summary: '', status: 'Draft', unit: '', unitName: '' });
      fetchHandovers();
    } catch (err) {
      alert('Failed to create handover');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredHandovers = () => {
    let filtered = handovers;
    
    if (user?.role === 'Supervisor') {
      filtered = handovers.filter(h => h.shiftName === user?.shiftAssigned || h.createdBy === user?.id);
    }
    
    if (selectedGroup !== 'All') {
      const groupUnitIds = refineryUnits.filter(u => u.group === selectedGroup).map(u => u.id);
      filtered = filtered.filter(h => groupUnitIds.includes(h.unit));
    }
    
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(h => h.unit === selectedUnit);
    }
    
    filtered = filtered.filter(h => {
      const matchesSearch = h.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            h.shiftName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (h.unitName || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    
    return filtered;
  };

  const visibleHandovers = getFilteredHandovers();
  const draftCount = visibleHandovers.filter(h => h.status === 'Draft').length;
  const submittedCount = visibleHandovers.filter(h => h.status === 'Submitted').length;

  const unitCount = {};
  handovers.forEach(h => {
    if (h.unit) unitCount[h.unit] = (unitCount[h.unit] || 0) + 1;
  });

  const groupCount = {};
  handovers.forEach(h => {
    const unit = refineryUnits.find(u => u.id === h.unit);
    if (unit && unit.group) {
      groupCount[unit.group] = (groupCount[unit.group] || 0) + 1;
    }
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#fff5eb' }}>
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff5eb', minHeight: '100vh' }}>
      {/* Simple Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 shadow-sm d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <img src="/iocl-logo.png" alt="IOCL" style={{ height: '40px', background: 'white', padding: '5px', borderRadius: '10px' }} />
          <div>
            <span className="fw-bold">Indian Oil Panipat Refinery</span>
            <small className="d-block text-white-50">Shift Handover Management System</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-semibold small">{user?.name}</div>
            <small className="text-white-50">{user?.role} | {user?.shiftAssigned || 'General'}</small>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm rounded-pill">Logout</button>
        </div>
      </div>

      <div className="container-fluid p-4">
        {/* Welcome Banner */}
        <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #ff9800, #e65100)' }}>
          <div className="card-body text-white p-4">
            <div className="row align-items-center">
              <div className="col">
                <h2 className="fw-bold mb-2">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}}, {user?.name}!
                </h2>
                <p className="mb-0 text-white-75">
                  {user?.role === 'Admin' ? 'You have full access to all refinery units and reports.' : 'You are managing shift handovers.'}
                </p>
              </div>
              <div className="col-auto">
                <div className="text-center bg-white bg-opacity-25 rounded-3 p-3">
                  <div className="h2 fw-bold mb-0">{visibleHandovers.length}</div>
                  <small>My Reports</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Handovers</h6>
                    <h2 className="fw-bold mb-0" style={{ color: '#e65100' }}>{visibleHandovers.length}</h2>
                  </div>
                  <div className="rounded-3 p-3" style={{ background: '#fff3e0' }}>
                    <i className="bi bi-files fs-1" style={{ color: '#ff9800' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Draft Reports</h6>
                    <h2 className="fw-bold mb-0 text-warning">{draftCount}</h2>
                  </div>
                  <div className="rounded-3 p-3" style={{ background: '#fff3e0' }}>
                    <i className="bi bi-file-earmark-text fs-1 text-warning"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Submitted Reports</h6>
                    <h2 className="fw-bold mb-0 text-success">{submittedCount}</h2>
                  </div>
                  <div className="rounded-3 p-3" style={{ background: '#fff3e0' }}>
                    <i className="bi bi-check2-circle fs-1 text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Filter - Admin Only */}
        {user?.role === 'Admin' && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: '#e65100' }}>Filter by Refinery Unit</h6>
              <div className="d-flex flex-wrap gap-2 mb-3 pb-2 border-bottom">
                {unitGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedUnit('all');
                    }}
                    className={`btn btn-sm rounded-pill ${selectedGroup === group ? 'btn-warning' : 'btn-outline-secondary'}`}
                  >
                    {group}
                    {groupCount[group] > 0 && group !== 'All' && (
                      <span className="badge bg-secondary ms-1">{groupCount[group]}</span>
                    )}
                    {group === 'All' && handovers.length > 0 && (
                      <span className="badge bg-secondary ms-1">{handovers.length}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {refineryUnits
                  .filter(unit => selectedGroup === 'All' || unit.group === selectedGroup)
                  .map(unit => (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit.id)}
                      className={`btn btn-sm rounded-pill ${selectedUnit === unit.id ? 'btn-warning' : 'btn-outline-secondary'}`}
                    >
                      {unit.name}
                      {unitCount[unit.id] > 0 && (
                        <span className="badge bg-secondary ms-1">{unitCount[unit.id]}</span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-3 mb-4">
          {(user?.role === 'Admin' || user?.role === 'Supervisor') && (
            <button onClick={() => setShowModal(true)} className="btn px-4 py-2 shadow-sm rounded-pill text-white" style={{ background: 'linear-gradient(90deg, #ff9800, #e65100)', border: 'none' }}>
              <i className="bi bi-plus-circle me-2"></i>Create New Handover Report
            </button>
          )}
          <button onClick={() => navigate('/my-tasks')} className="btn btn-primary px-4 py-2 shadow-sm rounded-pill">
            <i className="bi bi-list-check me-2"></i>My Tasks
          </button>
          {user?.role === 'Admin' && (
            <button onClick={() => navigate('/add-employee')} className="btn btn-success px-4 py-2 shadow-sm rounded-pill">
              <i className="bi bi-person-plus me-2"></i>Add Employee
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="position-relative" style={{ maxWidth: '350px' }}>
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control ps-5 py-2 rounded-pill"
              placeholder="Search handovers by unit, shift, or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Handovers Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: '#fff3e0' }}>
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Summary</th>
                    <th className="px-4 py-3">Tasks</th>
                    <th className="px-4 py-3">Issues</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                  {visibleHandovers.length === 0 ? (
                    <tr key="no-data">
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                        No handover reports found.
                      </td>
                    </tr>
                  ) : (
                    visibleHandovers.map((handover) => (
                      <tr key={handover.id}>
                        <td className="px-4 py-3">
                          {new Date(handover.date).toLocaleDateString()}
                          <br /><small className="text-muted">{new Date(handover.date).toLocaleTimeString()}</small>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${handover.shiftName === 'Morning' ? 'bg-warning' : handover.shiftName === 'Evening' ? 'bg-info' : 'bg-secondary'} rounded-pill`}>
                            {handover.shiftName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge bg-light text-dark rounded-pill">
                            {handover.unitName || handover.unit || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{handover.summary?.substring(0, 60)}...</td>
                        <td className="px-4 py-3">{handover.tasks?.length || 0}</td>
                        <td className="px-4 py-3">{handover.issues?.length || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${handover.status === 'Submitted' ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                            {handover.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="btn-group btn-group-sm">
                            <button onClick={() => navigate(`/handover/${handover.id}`)} className="btn btn-outline-info btn-sm rounded-pill me-1" title="View">
                              <i className="bi bi-eye"></i>
                            </button>
                            {(user?.role === 'Admin' || (user?.role === 'Supervisor' && handover.createdBy === user?.id)) && (
                              <>
                                <button onClick={() => navigate(`/handover/edit/${handover.id}`)} className="btn btn-outline-warning btn-sm rounded-pill me-1" title="Edit">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button onClick={() => handleDelete(handover.id)} className="btn btn-outline-danger btn-sm rounded-pill" title="Delete">
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-5 pt-3 border-top text-center" style={{ borderColor: '#ffe0b2' }}>
          <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-2">
            <img src="/iocl-logo.png" alt="IOCL" style={{ height: '25px' }} />
            <span className="small text-muted">Indian Oil Corporation Limited</span>
            <span className="small text-muted">|</span>
            <span className="small text-muted">Panipat Refinery (15 MMTPA)</span>
            <span className="small text-muted">|</span>
            <span className="small text-muted">ISO 14001 & ISO 9001 Certified</span>
          </div>
          <p className="small text-muted mb-0">© {new Date().getFullYear()} IOCL | All Rights Reserved</p>
        </footer>
      </div>

      {/* Create Handover Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 rounded-top-4" style={{ background: 'linear-gradient(90deg, #ff9800, #e65100)' }}>
                <h5 className="modal-title fw-bold text-white">
                  <i className="bi bi-file-plus me-2"></i>Create Handover Report
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateHandover}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Unit *</label>
                    <select
                      className="form-select rounded-pill"
                      value={formData.unit}
                      onChange={(e) => {
                        const unitId = e.target.value;
                        const unit = refineryUnits.find(u => u.id === unitId);
                        setFormData({ ...formData, unit: unitId, unitName: unit?.name || '' });
                      }}
                      required
                    >
                      <option value="">-- Select Unit --</option>
                      {refineryUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name} ({unit.capacity})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Shift</label>
                    <select
                      className="form-select rounded-pill"
                      value={formData.shiftName}
                      onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
                    >
                      <option value="Morning">🌅 Morning Shift (6AM - 2PM)</option>
                      <option value="Evening">🌇 Evening Shift (2PM - 10PM)</option>
                      <option value="Night">🌙 Night Shift (10PM - 6AM)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Work Summary</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Describe work done, pending tasks, equipment status..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="draft"
                          checked={formData.status === 'Draft'}
                          onChange={() => setFormData({ ...formData, status: 'Draft' })}
                        />
                        <label className="form-check-label" htmlFor="draft">📝 Draft</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="submitted"
                          checked={formData.status === 'Submitted'}
                          onChange={() => setFormData({ ...formData, status: 'Submitted' })}
                        />
                        <label className="form-check-label" htmlFor="submitted">✅ Submitted</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pb-4 pe-4">
                  <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 text-white" style={{ background: 'linear-gradient(90deg, #ff9800, #e65100)' }} disabled={submitting}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : <><i className="bi bi-save me-2"></i>Create Report</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}