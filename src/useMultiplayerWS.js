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

            client.subscribe('/topic/multiplayer/state', msg => {
                console.log('[useMultiplayerWS] Получен /topic/multiplayer/state:', msg.body);
                try {
                    const data = JSON.parse(msg.body);
                    setGameState(data);
                    setError(null);
                } catch (e) {
                    console.error('[useMultiplayerWS] Ошибка парсинга state:', e);
                    setError('Ошибка обработки состояния игры');
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

    function requestState(payload) {
        if (!clientRef.current || !connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            console.log('[useMultiplayerWS] requestState отправка:', payload);
            clientRef.current.publish({ destination: '/app/multiplayer.state', body: JSON.stringify(payload) });
        } catch (e) {
            console.error('[useMultiplayerWS] Ошибка отправки requestState:', e);
            setError('Ошибка запроса состояния игры');
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
        requestState
    };
} 