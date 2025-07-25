import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 实时验证字段
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'username':
        if (value.length < 3) {
          newErrors.username = '用户名至少需要3个字符';
        } else if (value.length > 20) {
          newErrors.username = '用户名不能超过20个字符';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'password':
        if (value.length < 6) {
          newErrors.password = '密码至少需要6个字符';
        } else {
          delete newErrors.password;
          
          // 如果密码改变，检查确认密码是否匹配
          if (formData.confirmPassword && value !== formData.confirmPassword) {
            newErrors.confirmPassword = '两次输入的密码不一致';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = '两次输入的密码不一致';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = '用户名长度需在3-20字符之间';
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      await register(formData.username, formData.password);
      setSuccess(true);
      
      // 3秒后跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      let errorMessage = '注册失败，请重试';
      
      if (err.response) {
        if (err.response.data.error === '用户名已存在') {
          setErrors({ username: '该用户名已被使用' });
        } else {
          errorMessage = err.response.data.error || '注册失败，请重试';
          setErrors({ general: errorMessage });
        }
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>创建清音帮会账号</h2>
        
        {success ? (
          <div className="success-message">
            <p>注册成功！即将跳转到登录页面...</p>
            <Link to="/login">立即登录</Link>
          </div>
        ) : (
          <>
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? 'error' : ''}
                  required
                />
                {errors.username && <div className="error-feedback">{errors.username}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  required
                />
                {errors.password && <div className="error-feedback">{errors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">确认密码</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  required
                />
                {errors.confirmPassword && <div className="error-feedback">{errors.confirmPassword}</div>}
              </div>
              
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </button>
            </form>
            
            <div className="auth-links">
              <span>已有账号？</span>
              <Link to="/login">立即登录</Link>
            </div>
            
            <div className="auth-links">
              <Link to="/">返回首页</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;