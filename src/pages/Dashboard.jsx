import { useState, useEffect } from 'react';
import api, { extractEmployees } from '../services/api';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, departments: 0, totalSalary: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/employees').then(({ data }) => {
      if (data.success) {
        const emps = extractEmployees(data);
        setEmployees(emps);
        const active = emps.filter((e) => e.isActive !== false);
        const depts = new Set(active.map((e) => e.department));
        setStats({
          total: emps.length,
          active: active.length,
          departments: depts.size,
          totalSalary: active.reduce((sum, e) => sum + (Number(e.baseSalary) || 0), 0),
        });
      } else {
        setError(data.message || 'Unable to load employees');
      }
    }).catch((error) => {
      console.error("Error fetching employees:", error);
      setError(error.response?.data?.message || 'Unable to load employees');
    });
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <>
      <h1>Dashboard</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Employees</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Employees</div>
          <div className="value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="label">Departments</div>
          <div className="value">{stats.departments}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Monthly Salary</div>
          <div className="value" style={{ fontSize: '1.2rem' }}>{fmt(stats.totalSalary)}</div>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '0.8rem' }}>Recent Employees</h3>
        <table>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Department</th><th>Designation</th><th>Base Salary</th></tr>
          </thead>
          <tbody>
            {employees.slice(0, 5).map((e) => (
              <tr key={e.id}>
                <td>{e.employeeCode}</td>
                <td>{e.firstName} {e.lastName}</td>
                <td>{e.department}</td>
                <td>{e.designation}</td>
                <td>{fmt(e.baseSalary)}</td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>No employees yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
