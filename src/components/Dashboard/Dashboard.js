import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

function Dashboard({ onSelectTeam }) {
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function loadTeams() {
    if (!currentUser) return;

    try {
      const teamsQuery = query(
        collection(db, 'teams'),
        where('members', 'array-contains', currentUser.uid)
      );
      const querySnapshot = await getDocs(teamsQuery);
      const teamsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    }
  }

  async function handleCreateTeam(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const teamData = {
        name: teamName,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        members: [currentUser.uid],
        memberEmails: [currentUser.email]
      };

      const docRef = await addDoc(collection(db, 'teams'), teamData);
      
      // Create default columns for the team
      const defaultColumns = ['Backlog', 'To Do', 'Doing', 'Done'];
      for (let i = 0; i < defaultColumns.length; i++) {
        await addDoc(collection(db, 'lists'), {
          teamId: docRef.id,
          name: defaultColumns[i],
          order: i,
          createdAt: new Date().toISOString()
        });
      }

      setTeamName('');
      setShowCreateModal(false);
      loadTeams();
    } catch (error) {
      alert('Erro ao criar equipe: ' + error.message);
    }

    setLoading(false);
  }

  async function handleInviteMember(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Normalizar email (lowercase, trim)
      const emailNormalized = inviteEmail.toLowerCase().trim();
      
      // Find user by email em toda a coleção users
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', emailNormalized)
      );
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        alert('❌ Usuário não encontrado.\n\nCertifique-se de que:\n1. O email está correto\n2. O usuário já criou uma conta no sistema');
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      
      // Verificar se já é membro
      if (selectedTeam.members.includes(userId)) {
        alert('⚠️ Este usuário já é membro da equipe!');
        setLoading(false);
        return;
      }

      // Add user to team
      const teamRef = doc(db, 'teams', selectedTeam.id);
      await updateDoc(teamRef, {
        members: arrayUnion(userId),
        memberEmails: arrayUnion(emailNormalized)
      });

      setInviteEmail('');
      setShowInviteModal(false);
      setSelectedTeam(null);
      loadTeams();
      alert('✅ Membro convidado com sucesso!');
    } catch (error) {
      console.error('Erro ao convidar:', error);
      alert('Erro ao convidar membro: ' + error.message);
    }

    setLoading(false);
  }

  function openInviteModal(team) {
    setSelectedTeam(team);
    setShowInviteModal(true);
  }

  function openEditModal(team) {
    setSelectedTeam(team);
    setTeamName(team.name);
    setShowEditModal(true);
  }

  async function handleEditTeam(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const teamRef = doc(db, 'teams', selectedTeam.id);
      await updateDoc(teamRef, {
        name: teamName,
        updatedAt: new Date().toISOString()
      });

      setTeamName('');
      setShowEditModal(false);
      setSelectedTeam(null);
      loadTeams();
      alert('✅ Equipe atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao editar equipe: ' + error.message);
    }

    setLoading(false);
  }

  async function handleDeleteTeam(team) {
    if (!window.confirm(`⚠️ Tem certeza que deseja excluir a equipe "${team.name}"?\n\nEsta ação não pode ser desfeita e todos os dados (listas e cards) serão mantidos, mas a equipe será removida.`)) {
      return;
    }

    setLoading(true);

    try {
      // Delete team
      await deleteDoc(doc(db, 'teams', team.id));
      
      loadTeams();
      alert('✅ Equipe excluída com sucesso!');
    } catch (error) {
      alert('Erro ao excluir equipe: ' + error.message);
    }

    setLoading(false);
  }

  async function handleLeaveTeam(team) {
    if (!window.confirm(`Deseja sair da equipe "${team.name}"?`)) {
      return;
    }

    setLoading(true);

    try {
      const teamRef = doc(db, 'teams', team.id);
      await updateDoc(teamRef, {
        members: arrayRemove(currentUser.uid),
        memberEmails: arrayRemove(currentUser.email)
      });

      loadTeams();
      alert('✅ Você saiu da equipe!');
    } catch (error) {
      alert('Erro ao sair da equipe: ' + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <img src="/mascot.png" alt="Mascote Scrum" className="dashboard-mascot" />
          <h1> Minhas Equipes Scrum</h1>
        </div>
        <div className="header-actions">
          <span className="user-info">👤 {currentUser?.displayName || currentUser?.email}</span>
          <button onClick={logout} className="btn-secondary">Sair</button>
        </div>
      </div>

      <div className="teams-container">
        <button onClick={() => setShowCreateModal(true)} className="create-team-btn">
          ➕ Criar Nova Equipe
        </button>

        <div className="teams-grid">
          {teams.map(team => {
            const isCreator = team.createdBy === currentUser.uid;
            return (
              <div key={team.id} className="team-card">
                <div className="team-card-header">
                  <h3>{team.name}</h3>
                  {isCreator && <span className="creator-badge">� Criador</span>}
                </div>
                <p>�👥 {team.members.length} membros</p>
                <div className="team-actions">
                  <button onClick={() => onSelectTeam(team)} className="btn-primary">
                    Abrir Board
                  </button>
                  <button onClick={() => openInviteModal(team)} className="btn-invite">
                    Convidar
                  </button>
                </div>
                <div className="team-secondary-actions">
                  {isCreator ? (
                    <>
                      <button onClick={() => openEditModal(team)} className="btn-edit" title="Editar equipe">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteTeam(team)} className="btn-delete" title="Excluir equipe">
                        🗑️
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleLeaveTeam(team)} className="btn-leave" title="Sair da equipe">
                      🚪 Sair
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {teams.length === 0 && (
          <div className="empty-state">
            <p>Você ainda não faz parte de nenhuma equipe.</p>
            <p>Crie uma nova equipe para começar! 🚀</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Criar Nova Equipe</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Nome da Equipe</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex: Equipe Alpha"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Convidar Membro</h2>
            <p className="modal-info">Equipe: <strong>{selectedTeam?.name}</strong></p>
            <p className="modal-hint">💡 O usuário precisa estar cadastrado no sistema</p>
            <form onSubmit={handleInviteMember}>
              <div className="form-group">
                <label>Email do Membro</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Equipe</h2>
            <form onSubmit={handleEditTeam}>
              <div className="form-group">
                <label>Nome da Equipe</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex: Equipe Alpha"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
