import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextDef';
import { authAPI } from '../services/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  /**
   * User logout
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Validate token and synchronize user data on initial load
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getProfile();
        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.warn('[AuthContext] Session expired or invalid token:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [logout]);

  /**
   * User login
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed. Please try again.';
      throw new Error(message);
    }
  };

  /**
   * User registration
   */
  const register = async (name, email, password, role = 'user') => {
    try {
      const response = await authAPI.register({ name, email, password, role });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
