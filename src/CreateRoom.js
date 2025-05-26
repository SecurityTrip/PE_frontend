import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerWS } from './useMultiplayerWS';
import MenuComponent from './MenuComponent'; // assuming MenuComponent is now in its own file

function CreateRoom() {
    const navigate = useNavigate();
    const { createRoom, roomCode, connected, error: wsError } = useMultiplayerWS();
    const [created, setCreated] = useState(false);
    const [error, setError] = useState('');
    const [ships, setShips] = useState([
        { size: 4, x: 0, y: 0, horizontal: true },
        { size: 3, x: 2, y: 2, horizontal: true },
        { size: 3, x: 4, y: 4, horizontal: true },
        { size: 2, x: 6, y: 6, horizontal: true },
        { size: 2, x: 8, y: 8, horizontal: true },
        { size: 2, x: 1, y: 1, horizontal: true },
        { size: 1, x: 3, y: 3, horizontal: true },
        { size: 1, x: 5, y: 5, horizontal: true },
        { size: 1, x: 7, y: 7, horizontal: true },
        { size: 1, x: 9, y: 9, horizontal: true },
    ]);

    // Обработка ошибок WebSocket
    useEffect(() => {
        if (wsError) {
            setError(wsError);
        }
    }, [wsError]);

    // Обработка получения кода комнаты
    useEffect(() => {
        if (roomCode && roomCode.gameCode) {
            console.log('[CreateRoom] Получен код комнаты:', roomCode);
            setCreated(true);
        }
    }, [roomCode]);

    const handleCreate = async () => {
        setError('');
        if (!connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            // Генерируем или берём userId из localStorage
            let userId = Number(localStorage.getItem('userId'));
            if (!userId) {
                userId = Date.now() + Math.floor(Math.random()*1000);
                localStorage.setItem('userId', userId);
            }
            // Создаем комнату через WebSocket, передаём userId
            createRoom({ ships, userId });
        } catch (e) {
            setError('Ошибка создания комнаты: ' + e.message);
        }
    };

    const handleCopy = () => {
        if (roomCode && roomCode.gameCode) {
            navigator.clipboard.writeText(roomCode.gameCode)
                .then(() => {
                    localStorage.setItem('multiplayer_gameCode', roomCode.gameCode);
                    localStorage.setItem('multiplayer_role', 'host');
                    navigate('/fieldedit'); // Consider navigating to a multiplayer field edit/wait screen
                })
                .catch(err => {
                    setError('Ошибка копирования кода: ' + err.message);
                });
        }
    };

    return (
        <MenuComponent selctdMenu='1'>
            <div style={{ 
                position: 'absolute', 
                top: '20vh', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '100%',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{ marginBottom: '2vh' }}>Создание игры</h2>
                {!created ? (
                    <>
                        <div style={{ marginBottom: '2vh' }}>
                            Нажмите кнопку для создания новой игры
                        </div>
                        <button 
                            onClick={handleCreate} 
                            className="copybutt"
                            style={{ marginTop: '2vh' }}
                        >
                            Создать игру
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '2vh' }}>
                            Код вашей игры:
                        </div>
                        <div style={{ 
                            fontSize: '3vh',
                            letterSpacing: '0.5vh',
                            marginBottom: '2vh',
                            fontFamily: 'monospace'
                        }}>
                            {roomCode.gameCode}
                        </div>
                        <button 
                            onClick={handleCopy} 
                            className="copybutt"
                            style={{ marginTop: '2vh' }}
                        >
                            Начать игру
                        </button>
                    </>
                )}
                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginTop: '2vh',
                        fontSize: '1.8vh'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </MenuComponent>
    );
}

export default CreateRoom;