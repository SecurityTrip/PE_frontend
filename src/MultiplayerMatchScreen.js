import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerWS } from './useMultiplayerWS';
import './FieldEdit.css';
import './components/SingleplayerMatchScreen.css';
// Импортируем renderBoard из SingleplayerMatchScreen.js
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

    useEffect(() => {
        if (!gameId) {
            setError('Идентификатор игры не найден.');
            setLoading(false);
            return;
        }
        // Ждём подключения WebSocket и только потом запрашиваем состояние
        if (connected) {
            requestState(gameId);
        }
    }, [gameId, connected, requestState]);

    // Слушаем обновления состояния игры через WebSocket
    useEffect(() => {
        if (moveInfo) {
            setMoveResult(moveInfo);
            // После хода запрашиваем актуальное состояние игры
            requestState(gameId);
        }
    }, [moveInfo, requestState, gameId]);

    useEffect(() => {
        if (wsGameState) {
            // Проверяем наличие всех необходимых полей
            if (wsGameState.playerBoard && wsGameState.computerBoard && wsGameState.gameState && wsGameState.gameCode) {
                setGame(wsGameState);
                setLoading(false);
                setError('');
            } else {
                setError('Получено неполное состояние игры');
                setLoading(false);
            }
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

    // Обработка клика по клетке поля противника
    function handleCellClick(x, y) {
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
        if (!connected) {
            setMoveError('Нет соединения с сервером');
            return;
        }
        // Отправляем ход через WebSocket
        sendMove({ gameCode: gameId, x, y });
    }


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
                            {game && game.playerBoard && singleRenderBoard(
                                game.playerBoard.board,
                                false,
                                undefined,
                                game.playerBoard.ships // ships для своего поля
                            )}
                        </div>
                        <div>
                            <div style={{ 
                                color: 'white', 
                                marginBottom: '1.5vh',
                                fontSize: '2.5vh',
                                textAlign: 'center'
                            }}>Поле противника</div>
                            {game && game.computerBoard && singleRenderBoard(
                                game.computerBoard.board,
                                true,
                                handleCellClick,
                                game.computerBoard.ships // ships для противника (должен быть пустой массив)
                            )}
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