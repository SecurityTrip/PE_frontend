import { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useMultiplayerWS() {
    const [connected, setConnected] = useState(false);
    const [roomCode, setRoomCode] = useState(null);
    const [joinInfo, setJoinInfo] = useState(null);
    const [moveInfo, setMoveInfo] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('[useMultiplayerWS] Нет токена, соединение не будет установлено');
            setError('Не авторизован');
            return;
        }

        console.log('[useMultiplayerWS] Попытка соединения с WebSocket...');
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: function (str) { console.log('[STOMP]', str); },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });

        client.onConnect = () => {
            setConnected(true);
            setError(null);
            console.log('[useMultiplayerWS] Соединение установлено');
            
            // Подписки на топики
            client.subscribe('/topic/multiplayer/code', msg => {
                console.log('[useMultiplayerWS] Получен /topic/multiplayer/code:', msg.body);
                try {
                    const data = JSON.parse(msg.body);
                    // Сохраняем gameCode в localStorage для синхронизации с backend
                    if (data && data.gameCode) {
                        localStorage.setItem('multiplayer_gameId', data.gameCode);
                    }
                    setRoomCode(data);
                    setError(null);
                } catch (e) {
                    console.error('[useMultiplayerWS] Ошибка парсинга code:', e);
                    setError('Ошибка обработки кода комнаты');
                }
            });

            client.subscribe('/topic/multiplayer/join', msg => {
                console.log('[useMultiplayerWS] Получен /topic/multiplayer/join:', msg.body);
                try {
                    const data = JSON.parse(msg.body);
                    // Сохраняем gameCode в localStorage для синхронизации с backend
                    if (data && data.gameCode) {
                        localStorage.setItem('multiplayer_gameId', data.gameCode);
                    }
                    setJoinInfo(data);
                    setError(null);
                } catch (e) {
                    console.error('[useMultiplayerWS] Ошибка парсинга join:', e);
                    setError('Ошибка обработки подключения');
                }
            });

            client.subscribe('/topic/multiplayer/move', msg => {
                console.log('[useMultiplayerWS] Получен /topic/multiplayer/move:', msg.body);
                try {
                    const data = JSON.parse(msg.body);
                    setMoveInfo(data);
                    setError(null);
                } catch (e) {
                    console.error('[useMultiplayerWS] Ошибка парсинга move:', e);
                    setError('Ошибка обработки хода');
                }
            });

            client.subscribe('/user/topic/multiplayer/state', msg => {
                console.log('[useMultiplayerWS] Получен /user/topic/multiplayer/state:', msg.body);
                try {
                    const data = JSON.parse(msg.body);
                    console.log('[useMultiplayerWS] Распарсили gameState:', data);
                    // Проверяем наличие ключевых полей и их структуру
                    let missing = [];
                    if (!data) missing.push('data');
                    if (!data.playerBoard) missing.push('playerBoard');
                    if (!data.computerBoard) missing.push('computerBoard');
                    if (!data.gameState) missing.push('gameState');
                    if (!data.gameCode) missing.push('gameCode');
                    // Дополнительно проверяем board и ships
                    if (data.playerBoard && (!Array.isArray(data.playerBoard.board) || typeof data.playerBoard.computer !== 'boolean')) missing.push('playerBoard.board/computer');
                    if (data.computerBoard && (!Array.isArray(data.computerBoard.board) || typeof data.computerBoard.computer !== 'boolean')) missing.push('computerBoard.board/computer');
                    if (missing.length === 0) {
                        setGameState(data);
                        setError(null);
                    } else {
                        console.error('[useMultiplayerWS] Получено неполное или некорректное состояние игры:', data, 'Отсутствуют/невалидны:', missing);
                        setError('Некорректное состояние игры: ' + missing.join(', '));
                    }
                } catch (e) {
                    console.error('[useMultiplayerWS] Ошибка парсинга state:', e, msg.body);
                    setError('Ошибка обработки состояния игры: ' + e);
                }
            });

            client.subscribe('/topic/multiplayer/error', msg => {
                console.error('[useMultiplayerWS] Получена ошибка:', msg.body);
                try {
                    const data = JSON.parse(msg.body);
                    setError(data.message || 'Произошла ошибка');
                } catch (e) {
                    setError('Произошла ошибка');
                }
            });
        };

        client.onStompError = frame => {
            console.error('[useMultiplayerWS] Broker reported error: ' + frame.headers['message']);
            setError('Ошибка соединения с сервером');
        };

        client.onWebSocketError = (event) => {
            console.error('[useMultiplayerWS] WebSocket error:', event);
            setError('Ошибка WebSocket соединения');
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    // Отправка сообщений
    function createRoom(payload) {
        if (!clientRef.current || !connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            console.log('[useMultiplayerWS] createRoom отправка:', payload);
            clientRef.current.publish({ destination: '/app/multiplayer.create', body: JSON.stringify(payload) });
        } catch (e) {
            console.error('[useMultiplayerWS] Ошибка отправки createRoom:', e);
            setError('Ошибка создания комнаты');
        }
    }

    function joinRoom(payload) {
        if (!clientRef.current || !connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            console.log('[useMultiplayerWS] joinRoom отправка:', payload);
            clientRef.current.publish({ destination: '/app/multiplayer.join', body: JSON.stringify(payload) });
        } catch (e) {
            console.error('[useMultiplayerWS] Ошибка отправки joinRoom:', e);
            setError('Ошибка подключения к комнате');
        }
    }

    function sendMove(payload) {
        if (!clientRef.current || !connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            console.log('[useMultiplayerWS] sendMove отправка:', payload);
            clientRef.current.publish({ destination: '/app/multiplayer.move', body: JSON.stringify(payload) });
        } catch (e) {
            console.error('[useMultiplayerWS] Ошибка отправки move:', e);
            setError('Ошибка отправки хода');
        }
    }

    function requestState(gameCode) {
        if (!clientRef.current || !connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            const userId = localStorage.getItem('userId');
            const payload = { gameCode, userId };
            console.log('[useMultiplayerWS] requestState отправка:', payload);
            clientRef.current.publish({ destination: '/app/multiplayer.state', body: JSON.stringify(payload) });
        } catch (e) {
            console.error('[useMultiplayerWS] Ошибка отправки requestState:', e);
            setError('Ошибка запроса состояния игры');
        }
    }
    
    function placeHostShips(payload) {
    if (!clientRef.current || !connected) {
        setError('Нет соединения с сервером');
        return;
    }
    try {
        console.log('[useMultiplayerWS] placeHostShips отправка:', payload);
        clientRef.current.publish({ destination: '/app/multiplayer.place', body: JSON.stringify(payload) });
    } catch (e) {
        console.error('[useMultiplayerWS] Ошибка отправки placeHostShips:', e);
        setError('Ошибка размещения кораблей хоста');
    }
    }
    // Отправка кораблей хоста после создания комнаты
    function placeHostShips(payload) {
        if (!clientRef.current || !connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            console.log('[useMultiplayerWS] placeHostShips отправка:', payload);
            clientRef.current.publish({ destination: '/app/multiplayer.place', body: JSON.stringify(payload) });
        } catch (e) {
            console.error('[useMultiplayerWS] Ошибка отправки placeHostShips:', e);
            setError('Ошибка размещения кораблей хоста');
        }
    }

    return {
        connected,
        roomCode,
        joinInfo,
        moveInfo,
        gameState,
        error,
        createRoom,
        joinRoom,
        sendMove,
        requestState,
        placeHostShips
    };
}