import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import './SprintManager.css';

function SprintManager({ team }) {
  const [sprints, setSprints] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sprintData, setSprintData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goal: ''
  });
  const [activeSprint, setActiveSprint] = useState(null);

  useEffect(() => {
    loadSprints();
  }, [team]);

  async function loadSprints() {
    try {
      const sprintsQuery = query(
        collection(db, 'sprints'),
        where('teamId', '==', team.id)
      );
      const querySnapshot = await getDocs(sprintsQuery);
      const sprintsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      sprintsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setSprints(sprintsData);
      
      const active = sprintsData.find(s => s.status === 'active');
      setActiveSprint(active);
    } catch (error) {
      console.error('Erro ao carregar sprints:', error);
    }
  }

  async function handleCreateSprint(e) {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'sprints'), {
        ...sprintData,
        teamId: team.id,
        status: 'planned',
        createdAt: new Date().toISOString()
      });

      setSprintData({ name: '', startDate: '', endDate: '', goal: '' });
      setShowCreateModal(false);
      loadSprints();
    } catch (error) {
      alert('Erro ao criar sprint: ' + error.message);
    }
  }

  async function handleStartSprint(sprint) {
    if (activeSprint) {
      alert('Já existe uma sprint ativa. Finalize-a primeiro.');
      return;
    }

    try {
      await updateDoc(doc(db, 'sprints', sprint.id), {
        status: 'active',
        startedAt: new Date().toISOString()
      });
      loadSprints();
    } catch (error) {
      alert('Erro ao iniciar sprint: ' + error.message);
    }
  }

  async function handleCompleteSprint(sprint) {
    if (!window.confirm('Deseja finalizar esta sprint?')) return;

    try {
      await updateDoc(doc(db, 'sprints', sprint.id), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      loadSprints();
    } catch (error) {
      alert('Erro ao finalizar sprint: ' + error.message);
    }
  }

  async function handleDeleteSprint(sprintId) {
    if (!window.confirm('Deseja excluir esta sprint?')) return;

    try {
      await deleteDoc(doc(db, 'sprints', sprintId));
      loadSprints();
    } catch (error) {
      alert('Erro ao excluir sprint: ' + error.message);
    }
  }

  function getDaysRemaining(endDate) {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function getProgress(sprint) {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const today = new Date();
    const total = end - start;
    const elapsed = today - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  return (
    <div className="sprint-manager">
      <div className="sprint-header">
        <h2>🏃 Gerenciamento de Sprints</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-create-sprint">
          ➕ Nova Sprint
        </button>
      </div>

      {activeSprint && (
        <div className="active-sprint">
          <div className="sprint-badge active">🔥 Sprint Ativa</div>
          <h3>{activeSprint.name}</h3>
          <p className="sprint-goal">🎯 {activeSprint.goal}</p>
          <div className="sprint-dates">
            <span>📅 {new Date(activeSprint.startDate).toLocaleDateString('pt-BR')}</span>
            <span>→</span>
            <span>📅 {new Date(activeSprint.endDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="sprint-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgress(activeSprint)}%` }}
              />
            </div>
            <p className="days-remaining">
              {getDaysRemaining(activeSprint.endDate) > 0 
                ? `${getDaysRemaining(activeSprint.endDate)} dias restantes`
                : 'Sprint finalizada'}
            </p>
          </div>
          <button 
            onClick={() => handleCompleteSprint(activeSprint)} 
            className="btn-complete-sprint"
          >
            ✓ Finalizar Sprint
          </button>
        </div>
      )}

      <div className="sprints-list">
        <h3>Todas as Sprints</h3>
        {sprints.length === 0 ? (
          <p className="empty-message">Nenhuma sprint criada ainda.</p>
        ) : (
          sprints.map(sprint => (
            <div key={sprint.id} className={`sprint-item ${sprint.status}`}>
              <div className="sprint-item-header">
                <h4>{sprint.name}</h4>
                <span className={`sprint-badge ${sprint.status}`}>
                  {sprint.status === 'active' ? '🔥 Ativa' : 
                   sprint.status === 'completed' ? '✓ Concluída' : '📋 Planejada'}
                </span>
              </div>
              <p>{sprint.goal}</p>
              <div className="sprint-dates">
                <span>{new Date(sprint.startDate).toLocaleDateString('pt-BR')}</span>
                <span>→</span>
                <span>{new Date(sprint.endDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="sprint-actions">
                {sprint.status === 'planned' && (
                  <button onClick={() => handleStartSprint(sprint)} className="btn-start">
                    ▶️ Iniciar
                  </button>
                )}
                {sprint.status !== 'active' && (
                  <button onClick={() => handleDeleteSprint(sprint.id)} className="btn-delete">
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Criar Nova Sprint</h2>
            <form onSubmit={handleCreateSprint}>
              <div className="form-group">
                <label>Nome da Sprint *</label>
                <input
                  type="text"
                  value={sprintData.name}
                  onChange={(e) => setSprintData({ ...sprintData, name: e.target.value })}
                  placeholder="Ex: Sprint 1 - MVP"
                  required
                />
              </div>
              <div className="form-group">
                <label>Objetivo da Sprint *</label>
                <textarea
                  value={sprintData.goal}
                  onChange={(e) => setSprintData({ ...sprintData, goal: e.target.value })}
                  placeholder="Ex: Desenvolver tela de login e autenticação"
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data de Início *</label>
                  <input
                    type="date"
                    value={sprintData.startDate}
                    onChange={(e) => setSprintData({ ...sprintData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Data de Término *</label>
                  <input
                    type="date"
                    value={sprintData.endDate}
                    onChange={(e) => setSprintData({ ...sprintData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SprintManager;
