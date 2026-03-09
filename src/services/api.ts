const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email?: string;
  department?: string;
}

export interface LeaveRequestDTO {
  id: string;
  student_id: string;
  student_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  current_stage?: number;
  created_at: string;
  updated_at: string;
}

class APIClient {
  private currentUser: User | null = null;

  constructor() {
    // Initialize from localStorage so auth headers are available immediately on refresh
    try {
      const saved = localStorage.getItem('approveiq_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      // ignore parse errors
    }
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.currentUser) {
      headers['x-user-id'] = this.currentUser.id;
      headers['x-username'] = this.currentUser.username;
      headers['x-user-name'] = this.currentUser.name;
      headers['x-user-role'] = this.currentUser.role;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = `API request failed with status ${response.status}`;
      try {
        const error = await response.json();
        message = error.error || error.message || message;
      } catch {
        // JSON parse failed, use default message
      }
      throw new Error(message);
    }

    return response.json();
  }

  // Auth endpoints
  async loginUser(email: string, password: string): Promise<User> {
    return this.request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  // Leave endpoints
  async getLeaves(): Promise<LeaveRequestDTO[]> {
    return this.request<LeaveRequestDTO[]>('/leaves');
  }

  async createLeave(data: {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }): Promise<{ message: string }> {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeave(id: string, data: {
    status: string;
    current_stage?: number;
    approver_stage?: number;
    comments?: string;
  }): Promise<{ message: string }> {
    return this.request(`/leaves/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // User management endpoints (admin)
  async createUser(data: {
    name: string;
    email: string;
    role: string;
    department?: string;
    username?: string;
    password?: string;
  }): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
  }): Promise<{ message: string }> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new APIClient();
