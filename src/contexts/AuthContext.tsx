import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types/leave';
import { apiClient } from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined users for development/testing
const PREDEFINED_USERS: Array<User & { password: string }> = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Alice Johnson',
    email: 'alice@college.edu',
    password: 'password',
    role: 'student',
    department: 'Computer Science',
    username: 'student1',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Prof. Smith',
    email: 'smith@college.edu',
    password: 'password',
    role: 'advisor',
    department: 'Computer Science',
    username: 'advisor1',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Dr. Brown',
    email: 'brown@college.edu',
    password: 'password',
    role: 'hod',
    department: 'Computer Science',
    username: 'hod1',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Principal Lee',
    email: 'lee@college.edu',
    password: 'password',
    role: 'principal',
    department: 'Administration',
    username: 'principal1',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'System Administrator',
    email: 'bashaimran021@gmail.com',
    password: '12345678',
    role: 'admin',
    department: 'IT Administration',
    username: 'admin',
  },
];

export { PREDEFINED_USERS };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('approveiq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      apiClient.setCurrentUser(user);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const found = PREDEFINED_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!found) {
        return { success: false, error: 'Invalid username or password' };
      }

      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem('approveiq_user', JSON.stringify(userData));
      apiClient.setCurrentUser(userData);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('approveiq_user');
    apiClient.setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
