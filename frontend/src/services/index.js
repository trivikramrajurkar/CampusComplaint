import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getClasses: () => api.get('/auth/classes'),
};

export const complaintService = {
  create: (formData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMy: () => api.get('/complaints/my'),
  getById: (id) => api.get(`/complaints/${id}`),
  submitFeedback: (id, data) => api.post(`/complaints/${id}/feedback`, data),
  getFeedback: (id) => api.get(`/complaints/${id}/feedback`),
};

export const coordinatorService = {
  getComplaints: () => api.get('/coordinator/complaints'),
  getComplaintById: (id) => api.get(`/coordinator/complaints/${id}`),
  verify: (id, data) => api.put(`/coordinator/complaints/${id}/verify`, data),
  reject: (id, data) => api.put(`/coordinator/complaints/${id}/reject`, data),
};

export const adminService = {
  getComplaints: (status) =>
    api.get('/admin/complaints', { params: status ? { status } : {} }),
  getComplaintById: (id) => api.get(`/admin/complaints/${id}`),
  assign: (id, data) => api.put(`/admin/complaints/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/admin/complaints/${id}/status`, data),
  getDepartments: () => api.get('/admin/departments'),
};
