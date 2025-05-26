import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerWS } from './useMultiplayerWS';
import './FieldEdit.css';
import './components/SingleplayerMatchScreen.css';
import { renderBoard as singleRenderBoard } from './components/SingleplayerMatchScreen';

const MultiplayerMatchScreen = () => {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [moveError, setMoveError] = useState('');
    const [moveResult, setMoveResult] = useState(null);
    const gameId = localStorage.getItem('multiplayer_gameId');

    const {
        connected,
        moveInfo,
        gameState: wsGameState,
        error: wsError,
        sendMove,
        requestState
    } = useMultiplayerWS();


    // Сброс состояния и запуск загрузки только при смене gameId (новая игра)
    useEffect(() => {
        if (!gameId) {
            setError('Идентификатор игры не найден.');
            setLoading(false);
            return;
        }
        // setLoading(true); // Не сбрасываем loading/game если gameId не меняется
        // setGame(null);
    }, [gameId]);


    // Запрашиваем состояние только когда появилось соединение и есть gameId, но не сбрасываем loading/game
    useEffect(() => {
        if (connected && gameId) {
            requestState(gameId);
        }
    }, [connected, gameId, requestState]);


    // Слушаем обновления результата хода через WebSocket
    useEffect(() => {
        if (moveInfo) {
            setMoveResult(moveInfo);
            // Не делаем requestState(gameId) — wsGameState должен обновиться через WebSocket
        }
    }, [moveInfo]);


    useEffect(() => {
        // Всегда убираем loading, если есть wsGameState (даже если он не меняется по ссылке)
        if (wsGameState && wsGameState.playerBoard && wsGameState.computerBoard && wsGameState.gameState && wsGameState.gameCode) {
            setGame(wsGameState);
            setLoading(false);
            setError('');
            // moveResult сбрасываем только если статус игры изменился (например, после хода)
            // setMoveResult(null); // Оставляем результат выстрела до следующего хода
        } else if (wsGameState) {
            setError('Получено неполное состояние игры');
            setLoading(false);
        } else if (connected && !wsGameState) {
            setError('Не удалось загрузить состояние игры. Попробуйте обновить страницу.');
            setLoading(false);
        }
    }, [wsGameState, connected]);


    useEffect(() => {
        if (wsError) {
            setMoveError(wsError);
        }
    }, [wsError]);


    // Выход из игры (мультиплеер)
    function handleExit() {
        localStorage.removeItem('multiplayer_gameId');
        navigate('/multiplayer'); // Навигация обратно на выбор комнаты
    }

    // Обработка клика по клетке поля противника (используем wsGameState для актуальности)
    function handleCellClick(x, y) {
        setMoveError('');
        setMoveResult(null);
        if (!wsGameState) {
            setMoveError('Игра не загружена');
            return;
        }
        if (wsGameState.gameState !== 'IN_PROGRESS') {
            setMoveError('Игра не активна');
            return;
        }
        if (!connected) {
            setMoveError('Нет соединения с сервером');
            return;
        }
        if (!wsGameState.playerTurn) {
            setMoveError('Сейчас не ваш ход');
            return;
        }
        // Для мультиплеера ОБЯЗАТЕЛЬНО нужен userId в payload!
        let userId = Number(localStorage.getItem('userId'));
        if (!userId) {
            userId = Date.now() + Math.floor(Math.random()*1000);
            localStorage.setItem('userId', userId);
        }
        sendMove({ gameCode: gameId, x, y, userId });
    }

    const renderCell = (x, y, value, isPlayerBoard) => {
        let cellClass = 'cell';
        let cellContent = '';

        if (isPlayerBoard) {
            // Для доски игрока
            if (value === 1) {
                cellClass += ' ship';
            } else if (value === 2) {
                cellClass += ' miss';
                cellContent = '•';
            } else if (value === 3) {
                cellClass += ' hit';
                cellContent = '×';
            }
        } else {
            // Для доски противника
            if (value === 2) {
                cellClass += ' miss';
                // Проверяем, является ли эта клетка соседней для потопленного корабля
                if (isAdjacentToSunkShip(x, y)) {
                    cellClass += ' adjacent';
                }
                cellContent = '•';
            } else if (value === 3) {
                cellClass += ' hit';
                cellContent = '×';
            }
        }

        return (
            <div
                key={`${x}-${y}`}
                className={cellClass}
                onClick={() => !isPlayerBoard && handleCellClick(x, y)}
            >
                {cellContent}
            </div>
        );
    };

    // Функция для проверки, является ли клетка соседней для потопленного корабля
    const isAdjacentToSunkShip = (x, y) => {
        if (!game || !game.computerBoard || !game.computerBoard.ships) return false;

        const board = game.computerBoard.board;
        const ships = game.computerBoard.ships;

        // Проверяем все корабли
        for (const ship of ships) {
            if (ship.sunk) {
                // Проверяем все клетки корабля
                for (const pos of ship.positions) {
                    const shipX = pos[0];
                    const shipY = pos[1];
                    
                    // Проверяем соседние клетки
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = shipX + dx;
                            const ny = shipY + dy;
                            
                            // Если это текущая клетка и она помечена как промах
                            if (nx === x && ny === y && board[ny][nx] === 2) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    if (loading && !game) {
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
                            {wsGameState && wsGameState.playerBoard && singleRenderBoard(
                                wsGameState.playerBoard.board,
                                false,
                                undefined,
                                wsGameState.playerBoard.ships // ships для своего поля
                            )}
                        </div>
                        <div>
                            <div style={{ 
                                color: 'white', 
                                marginBottom: '1.5vh',
                                fontSize: '2.5vh',
                                textAlign: 'center'
                            }}>
                                Поле противника
                                {wsGameState && (
                                    <span style={{
                                        marginLeft: '1vh',
                                        color: wsGameState.playerTurn ? '#4caf50' : '#ff9800',
                                        fontWeight: 'bold',
                                        fontSize: '2vh'
                                    }}>
                                        {wsGameState.playerTurn ? 'Ваш ход!' : 'Ждите противника'}
                                    </span>
                                )}
                            </div>
                            <div
                                style={{
                                    border: wsGameState?.playerTurn ? '3px solid #4caf50' : '3px solid #ff9800',
                                    borderRadius: '10px',
                                    opacity: wsGameState?.playerTurn ? 1 : 0.6,
                                    pointerEvents: wsGameState?.playerTurn ? 'auto' : 'none',
                                    transition: 'border 0.2s, opacity 0.2s',
                                    position: 'relative'
                                }}
                            >
                                {wsGameState && wsGameState.computerBoard && singleRenderBoard(
                                    wsGameState.computerBoard.board,
                                    true,
                                    wsGameState.playerTurn ? handleCellClick : undefined,
                                    wsGameState.computerBoard.ships // ships для противника (должен быть пустой массив)
                                )}
                                {!wsGameState?.playerTurn && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(0,0,0,0.15)',
                                        borderRadius: '10px',
                                        zIndex: 2
                                    }} />
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={{ 
                        color: 'white',
                        fontSize: '2vh',
                        textAlign: 'center',
                        marginTop: '2vh'
                    }}>
                        <div style={{ marginBottom: '1vh' }}>
                            Статус: {wsGameState && wsGameState.gameState === 'IN_PROGRESS' ? 'Игра идет' : (wsGameState && wsGameState.gameState === 'PLAYER_WINS' ? 'Вы выиграли!' : (wsGameState && wsGameState.gameState === 'OPPONENT_WINS' ? 'Противник выиграл' : 'Завершена'))}
                            {wsGameState && wsGameState.gameState === 'IN_PROGRESS' && (
                                <span style={{ marginLeft: '2vh' }}>
                                    Ход: {wsGameState.playerTurn ? 'Ваш' : 'Противника'}
                                </span>
                            )}
                        </div>
                        {moveResult && (
                            <div style={{ 
                                color: moveResult.lastMoveHit ? '#4caf50' : '#ff9800', 
                                marginTop: '1vh',
                                fontSize: '2.2vh'
                            }}>
                                {moveResult.lastMoveHit ? 'Попадание!' : 'Промах!'}
                                {moveResult.lastMoveSunk && ' Корабль потоплен!'}
                                {moveResult.lastMoveGameOver && ' Игра окончена!'}
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