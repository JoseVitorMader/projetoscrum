import React from 'react';
import './Card.css';

function Card({ card, onEdit, onDelete, onClick }) {
  const priorityColors = {
    high: '#e53e3e',
    medium: '#ff8c42',
    low: '#48bb78'
  };

  const priorityLabels = {
    high: '🔴',
    medium: '🟠',
    low: '🟢'
  };

  return (
    <div className="card" onClick={onClick}>
      {card.priority && (
        <div 
          className="card-priority-indicator" 
          style={{ background: priorityColors[card.priority] }}
          title={`Prioridade ${card.priority === 'high' ? 'Alta' : card.priority === 'medium' ? 'Média' : 'Baixa'}`}
        />
      )}
      
      <div className="card-header">
        <h4>{card.title}</h4>
        <div className="card-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="card-btn" title="Editar">✏️</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="card-btn" title="Excluir">🗑️</button>
        </div>
      </div>
      
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}

      {card.tags && card.tags.length > 0 && (
        <div className="card-tags">
          {card.tags.slice(0, 3).map(tag => (
            <span key={tag} className="card-tag">{tag}</span>
          ))}
          {card.tags.length > 3 && (
            <span className="card-tag-more">+{card.tags.length - 3}</span>
          )}
        </div>
      )}
      
      <div className="card-footer">
        <span className="card-author">👤 {card.createdByName}</span>
        <span className="card-date">
          {new Date(card.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
}

export default Card;
