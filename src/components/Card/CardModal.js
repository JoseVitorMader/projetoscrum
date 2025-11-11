import React, { useState, useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './CardModal.css';

function CardModal({ card, onClose, onUpdate }) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'medium');
  const [tags, setTags] = useState(card.tags || []);
  const [newTag, setNewTag] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [card.id]);

  async function loadComments() {
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('cardId', '==', card.id),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(commentsQuery);
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const cardRef = doc(db, 'cards', card.id);
      await updateDoc(cardRef, {
        title,
        description,
        priority,
        tags,
        updatedAt: new Date().toISOString()
      });
      
      if (onUpdate) {
        onUpdate({
          ...card,
          title,
          description,
          priority,
          tags
        });
      }
      
      onClose();
    } catch (error) {
      alert('Erro ao salvar card: ' + error.message);
    }
    setLoading(false);
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        cardId: card.id,
        text: newComment,
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      setNewComment('');
      loadComments();
    } catch (error) {
      alert('Erro ao adicionar comentário: ' + error.message);
    }
    setLoading(false);
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Deseja excluir este comentário?')) return;
    
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      loadComments();
    } catch (error) {
      alert('Erro ao excluir comentário: ' + error.message);
    }
  }

  function handleAddTag() {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  const priorityColors = {
    high: '#e53e3e',
    medium: '#ff8c42',
    low: '#48bb78'
  };

  const priorityLabels = {
    high: '🔴 Alta',
    medium: '🟠 Média',
    low: '🟢 Baixa'
  };

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="modal-title-input"
            placeholder="Título do card"
          />
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <label>📝 Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição detalhada..."
              rows="4"
            />
          </div>

          <div className="modal-section">
            <label>⚡ Prioridade</label>
            <div className="priority-buttons">
              {Object.keys(priorityLabels).map(p => (
                <button
                  key={p}
                  className={`priority-btn ${priority === p ? 'active' : ''}`}
                  style={{ 
                    borderColor: priorityColors[p],
                    color: priority === p ? 'white' : priorityColors[p],
                    background: priority === p ? priorityColors[p] : 'white'
                  }}
                  onClick={() => setPriority(p)}
                >
                  {priorityLabels[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <label>🏷️ Tags</label>
            <div className="tags-container">
              {tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>✕</button>
                </span>
              ))}
            </div>
            <div className="tag-input-container">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Adicionar tag..."
              />
              <button onClick={handleAddTag} className="add-tag-btn">+</button>
            </div>
          </div>

          <div className="modal-section">
            <label>💬 Comentários ({comments.length})</label>
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <strong>{comment.author}</strong>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p>{comment.text}</p>
                  {comment.authorId === currentUser.uid && (
                    <button 
                      className="delete-comment-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="add-comment">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                rows="2"
              />
              <button 
                onClick={handleAddComment} 
                disabled={loading || !newComment.trim()}
                className="btn-primary"
              >
                Comentar
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardModal;
