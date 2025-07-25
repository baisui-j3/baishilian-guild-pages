import React, { useState, useEffect } from 'react';
import CharacterCard from '../components/CharacterCard';
import { getApprovedCharacters } from '../services/api';

const Home = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const data = await getApprovedCharacters();
        setCharacters(data);
      } catch (err) {
        setError('加载角色数据失败，请稍后重试');
        console.error('加载角色数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCharacters();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-page">
      <h2>清音帮会成员名片墙</h2>
      
      {characters.length === 0 ? (
        <p>暂无成员名片，请登录后上传你的名片！</p>
      ) : (
        <div className="character-grid">
          {characters.map(character => (
            <CharacterCard 
              key={character.id} 
              character={character} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;