import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ImageBackground,
    ImageSourcePropType
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { HangmanVisual } from '../components/HangmanVisual';

interface Level {
    words: string[];
    background: ImageSourcePropType;
}

interface Levels {
    [key: number]: Level;
}

type RootStackParamList = {
    Login: undefined;
    Game: undefined;
    Leaderboard: undefined;
};

const LEVELS: Levels = {
    1: {
        words: ['SOL', 'LUZ', 'MAR'],
        background: require('../assets/level1.jpg') as ImageSourcePropType
    },
    2: {
        words: ['CASA', 'MESA', 'SOPA'],
        background: require('../assets/level2.jpg') as ImageSourcePropType
    },
    3: {
        words: ['PLATO', 'LIBRO', 'PAPEL'],
        background: require('../assets/level3.jpg') as ImageSourcePropType
    },
    4: {
        words: ['VENTANA', 'BOTELLA', 'PESCADO'],
        background: require('../assets/level4.jpg') as ImageSourcePropType
    },
    5: {
        words: ['CALENDARIO', 'BIBLIOTECA', 'COMPUTADORA'],
        background: require('../assets/level5.jpg') as ImageSourcePropType
    }
};

const LEVEL_TIME_LIMIT = 120; // 3 minutos en segundos

export default function GameScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [word, setWord] = useState<string>('');
    const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
    const [score, setScore] = useState<number>(0);
    const [wrongAttempts, setWrongAttempts] = useState<number>(0);
    const [wordsCompletedInLevel, setWordsCompletedInLevel] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(LEVEL_TIME_LIMIT);

    useEffect(() => {
        startNewGame();
    }, [currentLevel]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentLevel]);

    const handleTimeUp = () => {
        Alert.alert(
            'Tiempo Finalizado',
            '¡Se acabó el tiempo! Has perdido.',
            [
                {
                    text: 'Ver Tabla de Puntuaciones',
                    onPress: () => navigation.navigate('Leaderboard')
                }
            ]
        );
    };

    const startNewGame = () => {
        const levelWords = LEVELS[currentLevel].words;
        const newWord = levelWords[Math.floor(Math.random() * levelWords.length)];
        setWord(newWord);
        setGuessedLetters(new Set());
        setWrongAttempts(0);
        setTimeRemaining(LEVEL_TIME_LIMIT);
    };

    const handleLevelComplete = () => {
        if (currentLevel < 5) {
            Alert.alert(
                '¡Nivel Completado!',
                `¡Felicitaciones! Has completado el nivel ${currentLevel}`,
                [
                    {
                        text: 'Siguiente Nivel',
                        onPress: () => {
                            setCurrentLevel(prev => prev + 1);
                            setWordsCompletedInLevel(0);
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                '¡Juego Completado!',
                `¡Felicitaciones! Has completado todos los niveles con ${score} puntos`,
                [
                    {
                        text: 'Ver Ranking',
                        onPress: () => navigation.navigate('Leaderboard')
                    }
                ]
            );
        }
    };

    const guessLetter = (letter: string) => {
        if (guessedLetters.has(letter)) return;

        const newGuessedLetters = new Set(guessedLetters);
        newGuessedLetters.add(letter);
        setGuessedLetters(newGuessedLetters);

        if (!word.includes(letter)) {
            setWrongAttempts(prev => prev + 1);
            if (wrongAttempts + 1 >= 6) {
                Alert.alert('¡Perdiste!', `La palabra era: ${word}`, [
                    { 
                        text: 'Ver Ranking',
                        onPress: () => navigation.navigate('Leaderboard')
                    },
                    { 
                        text: 'Intentar de nuevo',
                        onPress: startNewGame
                    }
                ]);
            }
        } else {
            const isWinner = [...word].every(char => newGuessedLetters.has(char));
            if (isWinner) {
                const pointsForWord = 100 * currentLevel;
                const newScore = score + pointsForWord;
                setScore(newScore);
                setWordsCompletedInLevel(prev => {
                    const newWordsCompleted = prev + 1;
                    if (newWordsCompleted >= 3) {
                        setTimeout(handleLevelComplete, 100);
                    }
                    return newWordsCompleted;
                });
                Alert.alert('¡Ganaste!', `¡Conseguiste ${pointsForWord} puntos!`, [
                    { text: 'Siguiente palabra', onPress: startNewGame }
                ]);
            }
        }
    };

    const getDisplayWord = () => {
        return [...word].map(letter => guessedLetters.has(letter) ? letter : '_').join(' ');
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleExitGame = () => {
        Alert.alert(
            'Salir del juego',
            '¿Estás seguro que deseas salir? Perderás tu progreso actual.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Salir',
                    onPress: () => navigation.navigate('Login'),
                    style: 'destructive'
                }
            ]
        );
    };
    

    return (
        <ImageBackground
            source={LEVELS[currentLevel].background}
            style={styles.container}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]}>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleExitGame}
                    >
                        <Text style={styles.headerButtonText}>🚪 Salir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('Leaderboard')}
                    >
                        <Text style={styles.headerButtonText}>🏆 Ranking</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.levelText}>Nivel {currentLevel}</Text>
                <Text style={styles.timer}>⏱️ {formatTime(timeRemaining)}</Text>
                <Text style={styles.score}>Puntuación: {score}</Text>
                <Text style={styles.progress}>Palabras: {wordsCompletedInLevel}/3</Text>

                <HangmanVisual wrongAttempts={wrongAttempts} />

                <Text style={styles.word}>{getDisplayWord()}</Text>

                <View style={styles.keyboard}>
                    {'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map(letter => (
                        <TouchableOpacity
                            key={letter}
                            style={[
                                styles.letter,
                                guessedLetters.has(letter) && styles.letterUsed
                            ]}
                            onPress={() => guessLetter(letter)}
                            disabled={guessedLetters.has(letter)}
                        >
                            <Text style={styles.letterText}>{letter}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
    },
    headerButton: {
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 10,
    },
    headerButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    levelText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 60,
        color: '#333',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5
    },
    timer: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 5,
        color: '#333',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 5,
        color: '#333',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5
    },
    progress: {
        fontSize: 20,
        marginBottom: 20,
        color: '#333',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5
    },
    word: {
        fontSize: 36,
        letterSpacing: 5,
        marginVertical: 20,
        fontWeight: 'bold',
        color: '#333',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5
    },
    keyboard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    letter: {
        width: 40,
        height: 40,
        margin: 3,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    letterUsed: {
        backgroundColor: '#ccc',
    },
    letterText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});