import axios from 'axios';

const API = axios.create({ baseURL: 'http://100.66.89.46:3000' }); // Change this to your backend URL

export const login = (data) => API.post('/api/auth/login', data);
export const signup = (data) => API.post('/api/auth/signup', data);
export const addChild = (data, token) => API.post('/api/auth/add-child', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteChild = (id, token) => API.delete(`/api/auth/child/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
export const revokeAccess = (id, token) => API.put(`/api/auth/child/${id}/revoke`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});
export const fetchRtpsOptions = () => API.get('/rtps');