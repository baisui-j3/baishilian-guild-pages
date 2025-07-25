import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getPendingApprovals, 
  handleApproval,
  getAllUsers,
  resetUserPassword,
  getTheme,
  updateTheme
} from '../services/api';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCharacters, setPendingCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [themeColor, setThemeColor] = useState('pink');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  // 检查用户权限
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // 加载管理员数据
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取待审核角色
        const approvals = await getPendingApprovals();
        setPendingCharacters(approvals);
        
        // 获取所有用户
        const userList = await getAllUsers();
        setUsers(userList);
        
        // 获取当前主题
        const theme = await getTheme();
        setThemeColor(theme.themeColor);
        
      } catch (err) {
        setError('加载管理员数据失败');
        console.error('加载管理员数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.isAdmin) {
      fetchAdminData();
    }
  }, [user]);

  // 处理角色审核
  const handleApprovalAction = async (characterId, approve) => {
    try {
      await handleApproval(characterId, approve);
      setPendingCharacters(prev => prev.filter(char => char.id !== characterId));
    } catch (err) {
      setError(`处理审核失败: ${err.message}`);
    }
  };

  // 重置用户密码
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      setError('请选择用户并输入新密码');
      return;
    }
    
    try {
      setIsResettingPassword(true);
      setError('');
      
      const response = await resetUserPassword(selectedUser.id, newPassword);
      
      setNewPassword('');
      setSelectedUser(null);
      
      alert(`用户 ${selectedUser.username} 的密码已重置！新密码: ${response.newPassword}`);
    } catch (err) {
      setError('重置密码失败');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // 更新主题颜色
  const handleThemeChange = async (color) => {
    try {
      setIsUpdatingTheme(true);
      setError('');
      
      await updateTheme(color);
      setThemeColor(color);
      
      alert('主题更新成功！');
    } catch (err) {
      setError('更新主题失败');
    } finally {
      setIsUpdatingTheme(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="admin-page">
      <h2>管理员面板</h2>
      <p>欢迎回来，帮主！</p>
      
      {error && <div className="error">{error}</div>}
      
      {/* 用户管理部分 */}
      <div className="user-management">
        <h3>用户管理</h3>
        
        <div className="form-group">
          <label>选择用户</label>
          <select
            value={selectedUser ? selectedUser.id : ''}
            onChange={(e) => {
              const userId = parseInt(e.target.value);
              const user = users.find(u => u.id === userId);
              setSelectedUser(user);
            }}
          >
            <option value="">-- 选择用户 --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username} {user.isAdmin ? '(管理员)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        {selectedUser && (
          <div className="password-reset">
            <div className="form-group">
              <label>新密码</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="输入新密码或留空生成随机密码"
              />
            </div>
            <button 
              className="btn-reset"
              onClick={handleResetPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? '重置中...' : '重置密码'}
            </button>
          </div>
        )}
      </div>
      
      {/* 主题设置部分 */}
      <div className="theme-section">
        <h3>主题设置</h3>
        <div className="theme-colors">
          {['pink', 'red', 'blue', 'yellow', 'cyan', 'purple', 'black'].map(color => (
            <div 
              key={color}
              className={`theme-color-option ${themeColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleThemeChange(color)}
              title={color}
            />
          ))}
        </div>
        {isUpdatingTheme && <p>更新中...</p>}
      </div>
      
      {/* 待审核角色部分 */}
      <div className="approval-section">
        <h3>待审核角色</h3>
        
        {pendingCharacters.length === 0 ? (
          <p>没有待审核的角色</p>
        ) : (
          <div className="approval-list">
            {pendingCharacters.map(character => (
              <div key={character.id} className="approval-item">
                <div className="character-info">
                  <strong>{character.gameId}</strong>
                  <span>（由 {character.user?.username} 提交）</span>
                </div>
                
                {character.signature && (
                  <div className="signature">
                    <p>签名: {character.signature}</p>
                  </div>
                )}
                
                {character.screenshotPath && (
                  <div className="screenshot">
                    <img 
                      src={`/uploads/${character.screenshotPath}`} 
                      alt={`${character.gameId}的名片截图`} 
                    />
                  </div>
                )}
                
                <div className="approval-actions">
                  <button 
                    className="btn-approve"
                    onClick={() => handleApprovalAction(character.id, true)}
                  >
                    通过
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleApprovalAction(character.id, false)}
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;