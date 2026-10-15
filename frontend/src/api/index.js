import api from './client';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  deleteAccount: (data) => api.delete('/auth/delete-account', { data }),
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => api.get('/resume/list'),
  get: (id) => api.get(`/resume/${id}`),
  delete: (id) => api.delete(`/resume/${id}`),
  matchJD: (id, data) => api.post(`/resume/${id}/match`, data),
  listMatches: () => api.get('/resume/matches'),
};

export const interviewAPI = {
  start: (data) => api.post('/interview/start', data),
  get: (id) => api.get(`/interview/${id}`),
  submitAnswer: (interviewId, questionId, data) =>
    api.post(`/interview/${interviewId}/answer/${questionId}`, data),
  complete: (id) => api.post(`/interview/${id}/complete`),
  history: () => api.get('/interview/history'),
  delete: (id) => api.delete(`/interview/${id}`),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard/'),
  skillChart: () => api.get('/dashboard/skill-chart'),
};

export const jobsAPI = {
  search: (params) => api.get('/jobs/search', { params }),
  save: (data) => api.post('/jobs/save', data),
  saved: () => api.get('/jobs/saved'),
  unsave: (id) => api.delete(`/jobs/saved/${id}`),
};

export const roadmapAPI = {
  generate: (data) => api.post('/roadmap/generate', data),
  list: () => api.get('/roadmap/'),
  get: (id) => api.get(`/roadmap/${id}`),
  delete: (id) => api.delete(`/roadmap/${id}`),
};

export const linkedinAPI = {
  analyze: (data) => api.post('/linkedin/analyze', data),
};

export const projectsAPI = {
  recommend: (data) => api.post('/projects/recommend', data),
};

export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
};
