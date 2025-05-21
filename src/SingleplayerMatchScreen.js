import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizedFetch } from './api'; // Импорт authorizedFetch
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './FieldEdit.css'; // Предполагаем, что стили будут общими или адаптированы
import './SingleplayerMatchScreen.css'; // Импортируем новые стили

// Вспомогательная функция для рендеринга доски
function renderBoard(board, isEnemy, onCellClick, ships) {
    if (!board) return null;

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
                let bg = 'rgba(30,144,255,0.5)'; // Цвет пустой клетки по умолчанию
                let content = null; // Содержимое ячейки (например, для отображения попаданий/промахов)
                let cellClass = 'board-cell'; // Базовый класс ячейки
                
                if (isEnemy) {
                    // Логика для поля противника
                    if (cell === 2) {
                        bg = 'rgba(238,238,238,0.8)'; // промах
                        content = 'X'; // Маркер промаха
                    }
                    if (cell === 3) {
                        bg = 'rgba(229,57,53,0.8)'; // попадание
                        content = '●'; // Маркер попадания
                    }
                } else {
                    // Логика для поля игрока
                    
                    // Отображение кораблей игрока и их состояния
                    if (ships) {
                        let isCurrentCellShip = false;
                        for (const ship of ships) {
                            if (isShipCell(x, y, ship)) {
                                isCurrentCellShip = true;
                                cellClass += ' player-ship-cell'; // Добавляем класс для корабля игрока

                                // Проверяем, подбита ли эта часть корабля
                                // Нам нужно найти индекс части корабля
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
                                     bg = 'rgba(229,57,53,0.8)'; // Красный цвет для попадания
                                     content = '●'; // Маркер попадания
                                } else {
                                     bg = 'rgba(255,193,7,0.8)'; // Желтый цвет для не подбитого корабля
                                }

                                break; // Нашли корабль, можно остановиться
                            }
                        }
                         if (!isCurrentCellShip) { // Если это не корабль игрока, проверяем на промах
                              if (cell === 2) {
                                 bg = 'rgba(238,238,238,0.8)'; // промах
                                 content = 'X'; // Маркер промаха
                              }
                         }
                    }
                     // Если ships не загружен, используем старую логику (временно, пока не решим проблему загрузки)
                     else {
                          if (cell === 1) bg = 'rgba(68,68,68,0.8)'; // корабль игрока (пока серый)
                           if (cell === 2) {
                                bg = 'rgba(238,238,238,0.8)'; // промах
                                content = 'X'; // Маркер промаха
                           }
                           if (cell === 3) {
                                bg = 'rgba(229,57,53,0.8)'; // попадание
                                content = '●'; // Маркер попадания
                           }
                     }
                }

                return (
                    <div
                        key={x+','+y}
                        onClick={isEnemy && onCellClick ? () => onCellClick(x,y) : undefined}
                        className={cellClass}
                        style={{
                            background: bg,
                             cursor: isEnemy && onCellClick ? 'pointer' : 'default',
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
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [moveError, setMoveError] = useState('');
    const [moveResult, setMoveResult] = useState(null);
    const gameId = localStorage.getItem('singleplayer_gameId');
    const stompClient = useRef(null);

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
                    destination: '/app/singleplayer.state',
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
            destination: '/app/singleplayer.move',
            body: JSON.stringify(moveRequest)
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