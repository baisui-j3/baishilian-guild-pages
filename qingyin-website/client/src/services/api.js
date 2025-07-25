import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 通过proxy代理到后端
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  response => response.data,
  error => {
    const { response } = error;
    
    // 未认证或token过期
    if (response?.status === 401) {
      // 如果后端返回401（未授权），则清除token并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 将后端返回的错误信息传递下去
    return Promise.reject({
      message: response?.data?.error || '网络错误，请稍后重试',
      status: response?.status,
      response
    });
  }
);

/******************
 * 认证相关API
 ******************/

// 用户注册
export const register = (username, password) => {
  return api.post('/auth/register', { username, password });
};

// 用户登录
export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return api.get('/auth/me');
};

// 修改密码
export const changePassword = (currentPassword, newPassword) => {
  return api.put('/auth/password', { currentPassword, newPassword });
};

// 注销账户
export const deleteAccount = () => {
  return api.delete('/auth/account');
};

// 管理员重置用户密码
export const resetUserPassword = (userId, newPassword) => {
  return api.put(`/auth/users/${userId}/password`, { newPassword });
};

// ...之前的api代码...

/******************
 * 角色相关API
 ******************/

// 添加新角色
export const addCharacter = (gameId) => {
  return api.post('/characters', { gameId });
};

// 更新角色签名
export const updateSignature = (characterId, signature) => {
  return api.put(`/characters/${characterId}/signature`, { signature });
};

// 上传角色截图
export const uploadScreenshot = (characterId, file) => {
  const formData = new FormData();
  formData.append('screenshot', file);
  return api.post(`/characters/${characterId}/screenshot`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 获取用户所有角色
export const getUserCharacters = () => {
  return api.get('/characters');
};

// 删除角色
export const deleteCharacter = (characterId) => {
  return api.delete(`/characters/${characterId}`);
};

// 获取所有已审核角色（主页展示）
export const getApprovedCharacters = () => {
  return api.get('/characters/approved');
};

// 管理员获取待审核角色
export const getPendingApprovals = () => {
  return api.get('/admin/approvals');
};

// 管理员处理审核
export const handleApproval = (characterId, approve) => {
  return api.put(`/admin/approvals/${characterId}`, { approve });
};

// ...之前的API代码...

/******************
 * 管理员相关API
 ******************/

// 获取所有用户
export const getAllUsers = () => {
  return api.get('/admin/users');
};

// 重置用户密码
export const resetUserPassword = (userId, newPassword) => {
  return api.put(`/admin/users/${userId}/password`, { newPassword });
};

// 获取当前主题
export const getTheme = () => {
  return api.get('/theme');
};

// 更新主题
export const updateTheme = (themeColor) => {
  return api.put('/theme', { themeColor });
};

export default api;