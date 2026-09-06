import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, departments: 0, totalSalary: 0 });

  useEffect(() => {
    api.get('/employees').then(({ data }) => {
      if (data.success) {
        const emps = Array.isArray(data.data) ? data.data : data.data?.employees || [];
        setEmployees(emps);
        const active = emps.filter((e) => e.isActive);
        const depts = new Set(active.map((e) => e.department));
        setStats({
          total: emps.length,
          active: active.length,
          departments: depts.size,
          totalSalary: active.reduce((sum, e) => sum + e.baseSalary, 0),
        });
      }
    }).catch(() => {});
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <>
      <h1>Dashboard</h1>
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
