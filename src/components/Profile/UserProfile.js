import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

function UserProfile({ onBack }) {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    role: '',
    phone: '',
    location: '',
    photoURL: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          displayName: data.displayName || '',
          bio: data.bio || '',
          role: data.role || '',
          phone: data.phone || '',
          location: data.location || '',
          photoURL: data.photoURL || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Atualizar contexto
      if (updateUserProfile) {
        updateUserProfile(formData);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Carregando perfil...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button
          className="back-button"
          onClick={() => {
            if (typeof onBack === 'function') {
              onBack();
            } else {
              navigate('/dashboard');
            }
          }}
        >
          ← Voltar ao Dashboard
        </button>
        <h1>Meu Perfil</h1>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            {formData.photoURL ? (
              <img src={formData.photoURL} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{formData.displayName || 'Sem nome'}</h2>
            <p className="profile-email">{currentUser.email}</p>
            {formData.role && <span className="profile-role-badge">{formData.role}</span>}
          </div>
        </div>

        <div className="profile-form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="displayName">Nome de Exibição *</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="photoURL">URL da Foto de Perfil</label>
              <input
                type="url"
                id="photoURL"
                name="photoURL"
                value={formData.photoURL}
                onChange={handleChange}
                placeholder="https://exemplo.com/foto.jpg"
              />
              <small>Cole o link de uma imagem (ex: Gravatar, LinkedIn, etc)</small>
            </div>

            <div className="form-group">
              <label htmlFor="role">Cargo/Função</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Selecione um cargo</option>
                <option value="Product Owner">Product Owner</option>
                <option value="Scrum Master">Scrum Master</option>
                <option value="Developer">Developer</option>
                <option value="Tester">Tester</option>
                <option value="Designer">Designer</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Biografia</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Localização</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Cidade, Estado"
                />
              </div>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
