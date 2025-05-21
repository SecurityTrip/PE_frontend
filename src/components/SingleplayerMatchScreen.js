import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './SingleplayerMatchScreen.css';

// Вспомогательная функция для рендеринга доски
function renderBoard(board, isEnemy, onCellClick, ships) {
    if (!board) return null;

    console.log('[renderBoard] Данные для рендеринга:', {
        isEnemy,
        board,
        ships,
        boardType: isEnemy ? 'computer' : 'player'
    });

    // Helper to check if a cell is part of a ship
    const isShipCell = (cellX, cellY, ship) => {
        for (let i = 0; i < ship.size; i++) {
            const shipPartX = ship.horizontal ? ship.x + i : ship.x;
            const shipPartY = ship.horizontal ? ship.y : ship.y + i;
            if (shipPartX === cellX && shipPartY === cellY) {
                return true;
            }
        }
        return false;
    };

    return (
        <div className="board-grid">
            {board.map((row, y) => row.map((cell, x) => {
                let cellClass = 'board-cell';
                let content = null;
                
                if (!isEnemy && ships) {
                    // Логика для поля игрока
                    for (const ship of ships) {
                        if (isShipCell(x, y, ship)) {
                            cellClass += ' player-ship-cell';
                            // Проверяем, подбита ли эта часть корабля
                            let hitIndex = -1;
                            for(let i = 0; i < ship.size; i++) {
                                const shipPartX = ship.horizontal ? ship.x + i : ship.x;
                                const shipPartY = ship.horizontal ? ship.y : ship.y + i;
                                if (shipPartX === x && shipPartY === y) {
                                    hitIndex = i;
                                    break;
                                }
                            }
                            if (hitIndex !== -1 && ship.hits && ship.hits[hitIndex]) {
                                content = '●';
                            }
                            break;
                        }
                    }
                }

                // Обработка попаданий и промахов для обоих полей
                if (cell === 2) { // Промах
                    cellClass += ' miss';
                    content = 'X';
                } else if (cell === 3) { // Попадание
                    cellClass += ' hit';
                    content = '●';
                }

                return (
                    <div
                        key={x+','+y}
                        onClick={isEnemy && onCellClick ? () => onCellClick(x,y) : undefined}
                        className={cellClass}
                        style={{
                            cursor: isEnemy && onCellClick ? 'pointer' : 'default'
                        }}
                    >
                        {content}
                    </div>
                );
            }))}
        </div>
    );
}

const SingleplayerMatchScreen = () => {
    const navigate = useNavigate();
    const stompClient = useRef(null);
    const [gameId, setGameId] = React.useState(localStorage.getItem('singleplayer_gameId'));
    const [game, setGame] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [moveResult, setMoveResult] = React.useState(null);
    const [moveError, setMoveError] = React.useState('');

    useEffect(() => {
        if (!gameId) {
            navigate('/singleplayer');
            return;
        }

        // Инициализация WebSocket соединения
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                
                // Подписываемся на обновления состояния игры
                client.subscribe('/topic/singleplayer/state', (message) => {
                    const gameData = JSON.parse(message.body);
                    console.log('[SingleplayerMatchScreen] Получены данные игры:', gameData);
                    setGame(gameData);
                    setLoading(false);
                });

                // Подписываемся на ответы на ходы
                client.subscribe('/topic/singleplayer/move', (message) => {
                    const moveResponse = JSON.parse(message.body);
                    console.log('Move response:', moveResponse);
                    setMoveResult(moveResponse);
                });

                // Запрашиваем начальное состояние игры
                client.publish({
                    destination: "/app/singleplayer.state",
                    body: gameId
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            },
            onError: (error) => {
                console.error('WebSocket error:', error);
                setError('Ошибка соединения с сервером');
            }
        });

        stompClient.current = client;
        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [gameId, navigate]);

    const handleCellClick = (x, y) => {
        if (!stompClient.current || !stompClient.current.connected) {
            setError('Нет соединения с сервером');
            return;
        }

        if (!game) {
            setMoveError('Игра не загружена');
            return;
        }

        if (game.gameState !== 'IN_PROGRESS') {
            setMoveError('Игра не активна');
            return;
        }

        setMoveError('');
        setMoveResult(null);

        const moveRequest = {
            gameId: parseInt(gameId),
            x: x,
            y: y
        };

        stompClient.current.publish({
            destination: "/app/singleplayer.move",
            body: JSON.stringify(moveRequest)
        });

        // Запрашиваем обновление состояния игры после хода
        console.log('[SingleplayerMatchScreen] Запрос обновления состояния игры после хода');
        stompClient.current.publish({
            destination: "/app/singleplayer.state",
            body: gameId
        });
    };

    // Выход из игры (одиночная)
    function handleExit() {
        localStorage.removeItem('singleplayer_gameId');
        navigate('/singleplayer'); // Навигация обратно на выбор сложности
    }

    if (loading) {
        return (
            <header className="App-header">
                <div className="bckgr"></div>
                <div className="fieldEditBigTab" style={{ textAlign: 'center', paddingTop: '20vh' }}>
                    <div style={{ color: 'white', fontSize: '3vh' }}>Загрузка одиночной игры...</div>
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
            <h2>Одиночная игра</h2>
            <header className="App-header">
                <div className="bckgr"></div>
                <div style={{
                    color: 'white',
                    fontSize: '3vh',
                    textAlign: 'center',
                    marginBottom: '3vh'
                }}>
                    Одиночная игра
                    <button onClick={handleExit} className="fieldButt" style={{ marginLeft: '2vh' }}>Выйти</button>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: '5vh'
                }}>
                    <div className="match-board-container">
                        <div style={{
                            color: 'white',
                            marginBottom: '1.5vh',
                            fontSize: '2.5vh',
                            textAlign: 'center'
                        }}>Ваше поле</div>
                        {game && game.playerBoard && renderBoard(game.playerBoard.board, false, null, game.playerBoard.ships)}
                    </div>
                     <div className="match-board-container">
                        <div style={{
                            color: 'white',
                            marginBottom: '1.5vh',
                            fontSize: '2.5vh',
                            textAlign: 'center'
                        }}>Поле ИИ</div>
                        {game && game.computerBoard && renderBoard(game.computerBoard.board, true, handleCellClick, game.computerBoard.ships)}
                    </div>
                </div>

                <div style={{
                    color: 'white',
                    fontSize: '2vh',
                    textAlign: 'center',
                    marginTop: '3vh'
                }}>
                    <div style={{ marginBottom: '1vh' }}>
                        Статус: {game && game.gameState === 'IN_PROGRESS' ? 'Игра идет' : (game && game.gameState === 'PLAYER_WINS' ? 'Вы выиграли!' : (game && game.gameState === 'COMPUTER_WINS' ? 'ИИ выиграл' : 'Завершена'))}
                        {game && game.gameState === 'IN_PROGRESS' && (
                            <span style={{ marginLeft: '2vh' }}>
                                Ход: {game.playerTurn ? 'Ваш' : 'ИИ'}
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

            </header>
        </div>
    );
};

export default SingleplayerMatchScreen; 