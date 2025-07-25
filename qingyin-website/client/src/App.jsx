import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeSelector from './components/ThemeSelector';

// 动态加载主题样式
const loadThemeStyle = (theme) => {
  const linkId = 'theme-style';
  let link = document.getElementById(linkId);
  
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  
  link.href = `/themes/${theme}.css`;
};

// 主题包装器
const ThemeWrapper = ({ children }) => {
  const { themeColor } = useTheme();
  
  useEffect(() => {
    loadThemeStyle(themeColor);
  }, [themeColor]);
  
  return children;
};

// 需要认证的组件
const PrivateRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <Router>
          <div className="app-container">
            <Header />
            <ThemeSelector />
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 用户个人中心（需要登录） */}
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                
                {/* 管理员面板（需要管理员权限） */}
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute adminOnly={true}>
                      <Admin />
                    </PrivateRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

export default App;