import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function logActivity(teamId, type, description, userId) {
  try {
    await addDoc(collection(db, 'activities'), {
      teamId,
      type,
      description,
      userId,
      // use server timestamp so ordering is reliable and consistent
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
}
