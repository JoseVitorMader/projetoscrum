import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../Card/Card';
import CardModal from '../Card/CardModal';
import SprintManager from '../Sprint/SprintManager';
import ActivityLog from '../Activity/ActivityLog';
import { logActivity } from '../../utils/activityLogger';
import './Board.css';

function Board({ team, onBack }) {
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({});
  const [showCardModal, setShowCardModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSprintManager, setShowSprintManager] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [newCard, setNewCard] = useState({ title: '', description: '' });
  const [editingCard, setEditingCard] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!team) return;

    console.log('📊 Carregando board para team:', team.id, 'User:', currentUser?.uid);

    // Listen to lists (SEM orderBy para evitar erro de índice)
    const listsQuery = query(
      collection(db, 'lists'),
      where('teamId', '==', team.id)
    );

    const unsubscribeLists = onSnapshot(
      listsQuery, 
      (snapshot) => {
        console.log('✅ Lists carregadas:', snapshot.docs.length);
        const listsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Ordenar no código em vez de no Firestore
        listsData.sort((a, b) => a.order - b.order);
        setLists(listsData);
      },
      (error) => {
        console.error('❌ Erro ao carregar lists:', error);
        alert('Erro ao carregar colunas: ' + error.message);
      }
    );

    // Listen to cards
    const cardsQuery = query(
      collection(db, 'cards'),
      where('teamId', '==', team.id)
    );

    const unsubscribeCards = onSnapshot(
      cardsQuery, 
      (snapshot) => {
        console.log('✅ Cards carregados:', snapshot.docs.length);
        const cardsData = {};
        snapshot.docs.forEach(doc => {
          const card = { id: doc.id, ...doc.data() };
          console.log('  Card:', card.title, 'ListId:', card.listId);
          if (!cardsData[card.listId]) {
            cardsData[card.listId] = [];
          }
          cardsData[card.listId].push(card);
        });

        // Sort cards by order
        Object.keys(cardsData).forEach(listId => {
          cardsData[listId].sort((a, b) => a.order - b.order);
        });

        console.log('📦 Cards organizados:', cardsData);
        setCards(cardsData);
      },
      (error) => {
        console.error('❌ Erro ao carregar cards:', error);
        alert('Erro ao carregar cards: ' + error.message + '\n\nVerifique as regras do Firestore!');
      }
    );

    return () => {
      unsubscribeLists();
      unsubscribeCards();
    };
  }, [team, currentUser]);

  function openCardModal(list, card = null) {
    setSelectedList(list);
    if (card) {
      setEditingCard(card);
      setNewCard({ title: card.title, description: card.description || '' });
    } else {
      setEditingCard(null);
      setNewCard({ title: '', description: '' });
    }
    setShowCardModal(true);
  }

  function closeCardModal() {
    setShowCardModal(false);
    setSelectedList(null);
    setEditingCard(null);
    setNewCard({ title: '', description: '' });
  }

  async function handleSaveCard(e) {
    e.preventDefault();

    try {
      if (editingCard) {
        // Update existing card
        const cardRef = doc(db, 'cards', editingCard.id);
        await updateDoc(cardRef, {
          title: newCard.title,
          description: newCard.description,
          updatedAt: new Date().toISOString()
        });
        
        await logActivity(
          team.id,
          'card_updated',
          `${currentUser.displayName || currentUser.email} atualizou o card "${newCard.title}"`,
          currentUser.uid
        );
      } else {
        // Create new card
        const listCards = cards[selectedList.id] || [];
        await addDoc(collection(db, 'cards'), {
          teamId: team.id,
          listId: selectedList.id,
          title: newCard.title,
          description: newCard.description,
          order: listCards.length,
          createdBy: currentUser.uid,
          createdByName: currentUser.displayName || currentUser.email,
          createdAt: new Date().toISOString()
        });
        
        await logActivity(
          team.id,
          'card_created',
          `${currentUser.displayName || currentUser.email} criou o card "${newCard.title}" em ${selectedList.name}`,
          currentUser.uid
        );
      }

      closeCardModal();
    } catch (error) {
      alert('Erro ao salvar card: ' + error.message);
    }
  }

  async function handleDeleteCard(cardId) {
    if (!window.confirm('Deseja realmente excluir este card?')) return;

    try {
      const cardToDelete = Object.values(cards).flat().find(c => c.id === cardId);
      await deleteDoc(doc(db, 'cards', cardId));
      
      if (cardToDelete) {
        await logActivity(
          team.id,
          'card_deleted',
          `${currentUser.displayName || currentUser.email} excluiu o card "${cardToDelete.title}"`,
          currentUser.uid
        );
      }
    } catch (error) {
      alert('Erro ao excluir card: ' + error.message);
    }
  }

  async function onDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.listId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    // Update card position
    const cardRef = doc(db, 'cards', draggableId);
    
    try {
      await updateDoc(cardRef, {
        listId: destListId,
        order: destination.index,
        updatedAt: new Date().toISOString()
      });

      // Reorder other cards
      const destCards = cards[destListId] || [];
      const promises = [];

      if (sourceListId === destListId) {
        // Same list - reorder
        const newCards = Array.from(destCards);
        const [removed] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, removed);

        newCards.forEach((card, index) => {
          if (card.order !== index) {
            promises.push(
              updateDoc(doc(db, 'cards', card.id), { order: index })
            );
          }
        });
      } else {
        // Different lists
        destCards.forEach((card, index) => {
          if (index >= destination.index && card.id !== draggableId) {
            promises.push(
              updateDoc(doc(db, 'cards', card.id), { order: index + 1 })
            );
          }
        });
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao mover card:', error);
    }
  }

  return (
    <div className="board">
      <div className="board-header">
        <button onClick={onBack} className="btn-back">← Voltar</button>
        <h1>📋 {team.name}</h1>
        <div className="board-info">
          <button onClick={() => setShowSprintManager(!showSprintManager)} className="btn-sprint">
            🏃 {showSprintManager ? 'Ocultar' : 'Gerenciar'} Sprints
          </button>
          <span>👥 {team.members.length} membros</span>
        </div>
      </div>

      {showSprintManager && <SprintManager team={team} />}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-lists">
          {lists.map(list => (
            <div key={list.id} className="list">
              <div className="list-header">
                <h3>{list.name}</h3>
                <span className="card-count">{(cards[list.id] || []).length}</span>
              </div>

              <Droppable droppableId={list.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`list-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {(cards[list.id] || []).map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`card-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <Card
                              card={card}
                              onEdit={() => openCardModal(list, card)}
                              onDelete={() => handleDeleteCard(card.id)}
                              onClick={() => {
                                setSelectedCard(card);
                                setShowDetailModal(true);
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <button onClick={() => openCardModal(list)} className="add-card-btn">
                ➕ Adicionar Card
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showCardModal && (
        <div className="modal-overlay" onClick={closeCardModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCard ? 'Editar Card' : 'Novo Card'}</h2>
            <p className="modal-list-name">Lista: <strong>{selectedList?.name}</strong></p>
            <form onSubmit={handleSaveCard}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  placeholder="Ex: Implementar login"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  placeholder="Detalhes da tarefa..."
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeCardModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCard ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCard(null);
          }}
          onUpdate={(updatedCard) => {
            // Atualizar o card no estado local
            const listId = selectedCard.listId;
            setCards(prev => ({
              ...prev,
              [listId]: prev[listId].map(c => 
                c.id === updatedCard.id ? updatedCard : c
              )
            }));
          }}
        />
      )}

      <ActivityLog teamId={team.id} />
    </div>
  );
}

export default Board;
