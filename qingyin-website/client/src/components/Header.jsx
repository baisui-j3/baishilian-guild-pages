import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>剑网三浩气《清音》帮会</h1>
        </Link>
        
        <nav className="nav-links">
          <Link to="/">首页</Link>
          
          {user ? (
            <>
              <Link to="/profile">个人中心</Link>
              {user.isAdmin && <Link to="/admin">管理员面板</Link>}
              <button className="logout-btn" onClick={logout}>退出</button>
            </>
          ) : (
            <>
              <Link to="/login">登录</Link>
              <Link to="/register">注册</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;