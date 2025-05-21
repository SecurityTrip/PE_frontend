import { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useMultiplayerWS() {
    const [connected, setConnected] = useState(false);
    const [roomCode, setRoomCode] = useState(null);
    const [joinInfo, setJoinInfo] = useState(null);
    const [moveInfo, setMoveInfo] = useState(null);
    const [gameState, setGameState] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: function (str) { /*console.log(str);*/ },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });
        client.onConnect = () => {
            setConnected(true);
            // Подписки на топики
            client.subscribe('/topic/multiplayer/code', msg => {
                setRoomCode(JSON.parse(msg.body));
            });
            client.subscribe('/topic/multiplayer/join', msg => {
                setJoinInfo(JSON.parse(msg.body));
            });
            client.subscribe('/topic/multiplayer/move', msg => {
                setMoveInfo(JSON.parse(msg.body));
            });
            client.subscribe('/topic/multiplayer/state', msg => {
                setGameState(JSON.parse(msg.body));
            });
        };
        client.onStompError = frame => {
            console.error('Broker reported error: ' + frame.headers['message']);
        };
        client.activate();
        clientRef.current = client;
        return () => {
            client.deactivate();
        };
    }, []);

    // Отправка сообщений
    function createRoom(payload) {
        if (clientRef.current && connected)
            clientRef.current.publish({ destination: '/app/multiplayer.create', body: JSON.stringify(payload) });
    }
    function joinRoom(payload) {
        if (clientRef.current && connected)
            clientRef.current.publish({ destination: '/app/multiplayer.join', body: JSON.stringify(payload) });
    }
    function sendMove(payload) {
        if (clientRef.current && connected)
            clientRef.current.publish({ destination: '/app/multiplayer.move', body: JSON.stringify(payload) });
    }
    function requestState(payload) {
        if (clientRef.current && connected)
            clientRef.current.publish({ destination: '/app/multiplayer.state', body: JSON.stringify(payload) });
    }

    return {
        connected,
        roomCode,
        joinInfo,
        moveInfo,
        gameState,
        createRoom,
        joinRoom,
        sendMove,
        requestState
    };
} 