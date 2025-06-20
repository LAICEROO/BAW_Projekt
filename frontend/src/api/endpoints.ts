import api from './api';

// Auth endpoints
export const login = (username: string, password: string) =>
  api.post('/token/', { username, password });

export const refreshToken = (refresh: string) =>
  api.post('/token/refresh/', { refresh });

// Employee endpoints
export const getEmployees = () => api.get('/employees/');
export const getEmployee = (id: number) => api.get(`/employees/${id}/`);
export const createEmployee = (data: any) => api.post('/employees/', data);
export const updateEmployee = (id: number, data: any) => api.put(`/employees/${id}/`, data);
export const deleteEmployee = (id: number) => api.delete(`/employees/${id}/`);
export const getMe = () => api.get('/employees/me/');
export const changePassword = (id: number, oldPassword: string, newPassword: string) => 
  api.patch(`/employees/${id}/change_password/`, { old_password: oldPassword, new_password: newPassword });

// Enclosure endpoints
export const getEnclosures = () => api.get('/enclosures/');
export const getEnclosure = (id: number) => api.get(`/enclosures/${id}/`);
export const createEnclosure = (data: any) => api.post('/enclosures/', data);
export const updateEnclosure = (id: number, data: any) => api.put(`/enclosures/${id}/`, data);
export const deleteEnclosure = (id: number) => api.delete(`/enclosures/${id}/`);

// Animal endpoints
export const getAnimals = () => api.get('/animals/');
export const getAnimal = (id: number) => api.get(`/animals/${id}/`);
export const createAnimal = (data: any) => api.post('/animals/', data);
export const updateAnimal = (id: number, data: any) => api.put(`/animals/${id}/`, data);
export const updateAnimalHealth = (id: number, data: any) => api.patch(`/animals/${id}/`, data);
export const deleteAnimal = (id: number) => api.delete(`/animals/${id}/`);

// Task endpoints
export const getTasks = () => api.get('/tasks/');
export const getTask = (id: number) => api.get(`/tasks/${id}/`);
export const createTask = (data: any) => api.post('/tasks/', data);
export const updateTask = (id: number, data: any) => api.put(`/tasks/${id}/`, data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}/`);

// Dashboard endpoints
export const getDashboardStats = () => api.get('/dashboard/'); 