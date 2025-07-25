import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  addCharacter, 
  getUserCharacters, 
  updateSignature, 
  uploadScreenshot, 
  deleteCharacter,
  changePassword as changePasswordApi,
  deleteAccount as deleteAccountApi
} from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGameId, setNewGameId] = useState('');
  const [editingSignature, setEditingSignature] = useState({});
  const [uploadingScreenshot, setUploadingScreenshot] = useState({});
  
  // 密码修改相关状态
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  // 注销账户状态
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCharacters();
    }
  }, [user]);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const data = await getUserCharacters();
      setCharacters(data);
    } catch (err) {
      setError('加载角色数据失败，请稍后重试');
      console.error('加载角色数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCharacter = async () => {
    if (!newGameId.trim()) {
      setError('游戏ID不能为空');
      return;
    }
    
    try {
      await addCharacter(newGameId.trim());
      setNewGameId('');
      fetchCharacters(); // 刷新列表
    } catch (err) {
      setError(err.message || '添加角色失败');
    }
  };

  const handleDeleteCharacter = async (characterId) => {
    if (window.confirm('确定要删除这个角色吗？')) {
      try {
        await deleteCharacter(characterId);
        fetchCharacters(); // 刷新列表
      } catch (err) {
        setError('删除角色失败');
      }
    }
  };

  const handleUpdateSignature = async (characterId) => {
    const signature = editingSignature[characterId];
    if (!signature || signature.length > 50) {
      setError('签名不能为空且不超过50字');
      return;
    }
    
    try {
      await updateSignature(characterId, signature);
      setEditingSignature(prev => ({ ...prev, [characterId]: '' }));
      fetchCharacters(); // 刷新列表
    } catch (err) {
      setError('更新签名失败');
    }
  };

  const handleUploadScreenshot = async (characterId, file) => {
    if (!file) return;
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('只允许上传图片文件 (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    // 验证文件大小 (5MB限制)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }
    
    try {
      setUploadingScreenshot(prev => ({ ...prev, [characterId]: true }));
      await uploadScreenshot(characterId, file);
      fetchCharacters(); // 刷新列表
    } catch (err) {
      setError('上传截图失败');
    } finally {
      setUploadingScreenshot(prev => ({ ...prev, [characterId]: false }));
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('所有字段都必须填写');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('新密码和确认密码不一致');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('新密码长度至少为6个字符');
      return;
    }
    
    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      alert('密码修改成功！');
    } catch (err) {
      setPasswordError(err.message || '修改密码失败');
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      await deleteAccountApi();
      logout();
      alert('账户已成功注销');
    } catch (err) {
      setError('注销账户失败');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="profile-page">
      <h2>个人中心</h2>
      <p>欢迎回来，{user.username}！</p>
      
      {error && <div className="error">{error}</div>}
      
      {/* 账户管理部分 */}
      <div className="account-section">
        <h3>账户管理</h3>
        
        <button 
          className="btn-change-password"
          onClick={() => setIsChangingPassword(!isChangingPassword)}
        >
          {isChangingPassword ? '取消修改' : '修改密码'}
        </button>
        
        {isChangingPassword && (
          <div className="change-password-form">
            <div className="form-group">
              <label>当前密码</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>新密码</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>确认新密码</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            {passwordError && <div className="error">{passwordError}</div>}
            <button 
              className="btn-submit"
              onClick={handleChangePassword}
            >
              确认修改
            </button>
          </div>
        )}
        
        <button 
          className="btn-delete-account"
          onClick={() => setIsDeletingAccount(true)}
        >
          注销账户
        </button>
        
        {isDeletingAccount && (
          <div className="delete-account-confirm">
            <p>确定要注销账户吗？所有数据将被永久删除！</p>
            <div className="confirmation-buttons">
              <button 
                className="btn-confirm-delete"
                onClick={handleDeleteAccount}
              >
                确认注销
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setIsDeletingAccount(false)}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 添加新角色表单 */}
      <div className="add-character-form">
        <h3>绑定新角色</h3>
        <div className="form-group">
          <input
            type="text"
            value={newGameId}
            onChange={(e) => setNewGameId(e.target.value)}
            placeholder="输入游戏角色ID"
          />
          <button onClick={handleAddCharacter}>绑定</button>
        </div>
        <p className="hint">每个账号最多绑定3个角色</p>
      </div>
      
      {/* 角色列表 */}
      <div className="character-list">
        <h3>我的角色</h3>
        
        {characters.length === 0 ? (
          <p>你还没有绑定任何角色</p>
        ) : (
          characters.map(character => (
            <div key={character.id} className="character-item">
              <div className="character-header">
                <strong>{character.gameId}</strong>
                
                {/* 审核状态显示 - 红色提示 */}
                {character.isApproved === false && (
                  <span className="status-rejected">X 未通过审核 X</span>
                )}
              </div>
              
              {/* 签名部分 */}
              <div className="signature-section">
                <label>个性签名（50字以内）</label>
                <div className="form-group">
                  <textarea
                    value={editingSignature[character.id] || character.signature || ''}
                    onChange={(e) => setEditingSignature(prev => ({
                      ...prev,
                      [character.id]: e.target.value
                    }))}
                    maxLength={50}
                    placeholder="输入个性签名"
                  />
                  <button 
                    onClick={() => handleUpdateSignature(character.id)}
                    disabled={!editingSignature[character.id] || editingSignature[character.id] === character.signature}
                  >
                    更新
                  </button>
                </div>
              </div>
              
              {/* 截图部分 */}
              <div className="screenshot-section">
                <label>名片截图</label>
                {character.screenshotPath ? (
                  <div className="screenshot-preview">
                    <img 
                      src={`/uploads/${character.screenshotPath}`} 
                      alt={`${character.gameId}的名片截图`} 
                    />
                  </div>
                ) : (
                  <p>未上传</p>
                )}
                
                <div className="form-group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadScreenshot(character.id, e.target.files[0])}
                    disabled={uploadingScreenshot[character.id]}
                  />
                  {uploadingScreenshot[character.id] && <span>上传中...</span>}
                </div>
              </div>
              
              {/* 角色操作 */}
              <div className="character-actions">
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteCharacter(character.id)}
                >
                  删除角色
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;