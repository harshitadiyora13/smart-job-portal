import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Tags,
  BarChart3,
  LogOut,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus
} from 'lucide-react';

const API_URL = 'http://localhost:5000/v1/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingJobsLoading, setPendingJobsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });

  const token = localStorage.getItem('token');
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (_) {
      return null;
    }
  })();

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    }
  };

  const fetchPendingJobs = async () => {
    setPendingJobsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/jobs/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingJobs(res.data.jobs || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load pending jobs');
    } finally {
      setPendingJobsLoading(false);
    }
  };

  const updatePendingJobStatus = async (jobId, status) => {
    try {
      await axios.put(
        `${API_URL}/admin/jobs/${jobId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchPendingJobs();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/admin/categories`,
        { name: categoryForm.name, icon: categoryForm.icon },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategoryForm({ name: '', icon: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const deleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm('Delete this category?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API_URL}/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedUsers = Array.isArray(res.data?.users) ? res.data.users : [];
      const filteredUsers = currentUser?._id
        ? fetchedUsers.filter((u) => u?._id !== currentUser._id)
        : fetchedUsers;
      setUsers(filteredUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
    setLoading(false);
  };

  const viewUser = async (userId) => {
    setSelectedUserLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user');
    } finally {
      setSelectedUserLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm('Delete this user? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      fetchUsers();
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchUsers();
    } else {
      setError('Please login first');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (activeSection === 'jobs') {
      fetchPendingJobs();
    }

    if (activeSection === 'categories') {
      fetchCategories();
    }
  }, [activeSection, token]);

  if (error) {
    return (
      <div className="container mt-5">
        <h2>Admin Dashboard</h2>
        <div className="alert alert-danger">{error}</div>
        <p>To test admin panel:</p>
        <ol>
          <li>Login as any user</li>
          <li>Make sure the same user account has role: admin in MongoDB</li>
          <li>Refresh this page</li>
        </ol>
      </div>
    );
  }

  const sidebarBtn = (key) => {
    const active = key === activeSection;
    return `btn w-100 text-start d-flex align-items-center gap-2 ${active ? 'btn-light text-primary' : 'text-white'}`;
  };

  const actionBtn = 'btn btn-sm btn-outline-primary';
  const deleteBtn = 'btn btn-sm btn-outline-danger';

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <aside className="p-3" style={{ width: 260, backgroundColor: '#0d6efd' }}>
        <div className="text-white fw-bold mb-4">Admin Panel</div>

        <button className={sidebarBtn('overview')} onClick={() => setActiveSection('overview')}>
          <LayoutDashboard size={18} />
          Dashboard Overview
        </button>
        <button className={sidebarBtn('users')} onClick={() => setActiveSection('users')}>
          <Users size={18} />
          User Management
        </button>
        <button className={sidebarBtn('jobs')} onClick={() => setActiveSection('jobs')}>
          <Briefcase size={18} />
          Job Moderation
        </button>
        <button className={sidebarBtn('categories')} onClick={() => setActiveSection('categories')}>
          <Tags size={18} />
          Categories
        </button>
        <button className={sidebarBtn('reports')} onClick={() => setActiveSection('reports')}>
          <BarChart3 size={18} />
          Reports
        </button>

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.35)' }}>
          <button className="btn w-100 text-start d-flex align-items-center gap-2 text-white" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow-1" style={{ backgroundColor: '#f8fbff' }}>
        <div className="container py-4">
          {activeSection === 'overview' && (
            <>
              <h2 className="mb-3">Dashboard Overview</h2>

              {stats && (
                <div className="row">
                  <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="text-muted small">Total Users</div>
                        <div className="fs-4 fw-bold">{stats.users ?? 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="text-muted small">Total Jobs</div>
                        <div className="fs-4 fw-bold">{stats.jobs ?? 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="text-muted small">Total Reviews</div>
                        <div className="fs-4 fw-bold">{stats.reviews ?? 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="text-muted small">Total Companies</div>
                        <div className="fs-4 fw-bold">{stats.companies ?? 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="text-muted small">Pending Job Approvals</div>
                        <div className="fs-4 fw-bold">{stats.pendingJobApprovals ?? 0}</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

          {activeSection === 'users' && (
            <>
              <h2 className="mb-3">User Management</h2>

              {(selectedUser || selectedUserLoading) && (
                <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">User Details</h5>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedUser(null)}
                        disabled={selectedUserLoading}
                      >
                        Close
                      </button>
                    </div>

                    {selectedUserLoading ? (
                      <div className="mt-3">Loading...</div>
                    ) : (
                      selectedUser && (
                        <div className="mt-3">
                          <div><strong>Name:</strong> {selectedUser.name || '-'}</div>
                          <div><strong>Email:</strong> {selectedUser.email || '-'}</div>
                          <div><strong>Role:</strong> {selectedUser.role || '-'}</div>
                          <div><strong>ID:</strong> {selectedUser._id}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    /><br />
                    <button className="btn d-flex align-items-center bg-primary gap-2 shadow-sm text-white px-3" onClick={fetchUsers}>Search</button>
                  </div>

                  {loading ? <p className="mb-0">Loading...</p> : (
                    <div className="table-responsive">
                      <table className="table table-striped align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user._id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.role}</td>
                              <td>
                                <button
                                  className={`${actionBtn} me-2`}
                                  onClick={() => viewUser(user._id)}
                                >
                                  <span className="d-inline-flex align-items-center gap-1">
                                    <Eye size={14} />
                                    View
                                  </span>
                                </button>
                                <button
                                  className={deleteBtn}
                                  onClick={() => deleteUser(user._id)}
                                >
                                  <span className="d-inline-flex align-items-center gap-1">
                                    <Trash2 size={14} />
                                    Delete
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeSection === 'jobs' && (
            <>
              <h2 className="mb-3">Job Moderation</h2>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Pending Jobs</h5>

                  {pendingJobsLoading ? (
                    <p className="mb-0">Loading...</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Date Posted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingJobs.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-muted">No pending jobs</td>
                            </tr>
                          ) : (
                            pendingJobs.map((job) => (
                              <tr key={job._id}>
                                <td>{job.title}</td>
                                <td>{job.company}</td>
                                <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-success me-2"
                                    onClick={() => updatePendingJobStatus(job._id, 'approved')}
                                  >
                                    <span className="d-inline-flex align-items-center gap-1">
                                      <CheckCircle2 size={14} />
                                      Approve
                                    </span>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => updatePendingJobStatus(job._id, 'rejected')}
                                  >
                                    <span className="d-inline-flex align-items-center gap-1">
                                      <XCircle size={14} />
                                      Reject
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeSection === 'categories' && (
            <>
              <h2 className="mb-3">Categories</h2>

              <div className="row">
                <div className="col-lg-5 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">Add Category</h5>
                      <form onSubmit={createCategory}>
                        <div className="mb-3">
                          <label className="form-label">Category Name</label>
                          <input
                            className="form-control"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Engineering"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Lucide Icon Name</label>
                          <input
                            className="form-control"
                            value={categoryForm.icon}
                            onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))}
                            placeholder="e.g. Briefcase"
                          />
                          <div className="form-text">Store the icon name only (Lucide). Rendering can be added later.</div>
                        </div>
                        <button className="btn d-flex align-items-center bg-primary gap-2 shadow-sm text-white px-3" type="submit">
                          <span className="d-inline-flex align-items-center gap-1">
                            <Plus size={16} />
                            Create
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-lg-7 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">Existing Categories</h5>

                      {categoriesLoading ? (
                        <p className="mb-0">Loading...</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-striped align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Icon</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categories.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="text-muted">No categories</td>
                                </tr>
                              ) : (
                                categories.map((cat) => (
                                  <tr key={cat._id}>
                                    <td>{cat.name}</td>
                                    <td>{cat.icon}</td>
                                    <td>
                                      <button
                                        className={deleteBtn}
                                        onClick={() => deleteCategory(cat._id)}
                                      >
                                        <span className="d-inline-flex align-items-center gap-1">
                                          <Trash2 size={14} />
                                          Delete
                                        </span>
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'reports' && (
            <>
              <h2 className="mb-3">Reports</h2>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="text-muted">Reports dashboard placeholder.</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
