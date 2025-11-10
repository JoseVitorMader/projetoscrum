import React from 'react';
import './Card.css';

function Card({ card, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-header">
        <h4>{card.title}</h4>
        <div className="card-actions">
          <button onClick={onEdit} className="card-btn" title="Editar">✏️</button>
          <button onClick={onDelete} className="card-btn" title="Excluir">🗑️</button>
        </div>
      </div>
      
      {card.description && (
        <p className="card-description">{card.description}</p>
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
