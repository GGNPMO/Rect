import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GeneratePayroll() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/employees').then(({ data }) => {
      if (data.success) {
        const employees = Array.isArray(data.data) ? data.data : data.data?.employees || [];
        setEmployees(employees.filter((e) => e.isActive));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/payroll/generate', {
        employeeId: parseInt(form.employeeId),
        month: parseInt(form.month),
        year: parseInt(form.year),
      });
      if (data.success) setResult(data.data);
      else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <>
      <h1>Generate Payroll</h1>
      <div className="card" style={{ maxWidth: 500 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Employee</label>
            <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Month</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Generate</button>
          </div>
        </form>
      </div>

      {result && (
        <div className="card" style={{ maxWidth: 500, marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.8rem' }}>Payroll Generated</h3>
          <table>
            <tbody>
              <tr><td>Employee</td><td><strong>{result.employeeName}</strong></td></tr>
              <tr><td>Period</td><td>{result.month}/{result.year}</td></tr>
              <tr><td>Base Salary</td><td>{fmt(result.baseSalary)}</td></tr>
              <tr><td>HRA</td><td>{fmt(result.hra)}</td></tr>
              <tr><td>DA</td><td>{fmt(result.da)}</td></tr>
              <tr><td>TA</td><td>{fmt(result.ta)}</td></tr>
              <tr><td>Other Allowances</td><td>{fmt(result.otherAllowances)}</td></tr>
              <tr><td>Gross Salary</td><td><strong>{fmt(result.grossSalary)}</strong></td></tr>
              <tr><td>Deductions</td><td style={{ color: '#e74c3c' }}>-{fmt(result.totalDeductions)}</td></tr>
              <tr><td>Tax</td><td style={{ color: '#e74c3c' }}>-{fmt(result.taxAmount)}</td></tr>
              <tr style={{ background: '#f0fff0' }}><td><strong>Net Salary</strong></td><td><strong style={{ fontSize: '1.1rem' }}>{fmt(result.netSalary)}</strong></td></tr>
            </tbody>
          </table>
          <div className="form-actions">
            <button className="btn btn-success" onClick={() => navigate('/payroll')}>View All Payroll</button>
          </div>
        </div>
      )}
    </>
  );
}
