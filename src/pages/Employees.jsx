import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role === 'Admin' || user?.role === 'HR';

  const load = () => {
    api.get('/employees').then(({ data }) => {
      if (data.success) {
        setEmployees(Array.isArray(data.data) ? data.data : data.data?.employees || []);
      }
    });
  };

  useEffect(load, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    if (term.length >= 2) {
      api.get(`/employees/search?term=${encodeURIComponent(term)}`).then(({ data }) => {
        if (data.success) {
          setEmployees(Array.isArray(data.data) ? data.data : data.data?.employees || []);
        }
      });
    } else if (term === '') load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return;
    const { data } = await api.delete(`/employees/${id}`);
    setMsg(data.message);
    load();
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <>
      <h1>Employees</h1>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="toolbar">
        <input className="search-box" placeholder="Search employees..." value={search} onChange={handleSearch} />
        {canEdit && <Link to="/employees/new" className="btn btn-primary">+ Add Employee</Link>}
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Code</th><th>Name</th><th>Email</th><th>Department</th>
              <th>Designation</th><th>Salary</th><th>Status</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.employeeCode}</td>
                <td>{e.firstName} {e.lastName}</td>
                <td>{e.email}</td>
                <td>{e.department}</td>
                <td>{e.designation}</td>
                <td>{fmt(e.baseSalary)}</td>
                <td><span className={`badge ${e.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {e.isActive ? 'Active' : 'Inactive'}
                </span></td>
                {canEdit && (
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => navigate(`/employees/${e.id}/edit`)} style={{ marginRight: 4 }}>Edit</button>
                    {e.isActive && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Deactivate</button>}
                  </td>
                )}
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan={canEdit ? 8 : 7} style={{ textAlign: 'center', color: '#999' }}>No employees found</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
