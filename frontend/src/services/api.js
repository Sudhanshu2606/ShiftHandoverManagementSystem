import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7210/api",
});

// Add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ============ AUTH APIs ============
export const login = (data) => API.post("/Auth/login", data);
export const register = (data) => API.post("/Auth/register", data);

// ============ USER APIs ============
export const getUsers = () => API.get("/User");
export const getUsersByShift = (shift) => API.get(`/User/shift/${shift}`);
export const getUsersByRole = (role) => API.get(`/User/role/${role}`);

// ============ HANDOVER APIs ============
export const getHandovers = () => API.get("/Handover");
export const getHandover = (id) => API.get(`/Handover/${id}`);
export const createHandover = (data) => API.post("/Handover", data);
export const updateHandover = (id, data) => API.put(`/Handover/${id}`, data);
export const deleteHandover = (id) => API.delete(`/Handover/${id}`);

// ============ TASK APIs ============
export const getTasksByHandover = (handoverId) =>
  API.get(`/Task/handover/${handoverId}`);
export const getAllTasks = () => API.get("/Task/all");
export const getMyTasks = () => API.get("/Task/my-tasks");
export const getTasksAssignedToMe = () => API.get("/Task/assigned-to-me");
export const getTasksByShift = (shift) => API.get(`/Task/shift/${shift}`);
export const getTasksCreatedByMe = (userId) =>
  API.get(`/Task/created-by/${userId}`);
export const createTask = (data) => API.post("/Task", data);
export const updateTask = (id, data) => API.put(`/Task/${id}`, data);
export const updateTaskStatus = (id, status) => {
  return API.put(`/Task/${id}/status`, status, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
export const reassignTask = (id, newAssignedTo) => {
  return API.put(`/Task/${id}/reassign`, newAssignedTo, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
export const deleteTask = (id) => API.delete(`/Task/${id}`);

// ============ ISSUE APIs ============
export const getIssuesByHandover = (handoverId) =>
  API.get(`/Issue/handover/${handoverId}`);
export const createIssue = (data) => API.post("/Issue", data);
export const updateIssue = (id, data) => API.put(`/Issue/${id}`, data);
export const deleteIssue = (id) => API.delete(`/Issue/${id}`);
