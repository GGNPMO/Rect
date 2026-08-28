import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Payroll System</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/payroll">Payroll</NavLink>
          {(user?.role === 'Admin' || user?.role === 'HR') && (
            <>
              <NavLink to="/employees/new">Add Employee</NavLink>
              <NavLink to="/payroll/generate">Generate Payroll</NavLink>
            </>
          )}
        </nav>
        <div style={{ padding: '0 1rem', fontSize: '0.8rem', color: '#888' }}>
          {user?.username} ({user?.role})
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
