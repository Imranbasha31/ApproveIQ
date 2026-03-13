var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const API_BASE_URL = "/api";
class APIClient {
  constructor() {
    __publicField(this, "currentUser", null);
    try {
      const saved = localStorage.getItem("approveiq_user");
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
    }
  }
  setCurrentUser(user) {
    this.currentUser = user;
  }
  getAuthHeaders() {
    const headers = {};
    if (this.currentUser) {
      headers["x-user-id"] = this.currentUser.id;
      headers["x-username"] = this.currentUser.username;
      headers["x-user-name"] = this.currentUser.name;
      headers["x-user-role"] = this.currentUser.role;
      headers["x-user-department"] = this.currentUser.department || "";
    }
    return headers;
  }
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeaders()
    };
    return headers;
  }
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });
    if (!response.ok) {
      let message = `API request failed with status ${response.status}`;
      try {
        const error = await response.json();
        message = error.error || error.message || message;
      } catch {
      }
      throw new Error(message);
    }
    return response.json();
  }
  // Auth endpoints
  async loginUser(email, password) {
    return this.request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  }
  async getCurrentUser() {
    return this.request("/users/me");
  }
  async getUsers() {
    return this.request("/users");
  }
  // Leave endpoints
  async getLeaves() {
    return this.request("/leaves");
  }
  async createLeave(data, file) {
    if (file) {
      const formData = new FormData();
      formData.append("leave_type", data.leave_type);
      formData.append("start_date", data.start_date);
      formData.append("end_date", data.end_date);
      formData.append("reason", data.reason);
      formData.append("proof_file", file);
      const url = `${API_BASE_URL}/leaves`;
      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData
      });
      if (!response.ok) {
        let message = `API request failed with status ${response.status}`;
        try {
          const error = await response.json();
          message = error.error || error.message || message;
        } catch {
        }
        throw new Error(message);
      }
      return response.json();
    }
    return this.request("/leaves", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async updateLeave(id, data) {
    return this.request(`/leaves/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }
  // User management endpoints (admin)
  async createUser(data) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }
  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: "DELETE"
    });
  }
  async exportLeavesCSV() {
    const url = `${API_BASE_URL}/leaves/export/csv`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error("Failed to export CSV");
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "leave_requests.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
}
const apiClient = new APIClient();
export {
  apiClient
};
