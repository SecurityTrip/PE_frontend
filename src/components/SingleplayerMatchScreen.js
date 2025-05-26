import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './SingleplayerMatchScreen.css';

// Вспомогательная функция для рендеринга доски
export function renderBoard(board, isEnemy, onCellClick, ships) {
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

    // --- Исправление: вычисляем sunk для кораблей, если его нет ---
    let shipsWithSunk = ships;
    if (ships && ships.length > 0 && typeof ships[0].sunk === 'undefined') {
        shipsWithSunk = ships.map(ship => ({
            ...ship,
            sunk: Array.isArray(ship.hits) && ship.hits.length === ship.size && ship.hits.every(Boolean)
        }));
    }

    // Helper to check if a cell is adjacent to a sunk ship
    const isAdjacentToSunkShip = (cellX, cellY, shipsArg) => {
        const shipsLocal = shipsArg || shipsWithSunk;
        if (!shipsLocal) return false;
        for (const ship of shipsLocal) {
            if (ship.sunk) {
                // Проверяем все клетки корабля
                for (let i = 0; i < ship.size; i++) {
                    const shipPartX = ship.horizontal ? ship.x + i : ship.x;
                    const shipPartY = ship.horizontal ? ship.y : ship.y + i;
                    // Проверяем все соседние клетки
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = shipPartX + dx;
                            const ny = shipPartY + dy;
                            // Если это текущая клетка и она не является частью корабля
                            if (nx === cellX && ny === cellY && !isShipCell(cellX, cellY, ship)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    return (
        <div className="board-grid">
            {board.map((row, y) => row.map((cell, x) => {
                let cellClass = 'board-cell';
                let content = null;
                const shipsToUse = shipsWithSunk;
                if (!isEnemy && shipsToUse) {
                    // Логика для поля игрока
                    for (const ship of shipsToUse) {
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
                if (cell === 2 || (isEnemy && isAdjacentToSunkShip(x, y, shipsToUse))) { // Промах или клетка рядом с потопленным кораблем
                    cellClass += ' miss';
                    content = 'X';
                } else if (cell === 3) { // Попадание
                    cellClass += ' hit';
                    content = '●';

                    // Если это поле противника и клетка является частью потопленного корабля
                    if (isEnemy && shipsToUse) {
                        for (const ship of shipsToUse) {
                            if (ship.sunk && isShipCell(x, y, ship)) {
                                cellClass += ' sunk-enemy-ship-cell';
                                break;
                            }
                        }
                    }
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

        if (!game.playerTurn) {
            setMoveError('Сейчас ход компьютера');
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
                        Статус: {game && game.gameState === 'IN_PROGRESS' ? 'Игра идет' : (game && game.gameState === 'PLAYER_WON' ? 'Вы выиграли!' : (game && game.gameState === 'COMPUTER_WON' ? 'ИИ выиграл' : 'Завершена'))}
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