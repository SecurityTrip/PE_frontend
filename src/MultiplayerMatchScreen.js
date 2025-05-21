import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizedFetch } from './api';
import './FieldEdit.css';

// Вспомогательная функция для рендеринга доски
function renderBoard(board, isEnemy, onCellClick) {
    if (!board) return null;
    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(10, 7vh)', 
            gridTemplateRows: 'repeat(10, 7vh)', 
            gap: '0.2vh', 
            margin: '1vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '1vh',
            borderRadius: '1vh'
        }}>
            {board.map((row, y) => row.map((cell, x) => {
                let bg = 'rgba(30,144,255,0.5)';
                if (cell > 0 && !isEnemy) bg = 'rgba(68,68,68,0.8)'; // корабль игрока
                if (cell === 2) bg = 'rgba(238,238,238,0.8)'; // промах
                if (cell === 3) bg = 'rgba(229,57,53,0.8)'; // попадание
                return (
                    <div 
                        key={x+','+y} 
                        onClick={isEnemy && onCellClick ? () => onCellClick(x,y) : undefined} 
                        style={{ 
                            width: '7vh', 
                            height: '7vh', 
                            background: bg, 
                            border: '1px solid rgba(34,34,34,0.5)', 
                            borderRadius: '0.5vh',
                            cursor: isEnemy && onCellClick ? 'pointer' : 'default',
                            transition: 'background-color 0.3s ease'
                        }}
                    />
                );
            }))}
        </div>
    );
}

const MultiplayerMatchScreen = () => {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [moveError, setMoveError] = useState('');
    const [moveResult, setMoveResult] = useState(null);
    const gameId = localStorage.getItem('multiplayer_gameId');

    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) {
                setError('Идентификатор игры не найден.');
                setLoading(false);
                return;
            }
            try {
                const response = await authorizedFetch(`http://localhost:8080/game/multiplayer/${gameId}`);
                if (response.ok) {
                    const data = await response.json();
                    setGame(data);
                } else {
                    setError('Ошибка загрузки игры: ' + response.status);
                }
            } catch (e) {
                setError('Ошибка соединения с сервером.');
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [gameId]);

    async function handleCellClick(x, y) {
        setMoveError('');
        setMoveResult(null);
        if (!game) {
            setMoveError('Игра не загружена');
            return;
        }
        if (game.gameState !== 'IN_PROGRESS') {
            setMoveError('Игра не активна');
            return;
        }

        try {
            const response = await authorizedFetch(`http://localhost:8080/game/multiplayer/${gameId}/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x, y })
            });
            if (response.ok) {
                const data = await response.json();
                setMoveResult(data);
                // Обновить состояние игры после хода
                const updatedGameResponse = await authorizedFetch(`http://localhost:8080/game/multiplayer/${gameId}`);
                if (updatedGameResponse.ok) {
                    const updatedGameData = await updatedGameResponse.json();
                    setGame(updatedGameData);
                } else {
                    setError('Ошибка обновления состояния игры: ' + updatedGameResponse.status);
                }
            } else {
                const errorData = await response.json();
                setMoveError(errorData.message || 'Ошибка хода: ' + response.status);
            }
        } catch (e) {
            setMoveError('Ошибка соединения с сервером');
        }
    }

    // Выход из игры (мультиплеер)
    function handleExit() {
        localStorage.removeItem('multiplayer_gameId');
        navigate('/multiplayer'); // Навигация обратно на выбор комнаты
    }

    if (loading) {
        return (
            <header className="App-header">
                <div className="bckgr"></div>
                <div className="fieldEditBigTab" style={{ textAlign: 'center', paddingTop: '20vh' }}>
                    <div style={{ color: 'white', fontSize: '3vh' }}>Загрузка игры...</div>
                </div>
            </header>
        );
    }

    if (error) {
        return (
            <header className="App-header">
                <div className="bckgr"></div>
                <div className="fieldEditBigTab" style={{ textAlign: 'center', paddingTop: '20vh' }}>
                    <div style={{ color: 'white', fontSize: '3vh', marginBottom: '2vh' }}>{error}</div>
                    <button onClick={handleExit} className="fieldButt">Выйти</button>
                </div>
            </header>
        );
    }

    return (
        <div className="field-edit-container">
            <h2>Многопользовательская игра</h2>
            <header className="App-header">
                <div className="bckgr"></div>
                <div className="fieldEditBigTab" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3vh'
                }}>
                    <div style={{ 
                        color: 'white',
                        fontSize: '3vh',
                        textAlign: 'center'
                    }}>
                        Многопользовательская игра
                        <button onClick={handleExit} className="fieldButt" style={{ marginLeft: '2vh' }}>Выйти</button>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: '5vh'
                    }}>
                        <div>
                            <div style={{ 
                                color: 'white', 
                                marginBottom: '1.5vh',
                                fontSize: '2.5vh',
                                textAlign: 'center'
                            }}>Ваше поле</div>
                            {game && game.playerBoard && renderBoard(game.playerBoard.board, false)}
                        </div>
                        <div>
                            <div style={{ 
                                color: 'white', 
                                marginBottom: '1.5vh',
                                fontSize: '2.5vh',
                                textAlign: 'center'
                            }}>Поле противника</div>
                            {game && game.opponentBoard && renderBoard(game.opponentBoard.board, true, handleCellClick)}
                        </div>
                    </div>

                    <div style={{ 
                        color: 'white',
                        fontSize: '2vh',
                        textAlign: 'center',
                        marginTop: '2vh'
                    }}>
                        <div style={{ marginBottom: '1vh' }}>
                            Статус: {game && game.gameState === 'IN_PROGRESS' ? 'Игра идет' : (game && game.gameState === 'PLAYER_WINS' ? 'Вы выиграли!' : (game && game.gameState === 'OPPONENT_WINS' ? 'Противник выиграл' : 'Завершена'))}
                            {game && game.gameState === 'IN_PROGRESS' && (
                                <span style={{ marginLeft: '2vh' }}>
                                    Ход: {game.playerTurn ? 'Ваш' : 'Противника'}
                                </span>
                            )}
                        </div>

                        {moveResult && (
                            <div style={{ 
                                color: moveResult.hit ? '#4caf50' : '#ff9800', 
                                marginTop: '1vh',
                                fontSize: '2.2vh'
                            }}>
                                {moveResult.hit ? 'Попадание!' : 'Промах!'}
                                {moveResult.sunk && ' Корабль потоплен!'}
                                {moveResult.gameOver && ' Игра окончена!'}
                            </div>
                        )}

                        {moveError && (
                            <div style={{ 
                                color: '#f44336', 
                                marginTop: '1vh',
                                fontSize: '2vh'
                            }}>
                                {moveError}
                            </div>
                        )}

                        {error && gameId && (
                            <div style={{ 
                                color: '#f44336', 
                                marginTop: '1vh',
                                fontSize: '2vh'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
};

export default MultiplayerMatchScreen; 