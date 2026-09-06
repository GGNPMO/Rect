import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

const setAuthorization = (config, token) => {
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use((config) => {
  return setAuthorization(config, localStorage.getItem('token'));
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      const token = localStorage.getItem('token');

      if (refreshToken && token) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { token, refreshToken });
          if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            setAuthorization(original, data.data.token);
            return api(original);
          }
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

const employeeArrayKeys = ['employees', 'data', 'results', 'rows', 'records', 'items'];

function findEmployeeArray(value, depth = 0) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object' || depth > 5) return [];

  for (const key of employeeArrayKeys) {
    const result = findEmployeeArray(value[key], depth + 1);
    if (result.length > 0) return result;
  }

  for (const nestedValue of Object.values(value)) {
    const result = findEmployeeArray(nestedValue, depth + 1);
    if (result.length > 0) return result;
  }

  return [];
}

export function extractEmployees(response) {
  return findEmployeeArray(response?.data ?? response);
}
