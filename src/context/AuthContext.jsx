import { useState } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return token && username ? { username, role, token } : null;
  });
  const loading = false;

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    if (data.success) {
      const { token, refreshToken, username: user, role } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('username', user);
      localStorage.setItem('role', role);
      setUser({ username: user, role, token });
    }
    return data;
  };

  const register = async (username, email, password, role) => {
    const { data } = await api.post('/auth/register', { username, email, password, role });
    if (data.success) {
      const { token, refreshToken, username: user, role: r } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('username', user);
      localStorage.setItem('role', r);
      setUser({ username: user, role: r, token });
    }
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
