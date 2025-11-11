import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import './ActivityLog.css';

function ActivityLog({ teamId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [teamId]);

  async function loadActivities() {
    try {
      if (!teamId) {
        setActivities([]);
        setLoading(false);
        return;
      }
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('teamId', '==', teamId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(activitiesQuery);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setActivities(activitiesData);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  }

  function getActivityIcon(type) {
    const icons = {
      card_created: '➕',
      card_moved: '↔️',
      card_deleted: '🗑️',
      card_updated: '✏️',
      member_added: '👤',
      member_removed: '👋',
      sprint_started: '🏃',
      sprint_completed: '✅',
      comment_added: '💬'
    };
    return icons[type] || '📌';
  }

  function formatTime(timestamp) {
    let date;
    // support both Firestore Timestamp and ISO string
    if (timestamp && typeof timestamp === 'object' && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'ontem';
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  }

  const displayActivities = showAll ? activities : activities.slice(0, 10);

  if (loading) {
    return <div className="activity-log loading">Carregando atividades...</div>;
  }

  return (
    <div className="activity-log">
      <div className="activity-header">
        <h3>📜 Histórico de Atividades</h3>
        {activities.length > 10 && (
          <button 
            onClick={() => setShowAll(!showAll)} 
            className="toggle-activities"
          >
            {showAll ? 'Ver menos' : `Ver todas (${activities.length})`}
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <p className="empty-activities">Nenhuma atividade registrada ainda.</p>
      ) : (
        <div className="activities-list">
          {displayActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <span className="activity-icon">{getActivityIcon(activity.type)}</span>
              <div className="activity-content">
                <p className="activity-text">{activity.description}</p>
                <span className="activity-time">{formatTime(activity.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
