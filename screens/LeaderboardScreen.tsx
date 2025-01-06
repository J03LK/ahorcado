import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { ref, query, orderByChild, get } from 'firebase/database';
import { db } from '../config/firebase.config';

interface UserScore {
    id: string;
    username: string;
    score: number;
    gamesPlayed: number;
}

export default function LeaderboardScreen() {
    const [scores, setScores] = useState<UserScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const usersRef = ref(db, 'users');
            const usersQuery = query(usersRef, orderByChild('score'));
            const snapshot = await get(usersQuery);

            if (snapshot.exists()) {
                const leaderboardData: UserScore[] = [];
                snapshot.forEach((child) => {
                    const userData = child.val();
                    // Verificar que el usuario tenga una puntuación
                    if (userData.score !== undefined) {
                        leaderboardData.push({
                            id: child.key || '',
                            username: userData.username || userData.email || 'Usuario Anónimo',
                            score: userData.score || 0,
                            gamesPlayed: userData.gamesPlayed || 0
                        });
                    }
                });

                // Ordenar por puntuación de mayor a menor
                leaderboardData.sort((a, b) => b.score - a.score);
                setScores(leaderboardData);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, index }: { item: UserScore; index: number }) => (
        <View style={styles.scoreRow}>
            <View style={styles.rankContainer}>
                <Text style={styles.position}>{index + 1}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.gamesPlayed}>{item.gamesPlayed} juegos</Text>
            </View>
            <Text style={styles.score}>{item.score}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🏆 Tabla de Puntuaciones</Text>
            
            {scores.length === 0 ? (
                <Text style={styles.noScores}>No hay puntuaciones disponibles</Text>
            ) : (
                <>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerPosition}>Pos</Text>
                        <Text style={styles.headerUsername}>Jugador</Text>
                        <Text style={styles.headerScore}>Puntos</Text>
                    </View>

                    <FlatList
                        data={scores}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    headerRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
        marginBottom: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    headerPosition: {
        width: 50,
        fontWeight: 'bold',
        color: '#333',
    },
    headerUsername: {
        flex: 1,
        fontWeight: 'bold',
        color: '#333',
    },
    headerScore: {
        width: 80,
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#333',
    },
    listContainer: {
        paddingBottom: 20,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginVertical: 4,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    rankContainer: {
        width: 50,
    },
    position: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    score: {
        width: 80,
        textAlign: 'right',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    gamesPlayed: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    noScores: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
});