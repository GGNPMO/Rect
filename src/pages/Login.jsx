import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'User' });
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = isRegister
        ? await register(form.username, form.email, form.password, form.role)
        : await login(form.username, form.password);
      if (result.success) navigate('/');
      else setError(result.message);
    } catch {
      setError('Connection failed. Is the API running?');
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={set('username')} required />
          </div>
          {isRegister && (
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} required />
            </div>
          )}
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} required />
          </div>
          {isRegister && (
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={set('role')}>
                <option>User</option>
                <option>HR</option>
                <option>Admin</option>
              </select>
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} type="submit">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Login' : 'Register'}
          </a>
        </p>
      </div>
    </div>
  );
}
