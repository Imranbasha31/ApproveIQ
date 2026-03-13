import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/services/api";
const AuthContext = createContext(void 0);
const PREDEFINED_USERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Alice Johnson",
    email: "alice@college.edu",
    password: "password",
    role: "student",
    department: "Computer Science",
    username: "student1"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Prof. Smith",
    email: "smith@college.edu",
    password: "password",
    role: "advisor",
    department: "Computer Science",
    username: "advisor1"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Dr. Brown",
    email: "brown@college.edu",
    password: "password",
    role: "hod",
    department: "Computer Science",
    username: "hod1"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Principal Lee",
    email: "lee@college.edu",
    password: "password",
    role: "principal",
    department: "Administration",
    username: "principal1"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "System Administrator",
    email: "bashaimran021@gmail.com",
    password: "12345678",
    role: "admin",
    department: "IT Administration",
    username: "admin"
  }
];
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("approveiq_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (user) {
      apiClient.setCurrentUser(user);
    }
  }, [user]);
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      try {
        const userData2 = await apiClient.loginUser(email, password);
        if (userData2 && userData2.id) {
          userData2.id = userData2.id.toLowerCase();
          setUser(userData2);
          localStorage.setItem("approveiq_user", JSON.stringify(userData2));
          apiClient.setCurrentUser(userData2);
          return { success: true };
        }
        return { success: false, error: "Invalid email or password" };
      } catch (err) {
        if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
          return { success: false, error: err.message };
        }
      }
      const found = PREDEFINED_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) {
        return { success: false, error: "Invalid username or password" };
      }
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem("approveiq_user", JSON.stringify(userData));
      apiClient.setCurrentUser(userData);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("approveiq_user");
    apiClient.setCurrentUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  }}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export {
  AuthProvider,
  PREDEFINED_USERS,
  useAuth
};
