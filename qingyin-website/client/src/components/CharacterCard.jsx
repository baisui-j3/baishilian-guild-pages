import React from 'react';
import { useAuth } from '../context/AuthContext';

const CharacterCard = ({ character, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && character.userId === user.id;
  
  return (
    <div className="character-card">
      <div className="character-header">
        <h3 className="character-name">{character.gameId}</h3>
        {isOwner && (
          <div className="character-actions">
            <button 
              className="btn-icon" 
              onClick={() => onDelete(character.id)}
              title="删除角色"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      {character.screenshotPath && (
        <div className="character-screenshot">
          <img 
            src={`/uploads/${character.screenshotPath}`} 
            alt={`${character.gameId}的名片截图`} 
          />
        </div>
      )}
      
      {character.signature && (
        <div className="character-signature">
          <p>{character.signature}</p>
        </div>
      )}
      
      {character.isApproved === false && (
        <div className="character-status rejected">
          <span>X 未通过审核 X</span>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;