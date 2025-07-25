import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} 剑网三浩气《清音》帮会</p>
        <p>纵月 · 浩气</p>
      </div>
    </footer>
  );
};

export default Footer;