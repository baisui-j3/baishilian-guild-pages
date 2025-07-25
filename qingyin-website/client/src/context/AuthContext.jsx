import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (storedToken && storedUser) {
      setUser(storedUser);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setUser({
          ...response.data,
          isAdmin: response.data.isAdmin || false
        });
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      if (username === 'admin') {
        navigate('/admin');
        return { ...response.data, isAdmin: true };
      }
      
      navigate('/profile');
      return response.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword
      });
      return true;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout();
      return true;
    } catch (error) {
      console.error('注销账户失败:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    changePassword,
    deleteAccount,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && <div className="loading">加载中...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
};