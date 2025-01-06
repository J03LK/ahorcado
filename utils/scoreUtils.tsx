import { ref, set, get } from 'firebase/database';
import { db } from '../config/firebase.config';

interface UserData {
    username: string;
    score: number;
    gamesPlayed: number;
}

export const updateUserScore = async (userId: string, newScore: number) => {
    try {
        // Referencia al usuario en la base de datos
        const userRef = ref(db, `users/${userId}`);
        
        // Obtener datos actuales del usuario
        const snapshot = await get(userRef);
        const userData = snapshot.val() as UserData;
        
        // Actualizar solo si el nuevo puntaje es mayor que el existente
        if (!userData || newScore > userData.score) {
            await set(userRef, {
                ...userData,
                score: newScore,
                gamesPlayed: (userData?.gamesPlayed || 0) + 1
            });
        } else {
            // Si no es mayor el puntaje, solo actualizamos gamesPlayed
            await set(userRef, {
                ...userData,
                gamesPlayed: userData.gamesPlayed + 1
            });
        }
        
        return true;
    } catch (error) {
        console.error('Error updating score:', error);
        return false;
    }
};