import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PayrollList() {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get(`/payroll/period?month=${month}&year=${year}`).then(({ data }) => {
      if (data.success) setRecords(data.data);
    }).catch(() => {});
  };

  useEffect(load, [month, year]);

  const handleProcess = async (id) => {
    const { data } = await api.post(`/payroll/${id}/process`);
    setMsg(data.message);
    load();
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  const statusClass = (s) => `badge badge-${s.toLowerCase()}`;

  return (
    <>
      <h1>Payroll Records</h1>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ padding: '0.4rem' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <input type="number" value={year} onChange={(e) => setYear(+e.target.value)} style={{ width: 80, padding: '0.4rem' }} />
        </div>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Base</th><th>HRA</th><th>DA</th>
              <th>Gross</th><th>Deductions</th><th>Tax</th><th>Net Salary</th>
              <th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.employeeName}</td>
                <td>{fmt(r.baseSalary)}</td>
                <td>{fmt(r.hra)}</td>
                <td>{fmt(r.da)}</td>
                <td>{fmt(r.grossSalary)}</td>
                <td>{fmt(r.totalDeductions)}</td>
                <td>{fmt(r.taxAmount)}</td>
                <td><strong>{fmt(r.netSalary)}</strong></td>
                <td><span className={statusClass(r.status)}>{r.status}</span></td>
                <td>
                  {r.status === 'Draft' && (
                    <button className="btn btn-sm btn-success" onClick={() => handleProcess(r.id)}>Process</button>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan="10" style={{ textAlign: 'center', color: '#999' }}>No payroll records for this period</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
