import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const empty = { firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', dateOfJoining: '', baseSalary: '' };

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      api.get(`/employees/${id}`).then(({ data }) => {
        if (data.success) {
          const e = data.data;
          setForm({
            firstName: e.firstName, lastName: e.lastName, email: e.email,
            phone: e.phone, department: e.department, designation: e.designation,
            dateOfJoining: e.dateOfJoining?.split('T')[0] || '', baseSalary: e.baseSalary,
          });
        }
      });
    }
  }, [id, isEdit]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, baseSalary: parseFloat(form.baseSalary) };
      const { data } = isEdit
        ? await api.put(`/employees/${id}`, payload)
        : await api.post('/employees', payload);
      if (data.success) navigate('/employees');
      else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <>
      <h1>{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
      <div className="card" style={{ maxWidth: 600 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select value={form.department} onChange={set('department')} required>
                <option value="">Select...</option>
                <option>Engineering</option>
                <option>HR</option>
                <option>Finance</option>
                <option>Marketing</option>
                <option>Operations</option>
              </select>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input value={form.designation} onChange={set('designation')} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Joining</label>
              <input type="date" value={form.dateOfJoining} onChange={set('dateOfJoining')} required={!isEdit} />
            </div>
            <div className="form-group">
              <label>Base Salary (₹)</label>
              <input type="number" value={form.baseSalary} onChange={set('baseSalary')} required />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-success" type="submit">{isEdit ? 'Update' : 'Create'}</button>
            <button className="btn" type="button" onClick={() => navigate('/employees')}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
